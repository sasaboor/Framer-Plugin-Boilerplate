import React from "react";
import AppBar, { AppBarProps } from "./app-bar";
import { cn } from "../lib/utils";

interface PageContainerProps {
  appBar?: AppBarProps;
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export default function PageContainer({
  children,
  appBar,
  className,
  containerClassName,
}: PageContainerProps) {
  return (
    <div className={cn("flex-1 flex flex-col overflow-visible", className)}>
      {appBar && <AppBar {...appBar} />}
      <main
        className={cn(
          "flex-1 flex flex-col gap-3 px-4 py-4 pb-4 overflow-visible",
          containerClassName
        )}
      >
        {children}
      </main>
    </div>
  );
}
