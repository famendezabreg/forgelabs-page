-- Datos de ejemplo del plan de negocio para poblar /admin y el CRM.
-- EJECUTAR MANUALMENTE en el SQL Editor, DESPUÉS de las migraciones 0001 a 0005.
-- Se puede ejecutar varias veces: borra y vuelve a crear solo sus propios datos de ejemplo.
--
-- Los proyectos quedan SIN cuenta de portal (se identifican por nombre). Cuando un cliente se registre,
-- puedes vincular el proyecto a su cuenta creando uno nuevo desde /admin.
-- Los avances, fechas y la asignación de responsables son valores de ejemplo: ajústalos en /admin.
-- Los correos terminan en ".invalid" a propósito (no existen): reemplázalos por los reales en el CRM.

-- ---------- limpieza acotada de ejecuciones anteriores ----------
-- No borrar todos los correos .invalid: podrían pertenecer a leads ajenos al seed.
delete from public.leads
 where position('[seed_forge_labs]' in notes) = 1
    or email in (
      'pendiente@nodo624.invalid',
      'pendiente@compupart.invalid',
      'pendiente@lafabricaon.invalid',
      'pendiente-fase2@nodo624.invalid',
      'ejemplo1@ejemplo.invalid',
      'ejemplo2@ejemplo.invalid',
      'ejemplo3@ejemplo.invalid',
      'ejemplo4@ejemplo.invalid'
    );
delete from public.projects
 where client_id is null and (name, client_name, owner) in (
   ('Presencia digital y redes con IA — NODO 624', 'NODO 624', 'Sergio M.'),
   ('Presencia digital y contenido — NODO 624', 'NODO 624', 'Sergio M.'),
   ('NODO 624 · Fase 2: sistema de gestión de inquilinos', 'NODO 624', 'Marco G.'),
   ('SGS — versión multiempresa para SaaS', 'Compupart Store', 'Fernando M.'),
   ('Rediseño web — La Fábrica ON', 'La Fábrica ON', 'Kevin L.')
 );

-- ---------- proyectos ----------
insert into public.projects
  (client_name, owner, name, service_slug, status, progress, monthly_fee_usd, next_delivery_date, next_delivery_note)
values
  ('NODO 624', 'Sergio M.', 'Presencia digital y contenido — NODO 624', 'presencia-digital', 'maintenance', 100, 25,
   '2026-11-10', 'Contenido semanal en redes'),
  ('NODO 624', 'Marco G.', 'NODO 624 · Fase 2: sistema de gestión de inquilinos', 'software-a-medida', 'discovery', 10, null,
   '2026-11-18', 'Propuesta del sistema de gestión de inquilinos'),
  ('Compupart Store', 'Fernando M.', 'SGS — versión multiempresa para SaaS', 'software-a-medida', 'production', 80, 80,
   '2026-11-20', 'Conversión a SaaS: panel de planes y suscripciones'),
  ('La Fábrica ON', 'Kevin L.', 'Rediseño web — La Fábrica ON', 'presencia-digital', 'development', 30, null,
   '2026-11-25', 'Propuesta de diseño del nuevo sitio');

-- ---------- hitos ----------
insert into public.milestones (project_id, title, due_date, status, amount_usd, paid, sort_order)
select p.id, m.title, m.due_date::date, m.status, m.amount, m.paid, m.ord
from public.projects p
join (values
  ('Presencia digital y contenido — NODO 624', 'Sitio web con galería de espacios',                 '2026-09-30', 'done',        null::numeric, false, 0),
  ('Presencia digital y contenido — NODO 624', 'Formulario de prospectos conectado a base de datos', '2026-10-10', 'done',        null, false, 1),
  ('Presencia digital y contenido — NODO 624', 'Contenido semanal en redes',                         '2026-11-10', 'in_progress', null, false, 2),
  ('NODO 624 · Fase 2: sistema de gestión de inquilinos', 'Propuesta del sistema de gestión de inquilinos', '2026-11-18', 'in_progress', null, false, 0),
  ('SGS — versión multiempresa para SaaS', 'SGS en producción para el grupo de 3 empresas',        '2026-10-05', 'done',        null, false, 0),
  ('SGS — versión multiempresa para SaaS', 'Reportes técnicos en PDF automáticos',                 '2026-10-15', 'done',        null, false, 1),
  ('SGS — versión multiempresa para SaaS', 'Conversión a SaaS: modelo multiempresa y planes',       '2026-11-20', 'in_progress', null, false, 2),
  ('SGS — versión multiempresa para SaaS', 'Mensualidad — octubre 2026',                            '2026-10-31', 'done',        80,   true,  3),
  ('SGS — versión multiempresa para SaaS', 'Mensualidad — noviembre 2026',                          '2026-11-30', 'pending',     80,   false, 4),
  ('Rediseño web — La Fábrica ON', 'Diagnóstico de experiencia de usuario',                         '2026-10-12', 'done',        null, false, 0),
  ('Rediseño web — La Fábrica ON', 'Propuesta de diseño del nuevo sitio',                           '2026-11-25', 'in_progress', null, false, 1)
) as m(project, title, due_date, status, amount, paid, ord) on m.project = p.name;

