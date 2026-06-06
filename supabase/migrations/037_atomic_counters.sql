-- Atomic counters to avoid lost updates when a user answers rapidly (the
-- progress route otherwise does read-modify-write). SECURITY DEFINER so they run
-- with a fixed search_path and bypass RLS safely for the caller's own rows.

create or replace function public.increment_xp(p_user uuid, p_amount int)
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles set xp = coalesce(xp, 0) + p_amount where id = p_user;
$$;

create or replace function public.bump_misconception(p_user uuid, p_topic text, p_tag text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.student_misconceptions (user_id, topic_slug, tag, count, last_seen_at)
  values (p_user, p_topic, p_tag, 1, now())
  on conflict (user_id, topic_slug, tag)
  do update set count = public.student_misconceptions.count + 1, last_seen_at = now();
$$;

grant execute on function public.increment_xp(uuid, int) to authenticated;
grant execute on function public.bump_misconception(uuid, text, text) to authenticated;
