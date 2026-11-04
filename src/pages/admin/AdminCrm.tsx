import { useEffect, useState, type DragEvent, type FormEvent } from 'react'
import { formatDate, formatMoney } from '../../lib/format'
import { supabase } from '../../lib/supabase'

interface Lead {
  id: string
  name: string
  email: string
  company: string
  sector: string | null
  budget: string | null
  message: string
  service_slug: string | null
  source: string
  stage: string
  value_usd: number | null
  notes: string | null
  created_at: string
}

const STAGES = [
  { value: 'contacto', label: 'Contacto' },
  { value: 'discovery', label: 'Discovery' },
  { value: 'propuesta', label: 'Propuesta' },
  { value: 'cerrado', label: 'Cerrado' },
  { value: 'perdido', label: 'Perdido' },
] as const

const COLUMNS = 'id, name, email, company, sector, budget, message, service_slug, source, stage, value_usd, notes, created_at'

function LeadModal({ lead, onClose, onSaved }: { lead: Lead; onClose: () => void; onSaved: (l: Lead) => void }) {
  const [value, setValue] = useState(lead.value_usd?.toString() ?? '')
  const [notes, setNotes] = useState(lead.notes ?? '')
  const [stage, setStage] = useState(lead.stage)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!supabase) return
    const parsed = value === '' ? null : Number(value)
    if (parsed !== null && (Number.isNaN(parsed) || parsed < 0)) return setError('El valor no es válido.')
    setBusy(true)
    const patch = { value_usd: parsed, notes: notes.trim() || null, stage }
    const { error: err } = await supabase.from('leads').update(patch).eq('id', lead.id)
    setBusy(false)
    if (err) return setError('No se pudo guardar.')
    onSaved({ ...lead, ...patch })
    onClose()
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="card modal" role="dialog" aria-modal="true" aria-labelledby="leadTitle" onSubmit={onSubmit} noValidate>
        <h2 id="leadTitle">{lead.company}</h2>
        <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 14 }}>
          {lead.name} ·{' '}
          <a href={`mailto:${lead.email}`} style={{ color: 'var(--signal)' }}>
            {lead.email}
          </a>
          <br />
          {lead.sector ?? 'Sin sector'} · {lead.budget ?? 'Sin presupuesto'} · {lead.service_slug ?? 'Sin servicio'} · {formatDate(lead.created_at)}
        </p>
        <p style={{ fontSize: 13.5, borderTop: '1px solid var(--line-soft)', borderBottom: '1px solid var(--line-soft)', padding: '12px 0', marginBottom: 16, overflowWrap: 'anywhere' }}>
          {lead.message}
        </p>
        {error && (
          <div className="form-msg error" role="alert">
            {error}
          </div>
        )}
        <div className="field-row">
          <div className="field">
            <label htmlFor="lStage">Etapa</label>
            <select id="lStage" value={stage} onChange={(e) => setStage(e.target.value)}>
              {STAGES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="lValue">Valor estimado (USD)</label>
            <input id="lValue" type="number" min="0" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="lNotes">Notas internas</label>
          <textarea id="lNotes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000} />
        </div>
        <div className="step-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-forge" disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function AdminCrm() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(supabase !== null)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [dragId, setDragId] = useState<string | null>(null)
  const [overStage, setOverStage] = useState<string | null>(null)
  const [selected, setSelected] = useState<Lead | null>(null)

  useEffect(() => {
    if (!supabase) return
    let active = true
    supabase
      .from('leads')
      .select(COLUMNS)
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (!active) return
        setError(err ? 'No se pudieron cargar los leads.' : null)
        setLeads((data ?? []) as Lead[])
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  async function moveLead(id: string, stage: string) {
    const prev = leads.find((l) => l.id === id)
    if (!supabase || !prev || prev.stage === stage) return
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, stage } : l))) // optimista
    const { error: err } = await supabase.from('leads').update({ stage }).eq('id', id)
    if (err) {
      setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, stage: prev.stage } : l)))
      setError('No se pudo mover el lead. Se revirtió el cambio.')
    } else {
      setError(null)
    }
  }

  const onDrop = (e: DragEvent, stage: string) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain') || dragId
    setOverStage(null)
    setDragId(null)
    if (id) void moveLead(id, stage)
  }

  const q = query.trim().toLowerCase()
  const visible = q
    ? leads.filter((l) => [l.company, l.name, l.email, l.sector ?? ''].some((v) => v.toLowerCase().includes(q)))
    : leads

  return (
    <>
      <div className="app-topbar">
        <div>
          <span className="kicker">CRM</span>
          <h1>Pipeline comercial</h1>
        </div>
        <div className="field" style={{ marginBottom: 0, minWidth: 240 }}>
          <label htmlFor="crmSearch" className="visually-hidden">
            Buscar lead o empresa
          </label>
          <input id="crmSearch" type="search" placeholder="Buscar lead o empresa..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {error && (
        <div className="form-msg error" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <p className="empty" role="status">
          Cargando…
        </p>
      ) : (
        <div className="kanban">
          {STAGES.map((s) => {
            const items = visible.filter((l) => l.stage === s.value)
            return (
              <section
                key={s.value}
                className={`kb-col${overStage === s.value ? ' over' : ''}`}
                aria-label={`Etapa ${s.label}`}
                onDragOver={(e) => {
                  e.preventDefault()
                  setOverStage(s.value)
                }}
                onDragLeave={() => setOverStage((o) => (o === s.value ? null : o))}
                onDrop={(e) => onDrop(e, s.value)}
              >
                <div className="kb-col-head">
                  <span>{s.label}</span>
                  <span>{items.length}</span>
                </div>
                {items.length === 0 && <p className="kb-empty">Sin leads</p>}
                {items.map((l) => (
                  <article
                    key={l.id}
                    className={`card lead-card${dragId === l.id ? ' dragging' : ''}`}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', l.id)
                      e.dataTransfer.effectAllowed = 'move'
                      setDragId(l.id)
                    }}
                    onDragEnd={() => {
                      setDragId(null)
                      setOverStage(null)
                    }}
                  >
                    <button type="button" className="lead-open" onClick={() => setSelected(l)}>
                      <h5>{l.company}</h5>
                      <div className="lm">{l.sector ?? 'Sin sector'}</div>
                    </button>
                    <div className="lf">
                      <span className="src-chip">{l.source}</span>
                      <span className="lead-val">{l.value_usd != null ? formatMoney(l.value_usd) : l.budget ?? '—'}</span>
                    </div>
                    <label className="visually-hidden" htmlFor={`mv-${l.id}`}>
                      Mover {l.company} a otra etapa
                    </label>
                    <select id={`mv-${l.id}`} className="inline-select kb-move" value={l.stage} onChange={(e) => void moveLead(l.id, e.target.value)}>
                      {STAGES.map((st) => (
                        <option key={st.value} value={st.value}>
                          {st.label}
                        </option>
                      ))}
                    </select>
                  </article>
                ))}
              </section>
            )
          })}
        </div>
      )}

      {selected && (
        <LeadModal
          lead={selected}
          onClose={() => setSelected(null)}
          onSaved={(l) => setLeads((ls) => ls.map((x) => (x.id === l.id ? l : x)))}
        />
      )}
    </>
  )
}
