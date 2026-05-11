"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  Wine,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { logoutAction } from "@/app/dashboard/parametres/actions/security";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#a-propos", label: "À propos" },
];

export interface NavigationUser {
  id: string;
  email: string | null;
}

export interface NavigationProfile {
  id: string;
  nom_domaine: string | null;
  logo_url: string | null;
  prenom: string | null;
  nom: string | null;
}

interface Props {
  user: NavigationUser | null;
  profile: NavigationProfile | null;
}

export function NavigationClient({ user, profile }: Props) {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    if (!menuOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [menuOpen]);

  const initials = computeInitials(profile, user?.email ?? null);
  const displayName = computeDisplayName(profile, user?.email ?? null);
  const isAuthed = Boolean(user);

  const onLogout = async () => {
    setMenuOpen(false);
    await logoutAction();
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-colors duration-200",
        scrolled
          ? "border-b border-wine/15 bg-white/90 backdrop-blur-sm"
          : "border-b border-wine/10 bg-white",
      )}
    >
      <div className="container-page flex h-16 items-center justify-between lg:h-20">
        <Link
          href="/"
          className="font-serif text-2xl font-bold tracking-tight text-foreground lg:text-3xl"
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

        {/* CTA droite : varie selon état d'auth */}
        <div className="hidden items-center gap-3 md:flex">
          {!isAuthed ? (
            <>
              <Link
                href="/connexion"
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                Se connecter
              </Link>
              <Button asChild size="sm">
                <Link href="/inscription">Commencer gratuitement</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  Tableau de bord
                </Link>
              </Button>

              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  aria-label="Menu utilisateur"
                  className="inline-flex items-center gap-2 rounded-full p-1 pr-2 transition-colors hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine/30"
                >
                  <Avatar logoUrl={profile?.logo_url ?? null} initials={initials} />
                  <span className="hidden max-w-[140px] truncate text-sm font-medium text-foreground lg:inline">
                    {displayName}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-muted transition-transform",
                      menuOpen && "rotate-180",
                    )}
                    aria-hidden="true"
                  />
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    aria-orientation="vertical"
                    className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-md border border-border bg-background shadow-lg"
                  >
                    <div className="border-b border-border px-4 py-3">
                      <p className="truncate text-sm font-medium text-foreground">
                        {displayName}
                      </p>
                      {user?.email && (
                        <p className="mt-0.5 truncate text-xs text-muted">
                          {user.email}
                        </p>
                      )}
                    </div>

                    <nav className="py-1">
                      <MenuLink
                        href="/dashboard"
                        icon={<LayoutDashboard className="h-4 w-4" />}
                        onClick={() => setMenuOpen(false)}
                      >
                        Tableau de bord
                      </MenuLink>
                      <MenuLink
                        href="/dashboard/cuvees"
                        icon={<Wine className="h-4 w-4" />}
                        onClick={() => setMenuOpen(false)}
                      >
                        Mes cuvées
                      </MenuLink>
                      <MenuLink
                        href="/dashboard/commandes"
                        icon={<Package className="h-4 w-4" />}
                        onClick={() => setMenuOpen(false)}
                      >
                        Mes commandes
                      </MenuLink>
                      <MenuLink
                        href="/dashboard/parametres"
                        icon={<Settings className="h-4 w-4" />}
                        onClick={() => setMenuOpen(false)}
                      >
                        Paramètres
                      </MenuLink>
                    </nav>

                    <div className="border-t border-border py-1">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={onLogout}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-error transition-colors hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Se déconnecter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Mobile : bouton burger */}
        <button
          type="button"
          aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={mobileOpen}
          className="inline-flex h-10 w-10 items-center justify-center rounded-sm text-foreground md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="container-page flex flex-col py-4">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="py-3 text-sm text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </Link>
            ))}

            {!isAuthed ? (
              <div className="mt-2 flex flex-col gap-2 border-t border-border pt-4">
                <Button asChild variant="secondary" size="md" block>
                  <Link href="/connexion" onClick={() => setMobileOpen(false)}>
                    Se connecter
                  </Link>
                </Button>
                <Button asChild size="md" block>
                  <Link href="/inscription" onClick={() => setMobileOpen(false)}>
                    Commencer gratuitement
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="mt-2 flex flex-col gap-1 border-t border-border pt-4">
                <div className="px-1 pb-2">
                  <p className="truncate text-sm font-medium text-foreground">
                    {displayName}
                  </p>
                  {user?.email && (
                    <p className="mt-0.5 truncate text-xs text-muted">
                      {user.email}
                    </p>
                  )}
                </div>
                <MobileLink
                  href="/dashboard"
                  icon={<LayoutDashboard className="h-4 w-4" />}
                  onClick={() => setMobileOpen(false)}
                >
                  Tableau de bord
                </MobileLink>
                <MobileLink
                  href="/dashboard/cuvees"
                  icon={<Wine className="h-4 w-4" />}
                  onClick={() => setMobileOpen(false)}
                >
                  Mes cuvées
                </MobileLink>
                <MobileLink
                  href="/dashboard/commandes"
                  icon={<Package className="h-4 w-4" />}
                  onClick={() => setMobileOpen(false)}
                >
                  Mes commandes
                </MobileLink>
                <MobileLink
                  href="/dashboard/parametres"
                  icon={<Settings className="h-4 w-4" />}
                  onClick={() => setMobileOpen(false)}
                >
                  Paramètres
                </MobileLink>
                <button
                  type="button"
                  onClick={async () => {
                    setMobileOpen(false);
                    await logoutAction();
                  }}
                  className="mt-2 flex items-center gap-3 rounded-sm px-3 py-3 text-sm text-error transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Se déconnecter
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

// ─── Sous-composants ─────────────────────────────────────────────────────

function Avatar({
  logoUrl,
  initials,
}: {
  logoUrl: string | null;
  initials: string;
}) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt=""
        className="h-8 w-8 flex-shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background"
    >
      {initials}
    </span>
  );
}

function MenuLink({
  href,
  icon,
  children,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2 text-sm text-foreground transition-colors hover:bg-surface"
    >
      <span className="text-muted">{icon}</span>
      {children}
    </Link>
  );
}

function MobileLink({
  href,
  icon,
  children,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-sm px-3 py-3 text-sm text-foreground transition-colors hover:bg-surface"
    >
      <span className="text-muted">{icon}</span>
      {children}
    </Link>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────

function computeInitials(
  profile: NavigationProfile | null,
  email: string | null,
): string {
  if (profile?.nom_domaine) {
    const parts = profile.nom_domaine.trim().split(/\s+/);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return (parts[0][0] + parts[1][0]!).toUpperCase();
    }
    if (parts[0]) {
      return parts[0].slice(0, 2).toUpperCase();
    }
  }
  if (profile?.prenom && profile?.nom) {
    return (profile.prenom[0]! + profile.nom[0]!).toUpperCase();
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return "VQ";
}

function computeDisplayName(
  profile: NavigationProfile | null,
  email: string | null,
): string {
  if (profile?.nom_domaine) return profile.nom_domaine;
  const fullName = `${profile?.prenom ?? ""} ${profile?.nom ?? ""}`.trim();
  if (fullName) return fullName;
  if (email) return email;
  return "Mon compte";
}
