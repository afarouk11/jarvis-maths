-- Backfill: anyone with an existing profile is already onboarded
update public.profiles
set onboarding_complete = true
where onboarding_complete = false;
