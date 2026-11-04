import { lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Quote from './pages/Quote'
import Auth from './pages/Auth'
import { AppShell } from './components/AppShell'
const PortalLayout = lazy(() => import('./pages/portal/PortalLayout'))
const PortalSummary = lazy(() => import('./pages/portal/PortalSummary'))
const PortalDocuments = lazy(() => import('./pages/portal/PortalDocuments'))
const PortalBilling = lazy(() => import('./pages/portal/PortalBilling'))
const AdminProjects = lazy(() => import('./pages/admin/AdminProjects'))
const AdminProjectDetail = lazy(() => import('./pages/admin/AdminProjectDetail'))
const AdminClients = lazy(() => import('./pages/admin/AdminClients'))
const AdminCrm = lazy(() => import('./pages/admin/AdminCrm'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
import NotFound from './pages/NotFound'
import { Privacy, Terms } from './pages/Legal'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route index element={<Home />} />
          <Route element={<Layout />}>
            <Route path="catalogo" element={<Catalog />} />
            <Route path="cotizar" element={<Quote />} />
            <Route path="acceso" element={<Auth />} />
            <Route path="terminos" element={<Terms />} />
            <Route path="privacidad" element={<Privacy />} />
            <Route element={<ProtectedRoute />}>
              <Route
                path="portal"
                element={
                  <AppShell
                    label="Portal"
                    links={[
                      { to: '/portal', label: 'Resumen', end: true },
                      { to: '/portal/documentos', label: 'Documentos' },
                      { to: '/portal/facturacion', label: 'Facturación' },
                    ]}
                  />
                }
              >
                <Route element={<PortalLayout />}>
                  <Route index element={<PortalSummary />} />
                  <Route path="documentos" element={<PortalDocuments />} />
                  <Route path="facturacion" element={<PortalBilling />} />
                </Route>
              </Route>
            </Route>
            <Route element={<ProtectedRoute roles={['admin', 'manager']} />}>
              <Route
                path="admin"
                element={
                  <AppShell
                    variant="admin"
                    label="Admin"
                    links={[
                      { to: '/admin', label: 'Proyectos', end: true },
                      { to: '/admin/clientes', label: 'Clientes' },
                      { to: '/admin/crm', label: 'CRM' },
                      { to: '/admin/dashboard', label: 'Dashboard' },
                    ]}
                  />
                }
              >
                <Route index element={<AdminProjects />} />
                <Route path="proyectos/:id" element={<AdminProjectDetail />} />
                <Route path="clientes" element={<AdminClients />} />
                <Route path="crm" element={<AdminCrm />} />
                <Route path="dashboard" element={<AdminDashboard />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
