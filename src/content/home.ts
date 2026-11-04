/**
 * Todo el texto de la página principal vive aquí.
 * Los valores que empiezan con TODO_ son placeholders: en producción (build) las secciones
 * o campos que dependen de ellos se ocultan hasta que los reemplaces.
 */

export const isTodo = (value: string) => value.startsWith('TODO_')
/** En producción un placeholder no se muestra; en desarrollo sí, para que lo veas. */
export const visible = (value: string) => !(import.meta.env.PROD && isTodo(value))

export const NAV = {
  links: [
    { id: 'servicios', label: 'Servicios' },
    { id: 'metodo', label: 'Método' },
    { id: 'casos', label: 'Casos' },
    { id: 'nosotros', label: 'Nosotros' },
    { id: 'contacto', label: 'Contacto' },
  ],
  cta: 'Cotizar proyecto',
  login: 'Ingresar',
}

export const HERO = {
  kicker: 'AGENCIA DE SOFTWARE + IA · SV',
  title: ['Forjamos el software y la IA que tu negocio necesita para ', 'competir', '.'] as const,
  lede: 'Sitios web, chatbots de WhatsApp con IA, software a medida y asesoría para MIPYMEs que no tienen equipo técnico interno — ni presupuesto de multinacional.',
  primaryCta: 'Cotizar un proyecto',
  secondaryCta: 'Ver casos',
  readout: {
    system: 'IA con revisión humana obligatoria',
    clientsLabel: 'CLIENTES ACTIVOS//',
    clients: 3,
    expansion: 'SV → Centroamérica → LatAm',
  },
  testimonial: {
    quote: 'TODO_TESTIMONIO — una frase real de un cliente, de una o dos líneas.',
    author: 'TODO_NOMBRE_CLIENTE',
    role: 'TODO_CARGO · TODO_EMPRESA',
  },
}

export const PROBLEMS = {
  kicker: 'Lo que resolvemos',
  title: 'Tres problemas reales. Pasa el cursor para ver el impacto.',
  items: [
    {
      title: 'Invisibilidad digital',
      desc: 'Miles de MIPYMEs operan sin presencia web ni herramientas digitales.',
      detail: 'Se traduce en menos leads entrantes y dependencia total del boca a boca.',
      tone: 'ac-forge',
    },
    {
      title: 'IA sin aplicación clara',
      desc: 'Las empresas saben que la IA existe, pero no saben cómo aplicarla.',
      detail: 'El resultado: pilotos que nunca escalan, o decisiones automatizadas sin ningún control.',
      tone: 'ac-signal',
    },
    {
      title: 'Software "inaccesible"',
      desc: 'El desarrollo a medida se asocia con presupuestos grandes.',
      detail: 'Consecuencia: procesos manuales que no escalan frente a competidores digitalizados.',
      tone: 'ac-forge',
    },
  ],
}

export const SERVICES = {
  kicker: 'Servicios',
  title: 'Cuatro servicios y un SaaS.',
  intro: 'Precios claros desde el inicio. Y en todo lo que lleva IA, una persona revisa antes de que algo llegue a tus clientes.',
  cta: 'Cotizar este servicio →',
  categoryLabel: { proyectos: 'PROYECTOS', ia: 'IA APLICADA', asesoria: 'ASESORÍA Y SAAS' } as Record<string, string>,
  /** "Qué aporta" por slug de servicio. */
  aporta: {
    'presencia-digital': 'Dejas de depender del boca a boca: tu negocio se encuentra en internet y recibe prospectos.',
    'automatizacion-ia': 'Atiendes a tus clientes por WhatsApp a cualquier hora. La IA responde y agenda; una persona revisa y toma el relevo cuando hace falta.',
    'software-a-medida': 'Dejas el papel y las hojas sueltas: tu operación queda digitalizada, con roles, control y reportes.',
    asesoria: 'Sabes qué mejorar primero: un diagnóstico claro y un plan de mejora, sin compromiso de desarrollo.',
    'saas-micro': 'Software listo para usar desde el primer día, por una mensualidad y sin costo de instalación.',
  } as Record<string, string>,
  aportaFallback: 'Un alcance claro, un responsable y avance visible desde la primera semana.',
  aportaLabel: 'QUÉ APORTA//',
}

