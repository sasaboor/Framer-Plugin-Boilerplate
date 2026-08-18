# Framer Plugin Boilerplate

A comprehensive, production-ready boilerplate for building professional Framer plugins with authentication, payments, analytics, and a complete UI component library.

## Features

- **Authentication & Licensing** - Built-in Polar.sh integration for license management
- **Analytics** - Supabase-based analytics for user tracking and event analytics
- **Type-Safe Navigation** - Custom navigation system with type-safe routes
- **UI Component Library** - 20+ beautiful, accessible components built with Radix UI
- **Example Screens** - Dashboard, Onboarding, Settings, Help, and Account screens
- **Modern Stack** - React 18, TypeScript, Tailwind CSS, Framer Motion
- **Developer Experience** - Hot reload, TypeScript, ESLint, and more

# UI Kit/Component Library Plugin Boilerplate

A comprehensive, production-ready boilerplate for building professional Framer plugins with authentication, payments, analytics, and a complete UI component library.

> **Building a UI kit instead of a feature plugin?** This boilerplate handles auth, payments and analytics — but selling a component library needs a catalog, categories, search, and per-component gating too. Check out the **[UI Kit Boilerplate ($49.99)](https://buy.polar.sh/polar_cl_zd1dvfD7O9sAMSr83uGhwgG2OuzmmaremI6BX2lBSVZ)** — same stack, purpose-built for that.

## Features

## Quick Start

### Prerequisites

- Node.js 18+ installed
- A Polar.sh account (for payment processing)
- A Supabase account (for analytics)

### Installation

1. **Clone or download this repository**

```bash
git clone (https://github.com/sasaboor/Framer-Plugin-Boilerplate.git)
cd framer-plugin-boilerplate
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

⚠️ **SECURITY CRITICAL**: Never commit your `.env` file to version control!

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Polar.sh Configuration
VITE_POLAR_ACCESS_TOKEN=your_polar_access_token
VITE_POLAR_ORG_ID=your_polar_org_id
VITE_POLAR_PRODUCT_ID=your_polar_product_id
```

**Verify `.env` is not committed:**

```bash
git check-ignore .env
# Should output: .env
```

📚 **For complete security guidelines, see [SECURITY.md](./SECURITY.md)**

4. **Update branding**

Edit `framer.json` to customize your plugin:

```json
{
  "id": "your-plugin-id",
  "name": "Your Plugin Name",
  "modes": ["canvas"],
  "icon": "/your-icon.png",
  "description": "Your plugin description"
}
```

5. **Start development server**

```bash
npm run dev
```

6. **Build for production**

```bash
npm run build
```

## Project Structure

```
├── src/
│   ├── screens/          # Screen components
│   │   ├── Dashboard.tsx         # Component showcase
│   │   ├── OnboardingScreen.tsx  # Multi-step onboarding
│   │   ├── SettingsScreen.tsx    # Settings & preferences
│   │   ├── HelpScreen.tsx        # Help & documentation
│   │   ├── AccountScreen.tsx     # Account management
│   │   ├── LoginScreen.tsx       # License activation
│   │   ├── home.tsx              # Component examples
│   │   └── example.tsx           # More examples
│   │
│   ├── components/       # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── tabs.tsx
│   │   ├── accordion.tsx
│   │   └── ... (20+ components)
│   │
│   ├── navigation/       # Custom navigation system
│   │   ├── NavigationProvider.tsx
│   │   ├── routes.ts             # Route definitions
│   │   ├── types.ts
│   │   └── useNavigation.ts
│   │
│   ├── lib/             # Business logic & utilities
│   │   ├── payments/    # Polar.sh integration
│   │   ├── analytics/   # Supabase analytics
│   │   ├── hooks/       # Custom React hooks
│   │   ├── services/    # External services
│   │   └── config/      # Configuration
│   │
│   ├── App.tsx          # Root component
│   └── main.tsx         # Entry point
│
├── framer.json          # Plugin manifest
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

## Customization Guide

### Quick Customization (New! 🎉)

The boilerplate now includes centralized configuration files for easy customization:

**📝 Links Configuration** (`src/config/links.ts`)
- All external links in one place
- Easy to update branding, support, social media links
- Includes Polar.sh payment links

**🎨 Theme Configuration** (`src/config/theme.ts`)
- **Change your entire plugin's colors in 30 seconds!**
- Centralized colors, typography, spacing
- Change your brand color in one place - it updates everywhere
- Consistent design tokens throughout

**📚 Customization Guides:**
- [THEME_QUICK_START.md](./THEME_QUICK_START.md) - Change colors in 30 seconds (copy-paste presets!)
- [CUSTOMIZATION_GUIDE.md](./CUSTOMIZATION_GUIDE.md) - Complete customization guide
- [FEATURE_GATING_GUIDE.md](./FEATURE_GATING_GUIDE.md) - Gate features behind license tiers

### 1. Remove Payment/Licensing (Optional)

If you want to create a free plugin:

1. Remove `src/lib/payments/` folder
2. Remove license checks from `App.tsx`
3. Remove `LoginScreen.tsx` and `PaywallModal.tsx`
4. Update `AccountScreen.tsx` to remove license display

### 2. Add New Screens

1. **Define route** in `src/navigation/routes.ts`:

```typescript
export interface RouteParamList {
  // Existing routes...
  MyNewScreen: undefined; // or { id: string } for params
}
```

2. **Create screen** in `src/screens/MyNewScreen.tsx`:

```tsx
import PageContainer from "../components/page-container";
import { useNavigation } from "../navigation";

export default function MyNewScreen() {
  const navigation = useNavigation();

  return (
    <PageContainer
      appBar={{
        title: "My Screen",
        showBackButton: true,
        onBack: () => navigation.goBack()
      }}
    >
      {/* Your content here */}
    </PageContainer>
  );
}
```

3. **Register route** in `App.tsx`:

```tsx
import MyNewScreen from "./screens/MyNewScreen";

// In the return statement:
<Route name="MyNewScreen" screen={MyNewScreen} />
```

4. **Navigate** from anywhere:

```tsx
navigation.navigate('MyNewScreen');
```

### 3. Customize Components

All components are in `src/components/` and use Tailwind CSS for styling. You can:

- Modify existing components
- Create new components following the same patterns
- Update Tailwind theme in `tailwind.config.js`

### 4. Configure Analytics

Events are tracked automatically via Supabase. Add custom events:

```tsx
import { trackEvent } from "./lib/analytics/supabase";

trackEvent('custom_event_name', {
  property1: 'value1',
  property2: 'value2'
});
```

## UI Components

### Available Components

- **Layout**: Card, PageContainer, AppBar, Separator
- **Forms**: Button, Input, Textarea, Checkbox, Select
- **Feedback**: Alert, Badge, Progress, Spinner, Skeleton
- **Navigation**: Tabs, Accordion
- **Utilities**: Tooltip, Stepper, ScrollArea

### Component Examples

See the Dashboard screen for interactive component examples, or check `src/screens/home.tsx` for code samples.

## Deployment

### Pre-Deployment Security Checklist

Before deploying to production, ensure:

- [ ] `.env` is in `.gitignore` and not committed
- [ ] All API keys are rotated (if previously exposed)
- [ ] Service role key is only in Edge Function secrets
- [ ] Rate limiting is configured in Edge Functions
- [ ] CORS is configured correctly
- [ ] All Edge Functions are deployed
- [ ] Database migrations are applied
- [ ] License validation is tested with real keys

📚 **See complete checklist in [SECURITY.md](./SECURITY.md#deployment-checklist)**

### Deploy Supabase Edge Functions

```bash
# Set access token
export SUPABASE_ACCESS_TOKEN=your_token

# Deploy functions
supabase functions deploy validate-license
supabase functions deploy track-event
```

### Build Plugin

```bash
npm run build
```

### Pack for Distribution

```bash
npm run pack
```

This creates a `.framer-plugin` file that can be installed in Framer.

### Submit to Framer Plugin Store

1. Ensure all branding is updated
2. Test thoroughly in Framer
3. Create high-quality screenshots
4. Submit through Framer's plugin submission process

## Environment Variables

### Client-Safe Variables (Safe to expose in client code)

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key (RLS-protected) | Yes |
| `VITE_POLAR_ACCESS_TOKEN` | Your Polar.sh access token | Yes (if using payments) |
| `VITE_POLAR_ORG_ID` | Your Polar.sh organization ID | Yes (if using payments) |
| `VITE_POLAR_PRODUCT_ID` | Your Polar.sh product ID | Yes (if using payments) |

### Secret Variables (⚠️ NEVER expose in client code)

These should only be stored in Supabase Edge Function secrets:

```bash
# Set Edge Function secrets
supabase secrets set POLAR_ACCESS_TOKEN=your_token
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_key
```

**Security Note**: The `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security. Only use it in Edge Functions, never in client code.

📚 **For detailed security setup, see [SECURITY.md](./SECURITY.md)**

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- `npm run pack` - Create distributable plugin file
- `npm test` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI
- `npm run test:run` - Run tests once
- `npm run test:coverage` - Run tests with coverage report

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Payment**: Polar.sh SDK
- **Analytics**: Supabase (Postgres + Edge Functions)
- **Build Tool**: Vite
- **Plugin SDK**: Framer Plugin

## Architecture

For detailed architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md).

