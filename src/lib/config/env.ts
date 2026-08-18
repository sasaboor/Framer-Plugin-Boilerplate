/**
 * Environment Configuration
 * 
 * Centralizes all environment variables for the application.
 * All environment variables are prefixed with VITE_ to be accessible in the client code.
 */

export const env = {
  // Polar.sh Configuration
  polar: {
    accessToken: import.meta.env.VITE_POLAR_ACCESS_TOKEN || '',
    orgId: import.meta.env.VITE_POLAR_ORG_ID || '',
    productId: import.meta.env.VITE_POLAR_PRODUCT_ID || '',
  },

  // Development mode check
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;

// Validate required environment variables
export function validateEnv(): { isValid: boolean; missing: string[] } {
  const missing: string[] = [];

  if (!env.polar.accessToken) missing.push('VITE_POLAR_ACCESS_TOKEN');
  if (!env.polar.productId) missing.push('VITE_POLAR_PRODUCT_ID');

  return {
    isValid: missing.length === 0,
    missing,
  };
}


