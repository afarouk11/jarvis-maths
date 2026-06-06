-- Review logs feed FSRS personalisation; fsrs_retention is the per-user
-- requested retention the scheduler targets (default 0.9).
create table if not exists fsrs_review_logs (
  id           bigint      generated always as identity primary key,
  user_id      uuid        not null references auth.users(id) on delete cascade,
  topic_slug   text,
  grade        int         not null,
  elapsed_days float       not null default 0,
  recalled     boolean     not null,
  reviewed_at  timestamptz not null default now()
);

alter table fsrs_review_logs enable row level security;
create policy "users insert own review logs"
  on fsrs_review_logs for insert with check (auth.uid() = user_id);
create policy "users read own review logs"
  on fsrs_review_logs for select using (auth.uid() = user_id);
create index if not exists idx_fsrs_logs_user on fsrs_review_logs (user_id, reviewed_at);

alter table profiles add column if not exists fsrs_retention float not null default 0.9;
