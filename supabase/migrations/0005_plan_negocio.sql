-- Forge Labs — Fase 5: catálogo y datos según el plan de negocio.

-- ============ SERVICIOS ============
-- Nuevas categorías para los filtros: Proyectos / IA aplicada / Asesoría y SaaS.
alter table public.services drop constraint if exists services_category_check;

-- Conserva servicios y referencias existentes; normaliza categorías del catálogo anterior.
update public.services set category = case category
  when 'digital' then 'proyectos'
  when 'soporte' then 'asesoria'
  else category
end
where category in ('digital', 'soporte');

insert into public.services (slug, category, name, description, features, price_note, badge, badge_tone, sort_order, active) values
  ('presencia-digital', 'proyectos', 'Presencia digital',
   'Sitio web, dominio y SEO básico para que tu negocio se encuentre y atraiga clientes.',
   array['Sitio web', 'Dominio', 'SEO básico'],
   'Desde $600 + $25/mes (hosting, soporte y cambios menores)', 'Proyecto', 'default', 1, true),
  ('automatizacion-ia', 'ia', 'Automatización con IA',
   'Chatbot de WhatsApp con IA que responde y agenda, y pasa la conversación a una persona cuando hace falta.',
   array['Chatbot de WhatsApp con IA', 'Respuestas y agendamiento automáticos', 'Escalamiento a una persona', 'Revisión humana siempre'],
   'Desde $800 + $45/mes (incluye el uso de la IA)', 'IA con revisión humana', 'on', 2, true),
  ('software-a-medida', 'proyectos', 'Software a medida',
   'Sistemas hechos a la medida de tu operación: inventario, órdenes de servicio y citas.',
   array['Inventario, órdenes de servicio y citas', 'Roles y permisos', 'Reportes PDF'],
   'Desde $1,500 + $80/mes (respaldos y actualizaciones)', 'Proyecto', 'default', 3, true),
  ('asesoria', 'asesoria', 'Asesoría y acompañamiento',
   'Diagnóstico de la experiencia de usuario y de tus procesos, con un plan de mejora concreto.',
   array['Diagnóstico de UX y procesos', 'Plan de mejora'],
   '$250 por diagnóstico (sin mensualidad)', 'Asesoría', 'default', 4, true),
  ('saas-micro', 'asesoria', 'SaaS para microempresas',
   'Software por suscripción para microempresas, sin costo de instalación.',
   array['Plan Micro: 1 módulo, hasta 3 usuarios', 'Plan Pro: servicio técnico SGS + inventario, avisos por WhatsApp', 'Sin costo de instalación'],
   'Plan Micro $25/mes · Plan Pro $45/mes', 'SaaS', 'default', 5, true)
on conflict (slug) do update set
  category = excluded.category, name = excluded.name, description = excluded.description,
  features = excluded.features, price_note = excluded.price_note, badge = excluded.badge,
  badge_tone = excluded.badge_tone, sort_order = excluded.sort_order, active = excluded.active;

-- La regla se agrega DESPUÉS de actualizar las filas existentes (si no, falla por las categorías viejas).
alter table public.services
  add constraint services_category_check check (category in ('proyectos', 'ia', 'asesoria'));

-- ============ PROYECTOS ============
-- Nuevo estado "En producción".
alter table public.projects drop constraint if exists projects_status_check;
alter table public.projects
  add constraint projects_status_check
  check (status in ('discovery', 'development', 'production', 'maintenance', 'delivered', 'paused'));

-- Proyectos de clientes que aún no tienen cuenta en el portal: se identifican por nombre.
alter table public.projects alter column client_id drop not null;
alter table public.projects add column if not exists client_name text check (char_length(client_name) <= 160);
alter table public.projects add column if not exists owner text check (char_length(owner) <= 80);
alter table public.projects drop constraint if exists projects_has_client;
alter table public.projects
  add constraint projects_has_client check (client_id is not null or client_name is not null);

-- El correo del perfil se replica desde Auth y no debe poder falsificarse desde el cliente.
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (new.role is distinct from old.role or new.email is distinct from old.email)
     and auth.uid() is not null and not public.is_admin() then
    raise exception 'No tienes permiso para cambiar el rol o correo del perfil';
  end if;
  return new;
end;
$$;
