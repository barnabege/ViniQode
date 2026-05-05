"use client";

import * as React from "react";
import { Mail } from "lucide-react";
import { Input, type InputProps } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

export const EmailInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <div className="relative">
      <Mail
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
      <Input
        ref={ref}
        type="email"
        className={cn("pl-10", className)}
        {...props}
      />
    </div>
  ),
);
EmailInput.displayName = "EmailInput";
