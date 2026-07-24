-- Zan-F Digital Business Card System — Supabase schema
-- Run this once in the Supabase SQL Editor for your project.

create extension if not exists "pgcrypto";

-- Employees table: one row per card
create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  designation text not null,
  phone text not null,
  whatsapp text not null,
  email text,
  photo_url text,
  active boolean not null default true,
  view_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists employees_slug_idx on employees (slug);

-- Company-wide settings: used for the "deactivated card" fallback contact
-- and anything else that should be editable without a redeploy.
create table if not exists company_settings (
  id int primary key default 1,
  fallback_phone text not null default '+919884977994',
  fallback_whatsapp text not null default '+919600051672',
  fallback_email text,
  slogan text not null default 'Cleaner Power, Greener Future',
  logo_url text,
  constraint single_row check (id = 1)
);

insert into company_settings (id)
values (1)
on conflict (id) do nothing;

-- Keep updated_at current on every edit
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists employees_set_updated_at on employees;
create trigger employees_set_updated_at
  before update on employees
  for each row execute function set_updated_at();

-- Storage bucket for employee photos (create via Supabase dashboard if this fails
-- to run from the SQL editor — Storage buckets are sometimes managed separately):
-- insert into storage.buckets (id, name, public) values ('employee-photos', 'employee-photos', true)
-- on conflict (id) do nothing;

-- Row Level Security: cards are public to read (active ones only via the app query),
-- writes only via the service-role key used server-side in the admin routes.
alter table employees enable row level security;
alter table company_settings enable row level security;

create policy "Public can read employees" on employees
  for select using (true);

create policy "Public can read settings" on company_settings
  for select using (true);

-- No insert/update/delete policies are defined for anon/public, so all writes
-- must go through the server-side admin routes using the service_role key,
-- which bypasses RLS. Never expose the service_role key to the browser.
