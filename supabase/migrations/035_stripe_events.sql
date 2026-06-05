-- Idempotency ledger for Stripe webhook events (Stripe re-delivers events, so we
-- record processed ids and skip duplicates). Service-role only.
create table if not exists stripe_events (
  id         text        primary key,
  created_at timestamptz not null default now()
);

alter table stripe_events enable row level security;
