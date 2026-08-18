# Component Usage Guide

This document provides detailed usage examples for all components in the boilerplate.

## Table of Contents

- [Layout Components](#layout-components)
- [Form Components](#form-components)
- [Feedback Components](#feedback-components)
- [Navigation Components](#navigation-components)
- [Data Display](#data-display)
- [Utilities](#utilities)

---

## Layout Components

### PageContainer

Main layout wrapper for all screens with optional app bar.

```tsx
import PageContainer from "../components/page-container";

<PageContainer
  appBar={{
    title: "My Screen",
    showBackButton: true,
    onBack: () => navigation.goBack(),
    actions: <Button>Action</Button>
  }}
>
  {/* Your content here */}
</PageContainer>
```

**Props:**
- `appBar` (optional): Configuration for the top app bar
  - `title`: string - Screen title
  - `showBackButton`: boolean - Show back button
  - `onBack`: () => void - Back button handler
  - `actions`: ReactNode - Right-side actions
- `children`: ReactNode - Page content

---

### Card

Container component for grouping related content.

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/card";

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Optional description text</CardDescription>
  </CardHeader>
  <CardContent>
    Main card content goes here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

**Variants:**
- Default card with border
- Can be customized with className for gradients

---

### Separator

Horizontal or vertical divider.

```tsx
import { Separator } from "../components/separator";

<Separator />
<Separator orientation="vertical" />
```

**Props:**
- `orientation`: "horizontal" | "vertical" (default: "horizontal")

---

## Form Components

### Button

Primary action button with multiple variants.

```tsx
import Button from "../components/button";

<Button variant="primary" onClick={handleClick}>
  Primary Button
</Button>

<Button variant="secondary" size="sm">
  Small Secondary
</Button>

<Button variant="destructive" disabled>
  Disabled Destructive
</Button>

<Button variant="ghost">
  <Icon className="w-4 h-4" />
  With Icon
</Button>
```

**Props:**
- `variant`: "primary" | "secondary" | "destructive" | "ghost" | "link"
- `size`: "sm" | "md" | "lg" | "icon"
- `disabled`: boolean
- `onClick`: () => void
- `children`: ReactNode

---

### Input

Text input field.

```tsx
import { Input } from "../components/input";

<Input
  type="text"
  placeholder="Enter text..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

<Input
  type="email"
  placeholder="email@example.com"
  disabled
/>

<Input
  type="password"
  placeholder="Password"
/>
```

**Props:**
- `type`: "text" | "email" | "password" | "number" | etc.
- `placeholder`: string
- `value`: string
- `onChange`: (e: ChangeEvent) => void
- `disabled`: boolean
- All standard HTML input attributes

---

### Textarea

Multi-line text input.

```tsx
import { Textarea } from "../components/textarea";

<Textarea
  placeholder="Enter long text..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
  rows={4}
/>
```

**Props:**
- `placeholder`: string
- `value`: string
- `onChange`: (e: ChangeEvent) => void
- `rows`: number
- `disabled`: boolean

---

### Checkbox

Checkbox input with label.

```tsx
import { Checkbox } from "../components/checkbox";

<Checkbox
  id="terms"
  checked={checked}
  onCheckedChange={(checked) => setChecked(checked as boolean)}
/>

<label htmlFor="terms">Accept terms</label>
```

**Props:**
- `id`: string
- `checked`: boolean
- `onCheckedChange`: (checked: boolean | "indeterminate") => void
- `disabled`: boolean

---

### Select

Dropdown select menu.

```tsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/select";

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
    <SelectItem value="option3">Option 3</SelectItem>
  </SelectContent>
</Select>
```

**Props:**
- `value`: string
- `onValueChange`: (value: string) => void
- `disabled`: boolean

---

## Feedback Components

### Alert

Contextual feedback message.

```tsx
import { Alert, AlertTitle, AlertDescription } from "../components/alert";
import { Info, AlertCircle } from "lucide-react";

<Alert>
  <Info className="h-4 w-4" />
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>
    This is an informational message.
  </AlertDescription>
</Alert>

<Alert className="bg-red-50 border-red-200">
  <AlertCircle className="h-4 w-4 text-red-600" />
  <AlertTitle className="text-red-900">Error</AlertTitle>
  <AlertDescription className="text-red-700">
    Something went wrong.
  </AlertDescription>
</Alert>
```

**Customization:**
Use Tailwind classes for different variants (success, warning, error).

---

### Badge

Status indicator or label.

```tsx
import { Badge } from "../components/badge";

<Badge variant="default">Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="secondary">Secondary</Badge>
```

**Props:**
- `variant`: "default" | "success" | "warning" | "destructive" | "secondary"
- `children`: ReactNode

---

### Progress

Progress bar indicator.

```tsx
import { Progress } from "../components/progress";

<Progress value={65} />
<Progress value={100} />
```

**Props:**
- `value`: number (0-100)

---

### Spinner

Loading spinner.

```tsx
import { Spinner } from "../components/spinner";

<Spinner size="sm" />
<Spinner size="md" />
<Spinner size="lg" />
```

**Props:**
- `size`: "sm" | "md" | "lg"

---

### Skeleton

Loading placeholder.

```tsx
import { Skeleton } from "../components/skeleton";

<Skeleton className="h-4 w-full" />
<Skeleton className="h-4 w-3/4" />
<Skeleton className="h-4 w-1/2" />
```

**Props:**
- `className`: string (for size customization)

---

### LoadingScreen

Full-screen loading state.

```tsx
import LoadingScreen from "../components/LoadingScreen";

<LoadingScreen
  variant="default"
  message="Loading..."
/>

<LoadingScreen
  variant="processing"
  progress={45}
  message="Processing your request..."
/>
```

**Props:**
- `variant`: "default" | "processing" | "audit"
- `message`: string
- `progress`: number (optional, for progress variant)

---

### EmptyState

Empty state placeholder.

```tsx
import EmptyState from "../components/EmptyState";
import { FileText } from "lucide-react";

<EmptyState
  icon={<FileText className="w-12 h-12" />}
  title="No Data"
  description="There's nothing to show here yet"
/>
```

**Props:**
- `icon`: ReactNode
- `title`: string
- `description`: string

---

### ErrorState

Error state display.

```tsx
import ErrorState from "../components/ErrorState";

<ErrorState
  variant="inline"
  message="Failed to load data"
  onRetry={handleRetry}
/>

<ErrorState
  variant="fullscreen"
  message="Something went wrong"
/>
```

**Props:**
- `variant`: "inline" | "fullscreen"
- `message`: string
- `onRetry`: () => void (optional)

---

## Navigation Components

### Tabs

Tabbed interface.

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/tabs";

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
    <TabsTrigger value="tab3">Tab 3</TabsTrigger>
  </TabsList>

  <TabsContent value="tab1">
    Content for tab 1
  </TabsContent>

  <TabsContent value="tab2">
    Content for tab 2
  </TabsContent>

  <TabsContent value="tab3">
    Content for tab 3
  </TabsContent>
</Tabs>
```

**Props:**
- `defaultValue`: string - Initial active tab
- `value`: string - Controlled tab value
- `onValueChange`: (value: string) => void

---

### Accordion

Collapsible content sections.

```tsx
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../components/accordion";

<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Section 1</AccordionTrigger>
    <AccordionContent>
      Content for section 1
    </AccordionContent>
  </AccordionItem>

  <AccordionItem value="item-2">
    <AccordionTrigger>Section 2</AccordionTrigger>
    <AccordionContent>
      Content for section 2
    </AccordionContent>
  </AccordionItem>
</Accordion>

{/* Multiple sections can be open */}
<Accordion type="multiple">
  {/* ... */}
</Accordion>
```

**Props:**
- `type`: "single" | "multiple"
- `collapsible`: boolean (for single type)

---

### Stepper

Step indicator for multi-step flows.

```tsx
import { Stepper } from "../components/stepper";

<Stepper
  steps={[
    { number: 1, label: "Step 1" },
    { number: 2, label: "Step 2" },
    { number: 3, label: "Step 3" },
  ]}
  currentStep={2}
/>
```

**Props:**
- `steps`: Array<{ number: number; label: string }>
- `currentStep`: number

---

## Data Display

### AppBar

Top navigation bar.

```tsx
import AppBar from "../components/app-bar";

<AppBar
  title="My Screen"
  showBackButton={true}
  onBack={() => navigation.goBack()}
  actions={
    <Button size="icon" variant="secondary">
      <Settings className="w-4 h-4" />
    </Button>
  }
/>
```

**Props:**
- `title`: string
- `showBackButton`: boolean
- `onBack`: () => void
- `actions`: ReactNode

---

### ProStatusCard

Pro tier status display.

```tsx
import { ProStatusCard } from "../components/ProStatusCard";

<ProStatusCard />
```

Shows when user has a valid license.

---

### PaywallModal

Upgrade modal for free users.

```tsx
import { PaywallModal } from "../components/PaywallModal";

<PaywallModal
  isOpen={showPaywall}
  onClose={() => setShowPaywall(false)}
  onLicenseActivated={() => {
    setShowPaywall(false);
    // Handle success
  }}
/>
```

**Props:**
- `isOpen`: boolean
- `onClose`: () => void
- `onLicenseActivated`: () => void

---

## Utilities

### Tooltip

Hover tooltip.

```tsx
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "../components/tooltip";

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover me</TooltipTrigger>
    <TooltipContent>
      Tooltip content
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

### ScrollArea

Custom scrollable area.

```tsx
import { ScrollArea } from "../components/scroll-area";

<ScrollArea className="h-72">
  {/* Long content here */}
</ScrollArea>
```

**Props:**
- `className`: string (for height/width)

---

## Common Patterns

### Form with Validation

```tsx
const [formData, setFormData] = useState({ name: '', email: '' });
const [errors, setErrors] = useState({});

const handleSubmit = () => {
  // Validate
  const newErrors = {};
  if (!formData.name) newErrors.name = 'Name is required';
  if (!formData.email) newErrors.email = 'Email is required';

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  // Submit form
};

<Card>
  <CardContent className="space-y-4">
    <div>
      <Input
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
    </div>

    <Button onClick={handleSubmit}>Submit</Button>
  </CardContent>
</Card>
```

### Modal Pattern

```tsx
const [isOpen, setIsOpen] = useState(false);

<>
  <Button onClick={() => setIsOpen(true)}>Open Modal</Button>

  {isOpen && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>Modal Title</CardTitle>
        </CardHeader>
        <CardContent>
          Modal content
        </CardContent>
        <CardFooter>
          <Button onClick={() => setIsOpen(false)}>Close</Button>
        </CardFooter>
      </Card>
    </div>
  )}
</>
```

### List with Loading State

```tsx
const [items, setItems] = useState([]);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  fetchItems().then(data => {
    setItems(data);
    setIsLoading(false);
  });
}, []);

if (isLoading) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

if (items.length === 0) {
  return <EmptyState title="No items" description="No items to display" />;
}

return (
  <div className="space-y-2">
    {items.map(item => (
      <Card key={item.id}>
        <CardContent>{item.name}</CardContent>
      </Card>
    ))}
  </div>
);
```

---

## Styling Guidelines

### Color Scheme

Use Framer's CSS variables for consistency:

```tsx
<div className="bg-[var(--framer-color-bg)]">
  <p className="text-[var(--framer-color-text-primary)]">Primary text</p>
  <p className="text-[var(--framer-color-text-secondary)]">Secondary text</p>
  <p className="text-[var(--framer-color-text-tertiary)]">Tertiary text</p>
  <div className="border-[var(--framer-color-divider)]" />
</div>
```

### Spacing

Use Tailwind spacing utilities:

```tsx
<div className="space-y-4">  {/* Vertical spacing */}
  <div className="space-x-2"> {/* Horizontal spacing */}
    <Button />
    <Button />
  </div>
</div>

<div className="p-4">   {/* Padding */}
<div className="m-4">   {/* Margin */}
<div className="gap-2"> {/* Gap in flex/grid */}
```

### Responsive Design

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Auto-responsive grid */}
</div>

<div className="flex flex-col sm:flex-row gap-4">
  {/* Stack on mobile, row on desktop */}
</div>
```

---

## Accessibility Tips

1. **Always use labels with form inputs**
```tsx
<label htmlFor="email">Email</label>
<Input id="email" type="email" />
```

2. **Add aria-labels to icon buttons**
```tsx
<Button aria-label="Close modal">
  <X className="w-4 h-4" />
</Button>
```

3. **Use semantic HTML**
```tsx
<nav>...</nav>
<main>...</main>
<footer>...</footer>
```

4. **Keyboard navigation**
All components support keyboard navigation by default (Tab, Enter, Escape).

---

## Questions?

For architecture details, see [ARCHITECTURE.md](./ARCHITECTURE.md).
For general setup, see [README.md](./README.md).
