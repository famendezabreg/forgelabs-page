export type ProjectStatus = 'discovery' | 'development' | 'production' | 'maintenance' | 'delivered' | 'paused'
export type MilestoneStatus = 'pending' | 'in_progress' | 'done'

export interface Project {
  id: string
  client_id: string | null
  client_name: string | null
  owner: string | null
  name: string
  service_slug: string | null
  status: ProjectStatus
  progress: number
  monthly_fee_usd: number | null
  next_delivery_date: string | null
  next_delivery_note: string | null
  created_at: string
}

export interface Milestone {
  id: string
  project_id: string
  title: string
  due_date: string | null
  status: MilestoneStatus
  amount_usd: number | null
  paid: boolean
  sort_order: number
}

export interface ProjectUpdate {
  id: string
  project_id: string
  body: string
  created_at: string
}

export interface ProjectDocument {
  id: string
  project_id: string
  name: string
  storage_path: string
  size_bytes: number | null
  created_at: string
}

export interface ClientProfile {
  id: string
  email: string | null
  full_name: string | null
  company_name: string | null
  sector: string | null
  role: string
  created_at: string
}

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  discovery: 'Discovery',
  development: 'En desarrollo',
  production: 'En producción',
  maintenance: 'Mantenimiento',
  delivered: 'Entregado',
  paused: 'Pausado',
}

export const STATUS_BADGE: Record<ProjectStatus, string> = {
  discovery: 'disc',
  development: 'dev',
  production: 'dev',
  maintenance: 'maint',
  delivered: 'dev',
  paused: 'disc',
}

export const MILESTONE_LABEL: Record<MilestoneStatus, string> = {
  pending: 'Pendiente',
  in_progress: 'En curso',
  done: 'Completado',
}
