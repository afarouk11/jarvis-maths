alter table profiles
  add column if not exists language varchar(5) not null default 'en';
