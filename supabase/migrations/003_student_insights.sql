-- Student insights: patterns Jarvis learns about the student
create table public.student_insights (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.profiles(id) on delete cascade not null unique,
  -- Behavioural patterns
  avg_response_time_seconds float default 0,
  fastest_topic_slug text,
  slowest_topic_slug text,
  most_attempted_topic_slug text,
  most_missed_topic_slug text,
  common_mistake_patterns jsonb default '[]', -- array of {topic, pattern, count}
  -- Session patterns
  total_sessions integer default 0,
  avg_session_questions integer default 0,
  preferred_difficulty integer default 3,
  -- Jarvis memory: key facts remembered across conversations
  jarvis_notes jsonb default '[]', -- array of {note, created_at}
  updated_at timestamptz default now()
);

alter table public.student_insights enable row level security;
create policy "Students can view own insights" on public.student_insights for select using (auth.uid() = student_id);
create policy "Students can upsert own insights" on public.student_insights for insert with check (auth.uid() = student_id);
create policy "Students can update own insights" on public.student_insights for update using (auth.uid() = student_id);
