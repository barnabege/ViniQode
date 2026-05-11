// app/elabel/[lang]/[id]/page.tsx
//
// Page e-label publique conforme (UE) 2021/2117, traduite dans la
// langue indiquée par le segment [lang] de l'URL.
// Contraintes : ultra légère, sans tracking, sans cookies,
// sans publicité, lisible mobile en < 1 s.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  libelleAllergenesLocalized,
  listeIngredientsLibelleLocalized,
  type AllergeneCode,
} from "@/lib/ingredients";
import { formatNumberFR } from "@/lib/utils";
import {
  SUPPORTED_LOCALES,
  isLocale,
  type Locale,
} from "@/lib/i18n";
import { getMessages } from "@/messages";
import type { Cuvee, Profile } from "@/lib/database.types";
import { LanguageSwitcher } from "./LanguageSwitcher";

export const dynamic = "force-dynamic";
export const revalidate = 60;

interface PageProps {
  params: { lang: string; id: string };
}

export function generateMetadata({ params }: PageProps): Metadata {
  const lang: Locale = isLocale(params.lang) ? params.lang : "en";
  const messages = getMessages(lang);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://viniqode.fr";

  // hreflang : une alternate par locale + x-default sur EN.
  const languages: Record<string, string> = {};
  for (const loc of SUPPORTED_LOCALES) {
    languages[loc] = `${appUrl}/elabel/${loc}/${params.id}`;
  }
  languages["x-default"] = `${appUrl}/elabel/en/${params.id}`;

  return {
    title: messages.elabel.pageTitle,
    robots: {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    },
    alternates: {
      canonical: `${appUrl}/elabel/${lang}/${params.id}`,
      languages,
    },
  };
}

export default async function ELabelPage({ params }: PageProps) {
  if (!isLocale(params.lang)) notFound();
  const lang: Locale = params.lang;
  const messages = getMessages(lang);
  const t = messages.elabel;

  const supabase = createSupabaseServerClient();

  const { data } = await supabase
    .from("cuvees")
    .select("*")
    .eq("id", params.id)
    .single<Cuvee>();

  if (!data) notFound();

  if (data.statut !== "actif") {
    return <ELabelUnavailable title={t.unavailable.title} message={t.unavailable.message} />;
  }

  const { data: producteur } = await supabase
    .from("profiles")
    .select("nom_domaine, region")
    .eq("id", data.user_id)
    .single<Pick<Profile, "nom_domaine" | "region">>();

  const allergenes = (data.allergenes ?? []) as AllergeneCode[];
  const allergenesLibelle = libelleAllergenesLocalized(allergenes, messages);
  const ingredientsLibelle = listeIngredientsLibelleLocalized(
    (data.ingredients as string[]) ?? [],
    messages,
  );
  const typeLabel = data.type_vin ? messages.typesVin[data.type_vin] : "—";

  return (
    <div className="mx-auto min-h-screen max-w-prose px-5 py-6 text-foreground">
      <header className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <p className="font-serif text-sm font-semibold tracking-tight text-muted">
            {t.bannerHeader}
          </p>
          <p className="text-[11px] uppercase tracking-widest text-muted">
            {t.bannerSubheader}
          </p>
        </div>
        <LanguageSwitcher
          current={lang}
          cuveeId={params.id}
          ariaLabel={t.languageSwitcher.ariaLabel}
        />
      </header>

      <main className="space-y-8 py-6">
        <section>
          <h1 className="font-serif text-2xl leading-tight text-foreground sm:text-3xl">
            {data.nom}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {[data.appellation, data.millesime, typeLabel]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {producteur?.nom_domaine && (
            <p className="mt-1 text-sm text-muted">
              {producteur.nom_domaine}
              {producteur.region ? ` — ${producteur.region}` : ""}
            </p>
          )}
          {data.degre_alcool !== null && (
            <p className="mt-3 text-sm text-foreground">
              {t.bottle.volumeLabel} :{" "}
              {data.volume_cl ? `${data.volume_cl} ${t.bottle.volumeUnit}` : "—"} ·{" "}
              {t.bottle.alcoholLabel} : {formatNumberFR(data.degre_alcool, 1)}{" "}
              {t.bottle.alcoholUnit}
            </p>
          )}
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground">
            {t.headings.ingredients}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-foreground">
            {ingredientsLibelle}
            {allergenesLibelle && (
              <>
                {` — ${t.allergens.contains} `}
                <strong className="font-semibold">
                  {allergenesLibelle.toLowerCase()}
                </strong>
                .
              </>
            )}
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground">
            {t.headings.nutrition}
          </h2>
          <p className="text-xs text-muted">{t.nutrition.per100ml}</p>
          <table className="mt-3 w-full text-sm">
            <tbody className="divide-y divide-border">
              <NutriRow
                label={t.nutrition.energy}
                value={`${data.valeur_energetique_kj ?? 0} kJ / ${data.valeur_energetique_kcal ?? 0} kcal`}
                bold
              />
              <NutriRow label={t.nutrition.fat} value="0 g" />
              <NutriRow label={t.nutrition.saturates} value="0 g" indent />
              <NutriRow
                label={t.nutrition.carbs}
                value={`${formatNumberFR(data.glucides_g ?? 0, 1)} g`}
              />
              <NutriRow
                label={t.nutrition.sugars}
                value={`${formatNumberFR(data.sucres_g ?? 0, 1)} g`}
                indent
              />
              <NutriRow label={t.nutrition.protein} value="0 g" />
              <NutriRow label={t.nutrition.salt} value="0 g" />
            </tbody>
          </table>
        </section>
      </main>

      <footer className="mt-8 space-y-2 border-t border-border pt-5 text-xs leading-relaxed text-muted">
        <p>{t.footer.disclaimer}</p>
        <p>
          {t.footer.lastUpdated} :{" "}
          {new Intl.DateTimeFormat(lang, {
            day: "numeric",
            month: "long",
            year: "numeric",
          }).format(new Date(data.updated_at))}
        </p>
      </footer>
    </div>
  );
}

function ELabelUnavailable({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-prose flex-col items-center justify-center px-5 py-10 text-center">
      <p className="text-[11px] uppercase tracking-widest text-muted">
        ViniQode
      </p>
      <h1 className="mt-3 font-serif text-2xl text-foreground">{title}</h1>
      <p className="mt-3 text-sm text-muted">{message}</p>
    </div>
  );
}

function NutriRow({
  label,
  value,
  indent,
  bold,
}: {
  label: string;
  value: string;
  indent?: boolean;
  bold?: boolean;
}) {
  return (
    <tr>
      <td
        className={
          "py-2 pr-4 " +
          (indent ? "pl-5 text-muted" : "text-foreground") +
          (bold ? " font-semibold" : "")
        }
      >
        {label}
      </td>
      <td
        className={
          "py-2 text-right tabular-nums " +
          (bold ? "font-semibold text-foreground" : "text-foreground")
        }
      >
        {value}
      </td>
    </tr>
  );
}
