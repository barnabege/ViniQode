// components/ui/Checkbox.tsx
"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps {
  id?: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}

export function Checkbox({
  id,
  checked,
  disabled,
  onCheckedChange,
  label,
  description,
  className,
}: CheckboxProps) {
  const reactId = React.useId();
  const inputId = id ?? reactId;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "flex cursor-pointer items-start gap-3 select-none",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <span
        className={cn(
          "mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-sm border transition-colors",
          checked
            ? "border-accent bg-accent text-white"
            : "border-border bg-background",
        )}
        aria-hidden="true"
      >
        {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </span>
      <input
        id={inputId}
        type="checkbox"
        className="sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
      />
      {(label || description) && (
        <span className="flex flex-col">
          {label && (
            <span className="text-sm leading-snug text-foreground">{label}</span>
          )}
          {description && (
            <span className="text-xs leading-snug text-muted">{description}</span>
          )}
        </span>
      )}
    </label>
  );
}
