# Security Guide

This document outlines security best practices and guidelines for this Framer plugin boilerplate.

## Table of Contents
- [Environment Variables](#environment-variables)
- [API Key Management](#api-key-management)
- [CSRF Protection](#csrf-protection)
- [Rate Limiting](#rate-limiting)
- [Data Security](#data-security)
- [Deployment Checklist](#deployment-checklist)
- [Reporting Security Issues](#reporting-security-issues)

---

## Environment Variables

### ⚠️ CRITICAL: Never Commit `.env` Files

Your `.env` file contains sensitive API keys and should **NEVER** be committed to version control.

### Setup Process

1. **Copy the template:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your values:**
   - Get Supabase credentials from: https://supabase.com/dashboard
   - Get Polar.sh credentials from: https://polar.sh/dashboard

3. **Verify `.env` is gitignored:**
   ```bash
   git check-ignore .env
   # Should output: .env
   ```

### Environment Variable Types

**Client-Safe Variables** (prefixed with `VITE_`):
- `VITE_SUPABASE_URL` - Safe to expose
- `VITE_SUPABASE_ANON_KEY` - Safe to expose (has RLS protection)
- `VITE_POLAR_ORG_ID` - Safe to expose
- `VITE_POLAR_PRODUCT_ID` - Safe to expose

**Secret Variables** (⚠️ NEVER expose in client code):
- `VITE_POLAR_ACCESS_TOKEN` - Keep secret! Only use in Edge Functions
- Service Role Key - Only store in Supabase Edge Function secrets

### Rotating Exposed Keys

If you accidentally commit `.env` to git:

1. **Immediately rotate all keys:**
   - Supabase: Generate new anon key (optional, as it's RLS-protected)
   - Polar.sh: Regenerate access token immediately

2. **Remove from git history:**
   ```bash
   # Use git-filter-repo or BFG Repo-Cleaner
   # Or recreate the repository
   ```

3. **Update all environments:**
   - Development: Update your local `.env`
   - Production: Update hosting platform environment variables
   - Edge Functions: Update Supabase secrets

---

## API Key Management

### Supabase Keys

**Anon Key (Public):**
- Safe to expose in client code
- Protected by Row Level Security (RLS)
- Used for authenticated requests

**Service Role Key (Secret):**
- **NEVER** include in client code
- Only use in Edge Functions
- Bypasses RLS - handle with extreme care
- Store in Supabase Edge Function secrets:
  ```bash
  supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_key_here
  ```

### Polar.sh Keys

**Access Token (Secret):**
- Used for API requests to Polar.sh
- Only use in Edge Functions, never client-side
- Store in Edge Function environment variables

**Organization/Product IDs (Public):**
- Safe to expose
- Used for checkout links

---

## CSRF Protection

### What is CSRF?

Cross-Site Request Forgery (CSRF) is an attack that tricks users into performing unwanted actions.

### Current Protection

This boilerplate includes basic CSRF protection:

1. **Origin Validation:**
   - Edge Functions check request origin
   - Only Framer plugin origins are allowed

2. **License Key Validation:**
   - License keys act as authentication tokens
   - Validated on every sensitive operation

### Recommended Enhancements

For production, consider adding:

1. **CSRF Tokens:**
   ```typescript
   // Generate token on session start
   const csrfToken = crypto.randomUUID();
   sessionStorage.setItem('csrf_token', csrfToken);

   // Include in requests
   fetch('/api/endpoint', {
     headers: {
       'X-CSRF-Token': csrfToken
     }
   });
   ```

2. **SameSite Cookies:**
   ```typescript
   // If using cookies
   Set-Cookie: session=abc; SameSite=Strict; Secure
   ```

---

## Rate Limiting

### Why Rate Limiting?

Prevents abuse, brute force attacks, and DoS attempts.

### Current Implementation

Edge Functions include basic rate limiting:

```typescript
// Example: 10 requests per minute per IP
const rateLimitKey = `rate_limit:${clientIP}`;
const requestCount = await redis.incr(rateLimitKey);
if (requestCount === 1) {
  await redis.expire(rateLimitKey, 60);
}
if (requestCount > 10) {
  return new Response('Rate limit exceeded', { status: 429 });
}
```

### Recommended Limits

- **License Validation:** 5 attempts per minute
- **Analytics Events:** 100 events per minute
- **Webhooks:** 50 requests per hour

---

## Data Security

### Local Storage

**What's Stored:**
- License keys (plain text)
- Last validation timestamps
- User preferences

**Security Considerations:**
- localStorage is domain-scoped (safe from XSS on other domains)
- Consider encrypting sensitive data:
  ```typescript
  import CryptoJS from 'crypto-js';
  
  const encrypted = CryptoJS.AES.encrypt(
    licenseKey, 
    'encryption-key'
  ).toString();
  ```

### Supabase RLS

**Row Level Security (RLS) Policies:**
- Users can only read/write their own data
- Service role bypasses RLS (use carefully)
- Review policies regularly

**Example Policy:**
```sql
-- Users can only see their own data
CREATE POLICY "Users see own data" ON users
  FOR SELECT USING (auth.uid() = id);
```

### Analytics Data

**Privacy Considerations:**
- Event properties may contain PII
- License keys should never be stored in analytics
- Consider GDPR compliance for EU users

**Current Implementation:**
- License keys removed from event properties before storage
- User identification via UUID, not email
- No IP addresses stored

---

## Deployment Checklist

### Before Deploying to Production

- [ ] `.env` is in `.gitignore` and not committed
- [ ] All API keys are rotated (if previously exposed)
- [ ] Service role key is only in Edge Function secrets
- [ ] RLS policies are tested and working
- [ ] Rate limiting is configured
- [ ] Error monitoring is set up (Sentry, etc.)
- [ ] CORS is configured correctly
- [ ] Security headers are set (CSP, X-Frame-Options)
- [ ] All Edge Functions are deployed
- [ ] Database migrations are applied
- [ ] Webhooks are configured and tested
- [ ] License validation is tested with real keys
- [ ] Offline functionality is tested
- [ ] Session management is working
- [ ] Analytics events are being tracked

### Production Environment Variables

Set these in your hosting platform (Vercel, Netlify, etc.):

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_POLAR_ACCESS_TOKEN=your_polar_token
VITE_POLAR_ORG_ID=your_org_id
VITE_POLAR_PRODUCT_ID=your_product_id
```

### Supabase Edge Function Secrets

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
supabase secrets set POLAR_ACCESS_TOKEN=your_polar_token
supabase secrets set POLAR_ORG_ID=your_org_id
```

---

## Reporting Security Issues

### Found a Security Vulnerability?

**DO NOT** create a public GitHub issue.

Instead:
1. Email: your-security-email@example.com
2. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

- **24 hours:** Initial acknowledgment
- **7 days:** Assessment and triage
- **30 days:** Fix and disclosure (coordinated)

---

## Security Resources

### Learn More

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.com/docs/guides/database/securing-your-data)
- [Framer Plugin Security](https://www.framer.com/developers/plugins/security)

### Tools

- **Static Analysis:** ESLint with security plugins
- **Dependency Scanning:** `npm audit`, Snyk, Dependabot
- **Secret Scanning:** git-secrets, truffleHog
- **SAST:** SonarQube, CodeQL

---

## Version History

- **v1.0** (2025-01-XX): Initial security documentation
- Added CSRF protection guidelines
- Added rate limiting recommendations
- Added deployment checklist