-- ---------- actividad ----------
insert into public.project_updates (project_id, body, created_at)
select p.id, u.body, u.at::timestamptz
from public.projects p
join (values
  ('Presencia digital y contenido — NODO 624', 'Sitio web publicado con galería de espacios y formulario de prospectos conectado a la base de datos.', '2026-10-10 12:00'),
  ('Presencia digital y contenido — NODO 624', 'Se publica contenido semanal en redes sociales, con revisión humana antes de cada publicación.',        '2026-11-02 12:00'),
  ('NODO 624 · Fase 2: sistema de gestión de inquilinos', 'Se prepara la propuesta de la fase 2: sistema de gestión de inquilinos.',                    '2026-11-02 12:00'),
  ('SGS — versión multiempresa para SaaS', 'El SGS opera en producción con roles de técnico, vendedor, bodega y administrador.',                         '2026-10-05 12:00'),
  ('SGS — versión multiempresa para SaaS', 'Los reportes técnicos en PDF se generan automáticamente al cerrar cada orden de servicio.',                  '2026-10-15 12:00'),
  ('SGS — versión multiempresa para SaaS', 'Inicia la conversión del SGS a SaaS: separación de datos por empresa y definición de planes.',              '2026-11-02 12:00'),
  ('Rediseño web — La Fábrica ON', 'El diagnóstico de experiencia de usuario termina en un contrato de rediseño.',                                       '2026-10-12 12:00'),
  ('Rediseño web — La Fábrica ON', 'Inicia el rediseño del sitio web.',                                                                                  '2026-10-26 12:00')
) as u(project, body, at) on u.project = p.name;

-- ---------- CRM: clientes cerrados (los 3 reales) ----------
insert into public.leads (name, email, company, sector, budget, message, service_slug, source, stage, value_usd, notes) values
  ('Contacto NODO 624', 'pendiente@nodo624.invalid', 'NODO 624', 'Inmobiliaria', null,
   'Oficinas corporativas en Colonia Escalón. Sitio web con galería de espacios, formulario de prospectos y contenido semanal en redes.',
   'presencia-digital', 'directo', 'cerrado', 600, '[seed_forge_labs] Cliente activo. Actualizar correo.'),
  ('Contacto Compupart Store', 'pendiente@compupart.invalid', 'Compupart Store', 'Servicios', null,
   'Servicio técnico. Sistema de Gestión de Servicios (SGS) para un grupo de 3 empresas.',
   'software-a-medida', 'directo', 'cerrado', 1500, '[seed_forge_labs] Cliente activo. En conversión a SaaS. Actualizar correo.'),
  ('Contacto La Fábrica ON', 'pendiente@lafabricaon.invalid', 'La Fábrica ON', 'Servicios', null,
   'Branding y estrategia. Diagnóstico de experiencia de usuario de su sitio web, que terminó en un contrato de rediseño.',
   'asesoria', 'directo', 'cerrado', 250, '[seed_forge_labs] Cliente activo. Actualizar correo.');

-- ---------- CRM: propuesta ----------
insert into public.leads (name, email, company, sector, budget, message, service_slug, source, stage, value_usd, notes) values
  ('Contacto NODO 624', 'pendiente-fase2@nodo624.invalid', 'NODO 624 — Fase 2', 'Inmobiliaria', 'Más de $1,500',
   'Fase 2: sistema de gestión de inquilinos.',
   'software-a-medida', 'directo', 'propuesta', 1500, '[seed_forge_labs] Valor base del servicio (desde $1,500). Ajustar al cerrar la propuesta.');

-- ---------- CRM: leads de EJEMPLO (nombres ficticios) ----------
insert into public.leads (name, email, company, sector, budget, message, service_slug, source, stage, value_usd, notes) values
  ('Ejemplo uno', 'ejemplo1@ejemplo.invalid', 'Taller mecánico (ejemplo)', 'Servicios', '$700 – $1,500',
   'Las órdenes de reparación se llevan en papel y se pierden. Queremos un sistema para llevarlas.',
   'software-a-medida', 'web', 'contacto', 1500, '[seed_forge_labs] LEAD DE EJEMPLO'),
  ('Ejemplo dos', 'ejemplo2@ejemplo.invalid', 'Clínica dental (ejemplo)', 'Salud', '$700 – $1,500',
   'Queremos que los pacientes agenden citas por WhatsApp sin que alguien tenga que contestar todo el día.',
   'automatizacion-ia', 'web', 'contacto', 800, '[seed_forge_labs] LEAD DE EJEMPLO'),
  ('Ejemplo tres', 'ejemplo3@ejemplo.invalid', 'Boutique (ejemplo)', 'Comercio', 'Menos de $700',
   'No tenemos sitio web y los clientes no nos encuentran en internet.',
   'presencia-digital', 'web', 'discovery', 600, '[seed_forge_labs] LEAD DE EJEMPLO'),
  ('Ejemplo cuatro', 'ejemplo4@ejemplo.invalid', 'Ferretería (ejemplo)', 'Comercio', 'Menos de $700',
   'Queremos entender qué mejorar en la experiencia de compra de nuestro sitio.',
   'asesoria', 'web', 'discovery', 250, '[seed_forge_labs] LEAD DE EJEMPLO');
