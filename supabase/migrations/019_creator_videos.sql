create table creator_videos (
  id               uuid        primary key default gen_random_uuid(),
  creator_name     text        not null,
  creator_handle   text,
  creator_avatar_url text,
  title            text        not null,
  description      text,
  youtube_id       text        not null,
  topic_tag        text,
  approved         boolean     not null default false,
  created_at       timestamptz not null default now()
);

alter table creator_videos enable row level security;

create policy "anyone can view approved creator videos"
  on creator_videos for select
  using (approved = true);

create policy "admins can manage creator videos"
  on creator_videos for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and is_admin = true
    )
  );
