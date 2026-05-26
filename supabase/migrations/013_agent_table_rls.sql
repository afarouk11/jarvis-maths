-- Lock down agent_actions and agent_commands to service role only.
-- These are internal admin tables (email outreach drafts + WhatsApp command log)
-- and must never be readable by authenticated students.

alter table agent_actions  enable row level security;
alter table agent_commands enable row level security;

-- Service role bypasses RLS entirely in Supabase, so these policies block
-- all anon/authenticated access while leaving server-side admin access intact.
do $$ begin
  create policy "no public access" on agent_actions as restrictive using (false);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "no public access" on agent_commands as restrictive using (false);
exception when duplicate_object then null; end $$;
