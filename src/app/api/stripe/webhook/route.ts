import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'
import Stripe from 'stripe'

export const runtime = 'nodejs'

async function updateSubscription(
  supabase: Awaited<ReturnType<typeof createClient>>,
  sub: Stripe.Subscription
) {
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
  await supabase
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
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch {
    return new Response('Webhook signature invalid', { status: 400 })
  }

  const supabase = await createClient()

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await updateSubscription(supabase, event.data.object as Stripe.Subscription)
      break
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string)
        await updateSubscription(supabase, sub)
      }
      break
    }
  }

  return new Response('ok', { status: 200 })
}
