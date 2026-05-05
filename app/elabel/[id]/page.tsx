// app/elabel/[id]/page.tsx
//
// Page e-label publique conforme (UE) 2021/2117.
// Contraintes : ultra légère, sans tracking, sans cookies,
// sans publicité, lisible mobile en < 1 s.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { TYPES_VIN_LABELS } from "./labels";
import { libelleAllergenes, listeIngredientsLibelle } from "@/lib/ingredients";
import { formatDateFR, formatNumberFR } from "@/lib/utils";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { Cuvee, Profile } from "@/lib/database.types";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Information réglementaire (UE) 2021/2117",
};

interface PageProps {
  params: { id: string };
}

export default async function ELabelPage({ params }: PageProps) {
  const supabase = createSupabaseServerClient();

  const { data } = await supabase
    .from("cuvees")
    .select("*")
    .eq("id", params.id)
    .eq("statut", "actif")
    .single<Cuvee>();

  if (!data) notFound();

  const { data: producteur } = await supabase
    .from("profiles")
    .select("nom_domaine, region")
    .eq("id", data.user_id)
    .single<Pick<Profile, "nom_domaine" | "region">>();

  const allergenes = data.allergenes ?? [];
  const allergenesLibelle = libelleAllergenes(
    allergenes as Parameters<typeof libelleAllergenes>[0],
  );
  const ingredientsLibelle = listeIngredientsLibelle(
    (data.ingredients as string[]) ?? [],
  );
  const typeLabel = data.type_vin ? TYPES_VIN_LABELS[data.type_vin] : "—";

  return (
    <div className="mx-auto min-h-screen max-w-prose px-5 py-6 text-foreground">
      <header className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <p className="font-serif text-sm font-semibold tracking-tight text-muted">
            ViniQode
          </p>
          <p className="text-[11px] uppercase tracking-widest text-muted">
            Information réglementaire — (UE) 2021/2117
          </p>
        </div>
        <LanguageSwitcher />
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
              Volume : {data.volume_cl ? `${data.volume_cl} cl` : "—"} ·
              Titre alcoométrique : {formatNumberFR(data.degre_alcool, 1)} %
              vol.
            </p>
          )}
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground">Ingrédients</h2>
          <p className="mt-2 text-sm leading-relaxed text-foreground">
            {ingredientsLibelle}
            {allergenesLibelle && (
              <>
                {" — contient des "}
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
            Déclaration nutritionnelle
          </h2>
          <p className="text-xs text-muted">Pour 100 ml</p>
          <table className="mt-3 w-full text-sm">
            <tbody className="divide-y divide-border">
              <NutriRow
                label="Valeur énergétique"
                value={`${data.valeur_energetique_kj ?? 0} kJ / ${data.valeur_energetique_kcal ?? 0} kcal`}
                bold
              />
              <NutriRow label="Matières grasses" value="0 g" />
              <NutriRow
                label="dont acides gras saturés"
                value="0 g"
                indent
              />
              <NutriRow
                label="Glucides"
                value={`${formatNumberFR(data.glucides ?? 0, 1)} g`}
              />
              <NutriRow
                label="dont sucres"
                value={`${formatNumberFR(data.sucres_nutritionnels ?? 0, 1)} g`}
                indent
              />
              <NutriRow label="Protéines" value="0 g" />
              <NutriRow label="Sel" value="0 g" />
            </tbody>
          </table>
        </section>
      </main>

      <footer className="mt-8 space-y-2 border-t border-border pt-5 text-xs leading-relaxed text-muted">
        <p>
          Cette page est fournie à titre d'information réglementaire
          conformément au règlement (UE) 2021/2117. Aucune donnée
          personnelle n'est collectée lors de la consultation de cette page.
        </p>
        <p>Dernière mise à jour : {formatDateFR(data.updated_at)}</p>
      </footer>
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
