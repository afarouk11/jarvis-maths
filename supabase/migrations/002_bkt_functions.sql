-- Helper: get topics due for review for a student
create or replace function get_due_topics(p_student_id uuid)
returns table(
  topic_id uuid,
  p_known float,
  next_review_at timestamptz,
  questions_attempted integer
)
language sql stable
as $$
  select topic_id, p_known, next_review_at, questions_attempted
  from student_progress
  where student_id = p_student_id
    and next_review_at <= now()
  order by p_known asc, next_review_at asc;
$$;

-- Helper: compute weighted average mastery for a student
create or replace function student_avg_mastery(p_student_id uuid)
returns float
language sql stable
as $$
  select coalesce(avg(p_known), 0)
  from student_progress
  where student_id = p_student_id;
$$;

-- Auto-update streak and last_active_at on progress upsert
create or replace function update_student_streak()
returns trigger
language plpgsql
as $$
begin
  update profiles
  set
    last_active_at = now(),
    streak_days = case
      when last_active_at is null then 1
      when last_active_at::date = current_date then streak_days
      when last_active_at::date = current_date - 1 then streak_days + 1
      else 1
    end
  where id = new.student_id;
  return new;
end;
$$;

create trigger on_progress_update
after insert or update on student_progress
for each row execute function update_student_streak();

-- XP: award on question attempt
create or replace function award_xp()
returns trigger
language plpgsql
as $$
declare
  xp_gain integer;
begin
  xp_gain := case when new.correct then 10 else 2 end;
  update profiles set xp = xp + xp_gain where id = new.student_id;
  return new;
end;
$$;

create trigger on_attempt_award_xp
after insert on question_attempts
for each row execute function award_xp();
