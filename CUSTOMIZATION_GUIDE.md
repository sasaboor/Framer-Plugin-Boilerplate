# Customization Guide

This guide explains how to customize the Framer plugin boilerplate to match your brand and requirements.

## Table of Contents
- [Links Configuration](#links-configuration)
- [Theme & Colors Configuration](#theme--colors-configuration)
- [Component Customization](#component-customization)
- [Quick Start Checklist](#quick-start-checklist)

---

## Links Configuration

All external links are centralized in `/src/config/links.ts`. This makes it easy to update all links across the entire plugin from one file.

### File Location
```
src/config/links.ts
```

### What to Update

#### 1. **Product & Branding**
```typescript
// src/config/links.ts
export const LINKS = {
  website: 'https://your-plugin-website.com/',  // ← Change this
  // ...
}
```

**Used in:**
- AccountScreen (Visit Website button)
- Help resources
- Footer links

#### 2. **Legal & Policies**
```typescript
legal: {
  terms: 'https://your-site.com/terms',          // ← Change this
  privacy: 'https://your-site.com/privacy',      // ← Change this
  eula: 'https://your-site.com/eula',            // ← Change this
},
```

**Used in:**
- AccountScreen (Legal section)
- Footer
- Registration flow

#### 3. **Support & Contact**
```typescript
support: {
  email: 'support@your-plugin.com',              // ← Change this
  getEmailComposeUrl: (email: string) =>
    `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`,
},
```

**Used in:**
- AccountScreen (Get Support button)
- Help section
- Error messages

#### 4. **Social Media**
```typescript
social: {
  github: 'https://github.com/your-username/your-repo',     // ← Change this
  githubDocs: 'https://github.com/your-username/docs',      // ← Change this
  youtube: 'https://youtube.com/@yourchannel',              // ← Change this
  twitter: 'https://twitter.com/yourhandle',                // ← Change this
  discord: 'https://discord.gg/yourinvite',                 // ← Change this
},
```

**Used in:**
- HelpScreen
- AccountScreen
- Social sharing

#### 5. **Polar.sh (Payment & Licensing)**
```typescript
polar: {
  // Get these from your Polar.sh dashboard
  purchase: 'https://buy.polar.sh/YOUR_PRODUCT_LINK',       // ← Change this
  portal: 'https://polar.sh/your-org/portal/',              // ← Change this
  organization: 'https://polar.sh/your-org',                // ← Change this
},
```

**How to find your Polar.sh links:**
1. Go to https://polar.sh/dashboard
2. Navigate to your product
3. Copy the purchase link from "Checkout Links"
4. Copy the portal URL from "Customer Portal"

**Used in:**
- PaywallModal (Buy Pro button)
- ExpirationModal (Renew License button)
- LoginScreen (Purchase button)
- AccountScreen (Manage Subscription button)

#### 6. **Documentation**
```typescript
docs: {
  main: 'https://your-docs-site.com',                       // ← Change this
  gettingStarted: 'https://your-docs-site.com/getting-started',
  api: 'https://your-docs-site.com/api',
  troubleshooting: 'https://your-docs-site.com/troubleshooting',
},
```

**Used in:**
- HelpScreen
- Error messages
- Tooltips

### Usage Examples

#### Opening a Link
```typescript
import { LINKS, openLink } from '../config/links';

// Open a link in new tab
openLink(LINKS.website);
openLink(LINKS.polar.purchase);
```

#### Using in Components
```typescript
import { LINKS } from '../config/links';

function MyComponent() {
  return (
    <button onClick={() => window.open(LINKS.social.github, '_blank')}>
      Visit GitHub
    </button>
  );
}
```

#### Getting Email Compose URL
```typescript
import { LINKS } from '../config/links';

const composeUrl = LINKS.support.getEmailComposeUrl('custom@email.com');
window.open(composeUrl, '_blank');
```

---

## Theme & Colors Configuration

All colors, typography, spacing, and design tokens are centralized in `/src/config/theme.ts`.

### File Location
```
src/config/theme.ts
```

### What to Update

#### 1. **Primary/Accent Color** (Most Important!)
This is your brand color used throughout the plugin.

```typescript
// src/config/theme.ts
export const THEME = {
  colors: {
    primary: {
      DEFAULT: '#0099FF',      // ← Change to your brand color
      hover: '#0088EE',         // ← Slightly darker for hover
      light: 'rgba(0, 153, 255, 0.1)',  // ← Light background (10% opacity)
      lighter: 'rgba(0, 153, 255, 0.05)', // ← Very light (5% opacity)
    },
    // ...
  }
}
```

**Examples:**
- Blue: `#0099FF` (current)
- Purple: `#8B5CF6`
- Green: `#10B981`
- Red: `#EF4444`
- Orange: `#F97316`

**Used in:**
- Primary buttons
- Links
- Active states
- Highlights
- Badges
- Progress bars

#### 2. **Success, Warning, Error Colors**
```typescript
success: {
  DEFAULT: '#10B981',       // ← Change if needed
  dark: '#059669',
  light: 'rgba(16, 185, 129, 0.1)',
},

warning: {
  DEFAULT: '#F59E0B',       // ← Change if needed
  dark: '#D97706',
  light: 'rgba(245, 158, 11, 0.1)',
},

error: {
  DEFAULT: '#EF4444',       // ← Change if needed
  dark: '#DC2626',
  light: 'rgba(239, 68, 68, 0.1)',
},
```

**Used in:**
- Alert messages
- Validation states
- Status badges
- Notifications

#### 3. **Typography**
```typescript
typography: {
  fontFamily: {
    sans: 'system-ui, -apple-system, sans-serif',  // ← Change font
    mono: '"SF Mono", monospace',
  },
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px  ← Base font size
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    // ...
  },
}
```

#### 4. **Spacing**
```typescript
spacing: {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px  ← Default spacing
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  // ...
}
```

#### 5. **Border Radius**
```typescript
borderRadius: {
  none: '0',
  sm: '0.25rem',      // 4px
  DEFAULT: '0.5rem',  // 8px  ← Default for buttons, cards
  md: '0.5rem',       // 8px
  lg: '0.75rem',      // 12px
  xl: '1rem',         // 16px
  full: '9999px',     // Pills/circular
}
```

**Tip:** Increase for more rounded UI, decrease for sharper edges.

### Usage Examples

#### Using Theme Colors in Components
```typescript
import { THEME } from '../config/theme';

function MyButton() {
  return (
    <button
      style={{
        backgroundColor: THEME.colors.primary.DEFAULT,
        color: '#FFFFFF',
        padding: THEME.spacing.md,
        borderRadius: THEME.borderRadius.DEFAULT,
      }}
    >
      Click Me
    </button>
  );
}
```

#### Using with Tailwind Classes
```typescript
// Update your tailwind.config.js to use THEME values
import { THEME } from './src/config/theme';

export default {
  theme: {
    extend: {
      colors: {
        primary: THEME.colors.primary.DEFAULT,
        // ...
      },
    },
  },
};
```

#### Using Color Presets
```typescript
import { COLOR_PRESETS } from '../config/theme';

// Success alert styling
<div style={{
  backgroundColor: COLOR_PRESETS.success.background,
  borderColor: COLOR_PRESETS.success.border,
  color: COLOR_PRESETS.success.text,
}}>
  Success message
</div>
```

---

## Component Customization

### Updating Button Colors

Most buttons use the primary color automatically, but you can customize specific ones:

```typescript
// src/components/button.tsx
// Look for lines with bg-[#0099FF] and replace with:
bg-[${THEME.colors.primary.DEFAULT}]
```

### Updating Card Styles

```typescript
// src/components/card.tsx
// Customize border radius, padding, shadows
```

### Updating Modal Appearance

```typescript
// src/components/PaywallModal.tsx
// Update backdrop blur, card styling, etc.
```

---

## Quick Start Checklist

Use this checklist to customize the boilerplate for your plugin:

### 1. **Brand Identity** (Required)
- [ ] Update `LINKS.website` to your plugin website
- [ ] Update `LINKS.support.email` to your support email
- [ ] Update `THEME.colors.primary` to your brand color
- [ ] Update `framer.json` with your plugin name and description

### 2. **Payment Setup** (If using Polar.sh)
- [ ] Create product on Polar.sh
- [ ] Update `LINKS.polar.purchase` with your product link
- [ ] Update `LINKS.polar.portal` with your organization portal
- [ ] Update `.env` with Polar credentials

### 3. **Legal & Policies** (Required for Production)
- [ ] Create Terms of Service page
- [ ] Create Privacy Policy page
- [ ] Create EULA page
- [ ] Update `LINKS.legal.terms`, `privacy`, and `eula`

### 4. **Social & Support** (Recommended)
- [ ] Update `LINKS.social.github` with your repository
- [ ] Update `LINKS.social.youtube` if you have video tutorials
- [ ] Update `LINKS.social.twitter` for social sharing
- [ ] Update `LINKS.docs.main` with your documentation

### 5. **Visual Customization** (Optional)
- [ ] Customize `THEME.colors.primary` for your brand
- [ ] Adjust `THEME.borderRadius` for UI roundness
- [ ] Update `THEME.typography.fontFamily` if using custom fonts
- [ ] Customize success/warning/error colors if needed

### 6. **Content** (Required)
- [ ] Update plugin description in all screens
- [ ] Update feature list in PaywallModal
- [ ] Update FAQ in HelpScreen
- [ ] Update pricing in PaywallModal
- [ ] Update company name throughout

---

## Testing Your Changes

After customizing, test these areas:

1. **Links**
   - Click "Visit Website" in AccountScreen
   - Click "Get Support" and verify email opens
   - Click "Buy Pro" and verify Polar checkout opens
   - Click all social links in HelpScreen

2. **Colors**
   - Check primary button colors throughout
   - Verify hover states work correctly
   - Check alert/badge colors (success, warning, error)
   - Test in both light and dark modes (if applicable)

3. **Branding**
   - Verify plugin name appears correctly
   - Check all legal links work
   - Ensure support email is correct

---

## Common Customizations

### Example 1: Change to Purple Theme
```typescript
// src/config/theme.ts
primary: {
  DEFAULT: '#8B5CF6',      // Purple
  hover: '#7C3AED',         // Darker purple
  light: 'rgba(139, 92, 246, 0.1)',
  lighter: 'rgba(139, 92, 246, 0.05)',
}
```

### Example 2: More Rounded UI
```typescript
// src/config/theme.ts
borderRadius: {
  DEFAULT: '1rem',  // Change from 0.5rem to 1rem
  md: '1rem',
  lg: '1.25rem',
  // ...
}
```

### Example 3: Larger Text
```typescript
// src/config/theme.ts
fontSize: {
  base: '1.125rem',  // Change from 1rem to 1.125rem (18px)
  // ...
}
```

---

## Need Help?

- **Links not working?** Check that URLs are valid and include `https://`
- **Colors not updating?** Make sure you're using `THEME.colors.primary.DEFAULT`
- **Tailwind classes not updating?** You may need to update `tailwind.config.js`

---

## Best Practices

1. **Always use the config files** - Don't hardcode links or colors
2. **Test after changes** - Click all buttons and links
3. **Keep backups** - Save your custom values before major updates
4. **Use semantic names** - Name custom colors based on purpose (e.g., `brand`, `accent`)
5. **Document changes** - Keep notes on what you customized

---

**That's it!** Your plugin is now fully customized. 🎉

For more help, see:
- [README.md](./README.md) - General setup guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical architecture
- [COMPONENTS.md](./COMPONENTS.md) - Component documentation
