alter table public.profiles
  add column if not exists pro_access_until timestamptz;
