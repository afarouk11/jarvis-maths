-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  exam_board text not null default 'AQA' check (exam_board in ('AQA', 'Edexcel', 'OCR')),
  target_grade text not null default 'A*',
  exam_date date,
  xp integer not null default 0,
  streak_days integer not null default 0,
  last_active_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
do $$ begin
  create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
exception when duplicate_object then null; end $$;

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Topics
create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  parent_id uuid references public.topics(id),
  exam_board text,
  year_group text check (year_group in ('AS', 'A2')),
  order_index integer not null default 0,
  icon text
);

alter table public.topics enable row level security;
do $$ begin
  create policy "Topics are publicly readable" on public.topics for select using (true);
exception when duplicate_object then null; end $$;

-- Lessons
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references public.topics(id) on delete cascade not null,
  title text not null,
  content jsonb not null default '[]',
  difficulty integer not null default 1 check (difficulty between 1 and 5),
  estimated_minutes integer,
  created_at timestamptz not null default now()
);

alter table public.lessons enable row level security;
do $$ begin
  create policy "Lessons are publicly readable" on public.lessons for select using (true);
exception when duplicate_object then null; end $$;

-- Questions
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references public.topics(id) on delete cascade not null,
  stem text not null,
  answer text not null,
  worked_solution jsonb,
  difficulty integer not null default 1 check (difficulty between 1 and 5),
  marks integer not null default 1,
  source text,
  created_at timestamptz not null default now()
);

alter table public.questions enable row level security;
do $$ begin
  create policy "Questions are publicly readable" on public.questions for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Authenticated users can insert questions" on public.questions for insert with check (auth.role() = 'authenticated');
exception when duplicate_object then null; end $$;

-- Student Progress (BKT + SM-2)
create table if not exists public.student_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.profiles(id) on delete cascade not null,
  topic_id uuid references public.topics(id) on delete cascade not null,
  p_known float not null default 0.3,
  p_transit float not null default 0.09,
  p_slip float not null default 0.1,
  p_guess float not null default 0.2,
  next_review_at timestamptz not null default now(),
  interval_days float not null default 1,
  ease_factor float not null default 2.5,
  repetitions integer not null default 0,
  questions_attempted integer not null default 0,
  questions_correct integer not null default 0,
  last_attempted_at timestamptz,
  unique(student_id, topic_id)
);

alter table public.student_progress enable row level security;
do $$ begin
  create policy "Students can view own progress" on public.student_progress for select using (auth.uid() = student_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Students can insert own progress" on public.student_progress for insert with check (auth.uid() = student_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Students can update own progress" on public.student_progress for update using (auth.uid() = student_id);
exception when duplicate_object then null; end $$;

-- Question Attempts
create table if not exists public.question_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.profiles(id) on delete cascade not null,
  question_id uuid references public.questions(id) on delete cascade not null,
  correct boolean not null,
  time_taken_seconds integer,
  attempted_at timestamptz not null default now()
);

alter table public.question_attempts enable row level security;
do $$ begin
  create policy "Students can view own attempts" on public.question_attempts for select using (auth.uid() = student_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Students can insert own attempts" on public.question_attempts for insert with check (auth.uid() = student_id);
exception when duplicate_object then null; end $$;

-- Chat Sessions
create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.profiles(id) on delete cascade not null,
  topic_id uuid references public.topics(id),
  messages jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.chat_sessions enable row level security;
do $$ begin
  create policy "Students can manage own chat sessions" on public.chat_sessions for all using (auth.uid() = student_id);
exception when duplicate_object then null; end $$;
