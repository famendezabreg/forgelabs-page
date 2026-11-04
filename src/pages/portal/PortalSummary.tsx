import { openDocument } from '../../lib/useProjectData'
import { PortalSummaryView } from './PortalSummaryView'
import { usePortal } from './portalContext'

export default function PortalSummary() {
  const { project, milestones, updates, documents, loading, error } = usePortal()
  return (
    <PortalSummaryView
      project={project}
      milestones={milestones}
      updates={updates}
      documents={documents}
      loading={loading}
      error={error}
      onOpenDocument={(d) => void openDocument(d)}
    />
  )
}
