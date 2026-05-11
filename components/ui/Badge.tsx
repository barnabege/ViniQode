// components/ui/Badge.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-sm font-medium",
  {
    variants: {
      variant: {
        // success = vert SÉMANTIQUE (badge "Conforme", statut OK). Volontairement
        // découplé du token `accent` qui sert au branding wine.
        success: "bg-green-50 text-green-700",
        warning: "bg-orange-50 text-orange-700",
        error: "bg-red-50 text-error",
        info: "bg-blue-50 text-blue-700",
        neutral: "bg-surface text-muted",
        dark: "bg-foreground text-white",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-sm",
      },
    },
    defaultVariants: { variant: "neutral", size: "sm" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}
