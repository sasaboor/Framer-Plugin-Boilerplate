/**
 * Offline Block Modal Component
 *
 * Shows when user has been offline for more than 7 days with an active premium license.
 * Blocks access to premium features until user goes online to revalidate.
 * Cannot be dismissed - forces user to go online.
 */

import { Card } from './card';
import { trackEvent } from '../lib/analytics/supabase';
import { WifiOff, RefreshCw } from 'lucide-react';
import Button from './button';

interface OfflineBlockModalProps {
  isOpen: boolean;
  daysOffline: number;
  onRetry?: () => void;
}

export function OfflineBlockModal({ isOpen, daysOffline, onRetry }: OfflineBlockModalProps) {
  const handleRetry = () => {
    trackEvent('offline_retry_clicked', { days_offline: daysOffline });

    // Trigger revalidation attempt
    onRetry?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full p-6 space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
        <div className="space-y-4">
          {/* Icon and header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <WifiOff className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--framer-color-text-primary)]">
              Connection Required
            </h2>
            <p className="text-sm text-[var(--framer-color-text-secondary)] leading-relaxed">
              You've been offline for {daysOffline} {daysOffline === 1 ? 'day' : 'days'}. Please connect to the internet to verify your license and continue using premium features.
            </p>
          </div>

          {/* Info box */}
          <div className="bg-[var(--framer-color-bg-secondary)] rounded-lg p-4 space-y-2">
            <p className="text-xs font-semibold text-[var(--framer-color-text-secondary)] uppercase tracking-wide">
              Why is this needed?
            </p>
            <p className="text-sm text-[var(--framer-color-text-secondary)] leading-relaxed">
              To prevent license abuse, we require periodic online verification. Once you connect to the internet, your license will be validated automatically.
            </p>
          </div>

          {/* Grace period info */}
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md p-3">
            <p className="text-sm text-orange-600 dark:text-orange-400">
              <span className="font-semibold">Offline grace period:</span> You can use premium features offline for up to 7 days. After that, an internet connection is required.
            </p>
          </div>
        </div>

        {/* Retry button */}
        <div className="space-y-3">
          <Button
            onClick={handleRetry}
            className="w-full bg-[#0099FF] hover:bg-[#0088EE] text-white font-semibold"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Connection</span>
          </Button>

          <p className="text-xs text-center text-[var(--framer-color-text-tertiary)]">
            Make sure you're connected to the internet and click retry
          </p>
        </div>
      </Card>
    </div>
  );
}
