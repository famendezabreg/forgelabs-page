import { useEffect, useState } from 'react'
import { FALLBACK_SERVICES, type Service } from '../data/services'
import { supabase } from './supabase'

/** Carga el catálogo desde Supabase; si falla o está vacío, usa los datos de respaldo. */
export function useServices() {
  const [services, setServices] = useState<Service[]>(FALLBACK_SERVICES)
  const [loading, setLoading] = useState(supabase !== null)

  useEffect(() => {
    if (!supabase) return
    let cancelled = false
    supabase
      .from('services')
      .select('slug, category, name, description, features, price_note, badge, badge_tone')
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return
        if (!error && data && data.length > 0) setServices(data as Service[])
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { services, loading }
}
