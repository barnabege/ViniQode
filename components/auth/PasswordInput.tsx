"use client";

import * as React from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Input, type InputProps } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

export const PasswordInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);
    return (
      <div className="relative">
        <Lock
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <Input
          ref={ref}
          type={visible ? "text" : "password"}
          className={cn("pl-10 pr-10", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          tabIndex={-1}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";