export const METHOD = {
  kicker: 'Método',
  title: 'Cinco etapas. Un solo responsable.',
  labels: ['Qué hacemos', 'Qué recibes', 'Qué ves en tu portal'] as const,
  stages: [
    {
      name: 'Discovery',
      what: 'Entendemos tu negocio, tus procesos y el problema que de verdad duele. Medimos el punto de partida.',
      get: 'Un diagnóstico escrito con el problema, los datos de base y lo que no conviene construir.',
      portal: 'Tu cuenta de cliente y el estado de la cotización.',
    },
    {
      name: 'Propuesta',
      what: 'Definimos alcance, tecnología, tiempos y fases de pago. Todo por escrito, sin letra chica.',
      get: 'Una propuesta técnica y comercial en PDF para revisar y aprobar.',
      portal: 'La propuesta, su estado y la firma de aprobación.',
    },
    {
      name: 'Desarrollo',
      what: 'Construimos por sprints cortos y mostramos avance real, no capturas de pantalla.',
      get: 'Entregas parciales funcionando y una nota de avance en cada hito.',
      portal: 'Barra de progreso, línea de actividad y próximos entregables.',
    },
    {
      name: 'Entrega',
      what: 'Desplegamos en la plataforma más adecuada y dejamos al equipo operando.',
      get: 'El sistema en producción, accesos, documentación y una sesión de traspaso.',
      portal: 'Documentos finales, manual de uso y estado de facturación.',
    },
    {
      name: 'Soporte',
      what: 'Monitoreamos, corregimos y mejoramos lo entregado, con tiempos de respuesta acordados.',
      get: 'Una mensualidad que cubre hosting, soporte y cambios menores, según el servicio.',
      portal: 'Historial de mejoras y canal directo con el equipo.',
    },
  ],
}

export const PRINCIPLES = {
  kicker: 'Principios',
  title: 'Tres reglas que no se negocian.',
  items: [
    {
      tag: 'REVISIÓN// HUMANA OBLIGATORIA',
      title: 'IA con revisión humana obligatoria',
      body: 'Toda decisión que toma un modelo pasa por una persona antes de afectar a un cliente tuyo. Diseñamos el paso de revisión como parte del sistema, no como un extra.',
    },
    {
      tag: 'AVANCE// EN TU PORTAL',
      title: 'Avance visible en tu portal, no en correos',
      body: 'Estado, hitos y documentos en un solo lugar.',
    },
    {
      tag: 'MEDICIÓN// ANTES Y DESPUÉS',
      title: 'Medimos antes y después',
      body: 'Fijamos una métrica de base en discovery y la comparamos al entregar.',
    },
  ],
}

export const PAYMENT = {
  kicker: 'Cómo se paga',
  title: 'Paga por avance, no por fe.',
  body: [
    'Por fases: la mitad al arrancar y la otra mitad contra la entrega. Cada fase queda registrada en tu portal, con su estado de pago.',
    'Después, una mensualidad baja cubre hosting, soporte y cambios menores (desde $25/mes según el servicio). Sin letra chica.',
  ],
  cta: 'Consultar esta opción',
  invoice: {
    note: 'EJEMPLO ILUSTRATIVO',
    id: 'FL-0001',
    project: 'Presencia digital (desde $600)',
    lines: [
      { label: 'Fase 1 · Arranque (50%)', amount: 300, stamp: 'PAGADO', suffix: '' },
      { label: 'Fase 2 · Entrega (50%)', amount: 300, stamp: 'PENDIENTE', suffix: '' },
      { label: 'Mensualidad (hosting y soporte)', amount: 25, stamp: 'CADA MES', suffix: '/mes' },
    ],
    totalLabel: 'TOTAL DEL PROYECTO',
    stamp: 'FASE 1 · PAGADA',
  },
}

