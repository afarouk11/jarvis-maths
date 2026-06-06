-- Running confidence-calibration metric per student: the average gap between
-- self-assessed confidence and actual performance. Positive ⇒ overconfident,
-- negative ⇒ underconfident.
alter table profiles add column if not exists calib_sum   float not null default 0;
alter table profiles add column if not exists calib_count int   not null default 0;
