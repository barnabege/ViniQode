// components/landing/Navigation.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#a-propos", label: "À propos" },
];

export function Navigation() {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-colors duration-200",
        scrolled
          ? "border-b border-border bg-background/80 backdrop-blur"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="container-page flex h-16 items-center justify-between">
        <Link
          href="/"
          className="font-serif text-xl font-bold text-foreground"
        >
          ViniQode
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            Se connecter
          </Link>
          <Button asChild size="sm">
            <Link href="/register">Commencer gratuitement</Link>
          </Button>
        </div>

        <button
          type="button"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          className="inline-flex h-10 w-10 items-center justify-center rounded-sm text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="container-page flex flex-col py-4">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="py-3 text-sm text-foreground"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-4">
              <Button asChild variant="secondary" size="md" block>
                <Link href="/login">Se connecter</Link>
              </Button>
              <Button asChild size="md" block>
                <Link href="/register">Commencer gratuitement</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
