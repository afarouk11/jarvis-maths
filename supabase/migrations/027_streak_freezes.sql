-- Streak "freezes" — a small grace buffer so a single missed day doesn't reset
-- a long streak (a major retention lever). Earned at streak milestones, capped.
alter table profiles add column if not exists streak_freezes int not null default 2;
