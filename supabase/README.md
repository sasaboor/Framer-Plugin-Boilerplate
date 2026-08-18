# Supabase Backend Setup

This directory contains the Supabase backend configuration for the Framer Plugin Boilerplate.

## Prerequisites

1. Install the [Supabase CLI](https://supabase.com/docs/guides/cli)
```bash
npm install -g supabase
```

2. Create a Supabase project at [https://supabase.com](https://supabase.com)

## Setup Steps

### 1. Link Your Project

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### 2. Run Database Migrations

```bash
supabase db push
```

Or manually run the SQL migrations in order:
1. `migrations/001_initial_schema.sql`
2. `migrations/002_rls_policies.sql`

### 3. Deploy Edge Functions

Deploy all functions:
```bash
supabase functions deploy validate-license
supabase functions deploy polar-webhook
supabase functions deploy sync-usage
```

### 4. Set Environment Secrets

Set the required secrets for Edge Functions:

```bash
supabase secrets set POLAR_ACCESS_TOKEN=your_polar_access_token
supabase secrets set POLAR_ORG_ID=your_polar_org_id
supabase secrets set POLAR_WEBHOOK_SECRET=your_polar_webhook_secret
```

You can also set secrets in the Supabase Dashboard under Settings > Edge Functions.

### 5. Configure Polar.sh Webhook

1. Go to your Polar.sh dashboard
2. Navigate to Webhooks settings
3. Add a new webhook with URL:
   ```
   https://YOUR_PROJECT_REF.supabase.co/functions/v1/polar-webhook
   ```
4. Subscribe to these events:
   - `subscription.created`
   - `subscription.updated`
   - `subscription.cancelled`
   - `subscription.revoked`

### 6. Update Frontend Environment Variables

Add these to your `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Database Schema

### Tables

- **users**: User profiles linked to license keys
- **subscriptions**: Polar.sh subscription records
- **user_sessions**: Session tracking for analytics
- **usage_tracking**: User usage statistics and check counts

### Functions

- `get_active_subscription(user_id)`: Get active subscription for a user
- `increment_check_count(user_id)`: Increment usage counter

## Edge Functions

### validate-license

Validates license keys with Polar.sh API and manages user records.

**Endpoint**: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/validate-license`

**Request**:
```json
{
  "license_key": "pl_..."
}
```

**Response**:
```json
{
  "valid": true,
  "user": { ... },
  "message": "License validated successfully"
}
```

### polar-webhook

Handles Polar.sh webhook events for subscription management.

**Endpoint**: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/polar-webhook`

Automatically processes:
- Subscription creation
- Subscription updates
- Subscription cancellation
- Subscription revocation

### sync-usage

Syncs offline usage data from localStorage to Supabase.

**Endpoint**: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/sync-usage`

**Request**:
```json
{
  "license_key": "pl_...",
  "total_checks": 10,
  "free_check_used": true
}
```

## Testing

### Test Edge Functions Locally

```bash
supabase functions serve validate-license
```

Then test with curl:
```bash
curl -X POST http://localhost:54321/functions/v1/validate-license \
  -H "Content-Type: application/json" \
  -d '{"license_key":"your_test_key"}'
```

### View Logs

```bash
supabase functions logs validate-license
```

## Troubleshooting

### RLS Policies Not Working

Make sure you've run the `002_rls_policies.sql` migration. Check policies in the Supabase Dashboard under Authentication > Policies.

### Edge Functions Failing

Check the function logs:
```bash
supabase functions logs <function-name> --tail
```

Verify all environment secrets are set correctly.

### Database Migration Errors

Reset the database (⚠️ DESTRUCTIVE):
```bash
supabase db reset
```

Then re-run migrations:
```bash
supabase db push
```

## Security Notes

- Service role keys should **NEVER** be exposed to the client
- All API keys are stored as Edge Function secrets
- RLS policies ensure users can only access their own data
- Webhook signatures are verified before processing

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Polar.sh API Docs](https://docs.polar.sh/)
