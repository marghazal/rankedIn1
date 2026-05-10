-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)
-- It creates the scans table (if missing) and adds the user_id column for auth-linked history.

create table if not exists public.scans (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  linkedin_url text,
  full_name text,
  aura int4 default 0,
  tier text,
  school text,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- If the table already exists, ensure user_id column is present
alter table public.scans add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.scans add column if not exists created_at timestamptz default now();

-- Enable RLS
alter table public.scans enable row level security;

-- Anyone can read leaderboard
drop policy if exists "Public read scans" on public.scans;
create policy "Public read scans" on public.scans
  for select using (true);

-- Anyone (anon or authed) can insert scans
drop policy if exists "Public insert scans" on public.scans;
create policy "Public insert scans" on public.scans
  for insert with check (true);

-- Index for history queries
create index if not exists scans_user_id_idx on public.scans(user_id);
create index if not exists scans_aura_idx on public.scans(aura desc);
