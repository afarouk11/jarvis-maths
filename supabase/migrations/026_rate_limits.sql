-- Per-user fixed-window rate limiting for expensive AI routes.
create table if not exists rate_limits (
  user_id      uuid        not null references auth.users(id) on delete cascade,
  bucket       text        not null,
  window_start timestamptz not null default now(),
  count        int         not null default 0,
  primary key (user_id, bucket)
);

alter table rate_limits enable row level security;

create policy "users manage own rate limits"
  on rate_limits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
