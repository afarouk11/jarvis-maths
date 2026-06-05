-- Students can flag an AI mark they think is wrong. Feeds a review queue and,
-- over time, a measure of marking quality.
create table if not exists marking_reports (
  id             uuid        primary key default gen_random_uuid(),
  student_id     uuid        not null references public.profiles(id) on delete cascade,
  stem           text,
  correct_answer text,
  student_answer text,
  ai_feedback    text,
  ai_correct     boolean,
  reason         text,
  resolved       boolean     not null default false,
  created_at     timestamptz not null default now()
);

alter table marking_reports enable row level security;

create policy "students insert own marking reports"
  on marking_reports for insert with check (auth.uid() = student_id);
create policy "students read own marking reports"
  on marking_reports for select using (auth.uid() = student_id);
create policy "admins manage marking reports"
  on marking_reports for all
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

create index if not exists idx_marking_reports_unresolved on marking_reports (resolved, created_at);
