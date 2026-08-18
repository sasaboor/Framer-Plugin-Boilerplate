/**
 * Paywall Modal Component
 * 
 * Shows when user tries to run audit without a valid license
 */

import { useState, useEffect } from 'react';
import Button from './button';
import Input from './input';
import { Card } from './card';
import Spinner from './spinner';
import { useLicense } from '../lib/hooks/useLicense';
import { trackEvent } from '../lib/analytics/supabase';
import { X } from 'lucide-react';
import { LINKS, openLink } from '../config/links';
import { THEME } from '../config/theme';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLicenseActivated?: () => void;
}

export function PaywallModal({ isOpen, onClose, onLicenseActivated }: PaywallModalProps) {
  const [showLicenseInput, setShowLicenseInput] = useState(false);
  const [licenseKey, setLicenseKey] = useState('');
  const { activateLicense, isValidating, error } = useLicense();

  const handleClose = () => {
    setShowLicenseInput(false);
    setLicenseKey('');
    onClose();
  };

  const handleBuyPro = async () => {
    // Track buy now click
    trackEvent('buy_now_clicked', { source: 'upgrade_modal' });
    openLink(LINKS.polar.purchase);
  };

  const handleShowLicenseInput = () => {
    // Send to LoginScreen and close modal
    trackEvent('license_input_opened', { source: 'upgrade_modal' });
    window.dispatchEvent(new Event('navigate_to_login'));
    handleClose();
  };

  const handleActivate = async () => {
    if (!licenseKey.trim()) return;

    // Track license entry
    trackEvent('license_entered', {
      source: 'upgrade_modal',
      key_length: licenseKey.length
    });

    const success = await activateLicense(licenseKey);

    if (success) {
      // Track successful validation
      trackEvent('license_valid', { source: 'upgrade_modal' });

      setLicenseKey('');
      setShowLicenseInput(false);
      onLicenseActivated?.();
      onClose();
    } else {
      // Track invalid license
      trackEvent('license_invalid', { source: 'upgrade_modal' });
    }
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        // Close on backdrop click
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <Card className="max-w-md w-full p-6 space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-0.5 rounded-md hover:bg-[var(--framer-color-bg-secondary)] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4 text-[var(--framer-color-text-secondary)]" />
        </button>

        {!showLicenseInput ? (
          // Main upgrade screen
          <>
            <div className="space-y-2 pr-8">
              <h2 className="text-2xl font-bold text-[var(--framer-color-text-primary)]">
                Upgrade to Pro
              </h2>
              <p className="text-sm text-[var(--framer-color-text-secondary)] leading-relaxed">
                This is a premium feature. Unlock the full potential of this plugin with a Pro license.
              </p>
            </div>

            <div className="space-y-4">
              {/* Pro Features */}
              <div className="bg-[var(--framer-color-bg-secondary)] rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--framer-color-text-primary)]">Pro License</span>
                  <span className="text-lg font-bold" style={{ color: THEME.colors.primary.DEFAULT }}>$29.99</span>
                </div>
                <ul className="space-y-2 text-sm text-[var(--framer-color-text-secondary)]">
                  <li className="flex items-center gap-2">
                    <span style={{ color: THEME.colors.success.DEFAULT }}>✓</span>
                    <span>Export data to CSV/JSON</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span style={{ color: THEME.colors.success.DEFAULT }}>✓</span>
                    <span>Advanced analytics & reporting</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span style={{ color: THEME.colors.success.DEFAULT }}>✓</span>
                    <span>Unlimited projects</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span style={{ color: THEME.colors.success.DEFAULT }}>✓</span>
                    <span>Priority support</span>
                  </li>
                </ul>
              </div>

              {/* Buy Pro Button */}
              <Button
                onClick={handleBuyPro}
                className="w-full font-semibold"
              >
                Buy Pro
              </Button>

              {/* Already have license */}
              <Button
                onClick={handleShowLicenseInput}
                variant="secondary"
                className="w-full"
              >
                I already have a license key
              </Button>
            </div>
          </>
        ) : (
          // License key input screen
          <>
            <div className="space-y-2 pr-8">
              <h2 className="text-xl font-bold text-[var(--framer-color-text-primary)]">
                Activate License
              </h2>
              <p className="text-sm text-[var(--framer-color-text-secondary)]">
                Enter your license key to unlock all premium features
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-[var(--framer-color-text-secondary)]">
                  License Key
                </label>
                <Input
                  type="text"
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isValidating && handleActivate()}
                  disabled={isValidating}
                  className="font-mono text-sm"
                />
              </div>
              
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}

              <Button
                onClick={handleActivate}
                disabled={!licenseKey.trim() || isValidating}
                className="w-full"
              >
                {isValidating ? (
                  <>
                    <Spinner />
                    <span>Validating License...</span>
                  </>
                ) : (
                  'Validate License'
                )}
              </Button>

              <Button
                onClick={() => {
                  setShowLicenseInput(false);
                  setLicenseKey('');
                }}
                variant="secondary"
                className="w-full"
                disabled={isValidating}
              >
                Back
              </Button>
              
              <p className="text-xs text-[var(--framer-color-text-tertiary)] text-center">
                Enter the license key you received after purchase
              </p>
            </div>
          </>
        )}

        {/* Dismiss text */}
        {/* <p className="text-xs text-center text-[var(--framer-color-text-tertiary)]">
          Press ESC or click outside to dismiss
        </p> */}
      </Card>
    </div>
  );
}

