import { useState } from "react";
import { framer } from "framer-plugin";
import PageContainer from "../components/page-container";
import Button from "../components/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/card";
import { Separator } from "../components/separator";
import Input from "../components/input";
import Textarea from "../components/textarea";
import { Checkbox } from "../components/checkbox";
import { Alert, AlertDescription } from "../components/alert";
import { useNavigation } from "../navigation";
import {
  Settings as SettingsIcon,
  Bell,
  Palette,
  Shield,
  Save,
  RotateCcw,
  Info
} from "lucide-react";

export default function SettingsScreen() {
  const navigation = useNavigation();

  // Load saved settings or use defaults
  const [settings, setSettings] = useState({
    // General Settings
    userName: localStorage.getItem('user_name') || '',
    email: localStorage.getItem('user_email') || '',
    language: localStorage.getItem('language') || 'en',

    // Appearance
    theme: localStorage.getItem('theme') || 'auto',
    compactMode: localStorage.getItem('compact_mode') === 'true',

    // Notifications
    enableNotifications: localStorage.getItem('notifications') !== 'false',
    emailNotifications: localStorage.getItem('email_notifications') === 'true',
    desktopNotifications: localStorage.getItem('desktop_notifications') !== 'false',

    // Privacy & Data
    analytics: localStorage.getItem('analytics') !== 'false',
    crashReports: localStorage.getItem('crash_reports') !== 'false',
    shareData: localStorage.getItem('share_data') === 'true',

    // Advanced
    developerMode: localStorage.getItem('developer_mode') === 'true',
    experimentalFeatures: localStorage.getItem('experimental_features') === 'true',
    customApiEndpoint: localStorage.getItem('custom_api_endpoint') || '',
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
    setHasChanges(true);
  };

  const handleSave = () => {
    // Save all settings to localStorage
    Object.entries(settings).forEach(([key, value]) => {
      localStorage.setItem(key.replace(/([A-Z])/g, '_$1').toLowerCase(), String(value));
    });

    setHasChanges(false);
    framer.notify("Settings saved successfully!", { variant: "success" });
  };

  const handleReset = () => {
    // Reset to defaults
    const defaults = {
      userName: '',
      email: '',
      language: 'en',
      theme: 'auto',
      compactMode: false,
      enableNotifications: true,
      emailNotifications: false,
      desktopNotifications: true,
      analytics: true,
      crashReports: true,
      shareData: false,
      developerMode: false,
      experimentalFeatures: false,
      customApiEndpoint: '',
    };

    setSettings(defaults);
    setHasChanges(true);
    framer.notify("Settings reset to defaults", { variant: "info" });
  };

  return (
    <PageContainer
      appBar={{
        title: "Settings",
        showBackButton: true,
        onBack: () => navigation.goBack()
      }}
    >
      {hasChanges && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            You have unsaved changes. Click "Save Settings" to apply them.
          </AlertDescription>
        </Alert>
      )}

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4" />
            General
          </CardTitle>
          <CardDescription>Basic account and application settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--framer-color-text-primary)]">
              Display Name
            </label>
            <Input
              placeholder="Enter your name"
              value={settings.userName}
              onChange={(e) => handleChange('userName', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--framer-color-text-primary)]">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={settings.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
            <p className="text-xs text-[var(--framer-color-text-tertiary)]">
              Used for notifications and account recovery
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--framer-color-text-primary)]">
              Language
            </label>
            <select
              className="w-full px-3 py-2 rounded-md border border-[var(--framer-color-divider)] bg-[var(--framer-color-bg)] text-[var(--framer-color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[#0099FF]"
              value={settings.language}
              onChange={(e) => handleChange('language', e.target.value)}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="ja">日本語</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Appearance
          </CardTitle>
          <CardDescription>Customize how the plugin looks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--framer-color-text-primary)]">
              Theme
            </label>
            <select
              className="w-full px-3 py-2 rounded-md border border-[var(--framer-color-divider)] bg-[var(--framer-color-bg)] text-[var(--framer-color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[#0099FF]"
              value={settings.theme}
              onChange={(e) => handleChange('theme', e.target.value)}
            >
              <option value="auto">Auto (Follow Framer)</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm font-medium text-[var(--framer-color-text-primary)]">
                Compact Mode
              </label>
              <p className="text-xs text-[var(--framer-color-text-tertiary)] mt-1">
                Reduce spacing for a more compact interface
              </p>
            </div>
            <Checkbox
              checked={settings.compactMode}
              onCheckedChange={(checked) => handleChange('compactMode', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </CardTitle>
          <CardDescription>Manage how you receive updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm font-medium text-[var(--framer-color-text-primary)]">
                Enable Notifications
              </label>
              <p className="text-xs text-[var(--framer-color-text-tertiary)] mt-1">
                Master toggle for all notifications
              </p>
            </div>
            <Checkbox
              checked={settings.enableNotifications}
              onCheckedChange={(checked) => handleChange('enableNotifications', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between opacity-100">
            <div className="flex-1">
              <label className="text-sm font-medium text-[var(--framer-color-text-primary)]">
                Email Notifications
              </label>
              <p className="text-xs text-[var(--framer-color-text-tertiary)] mt-1">
                Receive updates via email
              </p>
            </div>
            <Checkbox
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => handleChange('emailNotifications', checked)}
              disabled={!settings.enableNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm font-medium text-[var(--framer-color-text-primary)]">
                Desktop Notifications
              </label>
              <p className="text-xs text-[var(--framer-color-text-tertiary)] mt-1">
                Show notifications in the app
              </p>
            </div>
            <Checkbox
              checked={settings.desktopNotifications}
              onCheckedChange={(checked) => handleChange('desktopNotifications', checked)}
              disabled={!settings.enableNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Privacy & Data
          </CardTitle>
          <CardDescription>Control your data and privacy preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm font-medium text-[var(--framer-color-text-primary)]">
                Analytics
              </label>
              <p className="text-xs text-[var(--framer-color-text-tertiary)] mt-1">
                Help improve the product with anonymous usage data
              </p>
            </div>
            <Checkbox
              checked={settings.analytics}
              onCheckedChange={(checked) => handleChange('analytics', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm font-medium text-[var(--framer-color-text-primary)]">
                Crash Reports
              </label>
              <p className="text-xs text-[var(--framer-color-text-tertiary)] mt-1">
                Automatically send crash reports to help us fix bugs
              </p>
            </div>
            <Checkbox
              checked={settings.crashReports}
              onCheckedChange={(checked) => handleChange('crashReports', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm font-medium text-[var(--framer-color-text-primary)]">
                Share Usage Data
              </label>
              <p className="text-xs text-[var(--framer-color-text-tertiary)] mt-1">
                Share detailed usage patterns with third parties
              </p>
            </div>
            <Checkbox
              checked={settings.shareData}
              onCheckedChange={(checked) => handleChange('shareData', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Advanced */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced</CardTitle>
          <CardDescription>Developer and experimental features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm font-medium text-[var(--framer-color-text-primary)]">
                Developer Mode
              </label>
              <p className="text-xs text-[var(--framer-color-text-tertiary)] mt-1">
                Enable developer tools and debugging features
              </p>
            </div>
            <Checkbox
              checked={settings.developerMode}
              onCheckedChange={(checked) => handleChange('developerMode', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm font-medium text-[var(--framer-color-text-primary)]">
                Experimental Features
              </label>
              <p className="text-xs text-[var(--framer-color-text-tertiary)] mt-1">
                Try out new features before they're released
              </p>
            </div>
            <Checkbox
              checked={settings.experimentalFeatures}
              onCheckedChange={(checked) => handleChange('experimentalFeatures', checked)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--framer-color-text-primary)]">
              Custom API Endpoint
            </label>
            <Textarea
              placeholder="https://api.example.com"
              value={settings.customApiEndpoint}
              onChange={(e) => handleChange('customApiEndpoint', e.target.value)}
              rows={2}
            />
            <p className="text-xs text-[var(--framer-color-text-tertiary)]">
              Override the default API endpoint (for advanced users only)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex-1"
            >
              <Save className="w-4 h-4" />
              Save Settings
            </Button>
            <Button
              variant="secondary"
              onClick={handleReset}
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
