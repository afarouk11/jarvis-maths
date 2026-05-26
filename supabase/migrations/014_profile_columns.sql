alter table public.profiles
  add column if not exists level         text    not null default 'A-Level'
    check (level in ('GCSE', 'A-Level')),
  add column if not exists year_group    text
    check (year_group in ('AS', 'A2', 'Y10', 'Y11')),
  add column if not exists dyslexia_mode boolean not null default false,
  add column if not exists adhd_mode     boolean not null default false,
  add column if not exists is_admin      boolean not null default false;
