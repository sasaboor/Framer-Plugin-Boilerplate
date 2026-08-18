/**
 * Route Parameter List
 *
 * Define all routes in your application here.
 * Routes with no parameters should use 'undefined'.
 * Routes with parameters should define their shape as an interface.
 *
 * @example
 * ```typescript
 * export interface RouteParamList {
 *   Dashboard: undefined;
 *   Details: { id: string; mode?: "view" | "edit" };
 * }
 * ```
 */
export interface RouteParamList {
  LoginScreen: undefined; // Login screen for Pro license authentication
  Dashboard: undefined; // Main component showcase and dashboard (default/home screen)
  AccountScreen: undefined; // Account management with resources and legal info
  OnboardingScreen: undefined; // Multi-step onboarding/welcome flow
  SettingsScreen: undefined; // App settings and preferences
  HelpScreen: undefined; // Help documentation and FAQ
  Home: undefined; // Component showcase with shadcn UI examples
  Example: undefined; // Additional component examples and demos
}

/**
 * Route Names
 * 
 * Union type of all available route names.
 * Automatically derived from RouteParamList keys.
 */
export type RouteName = keyof RouteParamList;
