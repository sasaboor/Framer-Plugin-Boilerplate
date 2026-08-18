import { RouteName } from "./routes";

/**
 * Route Configuration
 * 
 * Metadata for each route including labels, descriptions, and icons.
 * Useful for navigation menus, breadcrumbs, and documentation.
 */
export interface RouteConfig {
  name: RouteName;
  label: string;
  description: string;
  isDefault?: boolean;
}

/**
 * All Route Configurations
 * 
 * Central place to manage route metadata.
 */
export const routeConfigs: Record<RouteName, RouteConfig> = {
  LoginScreen: {
    name: "LoginScreen",
    label: "Login",
    description: "Professional login screen for Pro license authentication",
    isDefault: false,
  },
  Dashboard: {
    name: "Dashboard",
    label: "Dashboard",
    description: "Main template checker dashboard with audit controls",
    isDefault: true,
  },
  AccountScreen: {
    name: "AccountScreen",
    label: "Account",
    description: "Account management with resources and legal information",
    isDefault: false,
  },
  AuditResults: {
    name: "AuditResults",
    label: "Audit Results",
    description: "Detailed audit results with categorized issues and fixes",
    isDefault: false,
  },
  MarketplaceScreen: {
    name: "MarketplaceScreen",
    label: "Marketplace",
    description: "Marketplace compliance and submission requirements",
    isDefault: false,
  },
  PerformanceScreen: {
    name: "PerformanceScreen",
    label: "Performance",
    description: "Performance metrics and Core Web Vitals analysis",
    isDefault: false,
  },
  SEOScreen: {
    name: "SEOScreen",
    label: "SEO",
    description: "SEO checklist and search engine optimization",
    isDefault: false,
  },
  AccessibilityScreen: {
    name: "AccessibilityScreen",
    label: "Accessibility",
    description: "Accessibility compliance and WCAG standards",
    isDefault: false,
  },
  ResponsivenessScreen: {
    name: "ResponsivenessScreen",
    label: "Responsiveness",
    description: "Responsive design and device breakpoint testing",
    isDefault: false,
  },
  Home: {
    name: "Home",
    label: "Component Showcase",
    description: "Showcase of shadcn UI components with Framer theme",
    isDefault: false,
  },
  Example: {
    name: "Example",
    label: "More Examples",
    description: "Additional component examples and demos",
    isDefault: false,
  },
};

/**
 * Get route configuration by name
 */
export function getRouteConfig(name: RouteName): RouteConfig {
  return routeConfigs[name];
}

/**
 * Get the default route name
 */
export function getDefaultRoute(): RouteName {
  return Object.values(routeConfigs).find((config) => config.isDefault)
    ?.name || "Dashboard";
}

/**
 * Get all route names
 */
export function getAllRoutes(): RouteName[] {
  return Object.keys(routeConfigs) as RouteName[];
}

/**
 * Get route label
 */
export function getRouteLabel(name: RouteName): string {
  return routeConfigs[name]?.label || name;
}

