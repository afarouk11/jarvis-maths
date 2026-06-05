import { stripe } from '@/lib/stripe'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import Stripe from 'stripe'

export const runtime = 'nodejs'

function adminClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function updateSubscription(sub: Stripe.Subscription) {
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
  await adminClient()
    .from('profiles')
    .update({
      stripe_subscription_id: sub.id,
      stripe_subscription_status: sub.status,
    })
    .eq('stripe_customer_id', customerId)
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!.trim()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch {
    return new Response('Webhook signature invalid', { status: 400 })
  }

  // Idempotency: Stripe re-delivers events, so record each id and skip duplicates.
  // A unique-violation means we've already processed this event.
  try {
    const { error } = await adminClient().from('stripe_events').insert({ id: event.id })
    if (error?.code === '23505') return new Response('ok (duplicate)', { status: 200 })
  } catch {
    // Ledger table may not be migrated yet — fall through and process the event.
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await updateSubscription(event.data.object as Stripe.Subscription)
      break
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string)
        await updateSubscription(sub)
      }
      break
    }
  }

  return new Response('ok', { status: 200 })
}
