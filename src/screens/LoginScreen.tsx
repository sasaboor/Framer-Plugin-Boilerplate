/**
 * Login Screen
 * 
 * Professional login interface for entering Pro license keys.
 * Follows modern UI/UX best practices with accessibility support.
 */

import { useState, useEffect, useRef, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, ArrowRight, Sparkles, ChevronLeft } from 'lucide-react';
import { framer } from 'framer-plugin';
import Button from '../components/button';
import { Card } from '../components/card';
import Spinner from '../components/spinner';
import { useLicense } from '../lib/hooks/useLicense';
import { trackEvent } from '../lib/analytics/supabase';
import { storage } from '../lib/config/localStorage';
import { useNavigation } from '../navigation/useNavigation';
import { LINKS, openLink } from '../config/links';
import { THEME } from '../config/theme';

interface LoginScreenProps {
  onSuccess: () => void;
  onBack: () => void;
}

// Base component that requires props
export function LoginScreenBase({ onSuccess, onBack }: LoginScreenProps) {
  const [licenseKey, setLicenseKey] = useState('');
  const [showLicenseKey, setShowLicenseKey] = useState(false);
  const [formatError, setFormatError] = useState('');
  const [hasUsedFreeCheck, setHasUsedFreeCheck] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { activateLicense, isValidating, error } = useLicense();

  // Track screen view
  useEffect(() => {
    setHasUsedFreeCheck(false); // Feature-based licensing: no free check tracking

    trackEvent('login_screen_viewed', {
      reason: 'no_license'
    });

    // Auto-focus input
    inputRef.current?.focus();
  }, []);

  // Client-side format validation
  const validateFormat = (key: string): boolean => {
    if (!key.trim()) {
      setFormatError('');
      return false;
    }

    // Basic validation: at least 10 characters, alphanumeric and hyphens/underscores
    if (key.length < 10) {
      setFormatError('License key must be at least 10 characters');
      return false;
    }

    if (!/^[a-zA-Z0-9\-_]+$/.test(key)) {
      setFormatError('License key contains invalid characters');
      return false;
    }

    setFormatError('');
    return true;
  };

  // Handle input change
  const handleInputChange = (value: string) => {
    setLicenseKey(value);
    if (value.trim()) {
      validateFormat(value);
    } else {
      setFormatError('');
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate format first
    if (!validateFormat(licenseKey)) {
      return;
    }

    // Track submission
    trackEvent('login_attempt', {
      key_length: licenseKey.length,
    });

    // Attempt activation
    const success = await activateLicense(licenseKey);

    if (success) {
      // Track success
      trackEvent('login_success');

      // Call onSuccess which will transition to main app
      // Dashboard is the default route, so user will land there automatically
      setTimeout(() => {
        onSuccess();
      }, 300);
    } else {
      // Track failure
      trackEvent('login_failed', {
        error: error || 'Unknown error'
      });
    }
  };

  // Handle Get Pro button
  const handleGetPro = async () => {
    trackEvent('get_pro_clicked', { source: 'login_screen' });

    openLink(LINKS.polar.purchase);
  };

  // Check if form is valid
  const isFormValid = licenseKey.trim().length >= 10 && !formatError && !isValidating;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--framer-color-bg)]">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-20 px-4 h-14 flex items-center gap-3 bg-[var(--framer-color-bg)] border-b border-[var(--framer-color-divider)]">
        <Button onClick={onBack} size="icon" variant="ghost">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-base font-semibold text-[var(--framer-color-text-primary)]">
          Sign In
        </h1>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full border"
              style={{
                backgroundColor: THEME.colors.primary.light,
                borderColor: `${THEME.colors.primary.DEFAULT}33`
              }}
            >
              <Sparkles className="w-6 h-6" style={{ color: THEME.colors.primary.DEFAULT }} />
            </motion.div>

            <h2 className="text-lg font-semibold text-[var(--framer-color-text-primary)] mb-1">
              {hasUsedFreeCheck ? "You've used your free check" : "Enter your Pro license"}
            </h2>
            <p className="text-sm text-[var(--framer-color-text-secondary)]">
              {hasUsedFreeCheck
                ? "Sign in to continue with unlimited checks"
                : "Sign in to unlock unlimited template checks"
              }
            </p>
          </div>

        {/* Login Form */}
        <Card className="p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* License Key Input */}
            <div className="space-y-2">
              <label
                htmlFor="license-key"
                className="block text-xs font-semibold text-[var(--framer-color-text-secondary)] uppercase tracking-wide"
              >
                License Key
              </label>

              <div className="relative">
                <input
                  ref={inputRef}
                  id="license-key"
                  type={showLicenseKey ? 'text' : 'password'}
                  value={licenseKey}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && isFormValid) {
                      handleSubmit(e as any);
                    }
                  }}
                  placeholder="Enter your license key"
                  disabled={isValidating}
                  aria-label="License key"
                  aria-invalid={!!(formatError || error)}
                  aria-describedby={formatError || error ? 'license-error' : undefined}
                  className="w-full h-10 px-3 pr-10 font-mono text-sm rounded-md border border-[var(--framer-color-divider)] bg-[var(--framer-color-bg)] text-[var(--framer-color-text-primary)] placeholder:text-[var(--framer-color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                  style={{
                    '--focus-ring-color': THEME.colors.primary.DEFAULT,
                    '--focus-border-color': THEME.colors.primary.DEFAULT
                  } as any}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = THEME.colors.primary.DEFAULT;
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${THEME.colors.primary.DEFAULT}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '';
                    e.currentTarget.style.boxShadow = '';
                  }}
                />
                
                {/* Input Actions */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  {/* Show/Hide Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowLicenseKey(!showLicenseKey)}
                    aria-label={showLicenseKey ? 'Hide license key' : 'Show license key'}
                    className="p-1 rounded hover:bg-[var(--framer-color-bg-secondary)] text-[var(--framer-color-text-secondary)] transition-colors"
                  >
                    {showLicenseKey ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Messages */}
              <AnimatePresence mode="wait">
                {(formatError || error) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    id="license-error"
                    role="alert"
                    className="flex items-start gap-2 p-3 rounded-md border"
                    style={{
                      backgroundColor: THEME.colors.error.light,
                      borderColor: `${THEME.colors.error.DEFAULT}4D`
                    }}
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: THEME.colors.error.DEFAULT }} />
                    <p className="text-sm text-[var(--framer-color-text-primary)]">
                      {formatError || error || 'Invalid license key. Please try again.'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!isFormValid || isValidating}
              size="md"
              className="w-full"
              aria-label={isValidating ? 'Validating license key' : 'Continue with license key'}
            >
              {isValidating ? (
                <>
                  <Spinner className="bg-[var(--framer-color-text-reversed)]" />
                  <span>Validating...</span>
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </form>
        </Card>

        {/* Secondary Actions */}
        <div className="mt-4 text-center">
          <p className="text-sm text-[var(--framer-color-text-secondary)] mb-3">
            Don't have a license?
          </p>
          <Button
            onClick={handleGetPro}
            variant="secondary"
            size="md"
            className="w-full justify-center gap-2"
          >
            <span>Get Pro Access</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-[var(--framer-color-text-tertiary)] leading-relaxed">
            Secure authentication • Your license key is stored locally
          </p>
        </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

// Route wrapper that provides props
export default function LoginScreen() {
  const { navigate } = useNavigation();
  
  const handleSuccess = () => {
    // Navigate to Dashboard after successful login
    navigate('Dashboard');
    framer.notify("Welcome! You now have unlimited checks.", { variant: "success" });
  };

  const handleBack = () => {
    // Navigate back to Account screen
    navigate('AccountScreen');
  };
  
  return (
    <LoginScreenBase 
      onSuccess={handleSuccess}
      onBack={handleBack}
    />
  );
}
