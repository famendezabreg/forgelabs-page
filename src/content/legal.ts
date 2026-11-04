/**
 * Borrador de textos legales. Revísalos con asesoría legal antes de publicar.
 * Describen únicamente lo que el sitio hace hoy.
 */
export interface LegalDoc {
  title: string
  updated: string
  sections: { heading: string; body: string[] }[]
}

export const LEGAL_CONTACT = 'TODO_CORREO'

export const TERMS: LegalDoc = {
  title: 'Términos de servicio',
  updated: 'Octubre 2026',
  sections: [
    {
      heading: '1. Quiénes somos',
      body: ['Forge Labs es una agencia de software e inteligencia artificial aplicada con sede en El Salvador. Este sitio permite solicitar cotizaciones y, a los clientes, seguir el avance de sus proyectos.'],
    },
    {
      heading: '2. Cuenta de cliente',
      body: [
        'Para acceder al portal necesitas una cuenta. Eres responsable de mantener la confidencialidad de tu contraseña y de la actividad realizada con tu cuenta.',
        'Debes darnos información veraz. Podemos suspender cuentas que se usen de forma indebida o que pongan en riesgo la seguridad del sistema.',
      ],
    },
    {
      heading: '3. Cotizaciones y proyectos',
      body: [
        'Enviar una solicitud de cotización no genera obligación para ninguna de las partes. El alcance, los tiempos y el precio de cada proyecto se acuerdan por escrito en una propuesta aprobada por el cliente.',
        'Los proyectos se pagan por fases y, cuando aplica, con una mensualidad, según lo indicado en la propuesta.',
      ],
    },
    {
      heading: '4. Uso aceptable',
      body: ['No puedes intentar acceder a datos de otros clientes, interferir con el funcionamiento del sitio ni usarlo para fines ilícitos.'],
    },
    {
      heading: '5. Propiedad intelectual',
      body: ['El diseño, textos y marca de este sitio pertenecen a Forge Labs. La titularidad del código y los entregables de cada proyecto se define en el contrato correspondiente.'],
    },
    {
      heading: '6. Limitación de responsabilidad',
      body: ['El sitio se ofrece tal como está. Forge Labs no responde por interrupciones del servicio ajenas a su control, dentro de lo permitido por la ley aplicable.'],
    },
    {
      heading: '7. Cambios y contacto',
      body: ['Podemos actualizar estos términos; la fecha de actualización aparece al inicio. Para consultas escríbenos a {{contact}}.'],
    },
  ],
}

export const PRIVACY: LegalDoc = {
  title: 'Política de privacidad',
  updated: 'Octubre 2026',
  sections: [
    {
      heading: '1. Qué datos recopilamos',
      body: [
        'Al solicitar una cotización: nombre, correo, empresa, sector, presupuesto estimado, servicio de interés y el mensaje que escribas.',
        'Al crear una cuenta: correo, contraseña (almacenada de forma cifrada por nuestro proveedor de autenticación), nombre de la empresa, tu nombre y sector.',
        'Como cliente: la información de tus proyectos, documentos que compartimos contigo, hitos y estado de pagos.',
      ],
    },
    {
      heading: '2. Para qué los usamos',
      body: ['Para responder tus solicitudes, preparar propuestas, gestionar tus proyectos y facturación, y mantener la seguridad del sitio. No vendemos tus datos.'],
    },
    {
      heading: '3. Dónde se almacenan',
      body: ['Usamos Supabase (base de datos, autenticación y almacenamiento de archivos) y Cloudflare (alojamiento y red). Estos proveedores procesan datos en nuestro nombre.'],
    },
    {
      heading: '4. Quién puede verlos',
      body: ['Cada cliente solo ve la información de sus propios proyectos. El equipo de Forge Labs accede a los datos necesarios para prestar el servicio.'],
    },
    {
      heading: '5. Tus derechos',
      body: ['Puedes pedirnos acceso, corrección o eliminación de tus datos escribiendo a {{contact}}. Conservamos la información el tiempo necesario para prestar el servicio y cumplir obligaciones legales.'],
    },
    {
      heading: '6. Cookies y almacenamiento local',
      body: ['Usamos almacenamiento del navegador únicamente para mantener tu sesión iniciada. No usamos cookies publicitarias ni de seguimiento.'],
    },
  ],
}
