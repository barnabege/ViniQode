// components/auth/AuthSidebar.tsx
import Link from "next/link";
import { Check } from "lucide-react";

export interface AuthSidebarProps {
  title: string;
  reassurances?: string[];
  quote?: { text: string; author: string };
}

export function AuthSidebar({ title, reassurances, quote }: AuthSidebarProps) {
  return (
    <aside className="hidden flex-col justify-between bg-foreground p-12 text-white lg:flex lg:w-2/5">
      <Link href="/" className="font-serif text-2xl font-bold">
        ViniQode
      </Link>

      <div>
        <h1 className="font-serif text-3xl leading-tight sm:text-4xl">
          {title}
        </h1>

        {reassurances && reassurances.length > 0 && (
          <ul className="mt-8 space-y-3">
            {reassurances.map((r) => (
              <li key={r} className="flex items-start gap-3 text-sm text-white/80">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {quote ? (
        <figure className="border-l-2 border-accent pl-4">
          <blockquote className="font-serif text-base italic text-white/90">
            « {quote.text} »
          </blockquote>
          <figcaption className="mt-2 text-xs text-white/60">
            — {quote.author}
          </figcaption>
        </figure>
      ) : (
        <p className="text-xs text-white/50">
          © 2025 ViniQode. Conforme (UE) 2021/2117.
        </p>
      )}
    </aside>
  );
}
