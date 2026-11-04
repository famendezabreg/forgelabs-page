import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Brand } from './Brand'
import { useAuth } from '../lib/AuthContext'
import { useReveal } from '../hooks/useReveal'

const LINKS = [
  { to: '/catalogo', label: 'Servicios' },
  { to: '/#casos', label: 'Casos' },
  { to: '/cotizar', label: 'Cotizar' },
]

const YEAR = new Date().getFullYear()

export function Layout() {
  const [open, setOpen] = useState(false)
  const { pathname, hash } = useLocation()
  const { user, profile } = useAuth()

  useReveal(pathname)

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        return
      }
    }
    window.scrollTo({ top: 0 })
  }, [pathname, hash])

  const isAdmin = profile?.role === 'admin' || profile?.role === 'manager'
  const accountLink = !user
    ? { to: '/acceso', label: 'Ingresar' }
    : isAdmin
      ? { to: '/admin', label: 'Panel admin' }
      : { to: '/portal', label: 'Mi portal' }

  return (
    <>
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>
      <div className="grain" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />

      <header className="site-nav">
        <div className="site-nav-inner">
          <Link to="/" aria-label="Forge Labs — inicio">
            <Brand />
          </Link>
          <nav className="nav-links" aria-label="Principal">
            {LINKS.map((l) =>
              l.to.includes('#') ? (
                <Link key={l.to} to={l.to}>
                  {l.label}
                </Link>
              ) : (
                <NavLink key={l.to} to={l.to}>
                  {l.label}
                </NavLink>
              ),
            )}
          </nav>
          <div className="nav-actions">
            <Link to={accountLink.to} className="btn btn-ghost btn-sm">
              {accountLink.label}
            </Link>
            <Link to="/cotizar" className="btn btn-forge btn-sm btn-quote">
              Cotizar proyecto
            </Link>
            <button
              type="button"
              className="nav-toggle"
              aria-expanded={open}
              aria-controls="nav-mobile"
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
              onClick={() => setOpen((v) => !v)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>
        <nav id="nav-mobile" className={`nav-mobile${open ? ' open' : ''}`} aria-label="Menú móvil" onClick={() => setOpen(false)}>
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to}>
              {l.label}
            </Link>
          ))}
          <Link to="/cotizar" className="btn btn-forge">
            Cotizar proyecto
          </Link>
        </nav>
      </header>

      <main id="main-content" className="page-in" key={pathname} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>

      <footer className="site-foot">
        <div className="site-foot-links">
          <Link to="/catalogo">Servicios</Link>
          <Link to="/cotizar">Cotizar</Link>
          <Link to="/acceso">Portal de cliente</Link>
          <Link to="/terminos">Términos</Link>
          <Link to="/privacidad">Privacidad</Link>
        </div>
        FORGE LABS © {YEAR} — Agencia de software + IA aplicada · El Salvador
      </footer>
    </>
  )
}
