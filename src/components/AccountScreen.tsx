/**
 * Account Screen Component
 * 
 * Full-screen account interface with login, resources, and legal information
 */

import { useState } from 'react';
import { framer } from 'framer-plugin';
import {
  ChevronLeft,
  ChevronRight,
  User,
  ExternalLink,
  Sparkles,
  Globe,
  MessageCircle,
  ShoppingCart,
  FileText,
  Shield,
  ScrollText,
  CheckCircle2,
  LogOut,
  BarChart3
} from 'lucide-react';
import Button from './button';
import { Card } from './card';
import { Badge } from './badge';
import { useLicense } from '../lib/hooks/useLicense';
import { storage } from '../lib/config/localStorage';
import { trackEvent } from '../lib/analytics/supabase';
import { LINKS } from '../config/links';

interface AccountScreenProps {
  onBack: () => void;
  onLogin: () => void;
  onUpgrade?: () => void;
}

export function AccountScreen({ onBack, onLogin, onUpgrade }: AccountScreenProps) {
  const { licenseKey, removeLicense, tier } = useLicense();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const hasLicense = !!licenseKey;
  const isPro = tier === 'premium';

  // Handle external link clicks
  const handleLinkClick = (url: string, eventName: string) => {
    trackEvent(eventName);
    if (url.startsWith('mailto:')) {
      try {
        // Primary approach
        window.location.href = url;
      } catch {
        // Fallback: programmatically click an anchor
        const a = document.createElement('a');
        a.href = url;
        a.target = '_self';
        a.rel = 'noopener noreferrer';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } else {
      window.open(url, '_blank');
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    trackEvent('sign_out_clicked');

    console.log('[AccountScreen] Starting sign out process');

    // Remove license FIRST and wait for it to complete
    await removeLicense();
    setShowSignOutConfirm(false);

    console.log('[AccountScreen] License removed, dispatching auth-state-changed event');

    // Then dispatch auth state change so listeners see the updated state
    window.dispatchEvent(new Event('auth-state-changed'));

    console.log('[AccountScreen] Event dispatched');
  };

  return (
    <div className="min-h-screen bg-[var(--framer-color-bg)] flex flex-col">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-20 px-4 h-14 flex items-center gap-3 bg-[var(--framer-color-bg)] border-b border-[var(--framer-color-divider)]">
        <Button onClick={onBack} size="icon" variant="ghost">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-base font-semibold text-[var(--framer-color-text-primary)]">
          Account
        </h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
          
          {/* Account Status Section */}
          {hasLicense ? (
            // Logged In State
            <Card className="p-5 border-green-500/30 bg-green-500/5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-base font-semibold text-[var(--framer-color-text-primary)]">
                      Pro Account Active
                    </h2>
                    <Badge variant="success" className="text-[10px] px-2 py-0">
                      Pro
                    </Badge>
                  </div>
                  <p className="text-sm text-[var(--framer-color-text-secondary)]">
                    Unlimited access to all features
                  </p>
                </div>
              </div>


              {/* Sign Out Button */}
              <div className="pt-4 border-t border-[var(--framer-color-divider)]">
                {!showSignOutConfirm ? (
                  <Button
                    onClick={() => setShowSignOutConfirm(true)}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-center"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-[var(--framer-color-text-primary)] font-medium">
                      Are you sure you want to sign out?
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setShowSignOutConfirm(false)}
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSignOut}
                        variant="danger"
                        size="sm"
                        className="flex-1"
                      >
                        Sign Out
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            // Not Logged In State
            <Card className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-[#0099FF]/10 border border-[#0099FF]/20">
                <User className="w-6 h-6 text-[#0099FF]" />
              </div>

              <h2 className="text-base font-semibold text-[var(--framer-color-text-primary)] mb-1">
                Get Started
              </h2>
              <p className="text-sm text-[var(--framer-color-text-secondary)] mb-5">
                Sign in to unlock all features
              </p>

              <Button
                onClick={onLogin}
                size="md"
                className="w-full"
              >
                Sign In
              </Button>
            </Card>
          )}

          {/* Quick Actions Section */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-[var(--framer-color-text-secondary)] uppercase tracking-wide px-1">
              Quick Actions
            </h3>

            {!hasLicense && (
              <Card
                className="p-4 cursor-pointer hover:border-[#0099FF]/30 hover:bg-[#0099FF]/5 transition-colors"
                onClick={() => {
                  handleLinkClick(LINKS.polar.purchase, 'get_free_trial_clicked');
                  if (onUpgrade) onUpgrade();
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0099FF]/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-[#0099FF]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-[var(--framer-color-text-primary)]">
                      Get a License
                    </p>
                    <p className="text-xs text-[var(--framer-color-text-secondary)] mt-0.5">
                      Unlock all premium features
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--framer-color-text-tertiary)] shrink-0" />
                </div>
              </Card>
            )}

            {hasLicense && (
              <Card
                className="p-4 cursor-pointer hover:border-[#0099FF]/30 hover:bg-[#0099FF]/5 transition-colors"
                onClick={() => handleLinkClick(LINKS.polar.portal, 'manage_subscription_clicked')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0099FF]/10 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-[#0099FF]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-[var(--framer-color-text-primary)]">
                      Manage Subscription
                    </p>
                    <p className="text-xs text-[var(--framer-color-text-secondary)] mt-0.5">
                      Update billing, plan and invoices
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--framer-color-text-tertiary)] shrink-0" />
                </div>
              </Card>
            )}
          </section>

          {/* Resources Section */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-[var(--framer-color-text-secondary)] uppercase tracking-wide px-1">
              Resources
            </h3>

            <Card className="divide-y divide-[var(--framer-color-divider)]">
              {/* Visit Website */}
              <button
                onClick={() => handleLinkClick(LINKS.website, 'visit_website_clicked')}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--framer-color-bg-secondary)] transition-colors text-left first:rounded-t-lg last:rounded-b-lg"
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-[var(--framer-color-text-secondary)]" />
                  <span className="text-sm font-medium text-[var(--framer-color-text-primary)]">
                    Visit Website
                  </span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[var(--framer-color-text-tertiary)]" />
              </button>

              {/* Get Support */}
              <button
                onClick={() => {
                  trackEvent('get_support_clicked');
                  const supportEmail = LINKS.support.email;
                  const mailto = `mailto:${supportEmail}`;
                  const composeUrl = LINKS.support.getEmailComposeUrl(supportEmail);
                  const openURL = (framer as any)?.openURL;

                  if (typeof openURL === 'function') {
                    openURL(composeUrl);
                  } else {
                    try {
                      window.open(composeUrl, '_blank', 'noopener,noreferrer');
                    } catch {
                      // Ignore and fall back to mailto
                    }
                  }

                  // Trigger native mail client as a secondary attempt
                  setTimeout(() => {
                    try {
                      window.location.href = mailto;
                    } catch {
                      const link = document.createElement('a');
                      link.href = mailto;
                      link.style.display = 'none';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  }, 200);
                }}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--framer-color-bg-secondary)] transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-4 h-4 text-[var(--framer-color-text-secondary)]" />
                  <span className="text-sm font-medium text-[var(--framer-color-text-primary)]">
                    Get Support
                  </span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[var(--framer-color-text-tertiary)]" />
              </button>

              {/* Purchase License (hidden when logged in) */}
              {!hasLicense && (
                <button
                  onClick={() => handleLinkClick(LINKS.polar.purchase, 'purchase_license_clicked')}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--framer-color-bg-secondary)] transition-colors text-left last:rounded-b-lg"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="w-4 h-4 text-[var(--framer-color-text-secondary)]" />
                    <span className="text-sm font-medium text-[var(--framer-color-text-primary)]">
                      Purchase License
                    </span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-[var(--framer-color-text-tertiary)]" />
                </button>
              )}
            </Card>
          </section>

          {/* Legal Section */}
          <section className="space-y-3 pb-6">
            <h3 className="text-xs font-semibold text-[var(--framer-color-text-secondary)] uppercase tracking-wide px-1">
              Legal
            </h3>

            <Card className="divide-y divide-[var(--framer-color-divider)]">
              {/* Terms of Service */}
              <button
                onClick={() => handleLinkClick(LINKS.legal.terms, 'terms_clicked')}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--framer-color-bg-secondary)] transition-colors text-left first:rounded-t-lg"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-[var(--framer-color-text-secondary)]" />
                  <span className="text-sm font-medium text-[var(--framer-color-text-primary)]">
                    Terms of Service
                  </span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[var(--framer-color-text-tertiary)]" />
              </button>

              {/* Privacy Policy */}
              <button
                onClick={() => handleLinkClick(LINKS.legal.privacy, 'privacy_clicked')}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--framer-color-bg-secondary)] transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-[var(--framer-color-text-secondary)]" />
                  <span className="text-sm font-medium text-[var(--framer-color-text-primary)]">
                    Privacy Policy
                  </span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[var(--framer-color-text-tertiary)]" />
              </button>

              {/* EULA */}
              <button
                onClick={() => handleLinkClick(LINKS.legal.eula, 'eula_clicked')}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--framer-color-bg-secondary)] transition-colors text-left last:rounded-b-lg"
              >
                <div className="flex items-center gap-3">
                  <ScrollText className="w-4 h-4 text-[var(--framer-color-text-secondary)]" />
                  <span className="text-sm font-medium text-[var(--framer-color-text-primary)]">
                    End User License Agreement
                  </span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[var(--framer-color-text-tertiary)]" />
              </button>
            </Card>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[var(--framer-color-divider)] px-4 py-5 bg-[var(--framer-color-bg)]">
        <p className="text-xs text-center text-[var(--framer-color-text-tertiary)] leading-relaxed">
          © 2025 Your Plugin Name. All rights reserved.
        </p>
        <p className="text-xs text-center mt-2">
          <a
            href={LINKS.boilerplate}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--framer-color-text-tertiary)] hover:text-[var(--framer-color-text-secondary)] transition-colors"
          >
            Made by Your Name
          </a>
        </p>
      </footer>
    </div>
  );
}
