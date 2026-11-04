import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FALLBACK_SERVICES } from '../../data/services'
import { TEAM_OWNERS } from '../../data/team'
import { formatDate, formatMoney } from '../../lib/format'
import { supabase } from '../../lib/supabase'
import { STATUS_BADGE, STATUS_LABEL } from '../../lib/types'
import { clientLabel, useClients } from '../../lib/useClients'
import { useProjects } from '../../lib/useProjectData'

function NewProjectModal({ onClose }: { onClose: () => void }) {
  const { clients } = useClients()
  const navigate = useNavigate()
  const [clientId, setClientId] = useState('')
  const [clientName, setClientName] = useState('')
  const [owner, setOwner] = useState('')
  const [name, setName] = useState('')
  const [service, setService] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!clientId && clientName.trim().length < 2) return setError('Elige un cliente con cuenta o escribe su nombre.')
    if (name.trim().length < 2) return setError('Escribe el nombre del proyecto.')
    if (!supabase) return setError('Supabase no está configurado.')
    setBusy(true)
    const { data, error: err } = await supabase
      .from('projects')
      .insert({
        client_id: clientId || null,
        client_name: clientId ? null : clientName.trim(),
        owner: owner || null,
        name: name.trim(),
        service_slug: service || null,
      })
      .select('id')
      .single()
    setBusy(false)
    if (err || !data) return setError('No se pudo crear el proyecto.')
    navigate(`/admin/proyectos/${data.id}`)
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="card modal" role="dialog" aria-modal="true" aria-labelledby="newProjTitle" onSubmit={onSubmit} noValidate>
        <h2 id="newProjTitle">Nuevo proyecto</h2>
        {error && (
          <div className="form-msg error" role="alert">
            {error}
          </div>
        )}
        <div className="field">
          <label htmlFor="npClient">Cliente con cuenta en el portal</label>
          <select id="npClient" value={clientId} onChange={(e) => setClientId(e.target.value)}>
            <option value="">Sin cuenta todavía</option>
            {clients
              .filter((c) => c.role === 'client')
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {clientLabel(c)} {c.email ? `(${c.email})` : ''}
                </option>
              ))}
          </select>
        </div>
        {!clientId && (
          <div className="field">
            <label htmlFor="npClientName">Nombre del cliente</label>
            <input id="npClientName" value={clientName} onChange={(e) => setClientName(e.target.value)} maxLength={160} />
          </div>
        )}
        <div className="field">
          <label htmlFor="npName">Nombre del proyecto</label>
          <input id="npName" value={name} onChange={(e) => setName(e.target.value)} maxLength={160} autoFocus />
        </div>
        <div className="field">
          <label htmlFor="npService">Servicio</label>
          <select id="npService" value={service} onChange={(e) => setService(e.target.value)}>
            <option value="">Sin servicio</option>
            {FALLBACK_SERVICES.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="npOwner">Responsable</label>
          <select id="npOwner" value={owner} onChange={(e) => setOwner(e.target.value)}>
            <option value="">Sin asignar</option>
            {TEAM_OWNERS.map((t) => (
              <option key={t.name} value={t.name}>
                {t.name} · {t.role}
              </option>
            ))}
          </select>
        </div>
        <div className="step-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-forge" disabled={busy}>
            {busy ? 'Creando…' : 'Crear proyecto'}
          </button>
        </div>
      </form>
    </div>
  )
}

function useMilestoneTotals() {
  const [totals, setTotals] = useState({ pending: 0, paid: 0 })
  useEffect(() => {
    if (!supabase) return
    let active = true
    supabase
      .from('milestones')
      .select('amount_usd, paid')
      .not('amount_usd', 'is', null)
      .then(({ data }) => {
        if (!active || !data) return
        const sum = (paid: boolean) => data.filter((m) => m.paid === paid).reduce((s, m) => s + Number(m.amount_usd ?? 0), 0)
        setTotals({ pending: sum(false), paid: sum(true) })
      })
    return () => {
      active = false
    }
  }, [])
  return totals
}

export default function AdminProjects() {
  const totals = useMilestoneTotals()
  const { projects, loading, error } = useProjects('all')
  const { clients } = useClients()
  const [creating, setCreating] = useState(false)
  const byId = new Map(clients.map((c) => [c.id, c]))
  const active = projects.filter((p) => ['discovery', 'development', 'production', 'maintenance'].includes(p.status))
  const avg = active.length ? Math.round(active.reduce((s, p) => s + p.progress, 0) / active.length) : 0

  return (
    <>
      <div className="app-topbar">
        <div>
          <span className="kicker">Panel administrativo</span>
          <h1>Proyectos</h1>
        </div>
        <button type="button" className="btn btn-forge btn-sm" onClick={() => setCreating(true)}>
          + Nuevo proyecto
        </button>
      </div>

      {error && (
        <div className="form-msg error" role="alert">
          {error}
        </div>
      )}

      <div className="admin-kpis">
        <div className="card kpi-card">
          <div className="kv">{active.length}</div>
          <div className="kl">Proyectos activos</div>
          <div className="kd">{projects.length} en total</div>
        </div>
        <div className="card kpi-card">
          <div className="kv">{avg}%</div>
          <div className="kl">Avance promedio</div>
          <div className="kd">De los proyectos activos</div>
        </div>
        <div className="card kpi-card">
          <div className="kv">{formatMoney(totals.pending)}</div>
          <div className="kl">Por cobrar</div>
          <div className="kd">Hitos con monto sin pagar</div>
        </div>
        <div className="card kpi-card">
          <div className="kv">{formatMoney(totals.paid)}</div>
          <div className="kl">Cobrado</div>
          <div className="kd">Hitos pagados</div>
        </div>
      </div>

      <div className="card panel">
        {loading ? (
          <p className="empty">Cargando…</p>
        ) : projects.length === 0 ? (
          <p className="empty">Aún no hay proyectos. Crea el primero con “Nuevo proyecto”.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Proyecto</th>
                  <th>Cliente</th>
                  <th>Responsable</th>
                  <th>Estado</th>
                  <th>Avance</th>
                  <th>Próxima entrega</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link className="row-link" to={`/admin/proyectos/${p.id}`}>
                        {p.name}
                      </Link>
                    </td>
                    <td>{p.client_id ? clientLabel(byId.get(p.client_id)) : (p.client_name ?? '—')}</td>
                    <td>{p.owner ?? '—'}</td>
                    <td>
                      <span className={`status-badge ${STATUS_BADGE[p.status]}`}>{STATUS_LABEL[p.status]}</span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>
                      <span className="mini-progress" aria-hidden="true">
                        <i style={{ width: `${p.progress}%` }} />
                      </span>
                      {p.progress}%
                    </td>
                    <td>{formatDate(p.next_delivery_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {creating && <NewProjectModal onClose={() => setCreating(false)} />}
    </>
  )
}
