"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PhoneMockup } from "@/components/landing/PhoneMockup";
import { FormError } from "@/components/auth/FormError";
import {
  libelleAllergenes,
  listeIngredientsLibelle,
  type AllergeneCode,
} from "@/lib/ingredients";
import { formatNumberFR } from "@/lib/utils";
import { TYPE_VIN_LABELS, type TypeVinValue } from "@/lib/onboarding/schemas";
import { getOnboardingCuveeId } from "@/lib/onboarding/storage";
import {
  loadApercuAction,
  publishCuveeAction,
  type ApercuData,
} from "./actions";

type Status = "loading" | "ready" | "missing";

export function ApercuView() {
  const router = useRouter();
  const [status, setStatus] = React.useState<Status>("loading");
  const [data, setData] = React.useState<ApercuData | null>(null);
  const [error, setError] = React.useState<string | undefined>();
  const [needsEmailConfirmation, setNeedsEmailConfirmation] =
    React.useState(false);
  const [isPublishing, setIsPublishing] = React.useState(false);

  React.useEffect(() => {
    const id = getOnboardingCuveeId();
    if (!id) {
      setStatus("missing");
      return;
    }
    void (async () => {
      const result = await loadApercuAction(id);
      if (result.error || !result.data) {
        setStatus("missing");
        return;
      }
      setData(result.data);
      setStatus("ready");
    })();
  }, []);

  async function onPublish() {
    if (!data) return;
    setError(undefined);
    setNeedsEmailConfirmation(false);
    setIsPublishing(true);
    const result = await publishCuveeAction(data.cuvee.id);
    setIsPublishing(false);
    if (result.needsEmailConfirmation) {
      setNeedsEmailConfirmation(true);
      setError(result.error);
      return;
    }
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push(`/onboarding/felicitations?cuvee_id=${data.cuvee.id}`);
  }

  if (status === "missing") {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Cuvée introuvable.{" "}
        <a
          href="/onboarding/premiere-cuvee/infos"
          className="font-medium underline"
        >
          Reprenez l&apos;étape précédente.
        </a>
      </div>
    );
  }

  if (status === "loading" || !data) {
    return (
      <div className="rounded-md border border-border bg-background p-6 text-sm text-muted">
        Chargement de l&apos;aperçu…
      </div>
    );
  }

  const { cuvee, profile } = data;
  const typeLabel = cuvee.type_vin
    ? TYPE_VIN_LABELS[cuvee.type_vin as TypeVinValue]
    : "—";
  const ingredients = (cuvee.ingredients ?? []) as string[];
  const allergenes = (cuvee.allergenes ?? []) as AllergeneCode[];
  const ingredientsText = listeIngredientsLibelle(ingredients);
  const allergenesText = libelleAllergenes(allergenes);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
      <div className="flex justify-center lg:justify-start">
        <PhoneMockup>
          <ELabelInline
            nom={cuvee.nom}
            millesime={cuvee.millesime}
            typeLabel={typeLabel}
            domaine={profile.nom_domaine}
            region={profile.region}
            volume_cl={cuvee.volume_cl}
            degre={cuvee.degre_alcool}
            ingredientsText={ingredientsText}
            allergenesText={allergenesText}
            energieKj={cuvee.valeur_energetique_kj ?? 0}
            energieKcal={cuvee.valeur_energetique_kcal ?? 0}
            glucides={cuvee.glucides_g ?? 0}
            sucres={cuvee.sucres_g ?? 0}
          />
        </PhoneMockup>
      </div>

      <aside className="space-y-6">
        <div className="rounded-md border border-border bg-background p-6">
          <h2 className="font-serif text-xl text-foreground">
            Récapitulatif
          </h2>
          <dl className="mt-4 space-y-2.5 text-sm">
            <Row label="Cuvée" value={cuvee.nom} />
            <Row label="Millésime" value={String(cuvee.millesime ?? "—")} />
            <Row label="Type" value={typeLabel} />
            <Row
              label="Volume"
              value={cuvee.volume_cl ? `${cuvee.volume_cl} cl` : "—"}
            />
            <Row
              label="Degré"
              value={
                cuvee.degre_alcool !== null
                  ? `${formatNumberFR(cuvee.degre_alcool, 1)} % vol`
                  : "—"
              }
            />
            <Row
              label="Ingrédients"
              value={
                ingredients.length > 0
                  ? `${ingredients.length} renseigné${ingredients.length > 1 ? "s" : ""}`
                  : "—"
              }
            />
            <Row
              label="Allergènes"
              value={allergenesText || "Aucun"}
            />
          </dl>
        </div>

        <div className="space-y-3">
          <Button
            type="button"
            size="lg"
            block
            onClick={onPublish}
            disabled={isPublishing}
          >
            {isPublishing ? (
              "Publication…"
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Publier mon QR code
              </>
            )}
          </Button>
          <Link
            href="/onboarding/premiere-cuvee/infos"
            className="block text-center text-sm text-muted transition-colors hover:text-foreground"
          >
            Modifier les informations
          </Link>
        </div>

        {needsEmailConfirmation && (
          <div className="rounded-sm border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <strong className="font-semibold">
              Confirmez votre email pour publier.
            </strong>{" "}
            Cliquez sur le lien envoyé dans votre boîte de réception, puis
            revenez sur cette page.
          </div>
        )}
        {!needsEmailConfirmation && <FormError message={error} />}
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="truncate text-right font-medium text-foreground">
        {value}
      </dd>
    </div>
  );
}

