-- Email notification preference + a per-user token for one-click unsubscribe
-- links (compliance for transactional/marketing reminder emails).
alter table profiles add column if not exists email_reminders   boolean not null default true;
alter table profiles add column if not exists unsubscribe_token  uuid    not null default gen_random_uuid();
