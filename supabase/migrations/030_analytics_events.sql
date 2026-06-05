-- Lightweight product analytics. One row per meaningful action so we can later
-- measure which features correlate with grade improvement.
create table if not exists analytics_events (
  id         bigint      generated always as identity primary key,
  user_id    uuid        references auth.users(id) on delete set null,
  event      text        not null,
  props      jsonb       not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table analytics_events enable row level security;

create policy "users insert own events"
  on analytics_events for insert
  with check (auth.uid() = user_id);

create policy "admins read events"
  on analytics_events for select
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

create index if not exists idx_analytics_events_event on analytics_events (event, created_at);
