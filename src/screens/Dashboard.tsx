import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PageContainer from "../components/page-container";
import Button from "../components/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/card";
import { Badge } from "../components/badge";
import { Separator } from "../components/separator";
import { Alert, AlertTitle, AlertDescription } from "../components/alert";
import Input from "../components/input";
import { Checkbox } from "../components/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../components/accordion";
import { Progress } from "../components/progress";
import { Spinner } from "../components/spinner";
import { Skeleton } from "../components/skeleton";
import { ProStatusCard } from "../components/ProStatusCard";
import { useNavigation } from "../navigation";
import { storage } from "../lib/config/localStorage";
import { LINKS } from "../config/links";
import {
  User,
  Sparkles,
  Palette,
  Layout,
  MessageCircle,
  Zap,
  Check,
  AlertCircle,
  Info,
  AlertTriangle,
  ChevronRight,
  Settings,
  HelpCircle,
  Rocket
} from "lucide-react";

export default function Dashboard() {
  const navigation = useNavigation();
  const [hasLicense, setHasLicense] = useState(storage.hasValidLicense());
  const [checkboxState, setCheckboxState] = useState(false);
  const [progress, setProgress] = useState(65);

  // Check license state on mount, auth changes, and visibility changes
  useEffect(() => {
    // Check on mount
    const checkLicenseState = () => {
      const currentLicenseState = storage.hasValidLicense();
      console.log('[Dashboard] Checking license state:', currentLicenseState);
      setHasLicense(currentLicenseState);
    };

    // Check immediately on mount
    checkLicenseState();

    // Listen for auth state changes (login/logout)
    const handleAuthChange = () => {
      console.log('[Dashboard] Auth state changed, checking license');
      checkLicenseState();
    };

    // Listen for browser tab visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('[Dashboard] Tab became visible, checking license');
        checkLicenseState();
      }
    };

    window.addEventListener('auth-state-changed', handleAuthChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('auth-state-changed', handleAuthChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleAccountClick = () => {
    navigation.navigate('AccountScreen');
  };

  const handleFreeTrialClick = () => {
    window.open(LINKS.polar.purchase, '_blank');
  };

  const quickActions = [
    {
      icon: <Rocket className="w-5 h-5" />,
      title: "Get Started",
      description: "Multi-step onboarding flow",
      onClick: () => navigation.navigate('OnboardingScreen'),
      color: "from-blue-500/10 to-cyan-500/10 border-blue-500/20"
    },
    {
      icon: <Settings className="w-5 h-5" />,
      title: "Settings",
      description: "Configure your preferences",
      onClick: () => navigation.navigate('SettingsScreen'),
      color: "from-purple-500/10 to-pink-500/10 border-purple-500/20"
    },
    {
      icon: <HelpCircle className="w-5 h-5" />,
      title: "Help & Docs",
      description: "FAQ and documentation",
      onClick: () => navigation.navigate('HelpScreen'),
      color: "from-orange-500/10 to-yellow-500/10 border-orange-500/20"
    }
  ];

  return (
    <PageContainer
      appBar={{
        title: "Component Showcase",
        showBackButton: false,
        actions: (
          <div className="flex items-center gap-2">
            {!hasLicense && (
              <Button
                size="md"
                variant="primary"
                onClick={handleFreeTrialClick}
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Get a License</span>
              </Button>
            )}
            <Button
              size="icon"
              variant="secondary"
              onClick={handleAccountClick}
            >
              <User className="w-4 h-4" />
            </Button>
          </div>
        ),
      }}
    >
      {/* License Status */}
      {hasLicense ? (
        <ProStatusCard />
      ) : (
        <Alert className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <Zap size={16} color="#0099FF" />
          <AlertTitle className="text-blue-900">Free tier</AlertTitle>
          <AlertDescription className="text-blue-700">
            Upgrade to Pro for unlimited access and premium features
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--framer-color-text-primary)] mb-3 px-1">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card
                className={`cursor-pointer hover:shadow-md transition-all bg-gradient-to-br ${action.color}`}
                onClick={action.onClick}
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/50">
                        {action.icon}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[var(--framer-color-text-primary)]">
                          {action.title}
                        </h4>
                        <p className="text-xs text-[var(--framer-color-text-tertiary)] mt-0.5">
                          {action.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[var(--framer-color-text-tertiary)]" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Component Categories */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--framer-color-text-primary)] mb-3 px-1 flex items-center gap-2">
          <Palette className="w-4 h-4" />
          UI Components
        </h3>

        <Tabs defaultValue="buttons" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="buttons">Buttons</TabsTrigger>
            <TabsTrigger value="forms">Forms</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="buttons" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Button Variants</CardTitle>
                <CardDescription>Different button styles for various use cases</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button disabled>Disabled</Button>
                  <Button>
                    <Sparkles className="w-4 h-4" />
                    With Icon
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Badges</CardTitle>
                <CardDescription>Status indicators and labels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="destructive">Error</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forms" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Form Inputs</CardTitle>
                <CardDescription>Text inputs and form controls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[var(--framer-color-text-secondary)]">
                    Text Input
                  </label>
                  <Input placeholder="Enter text here..." />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[var(--framer-color-text-secondary)]">
                    Email Input
                  </label>
                  <Input type="email" placeholder="email@example.com" />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={checkboxState}
                    onCheckedChange={(checked) => setCheckboxState(checked as boolean)}
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-[var(--framer-color-text-primary)] cursor-pointer"
                  >
                    Accept terms and conditions
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progress Indicator</CardTitle>
                <CardDescription>Visual progress tracking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Progress value={progress} />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setProgress(Math.max(0, progress - 10))}>
                    Decrease
                  </Button>
                  <Button size="sm" onClick={() => setProgress(Math.min(100, progress + 10))}>
                    Increase
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Alerts</CardTitle>
                <CardDescription>Contextual feedback messages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Information</AlertTitle>
                  <AlertDescription>
                    This is an informational alert message.
                  </AlertDescription>
                </Alert>

                <Alert className="bg-green-50 border-green-200">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-900">Success</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Operation completed successfully!
                  </AlertDescription>
                </Alert>

                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertTitle className="text-yellow-900">Warning</AlertTitle>
                  <AlertDescription className="text-yellow-700">
                    Please review this warning message.
                  </AlertDescription>
                </Alert>

                <Alert className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-red-900">Error</AlertTitle>
                  <AlertDescription className="text-red-700">
                    An error occurred during the operation.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Loading States</CardTitle>
                <CardDescription>Spinners and skeletons</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Spinner size="sm" />
                  <Spinner size="md" />
                  <Spinner size="lg" />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Separator />

      {/* Accordion Example */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="w-4 h-4" />
            Accordion Component
          </CardTitle>
          <CardDescription>Collapsible content sections</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>What is this boilerplate?</AccordionTrigger>
              <AccordionContent>
                A comprehensive Framer plugin boilerplate with authentication, navigation,
                analytics, and a complete UI component library built with Shadcn and Radix UI.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>What's included?</AccordionTrigger>
              <AccordionContent>
                Polar.sh payment integration, PostHog analytics, type-safe navigation system,
                20+ reusable UI components, and example screens for common use cases.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>How do I customize it?</AccordionTrigger>
              <AccordionContent>
                Update the branding in framer.json, configure your Polar.sh and PostHog keys,
                and start building your plugin features using the existing components and patterns.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Navigation Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Example Screens
          </CardTitle>
          <CardDescription>Navigate to different screen examples</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="secondary"
            className="w-full justify-between"
            onClick={() => navigation.navigate('Home')}
          >
            <span>Component Library</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            className="w-full justify-between"
            onClick={() => navigation.navigate('Example')}
          >
            <span>More Examples</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>

    </PageContainer>
  );
}
