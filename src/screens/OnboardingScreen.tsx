import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { framer } from "framer-plugin";
import PageContainer from "../components/page-container";
import Button from "../components/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/card";
import { Stepper } from "../components/stepper";
import Input from "../components/input";
import { Checkbox } from "../components/checkbox";
import { useNavigation } from "../navigation";
import { storage } from "../lib/config/localStorage";
import {
  Rocket,
  Palette,
  Zap,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from "lucide-react";

const TOTAL_STEPS = 4;

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(1);
  const [userName, setUserName] = useState("");
  const [preferences, setPreferences] = useState({
    notifications: true,
    analytics: true,
    darkMode: false
  });

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Save onboarding completion
    localStorage.setItem('onboarding_completed', 'true');
    if (userName) {
      localStorage.setItem('user_name', userName);
    }
    framer.notify("Welcome! You're all set to get started.", { variant: "success" });
    navigation.navigate('Dashboard');
  };

  const canProceed = () => {
    if (currentStep === 2 && !userName.trim()) {
      return false;
    }
    return true;
  };

  const steps = [
    { number: 1, label: "Welcome" },
    { number: 2, label: "Profile" },
    { number: 3, label: "Preferences" },
    { number: 4, label: "Complete" }
  ];

  return (
    <PageContainer
      appBar={{
        title: "Get Started",
        showBackButton: true,
        onBack: () => navigation.goBack()
      }}
    >
      {/* Progress Stepper */}
      <Card>
        <CardContent className="pt-6 pb-6">
          <Stepper steps={steps} currentStep={currentStep} />
        </CardContent>
      </Card>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 rounded-full bg-blue-500/10">
                    <Rocket className="w-12 h-12 text-blue-600" />
                  </div>
                </div>
                <CardTitle className="text-center text-blue-900">
                  Welcome to Your Plugin
                </CardTitle>
                <CardDescription className="text-center text-blue-700">
                  Let's get you set up in just a few steps
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50">
                    <Palette className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm text-blue-900">
                        Beautiful Components
                      </h4>
                      <p className="text-xs text-blue-700 mt-1">
                        20+ pre-built UI components ready to use
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50">
                    <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm text-blue-900">
                        Fast Development
                      </h4>
                      <p className="text-xs text-blue-700 mt-1">
                        Built-in authentication, navigation, and analytics
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50">
                    <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm text-blue-900">
                        Production Ready
                      </h4>
                      <p className="text-xs text-blue-700 mt-1">
                        Payment integration and user management included
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Set Up Your Profile</CardTitle>
                <CardDescription>
                  Tell us a bit about yourself
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--framer-color-text-primary)]">
                    Your Name
                  </label>
                  <Input
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    autoFocus
                  />
                  <p className="text-xs text-[var(--framer-color-text-tertiary)]">
                    This helps us personalize your experience
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Customize Your Experience</CardTitle>
                <CardDescription>
                  Choose your preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="notifications"
                      checked={preferences.notifications}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, notifications: checked as boolean })
                      }
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="notifications"
                        className="text-sm font-medium text-[var(--framer-color-text-primary)] cursor-pointer"
                      >
                        Enable Notifications
                      </label>
                      <p className="text-xs text-[var(--framer-color-text-tertiary)] mt-1">
                        Get notified about important updates and changes
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="analytics"
                      checked={preferences.analytics}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, analytics: checked as boolean })
                      }
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="analytics"
                        className="text-sm font-medium text-[var(--framer-color-text-primary)] cursor-pointer"
                      >
                        Help Improve the Product
                      </label>
                      <p className="text-xs text-[var(--framer-color-text-tertiary)] mt-1">
                        Share anonymous usage data to help us improve
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="darkMode"
                      checked={preferences.darkMode}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, darkMode: checked as boolean })
                      }
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="darkMode"
                        className="text-sm font-medium text-[var(--framer-color-text-primary)] cursor-pointer"
                      >
                        Dark Mode
                      </label>
                      <p className="text-xs text-[var(--framer-color-text-tertiary)] mt-1">
                        Use dark theme (follows Framer theme by default)
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {currentStep === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 rounded-full bg-green-500/10">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-center text-green-900">
                  You're All Set!
                </CardTitle>
                <CardDescription className="text-center text-green-700">
                  {userName ? `Welcome aboard, ${userName}!` : 'Welcome aboard!'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-white/50">
                  <h4 className="font-semibold text-sm text-green-900 mb-3">
                    What's Next?
                  </h4>
                  <ul className="space-y-2 text-sm text-green-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Explore the component showcase
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Check out the settings page
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Start building your plugin
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="secondary"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1"
            >
              {currentStep === TOTAL_STEPS ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Complete
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
