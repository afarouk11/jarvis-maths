-- Lets a poor cached question be excluded from reuse, and links a marking report
-- to the question it concerns so admins can act on it.
alter table questions        add column if not exists flagged     boolean not null default false;
alter table marking_reports  add column if not exists question_id uuid;
