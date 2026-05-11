// app/dashboard/analytics/_components/PeriodSelector.tsx
"use client";

import { Check, ChevronDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DEFAULT_PERIOD,
  PERIOD_LABELS,
  type Period,
} from "../_lib/period";

const OPTIONS: readonly Period[] = ["7d", "30d", "90d", "12m"];

export function PeriodSelector({ current }: { current: Period }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function select(next: Period) {
    const params = new URLSearchParams(searchParams.toString());
    // Garde l'URL propre : on omet ?period quand on est sur la valeur par défaut.
    if (next === DEFAULT_PERIOD) params.delete("period");
    else params.set("period", next);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-9 items-center gap-2 rounded-sm border border-border bg-background px-3 text-sm text-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-2">
        {PERIOD_LABELS[current]}
        <ChevronDown className="h-4 w-4 text-muted" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[12rem]">
        {OPTIONS.map((p) => (
          <DropdownMenuItem
            key={p}
            onSelect={() => select(p)}
            className="flex items-center justify-between gap-3"
          >
            <span>{PERIOD_LABELS[p]}</span>
            {current === p && <Check className="h-3.5 w-3.5 text-wine" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
