# Supabase Analytics System

This Framer plugin uses **Supabase-only analytics** instead of third-party services like PostHog. All analytics data is stored in your own Supabase database, giving you complete control and privacy.

## Overview

- **Storage**: PostgreSQL database with JSONB properties for flexible event tracking
- **Processing**: Supabase Edge Function handles all event tracking
- **Privacy**: User identification via license key (automatic, no separate user tracking)
- **Cost**: Free tier covers most plugin usage
- **Ownership**: All data stays in your Supabase project

---

## Architecture

```
Plugin → Edge Function (track-event) → PostgreSQL (analytics_events table)
                                      ↓
                              Automatic User Resolution
                              (via license_key lookup)
```

### Components

1. **Database Table** (`analytics_events`): Stores all events with JSONB properties
2. **Edge Function** (`track-event`): Validates and processes events
3. **Client Module** (`src/lib/analytics/supabase.ts`): Tracks events from the plugin
4. **Views & Functions**: Pre-built SQL queries for common analytics

---

## How It Works

### Event Tracking

```typescript
import { trackEvent } from './lib/analytics/supabase';

// Track any event
await trackEvent('button_clicked', {
  button_name: 'purchase',
  screen: 'dashboard'
});

// Track errors
import { trackError } from './lib/analytics/supabase';

await trackError('api', 'Failed to validate license', {
  endpoint: '/validate',
  status_code: 500
});

// Track screen views
import { trackScreenView } from './lib/analytics/supabase';

await trackScreenView('Dashboard', {
  from_screen: 'Login'
});
```

### User Identification

**Automatic via License Key** - No manual identification needed!

When you call `trackEvent()`, the system automatically:
1. Reads the user's license key from localStorage
2. Passes it in the event properties
3. Edge Function looks up the user_id from the `users` table
4. Stores the event with the correct user_id

```typescript
// This automatically identifies the user
trackEvent('feature_used', {
  feature_name: 'export_csv'
});

// The Edge Function handles:
// 1. Reading license_key from properties
// 2. Looking up user_id from users table
// 3. Storing event with user_id
```

---

## Database Schema

### `analytics_events` Table

| Column       | Type        | Description                                    |
|-------------|-------------|------------------------------------------------|
| `id`        | UUID        | Primary key                                    |
| `user_id`   | UUID        | Foreign key to `users.id` (NULL for anonymous) |
| `event_name`| TEXT        | Event identifier (e.g., `license_activated`)   |
| `properties`| JSONB       | Event metadata as JSON                         |
| `created_at`| TIMESTAMPTZ | Event timestamp                                |

**Indexes:**
- `user_id` - Fast user event lookup
- `event_name` - Fast event type filtering
- `created_at DESC` - Time-series queries
- `(user_id, created_at DESC)` - User timeline
- `(event_name, created_at DESC)` - Event timelines

---

## Pre-Built Analytics Views

### Daily Active Users (DAU)

```sql
SELECT * FROM daily_active_users LIMIT 30;
```

Returns daily count of unique users who opened the plugin.

### Weekly Active Users (WAU)

```sql
SELECT * FROM weekly_active_users LIMIT 12;
```

Returns weekly count of unique active users.

### Popular Screens

```sql
SELECT * FROM popular_screens LIMIT 10;
```

Shows most viewed screens with view count and unique viewers.

### Error Summary

```sql
SELECT * FROM error_summary;
```

Groups errors by type with count, affected users, and last occurrence.

### License Conversion Funnel (Last 30 Days)

```sql
SELECT * FROM license_conversion_funnel;
```

Shows conversion rates: login screen → login attempt → license activation.

---

## Analytics Functions

### Get User Analytics

```sql
SELECT * FROM get_user_analytics('user-uuid-here');
```

Returns:
- `total_sessions` - Number of plugin opens
- `last_seen` - Most recent activity
- `most_viewed_screen` - User's favorite screen
- `total_events` - Total tracked events

### Event Counts by Day

```sql
SELECT * FROM get_event_counts_by_day('license_activated', 30);
```

Returns daily counts for a specific event over the last N days:
- `date` - Day
- `event_count` - Total events
- `unique_users` - Unique users who triggered the event

---

## Commonly Tracked Events

The system tracks these events automatically:

### Session Events
- `plugin_opened` - Plugin launched
- `plugin_closed` - Plugin closed/hidden
- `session_ended` - Session duration tracked

### License Events
- `login_screen_viewed` - User sees login screen
- `login_attempt` - User enters license key
- `login_success` - Valid license activated
- `login_failed` - Invalid license
- `license_activated` - License successfully validated
- `license_valid` - License revalidation successful
- `license_invalid` - License validation failed
- `license_expired_client_check` - Client-side expiration detected
- `license_expired_modal_shown` - Expiration modal displayed
- `license_revalidated` - Periodic revalidation successful
- `license_revalidation_failed` - Periodic revalidation failed
- `sign_out_clicked` - User signed out

### Error Events
- `error` - Generic error tracking
- `offline_too_long` - User offline >7 days
- `offline_modal_shown` - Offline block modal shown
- `offline_retry_clicked` - User attempts reconnection
- `offline_retry_success` - Reconnection successful

### Screen Navigation
- `screen_viewed` - Any screen viewed

