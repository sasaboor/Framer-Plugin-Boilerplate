import PageContainer from "../components/page-container";
import Button from "../components/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../components/accordion";
import { Badge } from "../components/badge";
import { Separator } from "../components/separator";
import { useNavigation } from "../navigation";
import { LINKS, openLink } from "../config/links";
import {
  HelpCircle,
  Book,
  MessageCircle,
  ExternalLink,
  Mail,
  FileText,
  Code,
  Video,
  Github,
  Twitter
} from "lucide-react";

export default function HelpScreen() {
  const navigation = useNavigation();

  const resources = [
    {
      icon: <Book className="w-5 h-5" />,
      title: "Documentation",
      description: "Complete guide to using this boilerplate",
      action: "View Docs",
      onClick: () => {
        // Open documentation
        openLink(LINKS.docs.main);
      }
    },
    {
      icon: <Video className="w-5 h-5" />,
      title: "Video Tutorials",
      description: "Step-by-step video guides",
      action: "Watch Now",
      onClick: () => {
        openLink(LINKS.social.youtube);
      }
    },
    {
      icon: <Code className="w-5 h-5" />,
      title: "Code Examples",
      description: "Browse code samples and patterns",
      action: "View Examples",
      onClick: () => {
        navigation.navigate('Home');
      }
    },
    {
      icon: <Github className="w-5 h-5" />,
      title: "GitHub Repository",
      description: "Source code and issue tracker",
      action: "Open GitHub",
      onClick: () => {
        openLink(LINKS.social.github);
      }
    }
  ];

  const supportChannels = [
    {
      icon: <Mail className="w-5 h-5" />,
      title: "Email Support",
      description: "support@your-domain.com",
      badge: "24-48h response"
    },
    {
      icon: <MessageCircle className="w-5 h-5" />,
      title: "Discord Community",
      description: "Join our Discord server",
      badge: "Active"
    },
    {
      icon: <Twitter className="w-5 h-5" />,
      title: "Twitter",
      description: "@your-handle",
      badge: "Updates"
    }
  ];

  return (
    <PageContainer
      appBar={{
        title: "Help & Support",
        showBackButton: true,
        onBack: () => navigation.goBack()
      }}
    >
      {/* Quick Start */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <HelpCircle className="w-5 h-5" />
            Getting Started
          </CardTitle>
          <CardDescription className="text-blue-700">
            New to this plugin? Start here
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="primary"
            className="w-full"
            onClick={() => navigation.navigate('OnboardingScreen')}
          >
            Run Onboarding Again
          </Button>
          <Button
            variant="secondary"
            className="w-full justify-between"
            onClick={() => navigation.navigate('Dashboard')}
          >
            <span>View Component Showcase</span>
            <ExternalLink className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="faq-1">
              <AccordionTrigger>What is this boilerplate?</AccordionTrigger>
              <AccordionContent>
                This is a comprehensive Framer plugin boilerplate that includes authentication
                with Polar.sh, analytics with PostHog, a complete UI component library based
                on Shadcn and Radix UI, and a type-safe navigation system. It's designed to
                help you build professional Framer plugins faster.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-2">
              <AccordionTrigger>How do I customize the branding?</AccordionTrigger>
              <AccordionContent>
                Update the plugin name, description, and icon in the `framer.json` file.
                You can also customize colors in `tailwind.config.js` and update the logo
                images in the `public` folder.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-3">
              <AccordionTrigger>How do I set up Polar.sh payments?</AccordionTrigger>
              <AccordionContent>
                1. Create a Polar.sh account and set up your product<br/>
                2. Get your API credentials from the Polar.sh dashboard<br/>
                3. Add `VITE_POLAR_ACCESS_TOKEN`, `VITE_POLAR_ORG_ID`, and `VITE_POLAR_PRODUCT_ID` to your `.env` file<br/>
                4. Update the checkout URL in the relevant components
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-4">
              <AccordionTrigger>How do I configure PostHog analytics?</AccordionTrigger>
              <AccordionContent>
                1. Create a PostHog account (cloud or self-hosted)<br/>
                2. Get your project API key and host URL<br/>
                3. Add `VITE_POSTHOG_API_KEY` and `VITE_POSTHOG_HOST` to your `.env` file<br/>
                4. Analytics will automatically start tracking events
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-5">
              <AccordionTrigger>How do I add new screens/routes?</AccordionTrigger>
              <AccordionContent>
                1. Define your route in `src/navigation/routes.ts` in the `RouteParamList` interface<br/>
                2. Create your screen component in `src/screens/`<br/>
                3. Add a Route component in `App.tsx` that maps your route name to the screen component<br/>
                4. Use `navigation.navigate('YourRouteName')` to navigate to it
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-6">
              <AccordionTrigger>What UI components are included?</AccordionTrigger>
              <AccordionContent>
                The boilerplate includes 20+ components: Button, Card, Badge, Input, Checkbox,
                Select, Textarea, Tabs, Accordion, Progress, Alert, Spinner, Skeleton, Stepper,
                Tooltip, Separator, and more. All are built with Radix UI primitives and styled
                with Tailwind CSS. Check the Dashboard for interactive examples.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-7">
              <AccordionTrigger>How do I build and publish my plugin?</AccordionTrigger>
              <AccordionContent>
                1. Run `npm run build` to create a production build<br/>
                2. Test the plugin locally using `npm run dev`<br/>
                3. Submit your plugin through the Framer Plugin Store submission process<br/>
                4. Make sure to update all branding and remove example content first
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-8">
              <AccordionTrigger>Can I remove the license/payment system?</AccordionTrigger>
              <AccordionContent>
                Yes! If you want to create a free plugin, you can remove the Polar.sh integration
                by deleting files in `src/lib/payments/`, removing license checks from components,
                and updating the authentication logic in `App.tsx` and `LoginScreen.tsx`.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-9">
              <AccordionTrigger>Where can I get help if I'm stuck?</AccordionTrigger>
              <AccordionContent>
                Check the support channels below! We offer email support, have an active Discord
                community, and post updates on Twitter. You can also open an issue on GitHub
                for bugs or feature requests.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-10">
              <AccordionTrigger>Is this boilerplate maintained?</AccordionTrigger>
              <AccordionContent>
                Yes! We regularly update the boilerplate with new components, bug fixes, and
                improvements. Check the GitHub repository for the latest updates and star it
                to stay notified of new releases.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Separator />

      {/* Resources */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--framer-color-text-primary)] mb-3 px-1">
          Learning Resources
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {resources.map((resource) => (
            <Card
              key={resource.title}
              className="cursor-pointer hover:shadow-md transition-all"
              onClick={resource.onClick}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[var(--framer-color-bg-tertiary)]">
                      {resource.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[var(--framer-color-text-primary)]">
                        {resource.title}
                      </h4>
                      <p className="text-xs text-[var(--framer-color-text-tertiary)] mt-0.5">
                        {resource.description}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[var(--framer-color-text-tertiary)]" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Support Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Get Support
          </CardTitle>
          <CardDescription>Choose your preferred support channel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {supportChannels.map((channel) => (
            <div
              key={channel.title}
              className="flex items-center justify-between p-3 rounded-lg border border-[var(--framer-color-divider)]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--framer-color-bg-tertiary)]">
                  {channel.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-[var(--framer-color-text-primary)]">
                      {channel.title}
                    </h4>
                    <Badge variant="secondary" className="text-xs">
                      {channel.badge}
                    </Badge>
                  </div>
                  <p className="text-xs text-[var(--framer-color-text-tertiary)] mt-0.5">
                    {channel.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Version Info */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between text-xs text-[var(--framer-color-text-tertiary)]">
            <span>Version 1.0.0</span>
            <span>Built with Framer Plugin SDK</span>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
