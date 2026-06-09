-- Dev-only demo journey. Run against a local/staging DB with a real student id:
--
--   psql "$DATABASE_URL" -v student_id="'00000000-0000-0000-0000-000000000000'" \
--     -f supabase/seed_journey_demo.sql
--
-- Creates one active journey focused on Differentiation, mid-cycle at the
-- "practice" phase, with a completed diagnose + learn step recording a small
-- mastery gain. Lets you see the brain + banner flow without grinding through it.

begin;

-- Clear any existing active journey for this demo student so the seed is repeatable.
update public.learning_journeys
  set status = 'abandoned', completed_at = now()
  where student_id = :student_id and status = 'active';

with topic as (
  select id from public.topics where slug = 'differentiation' limit 1
),
j as (
  insert into public.learning_journeys
    (student_id, status, current_phase, focus_topic_id, target_mastery, cycles_done)
  select :student_id, 'active', 'practice', topic.id, 0.7, 0
  from topic
  returning id, focus_topic_id
)
insert into public.journey_steps
  (journey_id, topic_id, phase, status, p_known_before, p_known_after, payload, completed_at)
select j.id, j.focus_topic_id, v.phase, 'done', v.before, v.after, v.payload::jsonb, now()
from j
cross join (values
  ('diagnose', 0.32, 0.32, '{"reason":"weakest prerequisite"}'),
  ('learn',    0.32, 0.41, '{"lesson":"Differentiation from First Principles"}')
) as v(phase, before, after, payload);

commit;
