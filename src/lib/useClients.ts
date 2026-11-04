import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { ClientProfile } from './types'

/** Perfiles visibles para el admin (todos). Solo funciona con rol admin/manager por RLS. */
export function useClients() {
  const [clients, setClients] = useState<ClientProfile[]>([])
  const [loading, setLoading] = useState(supabase !== null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) return
    let active = true
    supabase
      .from('profiles')
      .select('id, email, full_name, company_name, sector, role, created_at')
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (!active) return
        setError(err ? 'No se pudieron cargar los clientes.' : null)
        setClients((data ?? []) as ClientProfile[])
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return { clients, loading, error }
}

export function clientLabel(c: Pick<ClientProfile, 'company_name' | 'full_name' | 'email'> | undefined): string {
  if (!c) return '—'
  return c.company_name || c.full_name || c.email || '—'
}
