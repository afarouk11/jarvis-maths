-- Add level column to past_papers to distinguish GCSE vs A-Level papers
alter table past_papers
  add column if not exists level text not null default 'A-Level'
    check (level in ('GCSE', 'A-Level'));

-- Add mark_scheme_url column for storing mark scheme PDF url
alter table past_papers
  add column if not exists mark_scheme_url text;

-- Add tier column for GCSE Foundation/Higher
alter table past_papers
  add column if not exists tier text
    check (tier in ('Foundation', 'Higher'));

-- Add paper_label for human-readable paper name (e.g. "Paper 1 — Non-Calculator")
alter table past_papers
  add column if not exists paper_label text;

-- Index for level filtering
create index if not exists past_papers_level_idx on past_papers (level);
create index if not exists past_papers_board_level_idx on past_papers (exam_board, level);
