import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Brand } from '../Brand'
import { useActiveSection } from '../../hooks/useActiveSection'
import { useAuth } from '../../lib/AuthContext'
import { NAV } from '../../content/home'

const IDS = NAV.links.map((l) => l.id)

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const active = useActiveSection(IDS)
  const { user, profile } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const isAdmin = profile?.role === 'admin' || profile?.role === 'manager'
  const account = !user
    ? { to: '/acceso', label: NAV.login }
    : isAdmin
      ? { to: '/admin', label: 'Panel admin' }
      : { to: '/portal', label: 'Mi portal' }

  const activeIdx = IDS.indexOf(active ?? '')

  return (
    <>
      <header className={`hnav${scrolled ? ' scrolled' : ''}`}>
        <div className="hnav-inner">
          <a href="#top" aria-label="Forge Labs — inicio" onClick={() => setOpen(false)}>
            <Brand />
          </a>

          <nav className="hnav-links" aria-label="Principal">
            {NAV.links.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                className={active === l.id ? 'active' : ''}
                aria-current={active === l.id ? 'true' : undefined}
              >
                {l.label}
              </a>
            ))}
            <span
              className="hnav-indicator"
              aria-hidden="true"
              style={{
                opacity: activeIdx < 0 ? 0 : 1,
                transform: `translateX(${Math.max(activeIdx, 0) * 100}%)`,
                width: `${100 / NAV.links.length}%`,
              }}
            />
          </nav>

          <div className="hnav-actions">
            <Link to={account.to} className="hnav-login">
              {account.label}
            </Link>
            <Link to="/cotizar" className="btn btn-forge btn-sm hnav-cta">
              {NAV.cta}
            </Link>
            <button
              type="button"
              className="hnav-toggle"
              aria-expanded={open}
              aria-controls="hnav-menu"
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
              onClick={() => setOpen((v) => !v)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                {open ? <path d="M5 5l14 14M19 5L5 19" /> : <path d="M3 8h18M3 16h18" />}
              </svg>
            </button>
          </div>
        </div>
      </header>
      <div id="hnav-menu" className={`hmenu${open ? ' open' : ''}`} hidden={!open} onClick={() => setOpen(false)}>
        <nav aria-label="Menú móvil">
          {NAV.links.map((l, i) => (
            <a key={l.id} href={`#${l.id}`} style={{ ['--i' as string]: i }}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hmenu-foot">
          <Link to="/cotizar" className="btn btn-forge">
            {NAV.cta}
          </Link>
          <Link to={account.to} className="btn btn-ghost">
            {account.label}
          </Link>
        </div>
      </div>
    </>
  )
}
