-- Security hardening from the Supabase security advisor (applied to production
-- via MCP on 2026-06-11; kept here so the repo mirrors the live schema).

-- 1. Pin search_path on every flagged function (advisor 0011).
do $$
declare r record;
begin
  for r in
    select n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) as args
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('student_avg_mastery','handle_new_user','update_student_streak',
                        'match_paper_chunks','award_xp','match_knowledge',
                        'touch_learning_journey','get_due_topics')
  loop
    execute format('alter function %I.%I(%s) set search_path = public', r.nspname, r.proname, r.args);
  end loop;
end $$;

-- 2. agent_commands: the USING(true) policy applied to ALL roles, giving any
-- signed-in user full read/write. The app only touches this table with the
-- service role, which bypasses RLS, so the policy was pure exposure.
drop policy if exists "service role full access" on public.agent_commands;

-- 3. school_enquiries: same always-true policy exposed enquiry contact details
-- to any client. The public form only needs INSERT.
drop policy if exists "service role full access" on public.school_enquiries;
drop policy if exists "anyone can submit an enquiry" on public.school_enquiries;
create policy "anyone can submit an enquiry" on public.school_enquiries
  for insert to anon, authenticated with check (true);

-- 4. Harden XP/misconception RPCs: students may only act on their own row
-- (and XP per call is capped); the service role remains unrestricted.
create or replace function public.increment_xp(p_user uuid, p_amount integer)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if (select auth.role()) is distinct from 'service_role' then
    if (select auth.uid()) is null or p_user is distinct from (select auth.uid()) then
      raise exception 'increment_xp: callers may only award XP to themselves';
    end if;
    if p_amount < 0 or p_amount > 200 then
      raise exception 'increment_xp: amount out of range';
    end if;
  end if;
  update public.profiles set xp = coalesce(xp, 0) + p_amount where id = p_user;
end;
$$;

create or replace function public.bump_misconception(p_user uuid, p_topic text, p_tag text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if (select auth.role()) is distinct from 'service_role' then
    if (select auth.uid()) is null or p_user is distinct from (select auth.uid()) then
      raise exception 'bump_misconception: callers may only record their own misconceptions';
    end if;
  end if;
  insert into public.student_misconceptions (user_id, topic_slug, tag, count, last_seen_at)
  values (p_user, p_topic, p_tag, 1, now())
  on conflict (user_id, topic_slug, tag)
  do update set count = public.student_misconceptions.count + 1, last_seen_at = now();
end;
$$;

-- 5. Lock down RPC surface. handle_new_user is a trigger function and must
-- never be callable via REST; the other two self-enforce identity but should
-- not be visible to anonymous clients at all. EXECUTE is granted to PUBLIC by
-- default, so it must be revoked from public, not just anon.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.increment_xp(uuid, integer) from public, anon;
revoke execute on function public.bump_misconception(uuid, text, text) from public, anon;
grant execute on function public.increment_xp(uuid, integer) to authenticated, service_role;
grant execute on function public.bump_misconception(uuid, text, text) to authenticated, service_role;

-- 6. Remove duplicate permissive policies (each pair was fully covered by the
-- policy that remains).
drop policy if exists "Authenticated users can read knowledge" on public.knowledge_base;
drop policy if exists "Students can view own papers" on public.generated_papers;
