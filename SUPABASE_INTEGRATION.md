# Supabase Backend Integration Guide

This boilerplate includes a complete Supabase backend setup with:
- License-based authentication
- User management & session tracking
- Subscription management with Polar.sh webhooks
- Offline-first data synchronization
- Premium/Free tier system

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Setup Instructions](#setup-instructions)
4. [Frontend Integration](#frontend-integration)
5. [Usage Examples](#usage-examples)
6. [Offline Mode](#offline-mode)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

Supabase client (`@supabase/supabase-js`) is already installed.

### 2. Setup Supabase Project

1. Create a project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings > API
3. Add to `.env`:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Deploy Database Schema

```bash
cd supabase
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

### 4. Deploy Edge Functions

```bash
supabase functions deploy validate-license
supabase functions deploy polar-webhook
supabase functions deploy sync-usage
```

### 5. Configure Polar.sh Webhook

Add webhook URL in Polar.sh dashboard:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/polar-webhook
```

---

## 🏗 Architecture Overview

### Database Schema

```
users
├── id (uuid)
├── license_key (text, unique)
├── email (text, nullable)
├── tier (enum: free | premium)
└── timestamps

subscriptions
├── id (uuid)
├── user_id (fk → users)
├── polar_subscription_id (text)
├── status (enum: active | expired | revoked | cancelled)
├── expires_at (timestamp)
└── timestamps

user_sessions
├── id (uuid)
├── user_id (fk → users)
├── started_at (timestamp)
├── ended_at (timestamp)
├── duration_seconds (integer)
└── project_id (text)

usage_tracking
├── id (uuid)
├── user_id (fk → users)
├── total_checks_run (integer)
├── last_check_at (timestamp)
└── free_check_used (boolean)
```

### Service Layer

```
src/lib/supabase/
├── client.ts          # Supabase client setup
├── types.ts           # TypeScript types (auto-generated)
├── constants.ts       # Tier limits & config
├── auth.ts            # License validation & user management
├── subscriptions.ts   # Subscription CRUD operations
├── sessions.ts        # Session tracking
├── usage.ts           # Usage tracking with localStorage fallback
├── sync.ts            # Offline-first sync logic
├── roles.ts           # Tier-based permissions
├── migrate.ts         # LocalStorage → Supabase migration
└── index.ts           # Barrel exports
```

### Edge Functions

1. **validate-license**: Validates license keys with Polar.sh
2. **polar-webhook**: Processes Polar.sh subscription events
3. **sync-usage**: Syncs offline usage data

---

## 🛠 Setup Instructions

### Step 1: Database Migration

Run both SQL migrations in order:

```sql
-- migrations/001_initial_schema.sql
-- Creates tables, indexes, triggers

-- migrations/002_rls_policies.sql
-- Sets up Row Level Security
```

Or use the CLI:
```bash
supabase db push
```

### Step 2: Edge Function Secrets

Set secrets in Supabase Dashboard (Settings > Edge Functions > Secrets):

```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
POLAR_ACCESS_TOKEN=your_polar_access_token
POLAR_ORG_ID=your_polar_org_id
POLAR_WEBHOOK_SECRET=your_webhook_secret
```

Or via CLI:
```bash
supabase secrets set POLAR_ACCESS_TOKEN=xxx
supabase secrets set POLAR_ORG_ID=xxx
supabase secrets set POLAR_WEBHOOK_SECRET=xxx
```

### Step 3: Polar.sh Webhook Configuration

1. Go to Polar.sh Dashboard → Webhooks
2. Add webhook URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/polar-webhook`
3. Subscribe to events:
   - `subscription.created`
   - `subscription.updated`
   - `subscription.cancelled`
   - `subscription.revoked`

---

## 💻 Frontend Integration

### Basic Usage

```typescript
import {
  authenticateWithLicense,
  getCurrentTier,
  canPerformCheck,
  incrementCheckCount
} from './lib/supabase';

// Validate license
const result = await authenticateWithLicense('pl_xxx');
if (result.success) {
  console.log('User tier:', result.user.tier);
}

// Check permissions
const { allowed, reason } = await canPerformCheck(licenseKey, userId);
if (!allowed) {
  alert(reason); // "Free check limit reached..."
}

// Track usage
await incrementCheckCount(userId);
```

### Hook Integration

The `useLicense` hook has been updated to integrate with Supabase:

```typescript
const {
  licenseKey,
  activateLicense,
  removeLicense
} = useLicense();

// Activating a license now validates with Supabase
await activateLicense('pl_xxx');
```

### Session Tracking

```typescript
import { startSession, endSession } from './lib/supabase';

// Start session
const session = await startSession(userId, projectId);

// Later...
await endSession(session.id);
```

---

## 📡 Offline Mode

The boilerplate includes **offline-first** sync:

### How It Works

1. **Online**: Data saved to both Supabase + localStorage
2. **Offline**: Data queued in localStorage
3. **Reconnect**: Automatic sync when back online

### Sync Service

```typescript
import { setupSync, syncAllData } from './lib/supabase/sync';

// Setup automatic sync (call once on app start)
const cleanup = setupSync(userId);

// Manual sync
await syncAllData(userId);

// Cleanup on unmount
cleanup();
```

### Background Sync

- Syncs every 5 minutes when online
- Syncs immediately when coming back online
- Merges conflicts (takes higher values)

---

## 🎯 Usage Examples

### Example 1: Check User Tier

```typescript
import { getTierInfo } from './lib/supabase/roles';

const tierInfo = await getTierInfo(licenseKey, userId);

console.log(tierInfo);
// {
//   tier: 'premium',
//   displayName: 'Premium',
//   maxChecks: Infinity,
//   remainingChecks: Infinity,
//   features: ['basic_audit', 'seo_check', 'advanced_validation', ...],
//   isPremium: true
// }
```

### Example 2: Enforce Tier Limits

```typescript
import { validateTierAction } from './lib/supabase/roles';

// Before allowing export
const { allowed, reason } = await validateTierAction(licenseKey, 'export');

if (!allowed) {
  showUpgradeModal(reason);
  return;
}

// Proceed with export...
```

### Example 3: Get Subscription Info

```typescript
import { getActiveSubscription, getDaysUntilExpiry } from './lib/supabase/subscriptions';

const subscription = await getActiveSubscription(userId);

if (subscription) {
  const daysLeft = getDaysUntilExpiry(subscription);
  if (daysLeft && daysLeft < 7) {
    showRenewalReminder(daysLeft);
  }
}
```

### Example 4: Migrate Existing Users

```typescript
import { migrateLocalStorageToSupabase } from './lib/supabase/migrate';

// On first Supabase connection
const result = await migrateLocalStorageToSupabase(licenseKey);

if (result.success) {
  console.log('Migrated data:', result.migratedData);
}
```

---

## 🔧 Troubleshooting

### Issue: "Supabase not configured"

**Solution**: Check `.env` file has correct values:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

### Issue: RLS policy errors

**Solution**:
1. Verify `002_rls_policies.sql` has been run
2. Check Supabase Dashboard → Authentication → Policies
3. Ensure service role key is set in Edge Functions

### Issue: Webhook not receiving events

**Solution**:
1. Verify webhook URL in Polar.sh dashboard
2. Check Edge Function logs: `supabase functions logs polar-webhook`
3. Ensure `POLAR_WEBHOOK_SECRET` is set correctly

### Issue: Offline sync not working

**Solution**:
1. Check browser console for `[Sync]` logs
2. Verify `navigator.onLine` is `true`
3. Try manual sync: `await syncAllData(userId)`

### Issue: License validation fails

**Solution**:
1. Test Edge Function directly:
   ```bash
   curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/validate-license \
     -H "Content-Type: application/json" \
     -d '{"license_key":"pl_xxx"}'
   ```
2. Check Edge Function logs for errors
3. Verify Polar.sh API keys are correct

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Polar.sh API Docs](https://docs.polar.sh/)
- [TypeScript Supabase Client](https://supabase.com/docs/reference/javascript/typescript-support)

---

## 🚨 Security Notes

- ✅ Service role keys stored in Edge Functions (not exposed to client)
- ✅ RLS policies enforce data access control
- ✅ Webhook signatures verified before processing
- ✅ License validation done server-side
- ⚠️ Never commit `.env` file to version control

---

## 🎉 What's Next?

Now that Supabase is integrated, you can:

1. **Customize tier limits** in `src/lib/supabase/constants.ts`
2. **Add new features** with tier restrictions
3. **Build analytics dashboards** using session data
4. **Implement team workspaces** by extending the schema
5. **Add email notifications** using Supabase Auth + Edge Functions

Happy building! 🚀
