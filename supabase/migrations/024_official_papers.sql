create table if not exists official_papers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  board text not null check (board in ('Edexcel', 'AQA', 'OCR')),
  year integer not null,
  paper integer not null check (paper in (1, 2, 3)),
  pdf_url text,
  mark_scheme_url text,
  created_at timestamptz not null default now()
);

alter table official_papers enable row level security;

-- Anyone (including unauthenticated) can read — these are publicly available exams
do $$ begin
  create policy "anyone can read official papers" on official_papers
    for select using (true);
exception when duplicate_object then null; end $$;

-- Only admins can insert / update / delete
do $$ begin
  create policy "admins can manage official papers" on official_papers
    for all using (
      exists (select 1 from profiles where id = auth.uid() and is_admin = true)
    );
exception when duplicate_object then null; end $$;

create index if not exists official_papers_board_year_idx on official_papers(board, year, paper);
