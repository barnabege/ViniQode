// components/ui/StepIndicator.tsx
import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Step {
  label: string;
  /** Description courte affichée sous le label, optionnel */
  description?: string;
}

export interface StepIndicatorProps {
  steps: Step[];
  /** Index zéro-based de l'étape active */
  current: number;
  className?: string;
}

export function StepIndicator({ steps, current, className }: StepIndicatorProps) {
  return (
    <ol
      className={cn(
        "flex w-full items-stretch gap-2 overflow-x-auto no-scrollbar",
        className,
      )}
      aria-label="Progression"
    >
      {steps.map((step, idx) => {
        const status =
          idx < current ? "done" : idx === current ? "active" : "todo";
        return (
          <li
            key={step.label}
            className="flex min-w-[140px] flex-1 items-center gap-3"
          >
            <span
              className={cn(
                "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border text-sm font-medium",
                status === "done" && "border-accent bg-accent text-white",
                status === "active" && "border-accent text-accent",
                status === "todo" && "border-border text-muted",
              )}
              aria-current={status === "active" ? "step" : undefined}
            >
              {status === "done" ? (
                <Check className="h-4 w-4" strokeWidth={3} />
              ) : (
                idx + 1
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "truncate text-sm font-medium",
                  status === "todo" ? "text-muted" : "text-foreground",
                )}
              >
                {step.label}
              </p>
              {step.description && (
                <p className="truncate text-xs text-muted">{step.description}</p>
              )}
            </div>
            {idx < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={cn(
                  "hidden h-px flex-1 sm:block",
                  status === "done" ? "bg-accent" : "bg-border",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
