/**
 * Expiration Modal Component
 *
 * Shows when user's subscription has expired and they've been downgraded to free tier.
 * Cannot be dismissed - forces user to take action (renew or enter new license).
 */

import { useState } from 'react';
import Button from './button';
import Input from './input';
import { Card } from './card';
import Spinner from './spinner';
import { useLicense } from '../lib/hooks/useLicense';
import { trackEvent } from '../lib/analytics/supabase';
import { AlertCircle } from 'lucide-react';
import { LINKS, openLink } from '../config/links';

interface ExpirationModalProps {
  isOpen: boolean;
  onLicenseActivated?: () => void;
}

export function ExpirationModal({ isOpen, onLicenseActivated }: ExpirationModalProps) {
  const [showLicenseInput, setShowLicenseInput] = useState(false);
  const [licenseKey, setLicenseKey] = useState('');
  const { activateLicense, isValidating, error } = useLicense();

  const handleRenewLicense = () => {
    trackEvent('renew_license_clicked', { source: 'expiration_modal' });

    // Open Polar.sh checkout page
    openLink(LINKS.polar.purchase);
  };

  const handleShowLicenseInput = () => {
    trackEvent('enter_new_license_clicked', { source: 'expiration_modal' });
    setShowLicenseInput(true);
  };

  const handleActivate = async () => {
    if (!licenseKey.trim()) return;

    trackEvent('license_entered', {
      source: 'expiration_modal',
      key_length: licenseKey.length
    });

    const success = await activateLicense(licenseKey);

    if (success) {
      trackEvent('license_valid', { source: 'expiration_modal' });

      setLicenseKey('');
      setShowLicenseInput(false);
      onLicenseActivated?.();
    } else {
      trackEvent('license_invalid', { source: 'expiration_modal' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full p-6 space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
        {!showLicenseInput ? (
          // Main expiration screen
          <>
            <div className="space-y-4">
              {/* Icon and header */}
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--framer-color-text-primary)]">
                  Subscription Expired
                </h2>
                <p className="text-sm text-[var(--framer-color-text-secondary)] leading-relaxed">
                  Your subscription has expired and you've been downgraded to the free tier. Renew your license to continue using premium features.
                </p>
              </div>

              {/* Lost features */}
              <div className="bg-[var(--framer-color-bg-secondary)] rounded-lg p-4 space-y-3">
                <p className="text-xs font-semibold text-[var(--framer-color-text-secondary)] uppercase tracking-wide">
                  Premium features now locked:
                </p>
                <ul className="space-y-2 text-sm text-[var(--framer-color-text-secondary)]">
                  <li className="flex items-center gap-2">
                    <span className="text-orange-500">⚠</span>
                    <span>Export data to CSV/JSON</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-orange-500">⚠</span>
                    <span>Advanced analytics & reporting</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-orange-500">⚠</span>
                    <span>Unlimited projects</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-orange-500">⚠</span>
                    <span>Priority support</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              {/* Renew License Button */}
              <Button
                onClick={handleRenewLicense}
                className="w-full bg-[#0099FF] hover:bg-[#0088EE] text-white font-semibold"
              >
                Renew License
              </Button>

              {/* Enter New License */}
              <Button
                onClick={handleShowLicenseInput}
                variant="secondary"
                className="w-full"
              >
                I have a new license key
              </Button>
            </div>
          </>
        ) : (
          // License key input screen
          <>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-[var(--framer-color-text-primary)]">
                Enter New License
              </h2>
              <p className="text-sm text-[var(--framer-color-text-secondary)]">
                Enter your new license key to restore premium features
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
                  autoFocus
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
                  'Activate License'
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
                Enter your renewed license key or a new license key
              </p>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
