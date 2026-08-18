import PageContainer from "./page-container";
import { Card, CardContent, CardHeader } from "./card";
import { Skeleton } from "./skeleton";
import Spinner from "./spinner";

interface LoadingScreenProps {
  variant?: "dashboard" | "audit-results" | "category" | "audit";
  progress?: number;
  message?: string;
}

export default function LoadingScreen({ variant = "dashboard", progress = 0, message = "Loading..." }: LoadingScreenProps) {
  if (variant === "audit") {
    return (
      <PageContainer appBar={{ title: "Running Audit" }}>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 px-4">
          {/* Progress Percentage */}
          <div className="text-center space-y-2">
            <div className="text-5xl font-bold text-[var(--framer-color-text-primary)]">
              {Math.round(progress)}%
            </div>
            <p className="text-sm text-[var(--framer-color-text-secondary)]">
              {message}
            </p>
          </div>
          
          {/* Spinner */}
          <Spinner size="large" />
          
          {/* Progress Bar */}
          <div className="w-full max-w-xs">
            <div className="h-2 bg-[var(--framer-color-bg-tertiary)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#0099FF] transition-all duration-300 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }
  
  if (variant === "dashboard") {
    return (
      <PageContainer appBar={{ title: "Template Checker" }}>
        {/* Header */}
        <div className="space-y-1 px-1">
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Hero Card */}
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-start gap-3">
              <Skeleton className="w-12 h-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
            <Skeleton className="h-10 w-full rounded-lg" />
          </CardContent>
        </Card>

        {/* Overall Status Card */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-3 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="w-24 h-24 rounded-full" />
              <div className="flex-1 ml-6 space-y-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories Grid */}
        <div>
          <Skeleton className="h-4 w-24 mb-2 px-1" />
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="w-10 h-10 rounded-md" />
                    <Skeleton className="w-12 h-5 rounded-full" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-1 w-full rounded-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-2">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </PageContainer>
    );
  }

  if (variant === "audit-results") {
    return (
      <PageContainer appBar={{ title: "Audit Results" }}>
        {/* Last Scanned */}
        <div className="px-1">
          <Skeleton className="h-3 w-32" />
        </div>

        {/* Tabs */}
        <div className="space-y-2">
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-24" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-5 w-16 rounded-full" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Issues List */}
        <Card>
          <CardContent className="pt-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2 pb-3 border-b border-[var(--framer-color-divider)] last:border-0">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-16 h-5 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  if (variant === "category") {
    return (
      <PageContainer appBar={{ title: "Loading..." }}>
        {/* Header */}
        <div className="flex items-center gap-3 px-1">
          <Skeleton className="w-12 h-12 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>

        {/* Score Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Skeleton className="w-32 h-32 rounded-full" />
              <div className="flex-1 ml-6 space-y-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics */}
        <div>
          <Skeleton className="h-4 w-32 mb-2 px-1" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <Skeleton className="w-5 h-5" />
                    <Skeleton className="w-16 h-5 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </PageContainer>
    );
  }

  return null;
}

