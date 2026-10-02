-- Personal API tokens for the public API and MCP server (supabase/functions/api).
-- Only the SHA-256 hash is stored. The plaintext token is shown once in the app.
create table if not exists public.api_tokens (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  name         text        not null default 'API token',
  token_hash   text        not null unique,
  created_at   timestamptz not null default now(),
  last_used_at timestamptz
);
create index if not exists api_tokens_user_idx on public.api_tokens (user_id);
alter table public.api_tokens enable row level security;
grant select, insert, delete on public.api_tokens to authenticated;
create policy "api_tokens_select_own" on public.api_tokens for select to authenticated using (user_id = (select auth.uid()));
create policy "api_tokens_insert_own" on public.api_tokens for insert to authenticated with check (user_id = (select auth.uid()));
create policy "api_tokens_delete_own" on public.api_tokens for delete to authenticated using (user_id = (select auth.uid()));
