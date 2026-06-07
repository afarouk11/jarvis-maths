-- Learning journeys — SPOK's guided diagnose → learn → practice → assess → analyse cycle.
-- A journey is the persistent state machine behind the brain: it survives the student
-- navigating away to the notes / practice / papers pages and resumes back on /jarvis.

create table if not exists public.learning_journeys (
  id             uuid primary key default gen_random_uuid(),
  student_id     uuid references public.profiles(id) on delete cascade not null,
  status         text not null default 'active'
                   check (status in ('active','completed','abandoned')),
  current_phase  text not null default 'welcome'
                   check (current_phase in
                     ('welcome','diagnose','learn','practice','assess','analyse','complete')),
  focus_topic_id uuid references public.topics(id),
  target_mastery float not null default 0.7,
  cycles_done    integer not null default 0,
  started_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  completed_at   timestamptz
);

-- At most one active journey per student.
create unique index if not exists learning_journeys_one_active
  on public.learning_journeys (student_id) where status = 'active';

create index if not exists learning_journeys_student
  on public.learning_journeys (student_id, started_at desc);

alter table public.learning_journeys enable row level security;
do $$ begin
  create policy "Students manage own journeys" on public.learning_journeys
    for all using (auth.uid() = student_id) with check (auth.uid() = student_id);
exception when duplicate_object then null; end $$;

-- Per-phase audit trail: the cycle history plus the before/after mastery for each
-- topic worked, so SPOK can analyse how much the student actually improved.
create table if not exists public.journey_steps (
  id             uuid primary key default gen_random_uuid(),
  journey_id     uuid references public.learning_journeys(id) on delete cascade not null,
  topic_id       uuid references public.topics(id),
  phase          text not null
                   check (phase in ('diagnose','learn','practice','assess','analyse')),
  status         text not null default 'in_progress'
                   check (status in ('in_progress','done','skipped')),
  p_known_before float,
  p_known_after  float,
  payload        jsonb not null default '{}',   -- e.g. {paperId, lessonId, attempts, accuracy}
  created_at     timestamptz not null default now(),
  completed_at   timestamptz
);

create index if not exists journey_steps_journey
  on public.journey_steps (journey_id, created_at);

alter table public.journey_steps enable row level security;
do $$ begin
  create policy "Students manage own journey steps" on public.journey_steps
    for all using (
      exists (
        select 1 from public.learning_journeys j
        where j.id = journey_id and j.student_id = auth.uid()
      )
    ) with check (
      exists (
        select 1 from public.learning_journeys j
        where j.id = journey_id and j.student_id = auth.uid()
      )
    );
exception when duplicate_object then null; end $$;

-- Keep updated_at fresh on every journey mutation.
create or replace function public.touch_learning_journey()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_touch_learning_journey on public.learning_journeys;
create trigger trg_touch_learning_journey
  before update on public.learning_journeys
  for each row execute procedure public.touch_learning_journey();
