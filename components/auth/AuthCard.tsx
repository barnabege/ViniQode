import * as React from "react";
import Link from "next/link";

export interface AuthCardProps {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="w-full max-w-[440px] animate-fade-in">
      <Link
        href="/"
        className="mb-10 block text-center font-serif text-3xl font-bold tracking-tight text-foreground"
      >
        ViniQode
      </Link>

      <div className="rounded-md border border-border bg-background p-8 shadow-card sm:p-10">
        <div className="mb-7">
          <h1 className="font-serif text-2xl text-foreground sm:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-muted">{subtitle}</p>
          )}
        </div>
        {children}
      </div>

      {footer && (
        <p className="mt-6 text-center text-sm text-muted">{footer}</p>
      )}
    </div>
  );
}
