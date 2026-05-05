// app/page.tsx
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PhonePreview } from "@/components/ui/PhonePreview";
import { ELabelMockup } from "@/components/landing/ELabelMockup";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";

export default function HomePage() {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <TrustBar />
        <Problem />
        <Solution />
        <Avantages />
        <Tarifs />
        <Faq />
      </main>
      <Footer />
    </>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative">
      <div className="container-page grid min-h-[90vh] items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
        <div className="animate-slide-up">
          <Badge variant="success" size="md">
            ✓ Conforme au règlement (UE) 2021/2117
          </Badge>

          <h1 className="mt-6 font-serif text-4xl leading-[1.05] text-foreground sm:text-5xl lg:text-[56px]">
            Votre e-label QR code
            <br />
            conforme en 10 minutes.
          </h1>

          <p className="mt-6 max-w-xl text-lg text-muted sm:text-xl">
            47 000 vignerons ont l'obligation d'afficher un QR code sur
            leurs bouteilles depuis décembre 2023. ViniQode est la solution
            la plus simple du marché.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">
                Créer mon e-label gratuitement
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="#fonctionnalites">Voir une démo</Link>
            </Button>
          </div>

          <p className="mt-5 text-sm text-muted">
            Sans carte bancaire · 3 cuvées gratuites · Conforme garanti
          </p>
        </div>

        <div className="flex justify-center lg:justify-end">
          <PhonePreview>
            <ELabelMockup />
          </PhonePreview>
        </div>
      </div>
    </section>
  );
}

