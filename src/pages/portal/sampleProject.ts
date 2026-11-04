import type { Milestone, Project, ProjectDocument, ProjectUpdate } from '../../lib/types'

/** Datos de ejemplo (octubre–noviembre 2026) para que un cliente sin proyectos vea cómo luce el portal. */
export function buildSample() {
  const project: Project = {
    id: 'demo',
    client_id: 'demo',
    client_name: 'Compupart Store',
    owner: 'Fernando M.',
    name: 'SGS — versión multiempresa para SaaS',
    service_slug: 'software-a-medida',
    status: 'production',
    progress: 80,
    monthly_fee_usd: 80,
    next_delivery_date: '2026-11-20',
    next_delivery_note: 'Conversión a SaaS: panel de planes y suscripciones',
    created_at: '2026-10-01',
  }

  const m = (
    id: string,
    title: string,
    status: Milestone['status'],
    due: string,
    amount: number | null,
    paid: boolean,
    order: number,
  ): Milestone => ({ id, project_id: 'demo', title, due_date: due, status, amount_usd: amount, paid, sort_order: order })

  const milestones: Milestone[] = [
    m('m1', 'SGS en producción para el grupo de 3 empresas', 'done', '2026-10-05', null, false, 0),
    m('m2', 'Reportes técnicos en PDF automáticos', 'done', '2026-10-15', null, false, 1),
    m('m3', 'Conversión a SaaS: modelo multiempresa y planes', 'in_progress', '2026-11-20', null, false, 2),
    m('m4', 'Mensualidad — octubre 2026', 'done', '2026-10-31', 80, true, 3),
    m('m5', 'Mensualidad — noviembre 2026', 'pending', '2026-11-30', 80, false, 4),
  ]

  const u = (id: string, body: string, date: string): ProjectUpdate => ({
    id,
    project_id: 'demo',
    body,
    created_at: `${date}T12:00:00`,
  })
  const updates: ProjectUpdate[] = [
    u('u1', 'Inicia la conversión del SGS a SaaS: separación de datos por empresa y definición de planes.', '2026-11-02'),
    u('u2', 'Los reportes técnicos en PDF se generan automáticamente al cerrar cada orden de servicio.', '2026-10-15'),
    u('u3', 'El SGS opera en producción con roles de técnico, vendedor, bodega y administrador.', '2026-10-05'),
  ]

  const d = (id: string, name: string, date: string): ProjectDocument => ({
    id,
    project_id: 'demo',
    name,
    storage_path: '',
    size_bytes: null,
    created_at: `${date}T12:00:00`,
  })
  const documents: ProjectDocument[] = [
    d('d1', 'Manual de usuario SGS.pdf', '2026-10-06'),
    d('d2', 'Propuesta de conversión a SaaS.pdf', '2026-10-28'),
  ]

  return { project, milestones, updates, documents }
}
