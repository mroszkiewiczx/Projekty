import { supabase } from '@/lib/supabase'
import { StripeCheckoutSession, SchoolBillingInfo, SubscriptionPlan } from '@/types/billing'

export const PLANS: Record<string, SubscriptionPlan> = {
  basic: {
    id: 'basic',
    name: 'Basic',
    priceMonthly: 29,
    features: ['Up to 10 teachers', '100 materials/month', 'Basic support'],
    monthlyLimit: 100
  },
  pro: {
    id: 'pro',
    name: 'Professional',
    priceMonthly: 79,
    features: ['Up to 50 teachers', '500 materials/month', 'Priority support', 'Analytics'],
    monthlyLimit: 500
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    priceMonthly: 199,
    features: ['Unlimited teachers', 'Unlimited materials', '24/7 support', 'Custom integration'],
    monthlyLimit: 999999
  }
}

export const billingService = {
  async createCheckoutSession(workspaceId: string, planId: string): Promise<StripeCheckoutSession> {
    try {
      const plan = PLANS[planId]
      if (!plan) {
        throw new Error('Invalid plan ID')
      }

      // Call Stripe edge function
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          planId,
          priceMonthly: plan.priceMonthly
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const data = await response.json()

      return {
        sessionId: data.sessionId,
        url: data.url,
        expiresAt: new Date(data.expiresAt)
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      throw error
    }
  },

  async getBillingInfo(workspaceId: string): Promise<SchoolBillingInfo> {
    try {
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('workspace_id', workspaceId)
        .single()

      if (error || !subscription) {
        // No subscription yet
        return {
          workspaceId,
          plan: 'basic',
          status: 'active',
          monthlySpend: 0,
          monthlyLimit: PLANS.basic.monthlyLimit,
          monthlyUsed: 0,
          percentageUsed: 0
        }
      }

      // Get usage
      const { count: usageCount } = await supabase
        .from('ai_usage_logs')
        .select('id', { count: 'exact' })
        .eq('workspace_id', workspaceId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      const monthlyUsed = usageCount || 0
      const monthlyLimit = subscription.monthly_limit_materials || PLANS.basic.monthlyLimit
      const percentageUsed = Math.round((monthlyUsed / monthlyLimit) * 100)

      return {
        workspaceId,
        stripeCustomerId: subscription.stripe_customer_id,
        stripeSubscriptionId: subscription.stripe_subscription_id,
        plan: subscription.plan_tier,
        status: subscription.status,
        monthlySpend: (PLANS[subscription.plan_tier]?.priceMonthly || 0),
        nextRenewalDate: subscription.renewal_date ? new Date(subscription.renewal_date) : undefined,
        monthlyLimit,
        monthlyUsed,
        percentageUsed
      }
    } catch (error) {
      console.error('Error fetching billing info:', error)
      throw error
    }
  },

  async updateSubscriptionPlan(workspaceId: string, newPlanId: string): Promise<void> {
    try {
      const plan = PLANS[newPlanId]
      if (!plan) {
        throw new Error('Invalid plan ID')
      }

      // Call edge function to update Stripe
      const response = await fetch('/api/billing/update-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          newPlanId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update subscription plan')
      }

      // Update local DB
      await supabase
        .from('subscriptions')
        .update({
          plan_tier: newPlanId as 'basic' | 'pro' | 'enterprise',
          monthly_limit_materials: plan.monthlyLimit
        })
        .eq('workspace_id', workspaceId)
    } catch (error) {
      console.error('Error updating subscription plan:', error)
      throw error
    }
  },

  async cancelSubscription(workspaceId: string): Promise<void> {
    try {
      // Call edge function to cancel on Stripe
      const response = await fetch('/api/billing/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId })
      })

      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }

      // Update local DB
      await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('workspace_id', workspaceId)
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      throw error
    }
  },

  async getStripePortalLink(workspaceId: string): Promise<string> {
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId })
      })

      if (!response.ok) {
        throw new Error('Failed to get portal link')
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error('Error getting Stripe portal link:', error)
      throw error
    }
  },

  getPlans(): SubscriptionPlan[] {
    return Object.values(PLANS)
  },

  getPlan(planId: string): SubscriptionPlan | undefined {
    return PLANS[planId]
  }
}
