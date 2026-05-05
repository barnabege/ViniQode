// components/ui/PhonePreview.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export interface PhonePreviewProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Mockup de téléphone en CSS pur — utilisé sur la landing page
 * et l'étape 4 de création d'une cuvée pour visualiser l'e-label.
 */
export function PhonePreview({ children, className }: PhonePreviewProps) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[300px] rounded-[36px] border border-border bg-foreground p-2 shadow-card",
        className,
      )}
      aria-hidden="true"
    >
      <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-foreground" />
      <div className="relative h-[600px] overflow-hidden rounded-[28px] bg-background">
        <div className="h-full overflow-y-auto px-5 pb-8 pt-10 text-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
