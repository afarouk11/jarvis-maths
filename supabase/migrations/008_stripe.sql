alter table public.profiles
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists stripe_subscription_status text,
  add column if not exists chat_messages_today integer not null default 0,
  add column if not exists chat_messages_reset_at date not null default current_date;
