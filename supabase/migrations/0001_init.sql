-- Forge Labs — esquema inicial (Fase 1: sitio público + autenticación + leads)
-- Ejecutar en Supabase → SQL Editor, o con `supabase db push`.

-- ============ PERFILES ============
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  full_name    text check (char_length(full_name) <= 120),
  company_name text check (char_length(company_name) <= 160),
  sector       text check (char_length(sector) <= 60),
  role         text not null default 'client'
               check (role in ('client', 'collaborator', 'admin', 'manager')),
  created_at   timestamptz not null default now()
);

-- Rol del usuario actual. SECURITY DEFINER para evitar recursión de RLS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'manager')
  );
$$;

-- Crea el perfil al registrarse. El rol SIEMPRE es 'client' (nunca se lee de metadata).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, company_name, sector)
  values (
    new.id,
    left(new.raw_user_meta_data ->> 'full_name', 120),
    left(new.raw_user_meta_data ->> 'company_name', 160),
    left(new.raw_user_meta_data ->> 'sector', 60)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Nadie puede cambiar su propio rol (salvo admin, o SQL Editor/service role donde auth.uid() es null).
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    raise exception 'No tienes permiso para cambiar el rol';
  end if;
  return new;
end;
$$;

create trigger protect_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

alter table public.profiles enable row level security;

create policy "profiles: leer el propio o admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "profiles: actualizar el propio o admin"
  on public.profiles for update
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- ============ CATÁLOGO DE SERVICIOS ============
create table public.services (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  category    text not null check (category in ('proyectos', 'ia', 'asesoria')),
  name        text not null,
  description text not null,
  features    text[] not null default '{}',
  price_note  text not null default '',
  badge       text not null default '',
  badge_tone  text not null default 'default' check (badge_tone in ('default', 'on')),
  sort_order  int  not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.services enable row level security;

create policy "services: lectura pública de activos"
  on public.services for select
  using (active or public.is_admin());

create policy "services: admin escribe"
  on public.services for all
  using (public.is_admin())
  with check (public.is_admin());

insert into public.services (slug, category, name, description, features, price_note, badge, badge_tone, sort_order) values
  ('presencia-digital', 'proyectos', 'Presencia digital',
   'Sitio web, dominio y SEO básico para que tu negocio se encuentre y atraiga clientes.',
   array['Sitio web', 'Dominio', 'SEO básico'],
   'Desde $600 + $25/mes (hosting, soporte y cambios menores)', 'Proyecto', 'default', 1),
  ('automatizacion-ia', 'ia', 'Automatización con IA',
   'Chatbot de WhatsApp con IA que responde y agenda, y pasa la conversación a una persona cuando hace falta.',
   array['Chatbot de WhatsApp con IA', 'Respuestas y agendamiento automáticos', 'Escalamiento a una persona', 'Revisión humana siempre'],
   'Desde $800 + $45/mes (incluye el uso de la IA)', 'IA con revisión humana', 'on', 2),
  ('software-a-medida', 'proyectos', 'Software a medida',
   'Sistemas hechos a la medida de tu operación: inventario, órdenes de servicio y citas.',
   array['Inventario, órdenes de servicio y citas', 'Roles y permisos', 'Reportes PDF'],
   'Desde $1,500 + $80/mes (respaldos y actualizaciones)', 'Proyecto', 'default', 3),
  ('asesoria', 'asesoria', 'Asesoría y acompañamiento',
   'Diagnóstico de la experiencia de usuario y de tus procesos, con un plan de mejora concreto.',
   array['Diagnóstico de UX y procesos', 'Plan de mejora'],
   '$250 por diagnóstico (sin mensualidad)', 'Asesoría', 'default', 4),
  ('saas-micro', 'asesoria', 'SaaS para microempresas',
   'Software por suscripción para microempresas, sin costo de instalación.',
   array['Plan Micro: 1 módulo, hasta 3 usuarios', 'Plan Pro: servicio técnico SGS + inventario, avisos por WhatsApp', 'Sin costo de instalación'],
   'Plan Micro $25/mes · Plan Pro $45/mes', 'SaaS', 'default', 5);

-- ============ LEADS (solicitudes de cotización / CRM) ============
create table public.leads (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (char_length(name) between 2 and 120),
  email        text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 160),
  company      text not null check (char_length(company) between 2 and 160),
  sector       text check (char_length(sector) <= 60),
  budget       text check (char_length(budget) <= 60),
  message      text not null check (char_length(message) between 10 and 2000),
  service_slug text references public.services (slug) on update cascade on delete set null,
  source       text not null default 'web' check (char_length(source) <= 40),
  stage        text not null default 'contacto'
               check (stage in ('contacto', 'discovery', 'propuesta', 'cerrado', 'perdido')),
  value_usd    numeric(10, 2),
  notes        text,
  created_at   timestamptz not null default now()
);

create index leads_stage_idx on public.leads (stage, created_at desc);

alter table public.leads enable row level security;

-- Cualquiera (visitante anónimo o cliente) puede enviar una solicitud, pero SOLO en etapa inicial
-- y sin tocar campos internos. No pueden leerla de vuelta.
create policy "leads: envío público"
  on public.leads for insert
  to anon, authenticated
  with check (stage = 'contacto' and value_usd is null and notes is null);

create policy "leads: admin lee"
  on public.leads for select
  using (public.is_admin());

create policy "leads: admin actualiza"
  on public.leads for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "leads: admin elimina"
  on public.leads for delete
  using (public.is_admin());