For component usage guide, see [COMPONENTS.md](./COMPONENTS.md).

## Testing

This boilerplate includes a comprehensive testing setup with Vitest and React Testing Library.

### Running Tests

```bash
# Run tests in watch mode (recommended during development)
npm test

# Run tests once (for CI/CD)
npm run test:run

# Run tests with UI dashboard
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Writing Tests

Tests are located next to their source files with a `.test.ts` or `.test.tsx` extension:

```typescript
// Example: src/lib/utils/myUtil.test.ts
import { describe, it, expect } from 'vitest';
import { myUtil } from './myUtil';

describe('myUtil', () => {
  it('should work correctly', () => {
    expect(myUtil('input')).toBe('expected output');
  });
});
```

### Testing Components

Use the custom `render` function from `src/test/utils.tsx`:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/utils';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Test Coverage

The project aims for 70%+ coverage on critical paths:
- ✅ Error handling utilities (30 tests)
- ✅ Error boundary component (6 tests)
- 🔄 License management hooks (in progress)
- 🔄 Analytics tracking (in progress)

Run `npm run test:coverage` to see detailed coverage reports.

### Error Boundary

The app includes a global error boundary that catches React component errors and prevents crashes. In development mode, it shows detailed error messages. In production, it shows a user-friendly error screen.

## Best Practices

1. **Type Safety** - Use TypeScript strictly, define types for all props
2. **Component Composition** - Build small, reusable components
3. **Error Handling** - Use try-catch and display user-friendly errors
4. **Loading States** - Always show loading states for async operations
5. **Accessibility** - Use semantic HTML and ARIA attributes
6. **Performance** - Lazy load heavy components, memoize expensive computations
7. **Testing** - Write tests for critical business logic and components

## Troubleshooting

### Build fails with "Module not found"

- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite`

