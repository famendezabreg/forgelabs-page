-- Forge Labs — Fase 2: proyectos, hitos, actividad, documentos y almacenamiento.

-- El admin necesita ver el correo de cada cliente.
alter table public.profiles add column email text;
update public.profiles p set email = u.email from auth.users u where u.id = p.id;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, company_name, sector)
  values (
    new.id,
    new.email,
    left(new.raw_user_meta_data ->> 'full_name', 120),
    left(new.raw_user_meta_data ->> 'company_name', 160),
    left(new.raw_user_meta_data ->> 'sector', 60)
  );
  return new;
end;
$$;

-- ============ PROYECTOS ============
create table public.projects (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references public.profiles (id) on delete restrict,
  name          text not null check (char_length(name) between 2 and 160),
  service_slug  text references public.services (slug) on update cascade on delete set null,
  status        text not null default 'discovery'
                check (status in ('discovery', 'development', 'maintenance', 'delivered', 'paused')),
  progress      int  not null default 0 check (progress between 0 and 100),
  next_delivery_date date,
  next_delivery_note text check (char_length(next_delivery_note) <= 240),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index projects_client_idx on public.projects (client_id);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger projects_touch before update on public.projects
  for each row execute function public.touch_updated_at();

-- ¿El usuario actual puede ver este proyecto? (dueño o admin). SECURITY DEFINER evita recursión de RLS.
create or replace function public.can_access_project(pid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_admin() or exists (
    select 1 from public.projects where id = pid and client_id = auth.uid()
  );
$$;

alter table public.projects enable row level security;

create policy "projects: ver propio o admin" on public.projects for select
  using (client_id = auth.uid() or public.is_admin());
create policy "projects: admin crea" on public.projects for insert
  with check (public.is_admin());
create policy "projects: admin actualiza" on public.projects for update
  using (public.is_admin()) with check (public.is_admin());
create policy "projects: admin elimina" on public.projects for delete
  using (public.is_admin());

-- ============ HITOS (también son la base de facturación) ============
create table public.milestones (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects (id) on delete cascade,
  title       text not null check (char_length(title) between 2 and 160),
  due_date    date,
  status      text not null default 'pending' check (status in ('pending', 'in_progress', 'done')),
  amount_usd  numeric(10, 2) check (amount_usd is null or amount_usd >= 0),
  paid        boolean not null default false,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);
create index milestones_project_idx on public.milestones (project_id, sort_order);

alter table public.milestones enable row level security;
create policy "milestones: ver" on public.milestones for select using (public.can_access_project(project_id));
create policy "milestones: admin escribe" on public.milestones for all
  using (public.is_admin()) with check (public.is_admin());

-- ============ ACTIVIDAD ============
create table public.project_updates (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects (id) on delete cascade,
  body        text not null check (char_length(body) between 2 and 1000),
  author_id   uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at  timestamptz not null default now()
);
create index project_updates_project_idx on public.project_updates (project_id, created_at desc);

alter table public.project_updates enable row level security;
create policy "updates: ver" on public.project_updates for select using (public.can_access_project(project_id));
create policy "updates: admin escribe" on public.project_updates for all
  using (public.is_admin()) with check (public.is_admin());

-- ============ DOCUMENTOS ============
create table public.documents (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.projects (id) on delete cascade,
  name          text not null check (char_length(name) between 1 and 200),
  storage_path  text not null unique,
  size_bytes    bigint check (size_bytes is null or size_bytes >= 0),
  uploaded_by   uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at    timestamptz not null default now()
);
create index documents_project_idx on public.documents (project_id, created_at desc);

alter table public.documents enable row level security;
create policy "documents: ver" on public.documents for select using (public.can_access_project(project_id));
create policy "documents: admin escribe" on public.documents for all
  using (public.is_admin()) with check (public.is_admin());

-- ============ STORAGE (bucket privado, ruta: <project_id>/<archivo>) ============
insert into storage.buckets (id, name, public, file_size_limit)
values ('project-docs', 'project-docs', false, 20971520)
on conflict (id) do nothing;

-- Acceso por ruta; CASE garantiza que el cast a uuid solo ocurre si la carpeta tiene formato uuid.
create or replace function public.can_access_project_path(path text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when split_part(path, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then public.can_access_project(split_part(path, '/', 1)::uuid)
    else false
  end;
$$;

create policy "project-docs: leer"
  on storage.objects for select
  using (bucket_id = 'project-docs' and public.can_access_project_path(name));
create policy "project-docs: admin sube"
  on storage.objects for insert
  with check (bucket_id = 'project-docs' and public.is_admin());
create policy "project-docs: admin borra"
  on storage.objects for delete
  using (bucket_id = 'project-docs' and public.is_admin());
