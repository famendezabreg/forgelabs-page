import { Suspense } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

interface Props {
  label: string
  links: { to: string; label: string; end?: boolean }[]
  variant?: 'portal' | 'admin'
}

export function AppShell({ label, links, variant = 'portal' }: Props) {
  return (
    <div className={`app-shell ${variant}`}>
      <aside className="app-side">
        <nav aria-label={label}>
          <span className="side-label">{label}</span>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className="side-link">
              <span className="ic" aria-hidden="true" />
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="app-main">
        <Suspense
          fallback={
            <p className="empty" role="status">
              Cargando…
            </p>
          }
        >
          <Outlet />
        </Suspense>
      </div>
    </div>
  )
}
