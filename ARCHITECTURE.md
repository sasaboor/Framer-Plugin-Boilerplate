# Architecture Documentation

This document provides a comprehensive overview of the boilerplate's architecture, design patterns, and key systems.

## Table of Contents

1. [Overview](#overview)
2. [Navigation System](#navigation-system)
3. [Authentication Flow](#authentication-flow)
4. [Analytics System](#analytics-system)
5. [Component Architecture](#component-architecture)
6. [State Management](#state-management)
7. [File Organization](#file-organization)

---

## Overview

This boilerplate follows a component-based architecture with clear separation of concerns:

- **Screens** - Full-page components that represent different views
- **Components** - Reusable UI building blocks
- **Services** - External API integrations and utilities
- **Hooks** - Custom React hooks for reusable logic
- **Navigation** - Custom type-safe routing system
- **Analytics** - Event tracking and user identification

### Technology Stack

```
React 18 (UI library)
├── TypeScript (Type safety)
├── Tailwind CSS (Styling)
├── Framer Motion (Animations)
└── Vite (Build tool)

External Services
├── Polar.sh (Payments & Licensing)
├── PostHog (Analytics)
└── Framer Plugin SDK (Plugin API)
```

---

## Navigation System

### Design Philosophy

The navigation system is custom-built to provide:
- Type-safe navigation with autocomplete
- Stack-based navigation (similar to React Navigation)
- Parameter passing between screens
- Back navigation support

### Core Files

```
src/navigation/
├── NavigationProvider.tsx  # Context provider
├── Route.tsx              # Route component
├── routes.ts              # Route definitions
├── types.ts               # TypeScript types
└── useNavigation.ts       # Navigation hook
```

### How It Works

#### 1. Define Routes

All routes are defined in `routes.ts` with their parameter types:

```typescript
// src/navigation/routes.ts
export interface RouteParamList {
  Dashboard: undefined;              // No params
  UserProfile: { userId: string };   // With params
  Settings: undefined;
}
```

#### 2. Register Routes

Routes are registered in `App.tsx`:

```typescript
<NavigationProvider initialRoute="Dashboard">
  <Route name="Dashboard" screen={Dashboard} />
  <Route name="UserProfile" screen={UserProfile} />
  <Route name="Settings" screen={Settings} />
</NavigationProvider>
```

#### 3. Navigate

Use the `useNavigation` hook to navigate:

```typescript
const navigation = useNavigation();

// Navigate without params
navigation.navigate('Dashboard');

// Navigate with params (type-safe!)
navigation.navigate('UserProfile', { userId: '123' });

// Go back
navigation.goBack();

// Replace current route
navigation.replace('Dashboard');
```

### State Structure

```typescript
interface NavigationState {
  routes: Route[];  // Stack of routes
  index: number;    // Current route index
}
```

Example navigation stack:
```
[Dashboard] → [Settings] → [UserProfile]
                               ↑ (index: 2)
```

---

## Authentication Flow

### License-Based Authentication

The boilerplate uses Polar.sh for license management with three tiers:

1. **Free Tier** - No license, limited access
2. **Trial** - One free check before upgrade prompt
3. **Pro** - Valid license, unlimited access

### Authentication Logic

```
App Opens
    ↓
Check License
    ↓
┌─────────────┬──────────────┐
│ Has License │ No License   │
│             │              │
│  Show App   │  Check Free  │
│             │     ↓        │
│             │  ┌──┴──┐     │
│             │  │ Yes │ No  │
│             │  ↓     ↓     │
│             │ App  Login   │
└─────────────┴──────────────┘
```

### Key Files

```
src/lib/hooks/useLicense.ts            # License validation
src/lib/hooks/useLicenseRevalidation.ts # Periodic checks
src/lib/payments/polar.ts              # Polar.sh API
src/screens/LoginScreen.tsx            # License activation
src/components/PaywallModal.tsx        # Upgrade prompt
```

### License Validation Flow

```typescript
// 1. Check if license exists in localStorage
const licenseKey = storage.getLicenseKey();

// 2. Validate with Polar.sh API
const validation = await validateLicense(licenseKey);

// 3. Store validation result
if (validation.valid) {
  storage.setLicenseValidated(true);
  storage.setLicenseStatus('active');
}

// 4. Periodic revalidation (every hour)
useLicenseRevalidation({
  checkInterval: 60 * 60 * 1000,
  onLicenseInvalid: () => showLogin()
});
```

### Storage Keys

```typescript
// src/lib/config/localStorage.ts
export const STORAGE_KEYS = {
  LICENSE_KEY: 'license_key',
  LICENSE_VALIDATED: 'license_validated',
  LICENSE_STATUS: 'license_status',
  FREE_CHECK_USED: 'free_check_used',
  TOTAL_CHECKS: 'total_checks',
};
```

---

## Analytics System

### PostHog Integration

The boilerplate includes comprehensive analytics tracking:

- **User Identification** - Hashed license keys
- **Event Tracking** - User actions and conversions
- **Session Tracking** - App open/close events
- **User Properties** - Tier, checks count, etc.

### Core Files

```
src/lib/analytics/
├── posthog.ts              # PostHog initialization
├── session.ts              # Session tracking
└── userIdentification.ts   # User properties
```

### Event Tracking Patterns

#### 1. Screen Views

Automatically tracked via navigation:

```typescript
useEffect(() => {
  trackEvent('screen_viewed', {
    screen: 'Dashboard'
  });
}, []);
```

#### 2. User Actions

Track button clicks, form submissions, etc.:

```typescript
const handleUpgrade = () => {
  trackEvent('upgrade_button_clicked', {
    location: 'dashboard',
    tier: 'free'
  });

  // ... rest of logic
};
```

#### 3. Conversions

Track important business events:

```typescript
trackEvent('license_activated', {
  tier: 'pro',
  source: 'paywall_modal'
});
```

### User Properties

Updated automatically on app load:

```typescript
updateUserProperties({
  tier: hasLicense ? 'pro' : 'free',
  total_checks: storage.getTotalChecks(),
  license_status: storage.getLicenseStatus(),
  last_seen: new Date().toISOString()
});
```

### Session Tracking

```typescript
// App opens
startSession(); // Tracks 'app_opened' event

// App closes
endSession(); // Tracks 'app_closed' event + session duration
```

---

## Component Architecture

### Design Principles

1. **Composition over Inheritance** - Build complex UIs from simple components
2. **Single Responsibility** - Each component does one thing well
3. **Reusability** - Components work in multiple contexts
4. **Accessibility** - Semantic HTML + ARIA attributes
5. **Type Safety** - Strict TypeScript props

### Component Hierarchy

```
PageContainer (Layout)
├── AppBar (Header)
│   ├── BackButton
│   ├── Title
│   └── Actions
└── Content (Children)
    ├── Card
    │   ├── CardHeader
    │   ├── CardContent
    │   └── CardFooter
    └── Other Components
```

### Component Patterns

#### 1. Compound Components

Components that work together (e.g., Card):

```typescript
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
  <CardFooter>
    Footer actions
  </CardFooter>
</Card>
```

#### 2. Variant-Based Components

Components with different styles (e.g., Button):

```typescript
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Delete</Button>
```

Implemented using `class-variance-authority`:

```typescript
const buttonVariants = cva("base-classes", {
  variants: {
    variant: {
      primary: "primary-classes",
      secondary: "secondary-classes",
    },
    size: {
      sm: "small-classes",
      md: "medium-classes",
    }
  }
});
```

#### 3. Controlled Components

Form inputs with external state:

```typescript
const [value, setValue] = useState('');

<Input
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

### Styling Approach

**Tailwind CSS** with CSS variables for theming:

```css
/* Framer theme variables */
--framer-color-bg
--framer-color-text-primary
--framer-color-text-secondary
--framer-color-divider
```

Components adapt to Framer's light/dark theme automatically.

---

## State Management

### Approach

This boilerplate uses **local state** and **localStorage** instead of a global state management library:

- **Local State** (useState) - Component-specific state
- **LocalStorage** - Persistent data (licenses, settings)
- **Props** - Pass data down the tree
- **Hooks** - Share stateful logic

### LocalStorage Service

Centralized storage access:

```typescript
// src/lib/config/localStorage.ts
export const storage = {
  // License management
  getLicenseKey: () => localStorage.getItem(STORAGE_KEYS.LICENSE_KEY),
  setLicenseKey: (key: string) => localStorage.setItem(STORAGE_KEYS.LICENSE_KEY, key),

  // Settings
  getSetting: (key: string) => localStorage.getItem(key),
  setSetting: (key: string, value: string) => localStorage.setItem(key, value),

  // Helpers
  hasValidLicense: () => {
    // Complex logic here
  }
};
```

### Why No Global State?

For this use case:
- **Simple data flow** - Most state is screen-specific
- **Less boilerplate** - No actions, reducers, selectors
- **Easier debugging** - State lives where it's used
- **Smaller bundle** - No additional libraries

When to add global state:
- Many components need the same data
- Complex data transformations
- Optimistic updates

---

## File Organization

### Folder Structure Philosophy

```
src/
├── screens/        # Page-level components
├── components/     # Reusable UI components
├── navigation/     # Routing system
├── lib/           # Business logic
│   ├── hooks/     # Custom React hooks
│   ├── services/  # External APIs
│   ├── analytics/ # Analytics logic
│   ├── payments/  # Payment logic
│   ├── config/    # Configuration
│   └── utils/     # Utilities
├── types/         # Global TypeScript types
├── App.tsx        # Root component
└── main.tsx       # Entry point
```

### Naming Conventions

- **Components**: PascalCase (`Button.tsx`, `UserProfile.tsx`)
- **Hooks**: camelCase with "use" prefix (`useNavigation.ts`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_KEYS`)
- **Types**: PascalCase (`User`, `RouteParamList`)

### Import Organization

```typescript
// 1. External dependencies
import { useState } from "react";
import { framer } from "framer-plugin";

// 2. Internal components
import Button from "../components/button";
import { Card } from "../components/card";

// 3. Hooks and utilities
import { useNavigation } from "../navigation";
import { storage } from "../lib/config/localStorage";

// 4. Types
import type { User } from "../types";
```

---

## Best Practices

### 1. Error Handling

Always wrap API calls in try-catch:

```typescript
try {
  const result = await validateLicense(key);
  // Handle success
} catch (error) {
  console.error('License validation failed:', error);
  framer.notify("Validation failed", { variant: "error" });
}
```

### 2. Loading States

Show loading indicators:

```typescript
const [isLoading, setIsLoading] = useState(false);

const handleAction = async () => {
  setIsLoading(true);
  try {
    await someAsyncOperation();
  } finally {
    setIsLoading(false);
  }
};
```

### 3. Type Safety

Define proper types:

```typescript
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

const UserCard: React.FC<{ user: UserProfile }> = ({ user }) => {
  // Component implementation
};
```

### 4. Accessibility

Use semantic HTML and ARIA:

```typescript
<button
  aria-label="Close modal"
  onClick={handleClose}
>
  <X className="w-4 h-4" />
</button>
```

---

## Extending the Architecture

### Adding New Features

1. **Create necessary files** in appropriate folders
2. **Define types** in route definitions or type files
3. **Implement logic** following existing patterns
4. **Add tests** (if applicable)
5. **Update documentation**

### Migration Path

To add more complex state management:

1. Install library: `npm install zustand` (or Redux, Jotai, etc.)
2. Create stores in `src/stores/`
3. Gradually migrate from localStorage
4. Update documentation

---

## Performance Considerations

### Current Optimizations

- **Code splitting** - Vite handles automatic splitting
- **Lazy loading** - Can wrap routes in `React.lazy()`
- **Memoization** - Use `useMemo` and `useCallback` for expensive operations
- **Virtual scrolling** - Use Radix ScrollArea for long lists

### Future Optimizations

- Bundle size analysis with `vite-plugin-bundle-analyzer`
- Route-based code splitting
- Image optimization
- Service worker for offline support

---

## Questions?

Refer to [README.md](./README.md) for setup instructions and [COMPONENTS.md](./COMPONENTS.md) for component usage.
