-- Tracks recurring misconceptions / exam-technique slips per student and topic,
-- so SPOK can name patterns ("you keep dropping the constant of integration")
-- instead of treating every mistake as new.
create table if not exists student_misconceptions (
  user_id      uuid        not null references auth.users(id) on delete cascade,
  topic_slug   text        not null,
  tag          text        not null,
  count        int         not null default 1,
  last_seen_at timestamptz not null default now(),
  primary key (user_id, topic_slug, tag)
);

alter table student_misconceptions enable row level security;

create policy "users manage own misconceptions"
  on student_misconceptions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_student_misconceptions_user
  on student_misconceptions (user_id);
