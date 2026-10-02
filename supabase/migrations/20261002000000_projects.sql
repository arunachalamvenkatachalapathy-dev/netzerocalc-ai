-- NetZeroCalc: per-user project storage with row level security.

create table if not exists public.projects (
  id          text        not null,
  user_id     uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  name        text,
  data        jsonb       not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (user_id, id)
);

create index if not exists projects_user_updated_idx
  on public.projects (user_id, updated_at desc);

alter table public.projects enable row level security;

-- Tables are not auto-exposed on this project, so grant explicitly.
-- Signed-out (anon) users get nothing.
grant select, insert, update, delete on public.projects to authenticated;

create policy "projects_select_own" on public.projects
  for select to authenticated using (user_id = (select auth.uid()));
create policy "projects_insert_own" on public.projects
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "projects_update_own" on public.projects
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "projects_delete_own" on public.projects
  for delete to authenticated using (user_id = (select auth.uid()));

create or replace function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- Request log used by the ai-chat edge function for per-user rate limiting.
-- Only the service role touches this table (no grants, no policies for anon/authenticated).
create table if not exists public.ai_requests (
  id         bigint generated always as identity primary key,
  user_id    uuid        not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists ai_requests_user_time_idx on public.ai_requests (user_id, created_at desc);
alter table public.ai_requests enable row level security;
