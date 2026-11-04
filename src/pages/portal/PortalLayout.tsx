import { Outlet, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'
import { STATUS_LABEL } from '../../lib/types'
import { useProjectBundle, useProjects } from '../../lib/useProjectData'
import { useMemo } from 'react'
import type { PortalContext } from './portalContext'
import { PortalSummaryView } from './PortalSummaryView'
import { buildSample } from './sampleProject'

export default function PortalLayout() {
  const { profile, user, signOut } = useAuth()
  const { projects, loading: loadingProjects, error: projectsError } = useProjects('mine')
  const [params, setParams] = useSearchParams()

  const selectedId = params.get('proyecto')
  const project = projects.find((p) => p.id === selectedId) ?? projects[0] ?? null
  const bundle = useProjectBundle(project?.id)

  const sample = useMemo(() => buildSample(), [])
  const name = profile?.company_name ?? profile?.full_name ?? user?.email ?? 'Cliente'

  const header = (
    <div className="app-topbar">
      <div>
        <span className="kicker">Portal de cliente</span>
        <h1>{name}</h1>
      </div>
      <div className="row-actions">
        {project && (
          <span className="pill on">
            <span className="dot-live" />
            {STATUS_LABEL[project.status]}
          </span>
        )}
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => void signOut()}>
          Cerrar sesión
        </button>
      </div>
    </div>
  )

  if (loadingProjects) {
    return (
      <>
        {header}
        <p className="empty" role="status">
          Cargando tus proyectos…
        </p>
      </>
    )
  }

  if (projectsError) {
    return (
      <>
        {header}
        <div className="form-msg error" role="alert">
          {projectsError}
        </div>
      </>
    )
  }

  if (!project) {
    return (
      <>
        {header}
        <div className="demo-banner" role="note">
          <span className="pill warn">VISTA DE EJEMPLO</span>
          <p>
            Todavía no tienes proyectos. Así verás el avance, los hitos, los documentos y los pagos de tu proyecto cuando lo iniciemos.
          </p>
        </div>
        <div className="demo-frame" aria-label="Ejemplo de portal">
          <PortalSummaryView {...sample} />
        </div>
      </>
    )
  }

  return (
    <>
      {header}
      {projects.length > 1 && (
        <div className="field" style={{ maxWidth: 360 }}>
          <label htmlFor="projectSelect">Proyecto</label>
          <select id="projectSelect" value={project.id} onChange={(e) => setParams({ proyecto: e.target.value })}>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <Outlet context={{ project, ...bundle } satisfies PortalContext} />
    </>
  )
}