### Upgrade Flow
- `buy_now_clicked` - "Buy Pro" button clicked
- `get_pro_clicked` - "Get Pro" link clicked
- `license_input_opened` - License entry form opened
- `renew_license_clicked` - Renewal button clicked

---

## Querying Your Analytics

### Most Active Users

```sql
SELECT
  user_id,
  COUNT(*) as total_events,
  COUNT(DISTINCT DATE(created_at)) as active_days,
  MAX(created_at) as last_seen
FROM analytics_events
WHERE user_id IS NOT NULL
GROUP BY user_id
ORDER BY total_events DESC
LIMIT 20;
```

### Event Timeline

```sql
SELECT
  DATE(created_at) as date,
  event_name,
  COUNT(*) as count
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at), event_name
ORDER BY date DESC, count DESC;
```

### User Journey

```sql
SELECT
  event_name,
  properties,
  created_at
FROM analytics_events
WHERE user_id = 'user-uuid-here'
ORDER BY created_at DESC
LIMIT 50;
```

### Conversion Rate (Login → Activation)

```sql
WITH login_attempts AS (
  SELECT COUNT(DISTINCT user_id) as users
  FROM analytics_events
  WHERE event_name = 'login_attempt'
    AND created_at >= NOW() - INTERVAL '30 days'
),
activations AS (
  SELECT COUNT(DISTINCT user_id) as users
  FROM analytics_events
  WHERE event_name = 'license_activated'
    AND created_at >= NOW() - INTERVAL '30 days'
)
SELECT
  login_attempts.users as attempted,
  activations.users as activated,
  ROUND((activations.users::DECIMAL / NULLIF(login_attempts.users, 0)) * 100, 2) as conversion_rate
FROM login_attempts, activations;
```

### Error Analysis

```sql
SELECT
  properties->>'error_type' as error_type,
  COUNT(*) as occurrences,
  COUNT(DISTINCT user_id) as affected_users,
  ARRAY_AGG(DISTINCT properties->>'error_message') as error_messages,
  MAX(created_at) as last_seen
FROM analytics_events
WHERE event_name = 'error'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY properties->>'error_type'
ORDER BY occurrences DESC;
```

---

## Data Retention

By default, all analytics events are kept indefinitely. To clean up old events:

```sql
-- Delete events older than 90 days
SELECT cleanup_old_analytics_events(90);
```

### Automatic Cleanup (Optional)

Uncomment this in the migration file to enable monthly cleanup:

```sql
SELECT cron.schedule(
  'cleanup-old-analytics',
  '0 2 1 * *',  -- Run at 2am on the 1st of each month
  $$SELECT cleanup_old_analytics_events(90);$$
);
```

---

## Privacy & Security

### Row Level Security (RLS)

- **Service role**: Full access (used by Edge Functions)
- **Authenticated users**: Read-only access via Edge Functions
- **Anonymous users**: No direct access

### Data Protection

- Events are write-only from the plugin (users cannot read their own data directly)
- All event tracking goes through the Edge Function
- User identification is automatic via license_key (no PII required)
- License keys are never stored in events (only used for user lookup)

---

## Adding New Events

1. **Add event name constant** (optional but recommended):

```typescript
// src/lib/analytics/supabase.ts
export const AnalyticsEvents = {
  // ... existing events
  MY_NEW_EVENT: 'my_new_event',
} as const;
```

2. **Track the event**:

```typescript
import { trackEvent } from './lib/analytics/supabase';

trackEvent('my_new_event', {
  custom_property: 'value',
  another_property: 123
});
```

3. **Query the event**:

```sql
SELECT
  COUNT(*) as total,
  COUNT(DISTINCT user_id) as unique_users,
  properties
FROM analytics_events
WHERE event_name = 'my_new_event'
GROUP BY properties;
```

---

## Debugging

### Check if events are being tracked

```sql
SELECT * FROM analytics_events ORDER BY created_at DESC LIMIT 20;
```

### Check Edge Function logs

```bash
SUPABASE_ACCESS_TOKEN=your-token \
supabase functions logs track-event
```

### Test tracking from browser console

```javascript
// Open plugin, then in browser console:
const { trackEvent } = await import('./lib/analytics/supabase');
await trackEvent('test_event', { test: true });

// Check Supabase:
// SELECT * FROM analytics_events WHERE event_name = 'test_event';
```

---

## Cost Estimation

**Supabase Free Tier includes:**
- 500 MB database storage (analytics events are small)
- 2 GB Edge Function invocations/month
- Unlimited database reads

**Typical plugin usage:**
- ~100 events/user/month
- ~1 KB per event
- 1000 active users = ~100 MB/month storage + ~10k Edge Function calls

**Verdict:** Free tier is more than enough for most plugins.

---

## Migration from PostHog

Already done! This plugin has been fully migrated from PostHog to Supabase analytics.

### What Changed:
- ✅ All `posthog.capture()` calls → `trackEvent()`
- ✅ Removed `posthog-js` dependency
- ✅ All analytics data now in Supabase
- ✅ Better privacy & control
- ✅ Lower cost (free tier)

---

## Support

For questions or issues:
- Check the Supabase dashboard for event data
- Review Edge Function logs for errors
- Query `analytics_events` table directly

---

**That's it!** You now have a complete, privacy-first analytics system built directly into your Supabase infrastructure.
