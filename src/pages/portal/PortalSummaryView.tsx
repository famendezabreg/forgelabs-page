import { useState } from 'react'
import { formatDate, formatMoney } from '../../lib/format'
import { MILESTONE_LABEL, STATUS_LABEL, type Milestone, type Project, type ProjectDocument, type ProjectStatus, type ProjectUpdate } from '../../lib/types'

const STAGES = ['Discovery', 'Propuesta', 'Desarrollo', 'Entrega', 'Soporte'] as const

/** Etapa actual (0-4) según el estado del proyecto. */
function stageOf(status: ProjectStatus, progress: number): number {
  switch (status) {
    case 'discovery':
      return progress > 0 ? 1 : 0
    case 'development':
    case 'paused':
      return 2
    case 'delivered':
      return 3
    case 'production':
    case 'maintenance':
      return 4
  }
}

const DAY = 86_400_000

function daysUntil(date: string | null, now: number): number | null {
  if (!date) return null
  const [y, m, d] = date.slice(0, 10).split('-').map(Number)
  if (!y || !m || !d) return null
  return Math.round((new Date(y, m - 1, d).getTime() - now) / DAY)
}

interface Props {
  project: Project
  milestones: Milestone[]
  updates: ProjectUpdate[]
  documents: ProjectDocument[]
  loading?: boolean
  error?: string | null
  /** En modo demo los documentos no se pueden abrir. */
  onOpenDocument?: (doc: ProjectDocument) => void
}

export function PortalSummaryView({ project, milestones, updates, documents, loading = false, error = null, onOpenDocument }: Props) {
  const [now] = useState(() => new Date().setHours(0, 0, 0, 0))
  const stage = stageOf(project.status, project.progress)

  const done = milestones.filter((m) => m.status === 'done').length
  const billable = milestones.filter((m) => m.amount_usd != null)
  const total = billable.reduce((s, m) => s + (m.amount_usd ?? 0), 0)
  const paid = billable.filter((m) => m.paid).reduce((s, m) => s + (m.amount_usd ?? 0), 0)
  const days = daysUntil(project.next_delivery_date, now)
  const nextMilestone = milestones.find((m) => m.status !== 'done')

  const deliveryHint =
    days === null ? 'Sin fecha programada' : days < 0 ? 'Fecha vencida' : days === 0 ? 'Es hoy' : days === 1 ? 'Falta 1 día' : `Faltan ${days} días`

  return (
    <>
      <div className="portal-kpis">
        <div className="card kpi-card">
          <div className="kv">{project.progress}%</div>
          <div className="kl">Avance del proyecto</div>
          <div className="kd">{STATUS_LABEL[project.status]}</div>
        </div>
        <div className="card kpi-card">
          <div className="kv">
            {done}
            <span className="kv-sub">/{milestones.length}</span>
          </div>
          <div className="kl">Hitos completados</div>
          <div className="kd">{nextMilestone ? `Siguiente: ${nextMilestone.title}` : milestones.length ? 'Todos completados' : 'Aún sin hitos'}</div>
        </div>
        <div className="card kpi-card">
          <div className="kv">{formatDate(project.next_delivery_date)}</div>
          <div className="kl">Próxima entrega</div>
          <div className="kd">{deliveryHint}</div>
        </div>
        <div className="card kpi-card">
          <div className="kv">{formatMoney(paid)}</div>
          <div className="kl">Pagado de {formatMoney(total)}</div>
          <div className="kd">{total > 0 ? `${formatMoney(total - paid)} pendiente` : 'Sin cobros definidos'}</div>
        </div>
      </div>

      <div className="card panel">
        <div className="stage-head">
          <span>{project.name}</span>
          <span>{project.progress}% completado</span>
        </div>
        <div className="progress-track" role="progressbar" aria-valuenow={project.progress} aria-valuemin={0} aria-valuemax={100} aria-label="Avance del proyecto">
          <div className="progress-fill" style={{ width: `${project.progress}%` }} />
        </div>
        <ol className="stage-track" aria-label="Etapas del proyecto">
          {STAGES.map((name, i) => (
            <li key={name} className={i < stage ? 'passed' : i === stage ? 'current' : ''} aria-current={i === stage ? 'step' : undefined}>
              <span className="stage-node" aria-hidden="true" />
              <span className="stage-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="stage-name">{name}</span>
            </li>
          ))}
        </ol>
        <p className="stage-note">
          {project.next_delivery_date
            ? `Próxima entrega: ${project.next_delivery_note ? `${project.next_delivery_note} — ` : ''}${formatDate(project.next_delivery_date)}`
            : 'Aún no hay una próxima entrega programada.'}
        </p>
      </div>

      {error && (
        <div className="form-msg error" role="alert" style={{ marginTop: 22 }}>
          {error}
        </div>
      )}

      <div className="two-col">
        <div className="stack">
          <div className="card panel">
            <h3>Hitos del proyecto</h3>
            {loading && milestones.length === 0 ? (
              <p className="empty">Cargando…</p>
            ) : milestones.length === 0 ? (
              <p className="empty">Los hitos del proyecto aparecerán aquí.</p>
            ) : (
              <ol className="ms-list">
                {milestones.map((m) => (
                  <li key={m.id} className={`ms-item ${m.status}`}>
                    <span className="ms-dot" aria-hidden="true" />
                    <div className="ms-body">
                      <b>{m.title}</b>
                      <span className="meta">
                        {m.due_date ? formatDate(m.due_date) : 'Sin fecha'}
                        {m.amount_usd != null ? ` · ${formatMoney(m.amount_usd)}${m.paid ? ' pagado' : ''}` : ''}
                      </span>
                    </div>
                    <span className={`status-badge ${m.status === 'done' ? 'dev' : m.status === 'in_progress' ? 'maint' : 'disc'}`}>{MILESTONE_LABEL[m.status]}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="card panel">
            <h3>Actividad reciente</h3>
            {loading && updates.length === 0 ? (
              <p className="empty">Cargando…</p>
            ) : updates.length === 0 ? (
              <p className="empty">Todavía no hay actividad registrada.</p>
            ) : (
              <div className="timeline">
                {updates.map((u) => (
                  <div className="tl-item" key={u.id}>
                    <div className="tl-dot" aria-hidden="true" />
                    <div className="tl-date">{formatDate(u.created_at)}</div>
                    <p>{u.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="stack">
          <div className="card panel">
            <h3>Documentos recientes</h3>
            {documents.length === 0 ? (
              <p className="empty">Aún no hay documentos compartidos contigo.</p>
            ) : (
              documents.slice(0, 4).map((d) => (
                <div className="doc-row" key={d.id}>
                  <span className="doc-name">
                    {d.name}
                    <br />
                    <span className="meta">{formatDate(d.created_at)}</span>
                  </span>
                  {onOpenDocument && (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => onOpenDocument(d)}>
                      Descargar
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="card panel">
            <h3>Cómo funciona este portal</h3>
            <ul className="how-list">
              <li>
                <b>Avance real:</b> la barra y las etapas se actualizan con cada entrega.
              </li>
              <li>
                <b>Todo en un lugar:</b> hitos, documentos y pagos, sin buscar en correos.
              </li>
              <li>
                <b>Sin sorpresas:</b> ves qué se entrega, cuándo y cuánto se paga por cada hito.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
