import PageContainer from "../components/page-container";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/card";
import { Badge } from "../components/badge";
import { ScrollArea } from "../components/scroll-area";
import { Separator } from "../components/separator";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "../components/tooltip";
import Button from "../components/button";
import Input from "../components/input";
import Select from "../components/select";
import Checkbox from "../components/checkbox";
import { Alert, AlertDescription } from "../components/alert";
import { useNavigation } from "../navigation";
import { Info, Zap, Shield, Globe, LayoutDashboard } from "lucide-react";

export default function ExampleScreen() {
  const navigation = useNavigation();

  return (
    <PageContainer 
      appBar={{ 
        title: "More Components",
        actions: (
          <Button
            size="icon"
            variant="secondary"
            onClick={() => navigation.navigate("Dashboard")}
          >
            <LayoutDashboard className="w-4 h-4" />
          </Button>
        ),
      }}
    >
      {/* Badges Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Badge Variants</CardTitle>
          <CardDescription>Different badge styles for status indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="destructive">Error</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tooltips Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Tooltips</CardTitle>
          <CardDescription>Hover over items to see tooltips</CardDescription>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="secondary">
                    <Zap className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Performance</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="secondary">
                    <Shield className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Security</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="secondary">
                    <Globe className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>SEO</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* Existing Components with Framer Theme */}
      <Card>
        <CardHeader>
          <CardTitle>Form Controls</CardTitle>
          <CardDescription>Original boilerplate components with Framer theme</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--framer-color-text-primary)]">
              Input Field
            </label>
            <Input placeholder="Enter text..." />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--framer-color-text-primary)]">
              Select Dropdown
            </label>
            <Select
              items={[
                { label: "Option 1", value: "1" },
                { label: "Option 2", value: "2" },
                { label: "Option 3", value: "3" },
              ]}
              onChange={() => {}}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="terms" />
            <label 
              htmlFor="terms"
              className="text-sm text-[var(--framer-color-text-secondary)] cursor-pointer"
            >
              I agree to the terms and conditions
            </label>
          </div>

          <Separator />

          <div className="flex gap-2">
            <Button>Primary Action</Button>
            <Button variant="secondary">Cancel</Button>
          </div>
        </CardContent>
      </Card>

      {/* Scroll Area Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Scroll Area</CardTitle>
          <CardDescription>Custom scrollable content area</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-32 w-full rounded-md border border-[var(--framer-color-divider)] p-4">
            <div className="space-y-2">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="text-sm text-[var(--framer-color-text-secondary)]">
                  Item {i + 1} - This is scrollable content
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Alert Info */}
      <Alert variant="info">
        <Info className="h-4 w-4" />
        <AlertDescription>
          All components automatically adapt to Framer's light and dark themes using CSS variables.
        </AlertDescription>
      </Alert>

      {/* Color Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Framer Blue Accent</CardTitle>
          <CardDescription>Using #0099FF throughout the interface</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[#0099FF]" />
            <div>
              <div className="font-semibold text-[#0099FF]">#0099FF</div>
              <div className="text-xs text-[var(--framer-color-text-secondary)]">Primary Accent Color</div>
            </div>
          </div>
          <Separator />
          <p className="text-sm text-[var(--framer-color-text-secondary)]">
            This color is used for primary buttons, progress bars, badges, and interactive elements.
          </p>
        </CardContent>
      </Card>

    </PageContainer>
  );
}
