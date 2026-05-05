// components/dashboard/Sidebar.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Wine,
  Package,
  BarChart3,
  Settings,
  HelpCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Plan } from "@/lib/database.types";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Tableau de bord", icon: Home },
  { href: "/dashboard/cuvees", label: "Mes cuvées", icon: Wine },
  { href: "/dashboard/commandes", label: "Commandes", icon: Package },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/parametres", label: "Paramètres", icon: Settings },
  { href: "/dashboard/support", label: "Support", icon: HelpCircle },
];

const PLAN_LABELS: Record<Plan, string> = {
  starter: "Starter",
  essentiel: "Essentiel",
  pro: "Pro",
};

export interface SidebarProps {
  plan: Plan;
}

export function Sidebar({ plan }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r border-border bg-background lg:flex">
      <div className="px-6 py-6">
        <Link
          href="/"
          className="font-serif text-2xl font-bold tracking-tight text-foreground"
        >
          ViniQode
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-surface font-medium text-foreground"
                  : "text-muted hover:bg-surface hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="rounded-md bg-surface p-4">
          <p className="text-xs uppercase tracking-widest text-muted">
            Plan actuel
          </p>
          <div className="mt-2 flex items-center justify-between">
            <p className="font-serif text-base text-foreground">
              {PLAN_LABELS[plan]}
            </p>
            {plan === "starter" && <Badge variant="warning">Limité</Badge>}
          </div>
          {plan !== "pro" && (
            <Button asChild size="sm" block className="mt-4">
              <Link href="/dashboard/parametres/abonnement">
                {plan === "starter" ? "Passer à Essentiel" : "Passer à Pro"}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const items = NAV.slice(0, 5);
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-background lg:hidden">
      {items.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 py-2.5 text-[10px]",
              active ? "text-accent" : "text-muted",
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="truncate px-1">{item.label.split(" ")[0]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
