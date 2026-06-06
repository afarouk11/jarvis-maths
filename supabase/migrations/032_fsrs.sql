-- FSRS scheduler state: memory stability (days) and difficulty (1-10) per topic.
-- Nullable so existing rows are treated as fresh cards on their next review.
alter table student_progress add column if not exists stability float;
alter table student_progress add column if not exists difficulty float;
