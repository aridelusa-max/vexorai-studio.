-- LumaForge NextGen v2 foundation schema
-- Review before running. This creates new tables and does not alter existing tables.
-- Run only in the intended Supabase project's SQL Editor after checking the project.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  onboarding_completed boolean not null default false,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Untitled project' check (char_length(name) between 1 and 120),
  description text not null default '',
  framework text not null default 'react-vite',
  status text not null default 'draft' check (status in ('draft','building','ready','error','archived')),
  visibility text not null default 'private' check (visibility in ('private','unlisted','public')),
  thumbnail_url text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists projects_user_updated_idx on public.projects(user_id, updated_at desc);

create table if not exists public.project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  path text not null check (char_length(path) between 1 and 500),
  content text not null default '',
  language text not null default 'text',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(project_id, path)
);
create index if not exists project_files_project_idx on public.project_files(project_id);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists conversations_project_idx on public.conversations(project_id, updated_at desc);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant','system','tool')),
  content text not null default '',
  status text not null default 'complete' check (status in ('queued','running','complete','error','cancelled')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists messages_conversation_idx on public.messages(conversation_id, created_at);

create table if not exists public.project_versions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Saved version',
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists project_versions_project_idx on public.project_versions(project_id, created_at desc);

create table if not exists public.deployments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'unconfigured',
  provider_deployment_id text,
  url text,
  status text not null default 'pending' check (status in ('pending','building','ready','error','cancelled')),
  logs_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists deployments_project_idx on public.deployments(project_id, created_at desc);

create table if not exists public.usage_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  usage_type text not null check (char_length(usage_type) between 1 and 80),
  quantity numeric not null default 1 check (quantity >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists usage_records_user_created_idx on public.usage_records(user_id, created_at desc);

-- Enable row-level security for every user-owned table.
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_files enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.project_versions enable row level security;
alter table public.deployments enable row level security;
alter table public.usage_records enable row level security;

-- Profiles: a signed-in user can only read/update their own profile and create it for themselves.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select to authenticated using (id = (select auth.uid()));
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (id = (select auth.uid()));
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Every project-scoped row is private to its owner. These policies deliberately do not
-- implement public/unlisted sharing; that needs separate, narrowly scoped share-token logic.
drop policy if exists "projects_owner_all" on public.projects;
create policy "projects_owner_all" on public.projects for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "project_files_owner_all" on public.project_files;
create policy "project_files_owner_all" on public.project_files for all to authenticated using (user_id = (select auth.uid()) and exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid()))) with check (user_id = (select auth.uid()) and exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid())));
drop policy if exists "conversations_owner_all" on public.conversations;
create policy "conversations_owner_all" on public.conversations for all to authenticated using (user_id = (select auth.uid()) and exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid()))) with check (user_id = (select auth.uid()) and exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid())));
drop policy if exists "messages_owner_all" on public.messages;
create policy "messages_owner_all" on public.messages for all to authenticated using (user_id = (select auth.uid()) and exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid()))) with check (user_id = (select auth.uid()) and exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid())));
drop policy if exists "versions_owner_all" on public.project_versions;
create policy "versions_owner_all" on public.project_versions for all to authenticated using (user_id = (select auth.uid()) and exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid()))) with check (user_id = (select auth.uid()) and exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid())));
drop policy if exists "deployments_owner_all" on public.deployments;
create policy "deployments_owner_all" on public.deployments for all to authenticated using (user_id = (select auth.uid()) and exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid()))) with check (user_id = (select auth.uid()) and exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid())));
drop policy if exists "usage_owner_select" on public.usage_records;
create policy "usage_owner_select" on public.usage_records for select to authenticated using (user_id = (select auth.uid()));

-- Important: usage_records has no client insert/update/delete policy by design.
-- Production usage accounting must be written by trusted server-side code only.

-- Create a profile row for newly registered Auth users.
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute procedure public.handle_new_user_profile();
