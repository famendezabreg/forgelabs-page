import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth, type Role } from '../lib/AuthContext'

const LOADING = (
  <div className="loading-screen" role="status">
    CARGANDO//
  </div>
)

/** Exige sesión. Con `roles`, además exige que el perfil tenga uno de esos roles. */
export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) return LOADING
  if (!user) return <Navigate to="/acceso" replace state={{ from: location.pathname }} />
  if (roles) {
    if (!profile || !roles.includes(profile.role)) return <Navigate to="/portal" replace />
  }
  return <Outlet />
}
