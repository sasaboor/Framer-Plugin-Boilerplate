/**
 * Feature Flags System
 *
 * Defines which features are available to free vs premium users.
 * Customize this file to match your plugin's specific features.
 */

export type UserTier = 'free' | 'premium';

export interface Feature {
  id: string;
  name: string;
  description: string;
  tier: UserTier;
  category?: string;
}

/**
 * Define your plugin's features here
 * Add or remove features based on your plugin's needs
 */
export const FEATURES: Record<string, Feature> = {
  // Example: Basic features available to all users
  BASIC_UI: {
    id: 'basic_ui',
    name: 'Basic UI Components',
    description: 'Access to basic UI components and navigation',
    tier: 'free',
    category: 'ui',
  },
  VIEW_EXAMPLES: {
    id: 'view_examples',
    name: 'View Examples',
    description: 'Browse component examples and documentation',
    tier: 'free',
    category: 'documentation',
  },

  // Example: Premium features
  EXPORT_DATA: {
    id: 'export_data',
    name: 'Export Data',
    description: 'Export data as CSV, JSON, or other formats',
    tier: 'premium',
    category: 'export',
  },
  ADVANCED_ANALYTICS: {
    id: 'advanced_analytics',
    name: 'Advanced Analytics',
    description: 'Detailed analytics and reporting',
    tier: 'premium',
    category: 'analytics',
  },
  PRIORITY_SUPPORT: {
    id: 'priority_support',
    name: 'Priority Support',
    description: 'Fast-track support via email and Discord',
    tier: 'premium',
    category: 'support',
  },
  UNLIMITED_PROJECTS: {
    id: 'unlimited_projects',
    name: 'Unlimited Projects',
    description: 'Work on unlimited projects simultaneously',
    tier: 'premium',
    category: 'projects',
  },

  // Add more features as needed for your plugin
};

/**
 * Get all features for a specific tier
 */
export function getFeaturesForTier(tier: UserTier): Feature[] {
  return Object.values(FEATURES).filter(
    (feature) => feature.tier === tier || (tier === 'premium' && feature.tier === 'free')
  );
}

/**
 * Get features by category
 */
export function getFeaturesByCategory(category: string, tier?: UserTier): Feature[] {
  let features = Object.values(FEATURES).filter((feature) => feature.category === category);

  if (tier) {
    features = features.filter(
      (feature) => feature.tier === tier || (tier === 'premium' && feature.tier === 'free')
    );
  }

  return features;
}

/**
 * Check if a user has access to a specific feature
 */
export function hasFeatureAccess(featureId: string, userTier: UserTier): boolean {
  const feature = FEATURES[featureId];

  if (!feature) {
    console.warn(`[FeatureFlags] Feature "${featureId}" not found`);
    return false;
  }

  // Premium users have access to all features
  if (userTier === 'premium') {
    return true;
  }

  // Free users only have access to free features
  return feature.tier === 'free';
}

/**
 * Get a list of premium-only features
 */
export function getPremiumFeatures(): Feature[] {
  return Object.values(FEATURES).filter((feature) => feature.tier === 'premium');
}

/**
 * Get a list of free features
 */
export function getFreeFeatures(): Feature[] {
  return Object.values(FEATURES).filter((feature) => feature.tier === 'free');
}

/**
 * Feature comparison for upgrade prompts
 */
export interface TierComparison {
  free: string[];
  premium: string[];
}

export function getTierComparison(): TierComparison {
  return {
    free: getFreeFeatures().map((f) => f.name),
    premium: getPremiumFeatures().map((f) => f.name),
  };
}
