/**
 * Pro Status Card Component
 *
 * Displays Pro account status (feature-based licensing)
 */

import { useLicense } from '../lib/hooks/useLicense';

export function ProStatusCard() {
  const { tier } = useLicense();

  // Hidden in feature-based licensing model
  // Users can see their tier status in the Account screen instead
  return null;
}

