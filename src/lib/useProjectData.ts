import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { Milestone, Project, ProjectDocument, ProjectUpdate } from './types'

export interface ProjectBundle {
  milestones: Milestone[]
  updates: ProjectUpdate[]
  documents: ProjectDocument[]
}

const EMPTY: ProjectBundle = { milestones: [], updates: [], documents: [] }

/** Hitos, actividad y documentos de un proyecto. `reload` vuelve a pedirlos tras una escritura. */
export function useProjectBundle(projectId: string | undefined) {
  const [data, setData] = useState<ProjectBundle>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!supabase || !projectId) return
    let active = true
    const sb = supabase
    ;(async () => {
      setLoading(true)
      const [m, u, d] = await Promise.all([
        sb.from('milestones').select('*').eq('project_id', projectId).order('sort_order').order('created_at'),
        sb.from('project_updates').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
        sb.from('documents').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
      ])
      if (!active) return
      const failed = m.error ?? u.error ?? d.error
      setError(failed ? 'No se pudo cargar la información del proyecto.' : null)
      setData({
        milestones: (m.data ?? []) as Milestone[],
        updates: (u.data ?? []) as ProjectUpdate[],
        documents: (d.data ?? []) as ProjectDocument[],
      })
      setLoading(false)
    })()
    return () => {
      active = false
    }
  }, [projectId, tick])

  const reload = useCallback(() => setTick((t) => t + 1), [])
  return { ...data, loading, error, reload }
}

/** Abre un documento mediante URL firmada de corta duración. */
export async function openDocument(doc: ProjectDocument): Promise<string | null> {
  if (!supabase) return 'El almacenamiento no está disponible.'
  const { data, error } = await supabase.storage.from('project-docs').createSignedUrl(doc.storage_path, 60)
  if (error || !data) return 'No se pudo abrir el documento.'
  window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
  return null
}

export function useProjects(scope: 'mine' | 'all') {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(supabase !== null)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!supabase) return
    let active = true
    supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (!active) return
        setError(err ? 'No se pudieron cargar los proyectos.' : null)
        setProjects((data ?? []) as Project[])
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [scope, tick])

  const reload = useCallback(() => setTick((t) => t + 1), [])
  return { projects, loading, error, reload }
}