interface ELabelInlineProps {
  nom: string;
  millesime: number | null;
  typeLabel: string;
  domaine: string | null;
  region: string | null;
  volume_cl: number | null;
  degre: number | null;
  ingredientsText: string;
  allergenesText: string;
  energieKj: number;
  energieKcal: number;
  glucides: number;
  sucres: number;
}

function ELabelInline(props: ELabelInlineProps) {
  return (
    <div className="space-y-4 font-sans">
      <div className="space-y-1 border-b border-border pb-3">
        <p className="text-[10px] uppercase tracking-widest text-muted">
          (UE) 2021/2117
        </p>
        <p className="font-serif text-base text-foreground">{props.nom}</p>
        <p className="text-xs text-muted">
          {[props.millesime, props.typeLabel].filter(Boolean).join(" · ")}
        </p>
        {props.domaine && (
          <p className="text-xs text-muted">
            {props.domaine}
            {props.region ? ` — ${props.region}` : ""}
          </p>
        )}
        {props.degre !== null && (
          <p className="pt-1 text-[10px] text-muted">
            {props.volume_cl ? `${props.volume_cl} cl · ` : ""}
            {formatNumberFR(props.degre, 1)} % vol
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <p className="text-[10px] uppercase tracking-widest text-muted">
          Ingrédients
        </p>
        <p className="text-xs leading-relaxed text-foreground">
          {props.ingredientsText || "—"}
          {props.allergenesText && (
            <>
              {" — contient des "}
              <strong className="font-semibold">
                {props.allergenesText.toLowerCase()}
              </strong>
              .
            </>
          )}
        </p>
      </div>

      <div className="space-y-1.5">
        <p className="text-[10px] uppercase tracking-widest text-muted">
          Déclaration nutritionnelle
        </p>
        <p className="text-[10px] text-muted">Pour 100 ml</p>
        <table className="w-full text-[11px]">
          <tbody>
            <NutRow
              label="Énergie"
              value={`${props.energieKj} kJ / ${props.energieKcal} kcal`}
              bold
            />
            <NutRow label="Matières grasses" value="0 g" />
            <NutRow label="dont saturés" value="0 g" indent />
            <NutRow
              label="Glucides"
              value={`${formatNumberFR(props.glucides, 1)} g`}
            />
            <NutRow
              label="dont sucres"
              value={`${formatNumberFR(props.sucres, 1)} g`}
              indent
            />
            <NutRow label="Protéines" value="0 g" />
            <NutRow label="Sel" value="0 g" />
          </tbody>
        </table>
      </div>

      <p className="border-t border-border pt-3 text-[10px] leading-relaxed text-muted">
        Aucune donnée personnelle n&apos;est collectée lors de la consultation
        de cette page.
      </p>
    </div>
  );
}

function NutRow({
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
    <tr className="border-t border-border first:border-t-0">
      <td
        className={
          "py-1 " +
          (indent ? "pl-3 text-muted" : "text-foreground") +
          (bold ? " font-semibold" : "")
        }
      >
        {label}
      </td>
      <td
        className={
          "py-1 text-right tabular-nums " +
          (bold ? "font-semibold text-foreground" : "text-foreground")
        }
      >
        {value}
      </td>
    </tr>
  );
}
