-- Teacher-set assignments (topic practice or a mock paper) with a due date.
-- Completion is derived from the student's actual activity, so there's no
-- separate completion table to keep in sync.
create table if not exists assignments (
  id          uuid        primary key default gen_random_uuid(),
  teacher_id  uuid        not null references public.profiles(id) on delete cascade,
  class_code  text        not null,
  title       text        not null,
  type        text        not null default 'topic' check (type in ('topic', 'paper')),
  topic_slug  text,
  due_date    date,
  created_at  timestamptz not null default now()
);

alter table assignments enable row level security;

create policy "teachers manage own assignments"
  on assignments for all
  using (auth.uid() = teacher_id)
  with check (auth.uid() = teacher_id);

create policy "students read their class assignments"
  on assignments for select
  using (exists (
    select 1 from public.teacher_student_links l
    where l.student_id = auth.uid() and l.class_code = assignments.class_code
  ));

create index if not exists idx_assignments_class on assignments (class_code);
