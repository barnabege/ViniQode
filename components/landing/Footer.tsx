// components/landing/Footer.tsx
import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-foreground text-background">
      <div className="container-page py-20 sm:py-24">
        <div className="grid gap-y-14 md:grid-cols-12 md:gap-x-12">
          <div className="md:col-span-5">
            <p className="font-serif text-3xl font-medium tracking-tight">
              ViniQode
            </p>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-background/65">
              La conformité e-label simplifiée pour les vignerons
              artisanaux français. Pensé en France, hébergé en Europe.
            </p>
            <p className="mt-7 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.3em] text-background/55">
              <span aria-hidden="true" className="h-px w-8 bg-background/30" />
              Conforme au règlement (UE) 2021/2117
            </p>
          </div>

          <FooterColumn
            title="Produit"
            className="md:col-span-2"
            links={[
              { href: "#fonctionnalites", label: "Fonctionnalités" },
              { href: "#tarifs", label: "Tarifs" },
              { href: "#comment-ca-marche", label: "Méthode" },
              { href: "/api", label: "API" },
            ]}
          />
          <FooterColumn
            title="Ressources"
            className="md:col-span-2"
            links={[
              { href: "/blog", label: "Blog" },
              { href: "/guides", label: "Guides 2021/2117" },
              { href: "/support", label: "Support" },
            ]}
          />
          <FooterColumn
            title="Légal"
            className="md:col-span-3"
            links={[
              { href: "/cgv", label: "CGV" },
              { href: "/confidentialite", label: "Confidentialité" },
              { href: "/mentions-legales", label: "Mentions légales" },
              { href: "/rgpd", label: "RGPD" },
            ]}
          />
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-background/15 pt-8 text-xs text-background/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} ViniQode. Tous droits réservés.</p>
          <p className="font-serif italic">
            Établi en France — hébergé en Europe.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
  className,
}: {
  title: string;
  links: { href: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-background/55">
        {title}
      </p>
      <ul className="mt-5 space-y-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="link-editorial text-sm text-background/80 hover:text-background"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