// ─── Trust bar ───────────────────────────────────────────────────────────
function TrustBar() {
  const stats = [
    { value: "47 000+", label: "vignerons concernés en France" },
    { value: "< 10 min", label: "pour créer votre premier e-label" },
    { value: "100 %", label: "conforme au règlement européen" },
  ];

  return (
    <section className="bg-surface">
      <div className="container-page py-10">
        <p className="text-center text-sm text-muted">
          Rejoignez les vignerons qui font confiance à ViniQode
        </p>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-serif text-3xl text-foreground sm:text-4xl">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Problème ────────────────────────────────────────────────────────────
function Problem() {
  const cards = [
    {
      icon: "⚠️",
      title: "Aucune solution simple",
      body:
        "Les outils existants sont trop complexes, trop régionaux ou réservés aux grandes structures.",
    },
    {
      icon: "⚖️",
      title: "Un risque juridique réel",
      body:
        "La DGCCRF a commencé ses contrôles. Sans conformité, c'est un retrait de produits possible.",
    },
    {
      icon: "⏱️",
      title: "Un manque de temps",
      body:
        "Un vigneron de 8 hectares n'a pas de service informatique dédié.",
    },
  ];

  return (
    <section className="container-page py-20 sm:py-24" id="probleme">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-serif text-3xl text-foreground sm:text-4xl">
          Une obligation légale.
          <br />
          Encore trop peu de solutions simples.
        </h2>
        <p className="mt-5 text-base text-muted">
          Depuis décembre 2023, le règlement (UE) 2021/2117 impose à tous
          les vins commercialisés en Europe d'afficher leurs ingrédients,
          allergènes et déclaration nutritionnelle — soit sur l'étiquette,
          soit via un QR code renvoyant vers une page e-label conforme.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {cards.map((c) => (
          <article
            key={c.title}
            className="rounded-md border border-border bg-background p-6"
          >
            <div className="text-2xl" aria-hidden="true">
              {c.icon}
            </div>
            <h3 className="mt-4 font-serif text-lg text-foreground">
              {c.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{c.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

// ─── Solution / Comment ça marche ────────────────────────────────────────
function Solution() {
  const steps = [
    {
      n: 1,
      title: "Créez votre compte",
      body: "Inscription en 2 minutes, sans carte bancaire.",
    },
    {
      n: 2,
      title: "Saisissez vos cuvées",
      body:
        "Formulaire guidé, calcul automatique des valeurs nutritionnelles.",
    },
    {
      n: 3,
      title: "Générez le QR code",
      body: "Conforme GS1, haute résolution, prêt pour l'imprimeur.",
    },
    {
      n: 4,
      title: "Mettez à jour sans réimprimer",
      body:
        "Vos données changent, votre page e-label se met à jour instantanément.",
    },
  ];

  return (
    <section
      id="fonctionnalites"
      className="bg-surface py-20 sm:py-24"
    >
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="label-eyebrow">La solution</p>
          <h2 className="mt-3 font-serif text-3xl text-foreground sm:text-4xl">
            Créez votre e-label en 4 étapes.
          </h2>
        </div>

        <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <li
              key={s.n}
              className="rounded-md border border-border bg-background p-6"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-accent text-sm font-semibold text-accent">
                {s.n}
              </span>
              <h3 className="mt-4 font-serif text-lg text-foreground">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// ─── Avantages ───────────────────────────────────────────────────────────
function Avantages() {
  const items = [
    {
      icon: "🇫🇷",
      title: "Nationale & ouverte",
      body: "Disponible partout en France, pour toutes les appellations.",
    },
    {
      icon: "⚡",
      title: "Simple avant tout",
      body: "10 minutes, première utilisation. Aucune formation nécessaire.",
    },
    {
      icon: "✅",
      title: "100 % conforme",
      body: "Sans publicité, sans cookies, sans tracking.",
    },
    {
      icon: "🔄",
      title: "Sans réimpression",
      body: "Mise à jour de vos données en temps réel sur la page e-label.",
    },
    {
      icon: "🌍",
      title: "Multilingue",
      body: "24 langues de l'UE proposées automatiquement au consommateur.",
    },
    {
      icon: "📦",
      title: "Étiquettes physiques",
      body:
        "Commandez vos stickers QR code et contre-étiquettes directement.",
    },
  ];

  return (
    <section className="container-page py-20 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-serif text-3xl text-foreground sm:text-4xl">
          Pourquoi ViniQode ?
        </h2>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <article
            key={it.title}
            className="rounded-md border border-border bg-background p-6"
          >
            <div className="text-2xl" aria-hidden="true">
              {it.icon}
            </div>
            <h3 className="mt-4 font-serif text-lg text-foreground">
              {it.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{it.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

// ─── Tarifs ──────────────────────────────────────────────────────────────
function Tarifs() {
  return (
    <section id="tarifs" className="bg-surface py-20 sm:py-24">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="label-eyebrow">Tarifs</p>
          <h2 className="mt-3 font-serif text-3xl text-foreground sm:text-4xl">
            Commencez gratuitement.
          </h2>
          <p className="mt-3 text-base text-muted">
            Évoluez quand vous en avez besoin.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <PricingCard
            name="Starter"
            price="Gratuit"
            subtitle="Pour vos 3 premières cuvées"
            features={[
              "Jusqu'à 3 QR codes e-label",
              "Page e-label hébergée et conforme",
              "Tableau de bord simple",
              "Sans carte bancaire",
            ]}
            cta="Commencer gratuitement"
            ctaHref="/register"
            ctaVariant="outline"
          />
          <PricingCard
            featured
            name="Essentiel"
            price="99 €"
            subtitle="par an · soit 8,25 € / mois"
            features={[
              "QR codes illimités",
              "Mises à jour illimitées",
              "Multilingue UE (24 langues)",
              "Support email sous 48 h",
            ]}
            cta="Choisir Essentiel"
            ctaHref="/register?plan=essentiel"
            ctaVariant="primary"
          />
          <PricingCard
            name="Pro"
            price="149 €"
            subtitle="par an · soit 12,40 € / mois"
            features={[
              "Tout l'Essentiel inclus",
              "Analytics des scans",
              "Export PDF technique",
              "Support prioritaire sous 24 h",
            ]}
            cta="Choisir Pro"
            ctaHref="/register?plan=pro"
            ctaVariant="secondary"
          />
        </div>

        <p className="mt-10 text-center text-sm text-muted">
          Besoin d'une API ou de plusieurs établissements ?{" "}
          <Link
            href="mailto:contact@viniqode.fr"
            className="text-accent hover:underline"
          >
            Contactez-nous
          </Link>{" "}
          pour une offre Business.
        </p>
      </div>
    </section>
  );
}

interface PricingCardProps {
  name: string;
  price: string;
  subtitle: string;
  features: string[];
  cta: string;
  ctaHref: string;
  ctaVariant: "primary" | "secondary" | "outline";
  featured?: boolean;
}

function PricingCard({
  name,
  price,
  subtitle,
  features,
  cta,
  ctaHref,
  ctaVariant,
  featured,
}: PricingCardProps) {
  if (featured) {
    return (
      <article className="relative flex flex-col rounded-md border border-foreground bg-foreground p-8 text-white">
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-sm bg-accent px-3 py-1 text-[10px] uppercase tracking-widest text-white">
          Le plus populaire
        </span>
        <h3 className="font-serif text-lg">{name}</h3>
        <p className="mt-3 font-serif text-5xl">{price}</p>
        <p className="mt-1 text-sm text-white/70">{subtitle}</p>
        <ul className="mt-6 space-y-3 text-sm">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <Button asChild size="md" block>
            <Link href={ctaHref}>{cta}</Link>
          </Button>
        </div>
      </article>
    );
  }

  return (
    <article className="flex flex-col rounded-md border border-border bg-background p-8">
      <h3 className="font-serif text-lg text-foreground">{name}</h3>
      <p className="mt-3 font-serif text-5xl text-foreground">{price}</p>
      <p className="mt-1 text-sm text-muted">{subtitle}</p>
      <ul className="mt-6 space-y-3 text-sm text-foreground">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <Button asChild size="md" block variant={ctaVariant}>
          <Link href={ctaHref}>{cta}</Link>
        </Button>
      </div>
    </article>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────
function Faq() {
  const items = [
    {
      q: "Mon QR code sera-t-il vraiment conforme ?",
      a: "Oui. Les pages e-label ViniQode respectent toutes les exigences du règlement (UE) 2021/2117 : sans publicité, sans cookies, sans tracking, accessibles dans les 24 langues de l'UE.",
    },
    {
      q: "Combien de temps mes pages e-label restent-elles en ligne ?",
      a: "Tant que vous êtes abonné, vos pages sont accessibles. La réglementation exige une disponibilité de 3 à 10 ans — nous garantissons la pérennité de vos liens.",
    },
    {
      q: "Que se passe-t-il si je change d'ingrédients entre deux millésimes ?",
      a: "Vous mettez simplement à jour les données dans votre tableau de bord. La page e-label est mise à jour instantanément, sans réimprimer vos étiquettes.",
    },
    {
      q: "L'obligation s'applique-t-elle à mes vins exportés hors UE ?",
      a: "Non. Une dérogation accordée par la DGCCRF en juillet 2024 dispense les vins destinés exclusivement à l'export hors UE. En pratique, la plupart des vignerons font une seule étiquette pour tout.",
    },
    {
      q: "Puis-je commander mes étiquettes physiques chez ViniQode ?",
      a: "Oui. Depuis votre tableau de bord, vous pouvez commander des stickers QR code ou des contre-étiquettes personnalisées, livrés en 5 jours ouvrés.",
    },
    {
      q: "Est-ce que ViniQode fonctionne sur mobile ?",
      a: "Parfaitement. ViniQode est une Progressive Web App — vous pouvez l'installer sur votre téléphone comme une application depuis votre navigateur, sans passer par l'App Store.",
    },
  ];

  return (
    <section id="a-propos" className="container-page py-20 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center font-serif text-3xl text-foreground sm:text-4xl">
          Questions fréquentes.
        </h2>

        <Accordion type="single" collapsible className="mt-10">
          {items.map((item, idx) => (
            <AccordionItem key={item.q} value={`item-${idx}`}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
