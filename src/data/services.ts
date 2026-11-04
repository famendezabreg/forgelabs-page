export type ServiceCategory = 'proyectos' | 'ia' | 'asesoria'

export interface Service {
  slug: string
  category: ServiceCategory
  name: string
  description: string
  features: string[]
  price_note: string
  badge: string
  badge_tone: 'default' | 'on'
}

/** Datos de respaldo: se usan si Supabase no está configurado o no responde. Deben coincidir con la migración 0005. */
export const FALLBACK_SERVICES: Service[] = [
  {
    slug: 'presencia-digital',
    category: 'proyectos',
    name: 'Presencia digital',
    description: 'Sitio web, dominio y SEO básico para que tu negocio se encuentre y atraiga clientes.',
    features: ['Sitio web', 'Dominio', 'SEO básico'],
    price_note: 'Desde $600 + $25/mes (hosting, soporte y cambios menores)',
    badge: 'Proyecto',
    badge_tone: 'default',
  },
  {
    slug: 'automatizacion-ia',
    category: 'ia',
    name: 'Automatización con IA',
    description: 'Chatbot de WhatsApp con IA que responde y agenda, y pasa la conversación a una persona cuando hace falta.',
    features: ['Chatbot de WhatsApp con IA', 'Respuestas y agendamiento automáticos', 'Escalamiento a una persona', 'Revisión humana siempre'],
    price_note: 'Desde $800 + $45/mes (incluye el uso de la IA)',
    badge: 'IA con revisión humana',
    badge_tone: 'on',
  },
  {
    slug: 'software-a-medida',
    category: 'proyectos',
    name: 'Software a medida',
    description: 'Sistemas hechos a la medida de tu operación: inventario, órdenes de servicio y citas.',
    features: ['Inventario, órdenes de servicio y citas', 'Roles y permisos', 'Reportes PDF'],
    price_note: 'Desde $1,500 + $80/mes (respaldos y actualizaciones)',
    badge: 'Proyecto',
    badge_tone: 'default',
  },
  {
    slug: 'asesoria',
    category: 'asesoria',
    name: 'Asesoría y acompañamiento',
    description: 'Diagnóstico de la experiencia de usuario y de tus procesos, con un plan de mejora concreto.',
    features: ['Diagnóstico de UX y procesos', 'Plan de mejora'],
    price_note: '$250 por diagnóstico (sin mensualidad)',
    badge: 'Asesoría',
    badge_tone: 'default',
  },
  {
    slug: 'saas-micro',
    category: 'asesoria',
    name: 'SaaS para microempresas',
    description: 'Software por suscripción para microempresas, sin costo de instalación.',
    features: ['Plan Micro: 1 módulo, hasta 3 usuarios', 'Plan Pro: servicio técnico SGS + inventario, avisos por WhatsApp', 'Sin costo de instalación'],
    price_note: 'Plan Micro $25/mes · Plan Pro $45/mes',
    badge: 'SaaS',
    badge_tone: 'default',
  },
]

export const CATEGORY_FILTERS: { key: 'all' | ServiceCategory; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'proyectos', label: 'Proyectos' },
  { key: 'ia', label: 'IA aplicada' },
  { key: 'asesoria', label: 'Asesoría y SaaS' },
]
