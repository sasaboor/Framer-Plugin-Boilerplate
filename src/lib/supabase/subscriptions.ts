/**
 * Supabase Subscriptions Service
 * Manages user subscriptions and Polar.sh integration
 */

import { supabase, isSupabaseConfigured } from './client';
import type { Subscription, InsertSubscription, UpdateSubscription } from './types';
import { SUBSCRIPTION_STATUS } from './constants';

/**
 * Get active subscription for a user
 */
export async function getActiveSubscription(userId: string): Promise<Subscription | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', SUBSCRIPTION_STATUS.ACTIVE)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[Subscriptions] Error fetching active subscription:', error);
      return null;
    }

    // Check if subscription is expired
    if (data && data.expires_at) {
      const expiryDate = new Date(data.expires_at);
      if (expiryDate < new Date()) {
        // Subscription expired, update status
        await updateSubscription(data.id, {
          status: SUBSCRIPTION_STATUS.EXPIRED,
        });
        return null;
      }
    }

    return data;
  } catch (err) {
    console.error('[Subscriptions] Error in getActiveSubscription:', err);
    return null;
  }
}

/**
 * Get all subscriptions for a user
 */
export async function getUserSubscriptions(userId: string): Promise<Subscription[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Subscriptions] Error fetching subscriptions:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('[Subscriptions] Error in getUserSubscriptions:', err);
    return [];
  }
}

/**
 * Get subscription by Polar.sh subscription ID
 */
export async function getSubscriptionByPolarId(
  polarSubscriptionId: string
): Promise<Subscription | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('polar_subscription_id', polarSubscriptionId)
      .single();

    if (error) {
      console.error('[Subscriptions] Error fetching subscription by Polar ID:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('[Subscriptions] Error in getSubscriptionByPolarId:', err);
    return null;
  }
}

/**
 * Create a new subscription
 */
export async function createSubscription(
  subscriptionData: InsertSubscription
): Promise<Subscription | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(subscriptionData)
      .select()
      .single();

    if (error) {
      console.error('[Subscriptions] Error creating subscription:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('[Subscriptions] Error in createSubscription:', err);
    return null;
  }
}

/**
 * Update subscription
 */
export async function updateSubscription(
  subscriptionId: string,
  updates: UpdateSubscription
): Promise<Subscription | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) {
      console.error('[Subscriptions] Error updating subscription:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('[Subscriptions] Error in updateSubscription:', err);
    return null;
  }
}

/**
 * Check if subscription is expired
 */
export function isSubscriptionExpired(subscription: Subscription): boolean {
  if (!subscription.expires_at) {
    return false; // No expiry date means lifetime access
  }

  const expiryDate = new Date(subscription.expires_at);
  return expiryDate < new Date();
}

/**
 * Get days until subscription expires
 */
export function getDaysUntilExpiry(subscription: Subscription): number | null {
  if (!subscription.expires_at) {
    return null; // Lifetime access
  }

  const expiryDate = new Date(subscription.expires_at);
  const now = new Date();
  const diffTime = expiryDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
}

/**
 * Check if user has valid subscription
 */
export async function hasValidSubscription(userId: string): Promise<boolean> {
  const subscription = await getActiveSubscription(userId);
  return subscription !== null && !isSubscriptionExpired(subscription);
}

/**
 * Cancel subscription (mark as cancelled)
 */
export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  const result = await updateSubscription(subscriptionId, {
    status: SUBSCRIPTION_STATUS.CANCELLED,
  });
  return result !== null;
}

/**
 * Revoke subscription (mark as revoked)
 */
export async function revokeSubscription(subscriptionId: string): Promise<boolean> {
  const result = await updateSubscription(subscriptionId, {
    status: SUBSCRIPTION_STATUS.REVOKED,
  });
  return result !== null;
}
