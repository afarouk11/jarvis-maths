create table if not exists public.agent_commands (
  id           uuid primary key default gen_random_uuid(),
  command      text    not null,
  source       text    not null default 'whatsapp',
  triggered_by text,
  status       text    not null default 'pending'
    check (status in ('pending', 'running', 'done', 'failed')),
  created_at   timestamptz not null default now()
);

create table if not exists public.agent_actions (
  id           uuid primary key default gen_random_uuid(),
  action_type  text    not null,
  payload      jsonb   not null default '{}',
  status       text    not null default 'pending'
    check (status in ('pending', 'running', 'done', 'failed')),
  result       jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.agent_commands  enable row level security;
alter table public.agent_actions   enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'agent_commands' and policyname = 'no public access'
  ) then
    execute $p$
      create policy "no public access" on public.agent_commands
        as restrictive using (false)
    $p$;
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'agent_actions' and policyname = 'no public access'
  ) then
    execute $p$
      create policy "no public access" on public.agent_actions
        as restrictive using (false)
    $p$;
  end if;
end $$;
