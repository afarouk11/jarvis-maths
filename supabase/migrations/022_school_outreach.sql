create table if not exists school_outreach (
  id uuid primary key default gen_random_uuid(),
  school_name text not null,
  contact_email text not null,
  school_type text,           -- 'Academy', 'Comprehensive', 'Grammar', etc.
  borough text,
  website text,
  status text not null default 'pending', -- pending | sent | bounced | replied | opted_out
  sent_at timestamptz,
  replied_at timestamptz,
  personalisation jsonb default '{}',     -- { headOfMaths, schoolName, etc. }
  notes text,
  created_at timestamptz not null default now(),
  unique(contact_email)
);

-- Only admins can read/write this table
alter table school_outreach enable row level security;
do $$ begin
  create policy "admin only" on school_outreach
    for all using (
      exists (select 1 from profiles where id = auth.uid() and is_admin = true)
    );
exception when duplicate_object then null; end $$;

-- Index for filtering by status
create index if not exists school_outreach_status_idx on school_outreach(status);
