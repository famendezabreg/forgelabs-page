-- Forge Labs — Fase 4: estadísticas públicas para el hero de la página principal.
-- Solo expone conteos agregados; no filtra datos de ningún cliente.
create or replace function public.public_stats()
returns json
language sql
stable
security definer
set search_path = ''
as $$
  select json_build_object(
    'active_clients',
      (select count(distinct client_id) from public.projects
        where status in ('discovery', 'development', 'maintenance'))
  );
$$;

revoke all on function public.public_stats() from public;
grant execute on function public.public_stats() to anon, authenticated;
