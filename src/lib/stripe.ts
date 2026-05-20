import Stripe from 'stripe'

let _stripe: Stripe | null = null

function getInstance(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-04-22.dahlia',
    })
  }
  return _stripe
}

export const stripe = new Proxy({} as Stripe, {
  get(_, prop: string | symbol) {
    return (getInstance() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    chatMessagesPerDay: 10,
  },
  pro: {
    name: 'Pro',
    monthly: { priceGBP: 4000, priceDisplay: '£40', stripePriceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? '' },
    annual:  { priceGBP: 40000, priceDisplay: '£400', stripePriceId: process.env.STRIPE_PRO_ANNUAL_PRICE_ID ?? '' },
    chatMessagesPerDay: Infinity,
  },
}

export function isPro(status: string | null | undefined): boolean {
  return status === 'active' || status === 'trialing'
}
