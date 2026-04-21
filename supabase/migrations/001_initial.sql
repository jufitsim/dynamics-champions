-- ============================================================
-- Dynamics 365 Champions Directory — initial schema
-- Run this in Supabase SQL Editor for your project
-- ============================================================

-- Workloads lookup table
create table if not exists workloads (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz default now()
);

-- Seed default workloads
insert into workloads (name) values
  ('Finance'),
  ('Supply Chain'),
  ('Contact Center'),
  ('Field Service')
on conflict (name) do nothing;

-- Champions directory
create table if not exists champions (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  title        text not null,
  organization text not null,
  workload_id  uuid not null references workloads (id),
  image_url    text,
  linkedin_url text,
  status       text not null default 'pending'
                 check (status in ('pending', 'approved', 'rejected')),
  submitted_at timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table workloads enable row level security;
alter table champions  enable row level security;

-- Workloads: everyone can read; only authenticated (admin) can write
create policy "workloads_read"  on workloads for select using (true);
create policy "workloads_admin" on workloads for all    to authenticated using (true) with check (true);

-- Champions: public can read approved records and insert pending ones
create policy "champions_read_approved" on champions
  for select using (status = 'approved');

create policy "champions_public_insert" on champions
  for insert with check (status = 'pending');

-- Admin (authenticated) can read + update all records
create policy "champions_admin" on champions
  for all to authenticated using (true) with check (true);

-- ============================================================
-- Storage bucket for profile photos
-- ============================================================
insert into storage.buckets (id, name, public)
  values ('champion-images', 'champion-images', true)
on conflict (id) do nothing;

create policy "images_public_read" on storage.objects
  for select using (bucket_id = 'champion-images');

create policy "images_public_upload" on storage.objects
  for insert with check (bucket_id = 'champion-images');

create policy "images_admin_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'champion-images');
