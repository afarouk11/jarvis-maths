create table if not exists public.generated_papers (
  id            uuid    primary key default gen_random_uuid(),
  student_id    uuid    references public.profiles(id) on delete cascade not null,
  title         text    not null,
  paper         jsonb   not null,
  focus_topics  text[]  not null default '{}',
  total_marks   integer,
  time_minutes  integer,
  created_at    timestamptz not null default now()
);

create index if not exists generated_papers_student_created
  on public.generated_papers (student_id, created_at desc);

alter table public.generated_papers enable row level security;

create policy "Students can view own papers"
  on public.generated_papers for select
  using (auth.uid() = student_id);
