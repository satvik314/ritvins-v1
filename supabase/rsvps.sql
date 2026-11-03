-- Reply storage for the wedding site.
-- Guests can add a reply but cannot read anyone else's. Replies are read from
-- the Supabase dashboard, or through the latest_replies view with a service key.

create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 80),
  haldi boolean not null,
  sangeeth boolean not null,
  wedding boolean not null,
  party smallint not null default 1 check (party between 1 and 12),
  contact text check (char_length(contact) <= 120),
  note text check (char_length(note) <= 500)
);

alter table public.rsvps enable row level security;

create policy "Guests can add a reply"
  on public.rsvps for insert
  to anon
  with check (true);

-- A guest who changes a reply adds a new row, so this keeps the newest per name.
create or replace view public.latest_replies
with (security_invoker = true) as
select distinct on (lower(trim(name))) *
from public.rsvps
order by lower(trim(name)), created_at desc;
