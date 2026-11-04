-- Forge Labs — Fase 3: datos para el dashboard gerencial.

-- Fecha real de pago de cada hito (para ingresos por mes).
alter table public.milestones add column paid_at timestamptz;
update public.milestones set paid_at = created_at where paid and paid_at is null;

create or replace function public.set_milestone_paid_at()
returns trigger
language plpgsql
as $$
begin
  if not new.paid then
    new.paid_at = null;
  elsif tg_op = 'INSERT' then
    new.paid_at = now();
  elsif not old.paid then
    new.paid_at = now();
  end if;
  return new;
end;
$$;

create trigger milestones_paid_at
  before insert or update of paid on public.milestones
  for each row execute function public.set_milestone_paid_at();

-- Mensualidad del cliente (hosting, soporte y cambios menores).
alter table public.projects
  add column monthly_fee_usd numeric(10, 2)
  check (monthly_fee_usd is null or monthly_fee_usd >= 0);
