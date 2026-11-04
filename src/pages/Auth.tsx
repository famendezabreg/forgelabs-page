import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Brand } from '../components/Brand'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

type Mode = 'login' | 'register'
const SECTORS = ['Servicios', 'Comercio', 'Salud', 'Inmobiliaria', 'Otro']
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function friendlyError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login')) return 'Correo o contraseña incorrectos.'
  if (m.includes('already registered') || m.includes('already been registered')) return 'Ese correo ya tiene una cuenta. Inicia sesión.'
  if (m.includes('email not confirmed')) return 'Confirma tu correo antes de iniciar sesión (revisa tu bandeja).'
  if (m.includes('rate limit') || m.includes('too many')) return 'Demasiados intentos. Espera unos minutos.'
  if (m.includes('password')) return 'La contraseña debe tener al menos 8 caracteres.'
  return 'No se pudo completar la solicitud. Inténtalo de nuevo.'
}

export default function Auth() {
  const [mode, setMode] = useState<Mode>('login')
  const [company, setCompany] = useState('')
  const [fullName, setFullName] = useState('')
  const [sector, setSector] = useState(SECTORS[0])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [terms, setTerms] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/portal'

  if (!loading && user) return <Navigate to={from} replace />

  const isRegister = mode === 'register'

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
    setNotice(null)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setNotice(null)
    if (!supabase) return setError('El acceso no está disponible en este momento.')
    if (!EMAIL_RE.test(email.trim())) return setError('Escribe un correo válido.')
    if (password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.')
    if (isRegister) {
      if (company.trim().length < 2) return setError('Escribe el nombre de tu empresa.')
      if (!terms) return setError('Debes aceptar los términos para crear tu cuenta.')
    }

    setBusy(true)
    if (isRegister) {
      const { data, error: err } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/acceso`,
          data: { company_name: company.trim(), full_name: fullName.trim(), sector },
        },
      })
      setBusy(false)
      if (err) return setError(friendlyError(err.message))
      if (data.session) navigate(from, { replace: true })
      else setNotice('Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesión.')
      return
    }
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })
    setBusy(false)
    if (err) return setError(friendlyError(err.message))
    navigate(from, { replace: true })
  }

  return (
    <div className="auth-wrap">
      <div className="auth-side">
        <Brand />
        <p className="big-quote">
          "El acceso a tecnología real no debería ser <span>privilegio de unos pocos</span>."
        </p>
        <span className="kicker">Portal de cliente</span>
      </div>
      <div className="auth-form-wrap">
        <div className="auth-toggle" role="tablist" aria-label="Modo de acceso">
          <button type="button" role="tab" aria-selected={!isRegister} className={!isRegister ? 'active' : ''} onClick={() => switchMode('login')}>
            Iniciar sesión
          </button>
          <button type="button" role="tab" aria-selected={isRegister} className={isRegister ? 'active' : ''} onClick={() => switchMode('register')}>
            Crear cuenta
          </button>
        </div>
        <h1 style={{ fontSize: 24, marginBottom: 6 }}>{isRegister ? 'Crea tu cuenta de cliente' : 'Bienvenido de vuelta'}</h1>
        <p style={{ color: 'var(--dim)', fontSize: 13.5, marginBottom: 28 }}>
          {isRegister
            ? 'Accede al portal para ver el avance de tu proyecto en tiempo real.'
            : 'Ingresa para ver el avance de tu proyecto.'}
        </p>

        <form onSubmit={onSubmit} noValidate>
          {error && (
            <div className="form-msg error" role="alert">
              {error}
            </div>
          )}
          {notice && (
            <div className="form-msg ok" role="status">
              {notice}
            </div>
          )}
          {isRegister && (
            <>
              <div className="field">
                <label htmlFor="regCompany">Nombre de la empresa</label>
                <input id="regCompany" type="text" autoComplete="organization" value={company} onChange={(e) => setCompany(e.target.value)} maxLength={160} />
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="regName">Tu nombre</label>
                  <input id="regName" type="text" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={120} />
                </div>
                <div className="field">
                  <label htmlFor="regSector">Sector</label>
                  <select id="regSector" value={sector} onChange={(e) => setSector(e.target.value)}>
                    {SECTORS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
          <div className="field">
            <label htmlFor="authEmail">Correo</label>
            <input id="authEmail" type="email" autoComplete="email" placeholder="contacto@empresa.com" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={160} />
          </div>
          <div className="field">
            <label htmlFor="authPassword">Contraseña</label>
            <input
              id="authPassword"
              type="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={128}
            />
          </div>
          {isRegister && (
            <div className="check-row">
              <input type="checkbox" id="acceptTerms" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
              <label htmlFor="acceptTerms">
                Acepto los{' '}
                <Link to="/terminos" target="_blank" style={{ color: 'var(--signal)' }}>
                  términos de servicio
                </Link>{' '}
                y la{' '}
                <Link to="/privacidad" target="_blank" style={{ color: 'var(--signal)' }}>
                  política de privacidad
                </Link>{' '}
                de Forge Labs.
              </label>
            </div>
          )}
          <button type="submit" className="btn btn-forge btn-block" disabled={busy}>
            {busy ? 'Procesando…' : isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="switch-line">
          {isRegister ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta? '}
          <button type="button" className="link-btn" onClick={() => switchMode(isRegister ? 'login' : 'register')}>
            {isRegister ? 'Inicia sesión' : 'Créala aquí'}
          </button>
        </p>
        <p className="switch-line">
          <Link to="/" style={{ color: 'var(--dim)' }}>
            ← Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  )
}
