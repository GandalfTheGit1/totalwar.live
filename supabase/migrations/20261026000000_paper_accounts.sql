-- Paper-betting accounts (simulated bets against live Polymarket prices). One JSON document per anonymous player.
create table if not exists public.paper_accounts (
  player_id  uuid primary key,
  state      jsonb not null,
  updated_at timestamptz not null default now()
);

-- Accessed only through the service-role key from the Next.js API routes.
alter table public.paper_accounts enable row level security;
