# Feature-Based Licensing Guide

This boilerplate uses **feature-based licensing** instead of usage-based (check counting). This guide explains how to implement feature gating in your plugin.

---

## Overview

**Feature-based licensing** means:
- ✅ Free users have access to basic features
- ✅ Premium users have access to all features
- ❌ No usage counting or "X checks remaining"
- ❌ No free trial periods based on usage

---

## How It Works

### 1. Define Your Features

Edit `/src/lib/utils/featureFlags.ts` to define what features exist in your plugin:

```typescript
export const FEATURES: Record<string, Feature> = {
  // Free features
  BASIC_UI: {
    id: 'basic_ui',
    name: 'Basic UI Components',
    description: 'Access to basic UI components and navigation',
    tier: 'free',
    category: 'ui',
  },

  // Premium features
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
};
```

### 2. Gate Features in Your Code

When a user tries to access a premium feature, check their tier:

```typescript
import { useLicense } from '../lib/hooks/useLicense';
import { hasFeatureAccess } from '../lib/utils/featureFlags';
import { PaywallModal } from '../components/PaywallModal';

function ExportButton() {
  const { tier } = useLicense();
  const [showPaywall, setShowPaywall] = useState(false);

  const handleExport = () => {
    // Check if user has access to export feature
    if (!hasFeatureAccess('EXPORT_DATA', tier)) {
      setShowPaywall(true);
      return;
    }

    // User has access, perform export
    performExport();
  };

  return (
    <>
      <Button onClick={handleExport}>
        Export Data
      </Button>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
      />
    </>
  );
}
```

### 3. Using Supabase Roles System

For server-side validation or async checks:

```typescript
import { validateTierAction } from '../lib/supabase/roles';

async function handleExport() {
  const { allowed, reason } = await validateTierAction(
    licenseKey,
    'EXPORT_DATA'
  );

  if (!allowed) {
    alert(reason);
    setShowPaywall(true);
    return;
  }

  // Proceed with export
  await performExport();
}
```

---

## UI Integration

### Show Premium Badges

Mark premium features in your UI:

```tsx
import { Badge } from './components/badge';
import { hasFeatureAccess } from '../lib/utils/featureFlags';

function FeatureList() {
  const { tier } = useLicense();

  return (
    <div>
      <h3>
        Export Data
        {!hasFeatureAccess('EXPORT_DATA', tier) && (
          <Badge variant="warning">PRO</Badge>
        )}
      </h3>
    </div>
  );
}
```

### Disable Premium Buttons for Free Users

```tsx
function ExportButton() {
  const { tier } = useLicense();
  const isPremium = tier === 'premium';

  return (
    <Button
      disabled={!isPremium}
      onClick={handleExport}
    >
      Export Data {!isPremium && '(Pro)'}
    </Button>
  );
}
```

---

## Customizing the Paywall

Edit `/src/components/PaywallModal.tsx` to customize:
- Pricing display
- Feature list
- Call-to-action messaging
- Checkout URL

Current features shown in paywall:
- Export data to CSV/JSON
- Advanced analytics & reporting
- Unlimited projects
- Priority support

---

## Migration from Check-Based System

If you're migrating from a check-based system:

### Before (Usage-Based):
```typescript
const { hasFreeCheckAvailable, useFreeCheck } = useLicense();

if (!hasFreeCheckAvailable) {
  showPaywall();
  return;
}

useFreeCheck();
performAudit();
```

### After (Feature-Based):
```typescript
const { tier } = useLicense();

if (!hasFeatureAccess('ADVANCED_ANALYTICS', tier)) {
  showPaywall();
  return;
}

performAnalytics();
```

---

## Tier Information

Get current user tier info:

```typescript
import { getTierInfo } from '../lib/supabase/roles';

const tierInfo = await getTierInfo(licenseKey);

console.log({
  tier: tierInfo.tier,              // 'free' | 'premium'
  displayName: tierInfo.displayName, // 'Free' | 'Premium'
  isPremium: tierInfo.isPremium,     // boolean
  features: tierInfo.features,       // Array of Feature objects
});
```

---

## Example: Complete Feature Implementation

```typescript
// MyFeature.tsx
import { useState } from 'react';
import { useLicense } from '../lib/hooks/useLicense';
import { hasFeatureAccess } from '../lib/utils/featureFlags';
import { PaywallModal } from '../components/PaywallModal';
import Button from './button';
import { Badge } from './badge';

export function MyFeature() {
  const { tier, hasPremiumAccess } = useLicense();
  const [showPaywall, setShowPaywall] = useState(false);

  const handlePremiumAction = () => {
    if (!hasFeatureAccess('EXPORT_DATA', tier)) {
      setShowPaywall(true);
      return;
    }

    // Execute premium action
    console.log('Exporting data...');
  };

  return (
    <div>
      <h2>
        My Premium Feature
        {!hasPremiumAccess() && (
          <Badge variant="warning">PRO</Badge>
        )}
      </h2>

      <Button
        onClick={handlePremiumAction}
        disabled={!hasPremiumAccess()}
      >
        Export Data
      </Button>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onLicenseActivated={() => {
          // Retry action after upgrade
          handlePremiumAction();
        }}
      />
    </div>
  );
}
```

---

## Best Practices

1. **Always check on client-side** - Use `hasFeatureAccess()` before showing premium features
2. **Validate on server-side too** - Use Supabase Edge Functions to double-check tier access
3. **Show clear upgrade prompts** - Make it obvious what users get with Pro
4. **Use feature badges** - Mark premium features with "PRO" badges
5. **Provide graceful degradation** - Don't break the app for free users

---

## Testing

To test your feature gates:

1. **Without license**: Plugin should show free features only
2. **With license**: All features should be accessible
3. **After sign out**: Should revert to free tier

```typescript
// In browser console
localStorage.removeItem('framer_plugin_license_key'); // Test free tier
localStorage.setItem('framer_plugin_license_key', 'test-key'); // Test premium
```

---

## Summary

- ✅ Define features in `featureFlags.ts`
- ✅ Use `hasFeatureAccess(featureId, tier)` to check access
- ✅ Show `PaywallModal` when users try premium features
- ✅ Add "PRO" badges to premium features
- ✅ No more usage counting or check limits!

For more help, see:
- `/src/lib/utils/featureFlags.ts` - Feature definitions
- `/src/components/PaywallModal.tsx` - Upgrade modal
- `/src/lib/supabase/roles.ts` - Server-side validation
