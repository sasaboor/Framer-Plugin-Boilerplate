import { useEffect, useState } from "react";
import { framer } from "framer-plugin";
import "./index.css";
import Home from "./screens/home";
import { NavigationProvider, Route, getDefaultRoute, RouteName } from "./navigation";
import ExampleScreen from "./screens/example";
import Dashboard from "./screens/Dashboard";
import AccountScreen from "./screens/AccountScreen";
import LoginScreen, { LoginScreenBase } from "./screens/LoginScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import SettingsScreen from "./screens/SettingsScreen";
import HelpScreen from "./screens/HelpScreen";
import { startSession, endSession } from "./lib/analytics/session";
import { updateUserProperties } from "./lib/analytics/userIdentification";
import { storage } from "./lib/config/localStorage";
import { trackEvent, AnalyticsEvents } from "./lib/analytics/supabase";
import { useLicenseRevalidation } from "./lib/hooks/useLicenseRevalidation";
import { ExpirationModal } from "./components/ExpirationModal";
import { OfflineBlockModal } from "./components/OfflineBlockModal";

framer.showUI({
  position: "top right",
  resizable: true,
  minWidth: 400,
  maxWidth: 500,
  minHeight: 400,
  maxHeight: 600,
});

export function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [initialRouteOverride, setInitialRouteOverride] = useState<RouteName | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showExpirationModal, setShowExpirationModal] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [daysOffline, setDaysOffline] = useState(0);

  // Check authentication state
  const checkAuth = () => {
    const hasLicense = storage.hasValidLicense();

    // In feature-based licensing, we never force login screen
    // Users can access free features without a license
    // Premium features will show paywall modal when accessed
    setShowLogin(false);
    setIsCheckingAuth(false);
    if (isInitialLoad) setIsInitialLoad(false);
  };

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Listen for auth state changes (e.g., after sign out)
  useEffect(() => {
    const handleAuthChange = () => {
      setIsTransitioning(true);
      setTimeout(() => {
        checkAuth();
        setIsTransitioning(false);
      }, 300);
    };

    window.addEventListener('auth-state-changed', handleAuthChange);
    
    return () => {
      window.removeEventListener('auth-state-changed', handleAuthChange);
    };
  }, []);

  // Track session start/end
  useEffect(() => {
    // Start session when plugin opens (only if user has valid license)
    // This ensures plugin_opened events have user_id
    if (storage.hasValidLicense()) {
      startSession();
    }

    // Update user properties on mount
    updateUserProperties();
    
    // End session when plugin closes or becomes hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        endSession();
      } else {
        // Restart session when plugin becomes visible again
        startSession();
      }
    };
    
    // Track beforeunload (plugin close)
    const handleBeforeUnload = () => {
      endSession();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Cleanup
    return () => {
      endSession();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Periodic license revalidation
  const { revalidateLicense } = useLicenseRevalidation({
    checkOnMount: true,
    checkInterval: 60 * 60 * 1000, // Check every hour
    onLicenseInvalid: () => {
      // License is no longer valid (expired or revoked)
      checkAuth(); // This will trigger re-auth
    },
    onLicenseExpired: () => {
      // License has expired - show expiration modal
      setShowExpirationModal(true);
      trackEvent('license_expired_modal_shown');
    },
    onOfflineTooLong: () => {
      // User has been offline too long - show offline modal
      const days = storage.getDaysOffline();
      setDaysOffline(days);
      setShowOfflineModal(true);
      trackEvent('offline_modal_shown', { days_offline: days });
    },
  });

  // Handle successful login
  const handleLoginSuccess = () => {
    setIsTransitioning(true);

    // Smooth transition
    setTimeout(() => {
      setShowLogin(false);
      updateUserProperties();
      setInitialRouteOverride(null);

      // Track session start with valid user (after login)
      startSession();

      setTimeout(() => {
        setIsTransitioning(false);
        framer.notify("Welcome back! You now have unlimited checks.", { variant: "success" });
      }, 300);
    }, 300);
  };

  // Handle license activated from expiration modal
  const handleExpirationModalLicenseActivated = () => {
    setShowExpirationModal(false);
    updateUserProperties();
    framer.notify("License renewed successfully!", { variant: "success" });
    trackEvent('license_renewed_from_modal');
  };

  // Handle retry from offline modal
  const handleOfflineRetry = async () => {
    trackEvent('offline_retry_attempt');

    // Try to revalidate license
    await revalidateLicense();

    // Check if we're still offline
    if (storage.isOfflineTooLong(7)) {
      framer.notify("Still offline. Please check your internet connection.", { variant: "error" });
    } else {
      // Successfully went online
      setShowOfflineModal(false);
      framer.notify("Connection restored!", { variant: "success" });
      trackEvent('offline_retry_success');
    }
  };


  // Show loading state while checking auth
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--framer-color-bg)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#0099FF] border-t-transparent rounded-full animate-spin" />
          <div className="text-sm text-[var(--framer-color-text-secondary)]">Loading...</div>
        </div>
      </div>
    );
  }

  // Show transition overlay
  if (isTransitioning) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--framer-color-bg)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#0099FF] border-t-transparent rounded-full animate-spin" />
          <div className="text-sm text-[var(--framer-color-text-secondary)]">Preparing...</div>
        </div>
      </div>
    );
  }

  // Show login screen if user needs to authenticate
  if (showLogin) {
    return (
      <LoginScreenBase
        onSuccess={handleLoginSuccess}
        onBack={() => {
          // Close forced-login and open AccountScreen
          setInitialRouteOverride('AccountScreen');
          setShowLogin(false);
        }}
      />
    );
  }

  // Show main app
  return (
    <>
      <NavigationProvider initialRoute={initialRouteOverride ?? getDefaultRoute()}>
        <Route name="Dashboard" screen={Dashboard} />
        <Route name="LoginScreen" screen={LoginScreen} />
        <Route name="AccountScreen" screen={AccountScreen} />
        <Route name="OnboardingScreen" screen={OnboardingScreen} />
        <Route name="SettingsScreen" screen={SettingsScreen} />
        <Route name="HelpScreen" screen={HelpScreen} />
        <Route name="Home" screen={Home} />
        <Route name="Example" screen={ExampleScreen} />
      </NavigationProvider>

      {/* Expiration Modal - shown when subscription expires */}
      <ExpirationModal
        isOpen={showExpirationModal}
        onLicenseActivated={handleExpirationModalLicenseActivated}
      />

      {/* Offline Block Modal - shown when user offline >7 days */}
      <OfflineBlockModal
        isOpen={showOfflineModal}
        daysOffline={daysOffline}
        onRetry={handleOfflineRetry}
      />
    </>
  );
}
