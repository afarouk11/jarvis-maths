-- Add onboarding_complete flag to profiles
alter table public.profiles
  add column if not exists onboarding_complete boolean not null default false;
