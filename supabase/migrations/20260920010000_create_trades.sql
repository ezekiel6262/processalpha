create table if not exists public.trades (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null check (char_length(symbol) between 1 and 30),
  side text not null check (side in ('Long', 'Short')),
  entry numeric not null check (entry > 0),
  exit numeric not null check (exit > 0),
  thesis text not null check (char_length(thesis) between 1 and 3000),
  invalidation text not null check (char_length(invalidation) between 1 and 2000),
  risk_defined boolean not null default false,
  opposing_evidence_recorded boolean not null default false,
  confirmation_waited boolean not null default false,
  exit_rule_followed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.trades enable row level security;
revoke all on table public.trades from anon;
grant select, insert, update, delete on table public.trades to authenticated;

create policy "Users read their own trades" on public.trades for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users insert their own trades" on public.trades for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users update their own trades" on public.trades for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users delete their own trades" on public.trades for delete to authenticated
using ((select auth.uid()) = user_id);

create index if not exists trades_user_created_idx on public.trades (user_id, created_at desc);
