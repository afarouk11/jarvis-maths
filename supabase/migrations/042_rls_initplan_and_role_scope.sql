-- RLS performance pass from the Supabase performance advisor (applied to
-- production via MCP on 2026-06-11; kept here so the repo mirrors live).
--
-- 1. Wrap auth.uid()/auth.role()/auth.jwt() in scalar subqueries so Postgres
--    evaluates them once per statement instead of once per row (advisor 0003).
-- 2. Scope every auth-dependent policy to the authenticated role — such
--    policies can never pass for anon, so evaluating them for anon is wasted
--    work and trips the multiple-permissive-policies advisor (0006).
do $$
declare
  p record;
  new_qual text;
  new_check text;
  stmt text;
begin
  for p in
    select schemaname, tablename, policyname, roles, qual, with_check
    from pg_policies
    where schemaname = 'public'
      and (coalesce(qual, '') || coalesce(with_check, '')) ~ 'auth\.(uid|role|jwt)\(\)'
  loop
    new_qual := p.qual;
    if new_qual is not null then
      -- normalise any already-wrapped form first so the rewrite is idempotent
      new_qual := replace(new_qual, '( SELECT auth.uid() AS uid)',   'auth.uid()');
      new_qual := replace(new_qual, '( SELECT auth.role() AS role)', 'auth.role()');
      new_qual := replace(new_qual, '( SELECT auth.jwt() AS jwt)',   'auth.jwt()');
      new_qual := replace(new_qual, 'auth.uid()',  '(select auth.uid())');
      new_qual := replace(new_qual, 'auth.role()', '(select auth.role())');
      new_qual := replace(new_qual, 'auth.jwt()',  '(select auth.jwt())');
    end if;
    new_check := p.with_check;
    if new_check is not null then
      new_check := replace(new_check, '( SELECT auth.uid() AS uid)',   'auth.uid()');
      new_check := replace(new_check, '( SELECT auth.role() AS role)', 'auth.role()');
      new_check := replace(new_check, '( SELECT auth.jwt() AS jwt)',   'auth.jwt()');
      new_check := replace(new_check, 'auth.uid()',  '(select auth.uid())');
      new_check := replace(new_check, 'auth.role()', '(select auth.role())');
      new_check := replace(new_check, 'auth.jwt()',  '(select auth.jwt())');
    end if;

    stmt := format('alter policy %I on %I.%I to authenticated', p.policyname, p.schemaname, p.tablename);
    if new_qual is not null then
      stmt := stmt || format(' using (%s)', new_qual);
    end if;
    if new_check is not null then
      stmt := stmt || format(' with check (%s)', new_check);
    end if;
    execute stmt;
  end loop;
end $$;
