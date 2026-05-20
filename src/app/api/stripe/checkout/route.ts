import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, full_name')
    .eq('id', user.id)
    .single()

  const { plan } = await req.json().catch(() => ({ plan: 'monthly' }))
  const priceId = (plan === 'annual'
    ? process.env.STRIPE_PRO_ANNUAL_PRICE_ID!
    : process.env.STRIPE_PRO_MONTHLY_PRICE_ID!).trim()

  const origin = req.headers.get('origin') ?? 'https://studiq.org'

  console.log('[stripe/checkout] priceId:', priceId, 'origin:', origin, 'existingCustomer:', profile?.stripe_customer_id ?? 'none')

  try {
    // Reuse existing customer or create a new one
    let customerId = profile?.stripe_customer_id
    if (!customerId) {
      console.log('[stripe/checkout] creating customer for', user.email)
      const customer = await stripe.customers.create({
        email: user.email,
        name: profile?.full_name ?? undefined,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id
      console.log('[stripe/checkout] customer created:', customerId)
      await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
    }

    console.log('[stripe/checkout] creating session for customer:', customerId)
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?upgraded=1`,
      cancel_url: `${origin}/pricing`,
      metadata: { supabase_user_id: user.id },
    })
    console.log('[stripe/checkout] session created:', session.id)
    return Response.json({ url: session.url })
  } catch (err: any) {
    console.error('[stripe/checkout] ERROR msg:', err?.message)
    console.error('[stripe/checkout] ERROR type:', err?.type, 'code:', err?.code, 'status:', err?.statusCode)
    console.error('[stripe/checkout] ERROR raw:', JSON.stringify(err))
    return Response.json({ error: err?.message ?? 'Stripe error' }, { status: 500 })
  }
}
