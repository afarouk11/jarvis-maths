create table if not exists school_enquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  email text not null,
  role text not null,
  school text not null,
  message text,
  status text default 'new' -- new | contacted | pilot | declined
);

alter table school_enquiries enable row level security;

-- Only the service role can read (admin only via server-side)
do $$ begin
  create policy "service role full access" on school_enquiries using (true) with check (true);
exception when duplicate_object then null; end $$;
