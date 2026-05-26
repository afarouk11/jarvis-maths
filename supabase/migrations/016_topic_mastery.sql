create table if not exists public.topic_mastery (
  id            uuid    primary key default gen_random_uuid(),
  user_id       uuid    references public.profiles(id) on delete cascade not null,
  topic         text    not null,
  mastery_level float   not null default 0
    check (mastery_level >= 0 and mastery_level <= 5),
  created_at    timestamptz not null default now(),
  unique(user_id, topic)
);

create index if not exists topic_mastery_user_idx
  on public.topic_mastery (user_id);

alter table public.topic_mastery enable row level security;

do $$ begin
  create policy "Users can read own mastery" on public.topic_mastery for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Users can insert own mastery" on public.topic_mastery for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Users can update own mastery" on public.topic_mastery for update using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
