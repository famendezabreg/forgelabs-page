import { useOutletContext } from 'react-router-dom'
import type { Project } from '../../lib/types'
import type { ProjectBundle } from '../../lib/useProjectData'

export interface PortalContext extends ProjectBundle {
  project: Project
  loading: boolean
  error: string | null
}

export function usePortal() {
  return useOutletContext<PortalContext>()
}
