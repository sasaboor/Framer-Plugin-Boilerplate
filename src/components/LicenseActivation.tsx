/**
 * License Activation Component
 * 
 * UI for activating and managing license keys
 */

import { useState } from 'react';
import Button from './button';
import Input from './input';
import { Card } from './card';
import { Badge } from './badge';
import Spinner from './spinner';
import { useLicense } from '../lib/hooks/useLicense';

export function LicenseActivation() {
  const [inputKey, setInputKey] = useState('');
  const {
    hasLicense,
    licenseKey,
    isValidating,
    error,
    activateLicense,
    removeLicense,
  } = useLicense();

  const handleActivate = async () => {
    if (!inputKey.trim()) return;
    await activateLicense(inputKey);
    setInputKey('');
  };

  if (hasLicense && licenseKey) {
    return (
      <Card className="p-4 space-y-3 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[var(--framer-color-text-primary)]">
                ✓ Pro Account Active
              </span>
              <Badge variant="success">Unlimited Checks</Badge>
            </div>
            <p className="text-xs text-[var(--framer-color-text-tertiary)] font-mono">
              License: {licenseKey.substring(0, 8)}...{licenseKey.substring(licenseKey.length - 4)}
            </p>
          </div>
          <Button
            onClick={removeLicense}
            variant="secondary"
            size="sm"
          >
            Remove License
          </Button>
        </div>
        <div className="pt-2 border-t border-green-200 dark:border-green-800">
          <p className="text-xs text-[var(--framer-color-text-secondary)]">
            You have unlimited access to all audit features
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-3">
      <div className="space-y-1">
        <h3 className="font-medium">Activate License</h3>
        <p className="text-sm text-tertiary">
          Enter your license key to unlock unlimited audits
        </p>
      </div>

      <div className="space-y-2">
        <Input
          type="text"
          placeholder="License key"
          value={inputKey}
          onChange={(e) => setInputKey(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleActivate()}
          disabled={isValidating}
        />

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <Button
          onClick={handleActivate}
          disabled={!inputKey.trim() || isValidating}
          className="w-full"
        >
          {isValidating ? (
            <>
              <Spinner size="sm" />
              <span>Validating...</span>
            </>
          ) : (
            'Activate'
          )}
        </Button>
      </div>
    </Card>
  );
}

