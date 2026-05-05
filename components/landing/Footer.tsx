// components/landing/Footer.tsx
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-foreground text-white">
      <div className="container-page py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <p className="font-serif text-3xl font-bold tracking-tight">ViniQode</p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
              La conformité e-label simplifiée pour les vignerons artisanaux.
            </p>
          </div>

          <FooterColumn
            title="Produit"
            links={[
              { href: "#fonctionnalites", label: "Fonctionnalités" },
              { href: "#tarifs", label: "Tarifs" },
              { href: "/demo", label: "Démo" },
              { href: "/api", label: "API" },
            ]}
          />
          <FooterColumn
            title="Légal"
            links={[
              { href: "/cgv", label: "CGV" },
              { href: "/confidentialite", label: "Politique de confidentialité" },
              { href: "/mentions-legales", label: "Mentions légales" },
              { href: "/rgpd", label: "RGPD" },
            ]}
          />
          <FooterColumn
            title="Contact"
            links={[
              { href: "mailto:contact@viniqode.fr", label: "contact@viniqode.fr" },
              { href: "/support", label: "Support" },
              { href: "/partenariats", label: "Partenariats" },
            ]}
          />
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2025 ViniQode. Tous droits réservés.</p>
          <p>Conforme au règlement (UE) 2021/2117</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-white/50">{title}</p>
      <ul className="mt-4 space-y-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-sm text-white/80 transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
