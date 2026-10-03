-- Database-generated inventory history. Signed-in users can read only their own
-- history, not insert/edit/delete it. This is an application audit trail, not
-- independent certification or protection against the database administrator.
create table if not exists public.inventory_history (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id text not null,
  period_year integer,
  item_id text not null,
  item_name text not null,
  action text not null check (action in ('added','edited','deleted')),
  before_item jsonb,
  after_item jsonb,
  changed_fields text[] not null,
  actor_id uuid,
  actor_label text not null,
  source text not null,
  created_at timestamptz not null default now()
);
create index if not exists inventory_history_project_time_idx
  on public.inventory_history(user_id, project_id, created_at desc, id desc);
alter table public.inventory_history enable row level security;
grant select on public.inventory_history to authenticated;
create policy inventory_history_read_own on public.inventory_history for select
  to authenticated using (user_id = (select auth.uid()));

create or replace function public.record_inventory_history() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  old_data jsonb := case when TG_OP = 'INSERT' then '{}'::jsonb else OLD.data end;
  new_data jsonb := case when TG_OP = 'DELETE' then '{}'::jsonb else NEW.data end;
  owner_id uuid := case when TG_OP = 'DELETE' then OLD.user_id else NEW.user_id end;
  project text := case when TG_OP = 'DELETE' then OLD.id else NEW.id end;
  actor uuid := auth.uid();
  actor_name text;
  source_name text;
  r record;
  fields text[];
begin
  if TG_OP = 'UPDATE' and OLD.data -> 'periods' is not distinct from NEW.data -> 'periods' then return NEW; end if;
  if actor is not null then
    actor_name := coalesce(auth.jwt() ->> 'email', actor::text);
    source_name := 'app';
  else
    -- API tokens resolve to the project owner. Do not claim an API caller is a named person.
    actor_name := 'API / service process (project owner account)';
    source_name := 'api_or_service';
  end if;
  for r in
    with old_items as (
      select p.value ->> 'year' as yr, coalesce(i.value ->> 'id', 'row-' || i.ordinality::text) as iid, i.value as item
      from pg_catalog.jsonb_array_elements(coalesce(old_data -> 'periods', '[]'::jsonb)) p,
           pg_catalog.jsonb_array_elements(coalesce(p.value -> 'bom', '[]'::jsonb)) with ordinality i
    ), new_items as (
      select p.value ->> 'year' as yr, coalesce(i.value ->> 'id', 'row-' || i.ordinality::text) as iid, i.value as item
      from pg_catalog.jsonb_array_elements(coalesce(new_data -> 'periods', '[]'::jsonb)) p,
           pg_catalog.jsonb_array_elements(coalesce(p.value -> 'bom', '[]'::jsonb)) with ordinality i
    )
    select coalesce(n.yr,o.yr) as yr, coalesce(n.iid,o.iid) as iid, o.item as old_item, n.item as new_item
    from old_items o full join new_items n on o.yr=n.yr and o.iid=n.iid
    where o.item is distinct from n.item
  loop
    select array_agg(k order by k) into fields
    from (select jsonb_object_keys(coalesce(r.old_item,'{}'::jsonb)) as k
          union select jsonb_object_keys(coalesce(r.new_item,'{}'::jsonb))) keys
    where r.old_item -> k is distinct from r.new_item -> k;
    insert into public.inventory_history(user_id,project_id,period_year,item_id,item_name,action,before_item,after_item,changed_fields,actor_id,actor_label,source)
    values(owner_id,project,nullif(r.yr,'')::integer,r.iid,
      coalesce(r.new_item ->> 'name',r.old_item ->> 'name',r.new_item ->> 'item',r.old_item ->> 'item','Inventory item'),
      case when r.old_item is null then 'added' when r.new_item is null then 'deleted' else 'edited' end,
      r.old_item,r.new_item,coalesce(fields,'{}'::text[]),actor,actor_name,source_name);
  end loop;
  if TG_OP = 'DELETE' then return OLD; end if;
  return NEW;
end $$;
revoke all on function public.record_inventory_history() from public;
create trigger projects_inventory_history after insert or update or delete on public.projects
  for each row execute function public.record_inventory_history();
