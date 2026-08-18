import { framer } from "framer-plugin";
import PageContainer from "../components/page-container";
import Button from "../components/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/card";
import { Badge } from "../components/badge";
import { Separator } from "../components/separator";
import { LicenseActivation } from "../components/LicenseActivation";
import { storage } from "../lib/config/localStorage";
import { ExternalLink, Info, Heart, Sparkles } from "lucide-react";

// Import version from package.json at build time
const PLUGIN_VERSION = "1.0.0";

export default function Settings() {
  // Feature-based licensing: no check counting
  // const totalChecks = 0;

  const handleOpenDocs = () => {
    framer.openURL("https://developers.google.com/speed/docs/insights/v5/get-started");
  };

  const handleOpenGitHub = () => {
    framer.notify("GitHub repository coming soon!");
  };

  return (
    <PageContainer
      appBar={{
        title: "Settings",
      }}
    >
      {/* License Management */}
      <LicenseActivation />
      
      {/* Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-[var(--framer-color-text-secondary)]">
              Statistics tracking removed in feature-based licensing.
              View your account tier in the Account screen.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Separator />

      {/* Plugin Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#0099FF]" />
              <CardTitle>Template Checker</CardTitle>
            </div>
            <Badge variant="outline">v{PLUGIN_VERSION}</Badge>
          </div>
          <CardDescription>
            Validate your Framer templates for marketplace readiness
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-[var(--framer-color-text-secondary)] leading-relaxed">
              Template Checker helps you ensure your Framer templates meet all marketplace requirements 
              with automated checks for performance, SEO, accessibility, and responsiveness.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <button
              onClick={handleOpenDocs}
              className="flex items-center justify-between w-full p-3 rounded-md hover:bg-[var(--framer-color-bg-secondary)] transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-[var(--framer-color-bg-tertiary)]">
                  <Info className="w-4 h-4 text-[var(--framer-color-text-secondary)]" />
                </div>
                <div>
                  <div className="text-sm font-medium text-[var(--framer-color-text-primary)]">
                    Documentation
                  </div>
                  <div className="text-xs text-[var(--framer-color-text-tertiary)]">
                    Learn how to use the plugin
                  </div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-[var(--framer-color-text-tertiary)]" />
            </button>

            <button
              onClick={handleOpenGitHub}
              className="flex items-center justify-between w-full p-3 rounded-md hover:bg-[var(--framer-color-bg-secondary)] transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-[var(--framer-color-bg-tertiary)]">
                  <ExternalLink className="w-4 h-4 text-[var(--framer-color-text-secondary)]" />
                </div>
                <div>
                  <div className="text-sm font-medium text-[var(--framer-color-text-primary)]">
                    GitHub Repository
                  </div>
                  <div className="text-xs text-[var(--framer-color-text-tertiary)]">
                    View source code and report issues
                  </div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-[var(--framer-color-text-tertiary)]" />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                icon: "✅",
                title: "Marketplace Compliance",
                description: "28 checks across 10 categories"
              },
              {
                icon: "⚡",
                title: "Performance Analysis",
                description: "Core Web Vitals and loading speed checks"
              },
              {
                icon: "🔍",
                title: "SEO Validation",
                description: "Meta tags, Open Graph, and sitemap verification"
              },
              {
                icon: "♿",
                title: "Accessibility Testing",
                description: "WCAG 2.1 compliance and screen reader support"
              },
              {
                icon: "📱",
                title: "Responsive Design",
                description: "Multi-device layout testing across breakpoints"
              }
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="text-xl">{feature.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[var(--framer-color-text-primary)]">
                    {feature.title}
                  </div>
                  <div className="text-xs text-[var(--framer-color-text-secondary)]">
                    {feature.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Credits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" />
            Credits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <div className="font-medium text-[var(--framer-color-text-primary)] mb-1">
                Built with
              </div>
              <div className="text-xs text-[var(--framer-color-text-secondary)] space-y-0.5">
                <div>• Framer Plugin SDK</div>
                <div>• React & TypeScript</div>
                <div>• Tailwind CSS</div>
                <div>• Framer Motion</div>
                <div>• Radix UI</div>
                <div>• Lucide Icons</div>
              </div>
            </div>

            <Separator />

            <div>
              <div className="font-medium text-[var(--framer-color-text-primary)] mb-1">
                Design System
              </div>
              <div className="text-xs text-[var(--framer-color-text-secondary)]">
                Based on the Framer Plugin Boilerplate by{" "}
                <button
                  onClick={() => framer.notify("Opening boilerplate repo...")}
                  className="text-[#0099FF] hover:underline"
                >
                  @mehmetext
                </button>
              </div>
            </div>

            <Separator />

            <div className="text-xs text-[var(--framer-color-text-tertiary)] text-center pt-2">
              Made with ❤️ for the Framer community
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card className="border-[var(--framer-color-divider)]">
        <CardContent className="pt-4">
          <div className="space-y-2 text-xs text-[var(--framer-color-text-tertiary)]">
            <div className="flex justify-between">
              <span>Plugin Version</span>
              <span className="font-mono">{PLUGIN_VERSION}</span>
            </div>
            <div className="flex justify-between">
              <span>Environment</span>
              <span className="font-mono">Framer</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
