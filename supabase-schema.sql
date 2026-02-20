-- Supabase schema for SIMPLICITY blog
-- This file documents the expected database structure and RLS policies.
-- Apply these statements (adapted as needed) in your Supabase SQL editor.

----------------------------
-- EXTENSIONS (if needed) --
----------------------------
-- enable uuid generation in case it's not already enabled
create extension if not exists "uuid-ossp";

----------------
-- PROFILES   --
----------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  role text not null default 'user', -- 'admin' | 'user'
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Everyone can read public profiles (used only for role/name)
create policy if not exists "Profiles are readable by everyone"
on public.profiles
for select
using (true);

-- Users can insert their own profile row
create policy if not exists "Users can insert their own profile"
on public.profiles
for insert
with check (auth.uid() = id);

-- Users can update their own profile
create policy if not exists "Users can update their own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

--------------
-- POSTS    --
--------------

create table if not exists public.posts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  body jsonb not null, -- simplified Tiptap JSON document
  excerpt text not null,
  status text not null default 'draft', -- 'draft' | 'published'
  header_image text,
  views integer not null default 0,
  author_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_posts_status on public.posts (status);
create index if not exists idx_posts_created_at on public.posts (created_at desc);

alter table public.posts enable row level security;

-- Helper: check if current user is an admin based on profiles.role
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = uid
      and p.role = 'admin'
  );
$$;

-- Anyone can read published posts
create policy if not exists "Anyone can read published posts"
on public.posts
for select
using (status = 'published');

-- Admin can read all posts
create policy if not exists "Admin can read all posts"
on public.posts
for select
using (public.is_admin(auth.uid()));

-- Only admin can insert posts
create policy if not exists "Only admin can insert posts"
on public.posts
for insert
with check (public.is_admin(auth.uid()));

-- Only admin can update posts
create policy if not exists "Only admin can update posts"
on public.posts
for update
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- Only admin can delete posts
create policy if not exists "Only admin can delete posts"
on public.posts
for delete
using (public.is_admin(auth.uid()));

------------
-- TAGS   --
------------

create table if not exists public.tags (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,  -- e.g. "tech"
  label text,                 -- e.g. "Tech"
  created_at timestamptz not null default now()
);

alter table public.tags enable row level security;

-- Anyone can read tags
create policy if not exists "Anyone can read tags"
on public.tags
for select
using (true);

-- Only admin can insert tags
create policy if not exists "Only admin can insert tags"
on public.tags
for insert
with check (public.is_admin(auth.uid()));

-- Only admin can update tags
create policy if not exists "Only admin can update tags"
on public.tags
for update
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- Only admin can delete tags
create policy if not exists "Only admin can delete tags"
on public.tags
for delete
using (public.is_admin(auth.uid()));

----------------
-- POST_TAGS  --
----------------

create table if not exists public.post_tags (
  post_id uuid not null references public.posts (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (post_id, tag_id)
);

alter table public.post_tags enable row level security;

-- Anyone can see which tags belong to which posts (for filtering UI)
create policy if not exists "Anyone can read post_tags"
on public.post_tags
for select
using (true);

-- Only admin can modify post_tags
create policy if not exists "Only admin can modify post_tags"
on public.post_tags
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

