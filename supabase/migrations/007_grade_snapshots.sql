-- Grade snapshots: daily record of a student's predicted grade
-- Used by GradeTrendChart on the profile page
create table public.grade_snapshots (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.profiles(id) on delete cascade not null,
  avg_p_known float not null,
  grade text not null,
  created_at timestamptz not null default now()
);

alter table public.grade_snapshots enable row level security;
create policy "Users can view own snapshots" on public.grade_snapshots
  for select using (auth.uid() = student_id);
create policy "Users can insert own snapshots" on public.grade_snapshots
  for insert with check (auth.uid() = student_id);

create index grade_snapshots_student_created
  on public.grade_snapshots (student_id, created_at desc);
