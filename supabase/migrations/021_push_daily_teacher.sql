-- Push notification subscriptions
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  unique(user_id, endpoint)
);
alter table push_subscriptions enable row level security;
create policy "users manage own subscriptions" on push_subscriptions
  for all using (auth.uid() = user_id);

-- Daily challenge completions
create table if not exists daily_challenge_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge_date date not null default current_date,
  topic_slug text not null,
  correct boolean not null,
  xp_earned integer not null default 0,
  completed_at timestamptz not null default now(),
  unique(user_id, challenge_date)
);
alter table daily_challenge_completions enable row level security;
create policy "users manage own challenges" on daily_challenge_completions
  for all using (auth.uid() = user_id);

-- Teacher/parent role on profiles
alter table profiles
  add column if not exists role varchar(20) not null default 'student';

-- Teacher ↔ student links
create table if not exists teacher_student_links (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  class_code text not null,
  linked_at timestamptz not null default now(),
  unique(teacher_id, student_id)
);
alter table teacher_student_links enable row level security;
create policy "teachers see their students" on teacher_student_links
  for select using (auth.uid() = teacher_id);
create policy "students see their teacher links" on teacher_student_links
  for select using (auth.uid() = student_id);
create policy "students can link themselves" on teacher_student_links
  for insert with check (auth.uid() = student_id);
create policy "teachers can remove links" on teacher_student_links
  for delete using (auth.uid() = teacher_id);
