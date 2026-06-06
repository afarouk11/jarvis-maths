-- Per-sub-skill mastery within a topic (additive granularity layer on top of
-- the topic-level student_progress). Used to target practice at the specific
-- technique a student is weakest on.
create table if not exists student_skill_progress (
  student_id        uuid        not null references public.profiles(id) on delete cascade,
  topic_slug        text        not null,
  skill             text        not null,
  p_known           float       not null default 0.3,
  attempts          int         not null default 0,
  correct           int         not null default 0,
  last_attempted_at timestamptz,
  primary key (student_id, topic_slug, skill)
);

alter table student_skill_progress enable row level security;

create policy "users manage own skill progress"
  on student_skill_progress for all
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);

create index if not exists idx_student_skill_progress_student
  on student_skill_progress (student_id);