export const CASES = {
  kicker: 'Casos',
  title: 'Proyectos reales, no mockups.',
  statusLabel: 'Estado',
  items: [
    {
      name: 'NODO 624',
      tag: 'PRESENCIA DIGITAL',
      sector: 'OFICINAS CORPORATIVAS · COL. ESCALÓN',
      status: 'Fase 2 en propuesta',
      body: 'Sitio web con galería de espacios, formulario de prospectos conectado a base de datos y contenido semanal en redes. La fase 2 es un sistema de gestión de inquilinos.',
      chips: ['Sitio web', 'Galería de espacios', 'Formulario de prospectos', 'Contenido semanal en redes'],
    },
    {
      name: 'Compupart Store',
      tag: 'SOFTWARE A MEDIDA',
      sector: 'SERVICIO TÉCNICO',
      status: 'En producción',
      body: 'Sistema de Gestión de Servicios (SGS) para un grupo de 3 empresas. Digitaliza el flujo del taller desde el ingreso del equipo, con evidencia fotográfica y firma del cliente, hasta la entrega. Lo estamos convirtiendo en SaaS.',
      chips: ['Modelo multiempresa', 'Técnico, vendedor, bodega y administrador', 'Reportes técnicos PDF automáticos'],
    },
    {
      name: 'La Fábrica ON',
      tag: 'ASESORÍA',
      sector: 'BRANDING Y ESTRATEGIA',
      status: 'Contrato de rediseño',
      body: 'Diagnóstico de la experiencia de usuario de su sitio web, que terminó en un contrato de rediseño.',
      chips: ['Diagnóstico de UX', 'Rediseño web'],
    },
  ],
}

export const ABOUT = {
  kicker: 'Nosotros',
  title: 'Tecnología real no debería ser privilegio de pocos.',
  mission: {
    label: 'MISIÓN//',
    text: 'Forjar software e IA a la medida de negocios que nunca tuvieron un equipo técnico, con avance visible y cuentas claras.',
  },
  vision: {
    label: 'VISIÓN//',
    text: 'Ser el socio tecnológico de las MIPYMEs de la región.',
    route: 'SV → Centroamérica → LatAm',
  },
  values: [
    { title: 'Oficio', body: 'Preferimos hacerlo bien y explicarlo, que hacerlo rápido y esconderlo.' },
    { title: 'Claridad', body: 'Alcance, tiempos y costos por escrito antes de escribir una línea de código.' },
    { title: 'Criterio humano', body: 'La IA acelera. Las decisiones importantes las toma una persona.' },
  ],
}

export const TEAM = {
  kicker: 'Equipo',
  title: 'Quién está detrás.',
  members: [
    {
      name: 'TODO_NOMBRE',
      role: 'TODO_ROL · FUNDADOR',
      photo: 'TODO_FOTO',
      linkedin: 'TODO_LINKEDIN',
      bio: 'TODO_BIO — dos líneas sobre trayectoria y por qué fundaste Forge Labs.',
    },
  ],
  linkedinLabel: 'LinkedIn ↗',
}

export const FAQ = {
  kicker: 'Preguntas frecuentes',
  title: 'Lo que casi todos preguntan.',
  items: [
    {
      q: '¿Cuánto tarda un proyecto?',
      a: 'Depende del alcance. Un sitio web es cuestión de semanas; un software a medida toma más. El plazo exacto queda escrito en la propuesta, con fechas por fase.',
    },
    {
      q: '¿Cuánto cuesta?',
      a: 'Presencia digital desde $600 + $25/mes, automatización con IA desde $800 + $45/mes, software a medida desde $1,500 + $80/mes y asesoría a $250 por diagnóstico. El proyecto se paga por fases (50/50) y después hay una mensualidad.',
    },
    {
      q: '¿De quién es el código?',
      a: 'TODO_CONFIRMAR_POLITICA — por defecto: el código y los datos de tu proyecto son tuyos al completar el pago; los términos finales quedan en el contrato.',
    },
    {
      q: '¿Qué soporte hay después de la entrega?',
      a: 'La mensualidad cubre hosting, soporte, cambios menores y, según el servicio, respaldos, actualizaciones y el uso de la IA.',
    },
    {
      q: '¿Qué pasa si la IA se equivoca?',
      a: 'Por eso hay una persona en el circuito. Ninguna decisión del modelo afecta a tus clientes sin revisión humana, y dejamos registro de cada decisión para auditarla.',
    },
  ],
}

export const CONTACT = {
  id: 'contacto',
  title: 'Cuéntanos el problema. Nosotros forjamos la solución.',
  cta: 'Cotizar proyecto',
  whatsappLabel: 'WHATSAPP//',
  emailLabel: 'CORREO//',
  whatsapp: 'TODO_WHATSAPP', // formato 50370000000
  email: 'TODO_CORREO',
}

export const FOOTER = {
  tagline: 'Forjamos software e IA con criterio humano.',
  navTitle: 'Navegación',
  contactTitle: 'Contacto',
  legal: 'FORGE LABS © 2026',
  legalNote: 'Agencia de software + IA aplicada · El Salvador',
}
