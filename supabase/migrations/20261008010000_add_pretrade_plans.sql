create table if not exists public.trade_plans (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null check (char_length(symbol) between 1 and 30),
  side text not null check (side in ('Long', 'Short')),
  planned_entry numeric not null check (planned_entry > 0),
  stop_price numeric not null check (stop_price > 0),
  target_price numeric not null check (target_price > 0),
  risk_percent numeric not null check (risk_percent > 0 and risk_percent <= 5),
  thesis text not null check (char_length(thesis) between 1 and 3000),
  invalidation text not null check (char_length(invalidation) between 1 and 2000),
  rule_ids jsonb not null default '[]'::jsonb,
  status text not null default 'planned' check (status in ('planned', 'open', 'completed')),
  executed_at timestamptz,
  completed_at timestamptz,
  trade_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.trade_plans enable row level security;
revoke all on table public.trade_plans from anon;
grant select, insert, update, delete on table public.trade_plans to authenticated;

drop policy if exists "Users read their own trade plans" on public.trade_plans;
create policy "Users read their own trade plans" on public.trade_plans for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users insert their own trade plans" on public.trade_plans;
create policy "Users insert their own trade plans" on public.trade_plans for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users update their own trade plans" on public.trade_plans;
create policy "Users update their own trade plans" on public.trade_plans for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users delete their own trade plans" on public.trade_plans;
create policy "Users delete their own trade plans" on public.trade_plans for delete to authenticated
using ((select auth.uid()) = user_id);

create index if not exists trade_plans_user_created_idx on public.trade_plans (user_id, created_at desc);

alter table public.trades add column if not exists plan_id uuid references public.trade_plans(id) on delete set null;
alter table public.trades add column if not exists plan_snapshot jsonb;
create index if not exists trades_plan_idx on public.trades (plan_id);
