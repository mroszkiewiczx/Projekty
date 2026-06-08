export interface StripeCheckoutSession {
  sessionId: string
  url: string
  expiresAt: Date
}

export interface SubscriptionPlan {
  id: string
  name: string
  priceMonthly: number
  features: string[]
  monthlyLimit: number
}

export interface SchoolBillingInfo {
  workspaceId: string
  stripeCustomerId?: string | null
  stripeSubscriptionId?: string | null
  plan: 'basic' | 'pro' | 'enterprise'
  status: 'active' | 'paused' | 'cancelled' | 'past_due' | 'trial'
  monthlySpend: number
  nextRenewalDate?: Date
  monthlyLimit: number
  monthlyUsed: number
  percentageUsed: number
}

export interface BillingWebhookEvent {
  type: 'customer.subscription.created' | 'customer.subscription.updated' | 'invoice.paid' | 'invoice.payment_failed'
  data: Record<string, any>
  timestamp: Date
}
