/**
 * Supabase Roles & Tier Management Service
 * Handles user permissions and feature-based tier access
 *
 * Note: This has been updated to use feature-based licensing instead of usage-based
 */

import { USER_TIERS } from './constants';
import { getCurrentTier } from './auth';
import type { UserTier } from './types';
import { hasFeatureAccess as checkFeatureAccess, FEATURES, type Feature } from '../utils/featureFlags';

/**
 * Check if a user has access to a specific feature
 * Uses the feature flags system
 */
export async function hasFeatureAccess(
  licenseKey: string | null,
  featureId: string
): Promise<boolean> {
  const tier = await getCurrentTier(licenseKey);
  return checkFeatureAccess(featureId, tier);
}

/**
 * Check if user can access a premium feature
 * @deprecated Use hasFeatureAccess instead with specific feature IDs
 */
export async function canPerformCheck(
  licenseKey: string | null,
  featureId: string = 'EXPORT_DATA'
): Promise<{ allowed: boolean; reason?: string }> {
  const tier = await getCurrentTier(licenseKey);
  const hasAccess = checkFeatureAccess(featureId, tier);

  if (!hasAccess) {
    return {
      allowed: false,
      reason: 'This is a premium feature. Please upgrade to Pro to access it.',
    };
  }

  return { allowed: true };
}

/**
 * Get tier display name
 */
export function getTierDisplayName(tier: UserTier): string {
  switch (tier) {
    case USER_TIERS.FREE:
      return 'Free';
    case USER_TIERS.PREMIUM:
      return 'Premium';
    default:
      return 'Unknown';
  }
}

/**
 * Get tier badge color (for UI)
 */
export function getTierBadgeColor(tier: UserTier): string {
  switch (tier) {
    case USER_TIERS.FREE:
      return 'gray';
    case USER_TIERS.PREMIUM:
      return 'green';
    default:
      return 'gray';
  }
}

/**
 * Check if user needs to upgrade
 */
export async function shouldShowUpgradePrompt(
  licenseKey: string | null
): Promise<boolean> {
  const tier = await getCurrentTier(licenseKey);
  return tier === USER_TIERS.FREE;
}

/**
 * Get user tier info summary
 */
export interface TierInfo {
  tier: UserTier;
  displayName: string;
  badgeColor: string;
  features: Feature[];
  isPremium: boolean;
}

export async function getTierInfo(
  licenseKey: string | null
): Promise<TierInfo> {
  const tier = await getCurrentTier(licenseKey);
  const features = Object.values(FEATURES).filter(f =>
    f.tier === tier || (tier === 'premium' && f.tier === 'free')
  );

  return {
    tier,
    displayName: getTierDisplayName(tier),
    badgeColor: getTierBadgeColor(tier),
    features,
    isPremium: tier === USER_TIERS.PREMIUM,
  };
}

/**
 * Validate tier-based action using feature IDs
 * Generic function to check if user can perform any tier-restricted action
 *
 * @example
 * const canExport = await validateTierAction(licenseKey, 'EXPORT_DATA');
 * if (!canExport.allowed) {
 *   showPaywallModal();
 * }
 */
export async function validateTierAction(
  licenseKey: string | null,
  featureId: string
): Promise<{ allowed: boolean; reason?: string; feature?: Feature }> {
  const tier = await getCurrentTier(licenseKey);
  const feature = FEATURES[featureId];

  if (!feature) {
    return {
      allowed: false,
      reason: `Unknown feature: ${featureId}`,
    };
  }

  const hasAccess = checkFeatureAccess(featureId, tier);

  if (!hasAccess) {
    return {
      allowed: false,
      reason: `${feature.name} is a premium feature. Upgrade to Pro to access it.`,
      feature,
    };
  }

  return { allowed: true, feature };
}
