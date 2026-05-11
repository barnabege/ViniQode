// app/_components/connected-home/ContextualSuggestion.tsx
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { ContextualSuggestion as Suggestion } from "@/lib/home-data";

export function ContextualSuggestion({ suggestion }: { suggestion: Suggestion }) {
  return (
    <section>
      <div className="flex flex-col gap-4 rounded-md border border-accent/20 bg-accent/5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="sm:max-w-xl">
          <p className="font-medium text-foreground">{suggestion.title}</p>
          <p className="mt-1 text-sm text-muted">{suggestion.description}</p>
        </div>
        <Button asChild size="md" className="self-start sm:self-auto">
          <Link href={suggestion.cta_href}>{suggestion.cta_label}</Link>
        </Button>
      </div>
    </section>
  );
}
