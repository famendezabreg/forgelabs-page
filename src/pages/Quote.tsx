import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useServices } from '../lib/useServices'
import { supabase } from '../lib/supabase'

const STEPS = ['Servicio', 'Tus datos', 'Solicitud enviada']
const SECTORS = ['Servicios', 'Comercio', 'Salud', 'Inmobiliaria', 'Otro']
const BUDGETS = ['Menos de $700', '$700 – $1,500', 'Más de $1,500']
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Quote() {
  const [params] = useSearchParams()
  const { services } = useServices()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [slug, setSlug] = useState<string | null>(params.get('servicio'))
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    sector: SECTORS[0],
    budget: BUDGETS[1],
    message: '',
    website: '', // honeypot anti-spam: debe quedar vacío
  })
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const service = services.find((s) => s.slug === slug) ?? null
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (form.website) return // bot
    if (form.name.trim().length < 2) return setError('Escribe tu nombre.')
    if (!EMAIL_RE.test(form.email.trim())) return setError('Escribe un correo válido.')
    if (form.company.trim().length < 2) return setError('Escribe el nombre de tu negocio.')
    if (form.message.trim().length < 10) return setError('Cuéntanos un poco más sobre el problema (mínimo 10 caracteres).')
    if (!supabase) return setError('El envío no está disponible en este momento. Inténtalo más tarde.')

    setSending(true)
    const { error: err } = await supabase.from('leads').insert({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      company: form.company.trim(),
      sector: form.sector,
      budget: form.budget,
      message: form.message.trim(),
      service_slug: slug,
      source: 'web',
    })
    setSending(false)
    if (err) {
      setError('No pudimos enviar tu solicitud. Revisa tu conexión e inténtalo de nuevo.')
      return
    }
    setStep(3)
  }

  return (
    <div className="container section">
      <div className="section-head">
        <span className="kicker">Proceso de cotización</span>
        <h2>De la idea al kickoff</h2>
      </div>

      <ol className="stepper" aria-label="Progreso de la cotización" style={{ listStyle: 'none' }}>
        {STEPS.map((label, i) => {
          const n = i + 1
          const cls = n < step ? 'done' : n === step ? 'active' : ''
          return (
            <li key={label} style={{ display: 'flex', flex: 1 }}>
              <button
                type="button"
                className={`step-btn ${cls}`}
                style={{ width: '100%' }}
                disabled={n >= step || step === 3}
                aria-current={n === step ? 'step' : undefined}
                onClick={() => setStep(n as 1 | 2)}
              >
                <span className="sn">{String(n).padStart(2, '0')}</span>
                <span className="sl">{label}</span>
              </button>
            </li>
          )
        })}
      </ol>

      <div className="proc-grid">
        <div>
          {step === 1 && (
            <div className="card step-panel">
              <h3>¿Qué necesitas?</h3>
              <p className="muted">Elige el servicio que más se acerca. Podrás cambiarlo antes de enviar.</p>
              <div className="option-grid">
                {services.map((s) => (
                  <button
                    key={s.slug}
                    type="button"
                    className="option"
                    aria-pressed={slug === s.slug}
                    onClick={() => setSlug(s.slug)}
                  >
                    <b>{s.name}</b>
                    <span>{s.description}</span>
                  </button>
                ))}
              </div>
              <button type="button" className="btn btn-forge" disabled={!slug} onClick={() => setStep(2)}>
                Continuar
              </button>
            </div>
          )}

          {step === 2 && (
            <form className="card step-panel" onSubmit={onSubmit} noValidate>
              <h3>Cuéntanos sobre tu negocio</h3>
              {error && (
                <div className="form-msg error" role="alert">
                  {error}
                </div>
              )}
              <div className="field-row">
                <div className="field">
                  <label htmlFor="qName">Tu nombre</label>
                  <input id="qName" type="text" autoComplete="name" value={form.name} onChange={set('name')} maxLength={120} />
                </div>
                <div className="field">
                  <label htmlFor="qEmail">Correo</label>
                  <input id="qEmail" type="email" autoComplete="email" value={form.email} onChange={set('email')} maxLength={160} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="qCompany">Nombre del negocio</label>
                <input id="qCompany" type="text" autoComplete="organization" value={form.company} onChange={set('company')} maxLength={160} />
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="qSector">Sector</label>
                  <select id="qSector" value={form.sector} onChange={set('sector')}>
                    {SECTORS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="qBudget">Presupuesto estimado</label>
                  <select id="qBudget" value={form.budget} onChange={set('budget')}>
                    {BUDGETS.map((b) => (
                      <option key={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field">
                <label htmlFor="qMsg">¿Qué problema quieres resolver?</label>
                <textarea
                  id="qMsg"
                  rows={4}
                  value={form.message}
                  onChange={set('message')}
                  maxLength={2000}
                  placeholder="Ej. Las órdenes de reparación se llevan en papel y se pierden..."
                />
              </div>
              <div className="visually-hidden" aria-hidden="true">
                <label htmlFor="qWebsite">No llenar este campo</label>
                <input id="qWebsite" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
              </div>
              <div className="step-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>
                  Atrás
                </button>
                <button type="submit" className="btn btn-forge" disabled={sending}>
                  {sending ? 'Enviando…' : 'Enviar solicitud'}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="card step-panel">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg className="success-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Solicitud recibida
              </h3>
              <p className="muted" role="status">
                Gracias, {form.name.split(' ')[0]}. Recibimos tu solicitud y revisaremos el alcance. Te contactaremos a {form.email} para conversar sobre los siguientes pasos.
              </p>
              <ul className="next-steps">
                <li>
                  <b>01</b> Propuesta: alcance, tecnología y tiempos claros.
                </li>
                <li>
                  <b>02</b> Propuesta: definiremos alcance, tiempos y precio contigo.
                </li>
                <li>
                  <b>03</b> Inicio: si aprobamos la propuesta, coordinamos el arranque del proyecto.
                </li>
              </ul>
              <div className="step-actions" style={{ marginTop: 22 }}>
                <Link to="/acceso" className="btn btn-forge">
                  Crear mi cuenta de cliente
                </Link>
                <Link to="/" className="btn btn-ghost">
                  Volver al inicio
                </Link>
              </div>
            </div>
          )}
        </div>

        <aside className="summary-card card" aria-label="Resumen de la cotización">
          <h4>Resumen</h4>
          <div className="summary-row">
            <span>Servicio</span>
            <span>{service?.name ?? 'Sin elegir'}</span>
          </div>
          <div className="summary-row">
            <span>Tiempo estimado</span>
            <span>A definir en discovery</span>
          </div>
          <div className="summary-row">
            <span>Modelo de pago</span>
            <span>Por fases + mensualidad</span>
          </div>
          <div className="summary-row">
            <span>Etapa actual</span>
            <span style={{ color: 'var(--signal)' }}>{step === 3 ? 'Solicitud recibida' : 'Definiendo necesidad'}</span>
          </div>
        </aside>
      </div>
    </div>
  )
}