### Plugin doesn't load in Framer

- Check `framer.json` is valid
- Ensure build was successful
- Restart Framer

### Environment variables not working

- Ensure `.env` file exists in root
- Variables must be prefixed with `VITE_`
- Restart dev server after changing `.env`

## Support

- **Documentation**: Check `ARCHITECTURE.md` and `COMPONENTS.md`
- **Issues**: Open an issue on GitHub

## Author

**Syed Saboor** — I build and sell Framer plugins; this boilerplate is the exact stack behind them, including [Template Checker](https://www.framer.com/marketplace/plugins/template-checker/), live on the Framer marketplace. **6,000+ combined users** across my published plugins.

**Want your plugin built instead of DIY'd?** I take on a limited number of client builds. Email me: [syedsaboor005@gmail.com](mailto:syedsaboor005@gmail.com)

- Twitter: (https://x.com/_syedsaboor)
- Framer Profile: (https://www.framer.com/@syed-saboor/)

## Selling a Component Library?

If you're building a UI kit plugin rather than a feature plugin, this repo won't give you a component catalog, search, favorites, or per-component free/paid gating — that's a different set of screens. The **[UI Kit Boilerplate](https://buy.polar.sh/polar_cl_zd1dvfD7O9sAMSr83uGhwgG2OuzmmaremI6BX2lBSVZ)** ($49.99, one-time) is built on this same foundation with all of that added.


## License

MIT License - feel free to use this boilerplate for commercial projects.

## Credits

Built with:
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/) (inspiration)
- [Polar.sh](https://polar.sh/)
- [Supabase](https://supabase.com/)

---

Happy building!
