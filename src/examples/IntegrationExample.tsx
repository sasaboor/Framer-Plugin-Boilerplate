/**
 * Integration Usage Example
 * 
 * This file demonstrates how to use the Polar.sh and PostHog integrations
 */

import { useState } from 'react';
import { Button } from '../components/button';
import { PaywallModal } from '../components/PaywallModal';
import { LicenseActivation } from '../components/LicenseActivation';
import { useAnalytics, useScreenTracking } from '../lib/hooks/useAnalytics';
import { useLicense } from '../lib/hooks/useLicense';

/**
 * Example: Dashboard with Feature-Based License Check
 */
export function DashboardExample() {
  // Automatic screen tracking
  useScreenTracking('Dashboard');

  const { track, trackAudit } = useAnalytics();
  const { hasLicense, tier, hasPremiumAccess } = useLicense();

  const [showPaywall, setShowPaywall] = useState(false);

  const handleStartAudit = async () => {
    // Check if user has premium access
    // In feature-based licensing, free users can't run audits
    // Customize this based on your plugin's features
    if (!hasPremiumAccess()) {
      setShowPaywall(true);
      return;
    }

    // Track audit start
    track('audit_started', {
      has_license: hasLicense,
      tier: tier,
    });

    // Run your audit logic here
    const startTime = Date.now();

    try {
      // ... audit logic ...
      const score = 85;
      const issuesCount = 12;
      const duration = Date.now() - startTime;

      // Track successful audit
      trackAudit(score, issuesCount, duration);
    } catch (error) {
      // Track failed audit
      track('audit_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>

      {/* Show license status */}
      {tier === 'premium' ? (
        <p>✓ Premium License Active</p>
      ) : (
        <p>⚠️ Free Tier - Upgrade for full access</p>
      )}

      <Button onClick={handleStartAudit}>
        Start Audit {tier === 'free' && '(Pro)'}
      </Button>

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onLicenseActivated={() => {
          // License activated successfully
          setShowPaywall(false);
        }}
      />
    </div>
  );
}

/**
 * Example: Settings Screen with License Management
 */
export function SettingsExample() {
  useScreenTracking('Settings');

  const { track } = useAnalytics();
  const { tier } = useLicense();

  const handleExportData = () => {
    track('settings_export_clicked');
    // Export logic...
  };

  return (
    <div>
      <h1>Settings</h1>

      {/* License Management */}
      <section>
        <h2>License</h2>
        <LicenseActivation />
      </section>

      {/* Tier Display */}
      <section>
        <h2>Account Tier</h2>
        <p>Current Tier: {tier === 'premium' ? 'Premium' : 'Free'}</p>
      </section>

      <Button onClick={handleExportData}>
        Export Data
      </Button>
    </div>
  );
}

/**
 * Example: Custom Analytics Tracking
 */
export function AnalyticsExample() {
  const { track, identify } = useAnalytics();

  // Track button clicks
  const handleButtonClick = (buttonName: string) => {
    track('button_clicked', {
      button_name: buttonName,
      screen: 'example',
      timestamp: Date.now(),
    });
  };

  // Identify user with license key (hashed)
  const handleUserIdentification = (licenseKey: string) => {
    // Hash the license key for privacy
    const userId = btoa(licenseKey).substring(0, 16);
    
    identify(userId, {
      has_license: true,
      plan: 'premium',
    });
  };

  return (
    <div>
      <Button onClick={() => handleButtonClick('primary_action')}>
        Track Click
      </Button>
    </div>
  );
}

/**
 * Example: Protected Feature with Paywall
 */
export function ProtectedFeatureExample() {
  const { hasPremiumAccess } = useLicense();
  const { trackPurchase } = useAnalytics();
  const [showPaywall, setShowPaywall] = useState(false);

  const handleFeatureAccess = () => {
    // Check if user has premium access
    if (!hasPremiumAccess()) {
      trackPurchase('protected_feature');
      setShowPaywall(true);
      return;
    }

    // Feature logic...
  };

  return (
    <div>
      <Button onClick={handleFeatureAccess}>
        Access Premium Feature
      </Button>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
      />
    </div>
  );
}


