/**
 * Supabase Constants
 * Tier limits, table names, and configuration constants
 */

export const TIER_LIMITS = {
  FREE: {
    maxChecks: 5,
    features: ['basic_audit', 'seo_check'],
  },
  PREMIUM: {
    maxChecks: Infinity,
    features: ['basic_audit', 'seo_check', 'advanced_validation', 'export_reports', 'priority_support'],
  },
} as const;

export const USER_TIERS = {
  FREE: 'free',
  PREMIUM: 'premium',
} as const;

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  REVOKED: 'revoked',
  CANCELLED: 'cancelled',
} as const;

export const TABLE_NAMES = {
  USERS: 'users',
  SUBSCRIPTIONS: 'subscriptions',
  USER_SESSIONS: 'user_sessions',
  USAGE_TRACKING: 'usage_tracking',
} as const;

export const SYNC_CONFIG = {
  /**
   * How often to sync data when online (milliseconds)
   */
  BACKGROUND_SYNC_INTERVAL: 5 * 60 * 1000, // 5 minutes

  /**
   * Maximum number of offline actions to queue
   */
  MAX_OFFLINE_QUEUE_SIZE: 100,

  /**
   * Retry attempts for failed syncs
   */
  MAX_RETRY_ATTEMPTS: 3,
} as const;
