-- SPOK chat message history, one row per message, per student
create table public.spok_messages (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users on delete cascade not null,
  role        text not null check (role in ('user', 'assistant')),
  content     text not null,
  created_at  timestamptz not null default now()
);

create index spok_messages_user_created on public.spok_messages (user_id, created_at desc);

alter table public.spok_messages enable row level security;
create policy "Users can read own messages"   on public.spok_messages for select using (auth.uid() = user_id);
create policy "Users can insert own messages" on public.spok_messages for insert with check (auth.uid() = user_id);
create policy "Users can delete own messages" on public.spok_messages for delete using (auth.uid() = user_id);
