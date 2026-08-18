import { framer } from "framer-plugin";
import Button from "../components/button";
import PageContainer from "../components/page-container";
import { useNavigation } from "../navigation";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter 
} from "../components/card";
import { Badge } from "../components/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/tabs";
import { Progress } from "../components/progress";
import { Alert, AlertTitle, AlertDescription } from "../components/alert";
import { Separator } from "../components/separator";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../components/accordion";
import { Skeleton } from "../components/skeleton";
import { Code, CheckCircle2, AlertCircle, Info, Sparkles, LayoutDashboard } from "lucide-react";

export default function Home() {
  const navigation = useNavigation();

  return (
    <PageContainer
      appBar={{
        title: "Component Showcase",
        actions: (
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="secondary"
              onClick={() => navigation.navigate("Dashboard")}
            >
              <LayoutDashboard className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              onClick={() => navigation.navigate("Example")}
            >
              <Code className="w-4 h-4" />
            </Button>
          </div>
        ),
      }}
    >
      {/* Hero Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#0099FF]" />
            <CardTitle>Welcome to Template Checker</CardTitle>
          </div>
          <CardDescription>
            Validate your Framer templates for marketplace readiness
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--framer-color-text-secondary)]">Overall Score</span>
              <span className="font-semibold text-[#0099FF]">85%</span>
            </div>
            <Progress value={85} />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Badge variant="default">Performance</Badge>
            <Badge variant="success">SEO Ready</Badge>
            <Badge variant="warning">2 Issues</Badge>
            <Badge variant="secondary">Accessibility</Badge>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full"
            onClick={() => framer.notify("Running template checks...")}
          >
            Run Full Check
          </Button>
        </CardFooter>
      </Card>

      {/* Alerts Section */}
      <div className="space-y-2">
        <Alert variant="info">
          <Info className="h-4 w-4" />
          <AlertTitle>Pro Tip</AlertTitle>
          <AlertDescription>
            Run checks before submitting to the marketplace to ensure compliance.
          </AlertDescription>
        </Alert>

        <Alert variant="success">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>All Clear!</AlertTitle>
          <AlertDescription>
            Your template passes all performance checks.
          </AlertDescription>
        </Alert>

        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Minor Issues Found</AlertTitle>
          <AlertDescription>
            2 images could be optimized for better performance.
          </AlertDescription>
        </Alert>
      </div>

      <Separator />

      {/* Tabs Section */}
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="checks" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="checks" className="flex-1">Checks</TabsTrigger>
              <TabsTrigger value="results" className="flex-1">Results</TabsTrigger>
              <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="checks" className="space-y-2">
              <p className="text-sm text-[var(--framer-color-text-secondary)]">
                Configure which checks to run on your template.
              </p>
              <div className="space-y-1">
                <div className="flex items-center justify-between p-2 rounded-md hover:bg-[var(--framer-color-bg-secondary)]">
                  <span className="text-sm">Performance Audit</span>
                  <Badge variant="default">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded-md hover:bg-[var(--framer-color-bg-secondary)]">
                  <span className="text-sm">SEO Analysis</span>
                  <Badge variant="default">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded-md hover:bg-[var(--framer-color-bg-secondary)]">
                  <span className="text-sm">Accessibility Check</span>
                  <Badge variant="secondary">Disabled</Badge>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="results" className="space-y-2">
              <p className="text-sm text-[var(--framer-color-text-secondary)]">
                View detailed results from your last template check.
              </p>
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </TabsContent>
            <TabsContent value="settings">
              <p className="text-sm text-[var(--framer-color-text-secondary)]">
                Customize your template checking preferences.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Accordion Section */}
      <Card>
        <CardHeader>
          <CardTitle>Common Issues</CardTitle>
          <CardDescription>
            Learn how to fix the most common template issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Image Optimization</AccordionTrigger>
              <AccordionContent>
                Compress and optimize images to reduce load times. Use modern formats like WebP when possible.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Missing Meta Tags</AccordionTrigger>
              <AccordionContent>
                Ensure all pages have proper title, description, and Open Graph tags for better SEO and social sharing.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Accessibility Issues</AccordionTrigger>
              <AccordionContent>
                Add alt text to images, ensure proper heading hierarchy, and maintain sufficient color contrast.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Status Cards Grid */}
      <div className="grid grid-cols-2 gap-2">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-[#0099FF]">98</div>
              <p className="text-xs text-[var(--framer-color-text-secondary)]">Performance Score</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-green-500">12</div>
              <p className="text-xs text-[var(--framer-color-text-secondary)]">Tests Passed</p>
            </div>
          </CardContent>
        </Card>
      </div>

    </PageContainer>
  );
}
