"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { FormError } from "@/components/auth/FormError";
import { calculerNutrition } from "@/lib/nutrition";
import { getOnboardingCuveeId } from "@/lib/onboarding/storage";
import { getDraftCuveeAction, saveNutritionAction } from "./actions";

type Status = "loading" | "ready" | "missing";

interface FormValues {
  energie_kj: number;
  energie_kcal: number;
  glucides_g: number;
  sucres_g: number;
}

export function NutritionForm() {
  const router = useRouter();
  const [status, setStatus] = React.useState<Status>("loading");
  const [serverError, setServerError] = React.useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [edited, setEdited] = React.useState(false);
  const [values, setValues] = React.useState<FormValues>({
    energie_kj: 0,
    energie_kcal: 0,
    glucides_g: 0,
    sucres_g: 0,
  });
  const cuveeIdRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    const id = getOnboardingCuveeId();
    if (!id) {
      setStatus("missing");
      return;
    }
    cuveeIdRef.current = id;

    void (async () => {
      const result = await getDraftCuveeAction(id);
      if (result.error || !result.cuvee) {
        setStatus("missing");
        return;
      }
      const nut = calculerNutrition({
        degreAlcool: result.cuvee.degre_alcool,
        sucresResiduels: result.cuvee.sucres_residuels,
      });
      setValues({
        energie_kj: nut.energieKj,
        energie_kcal: nut.energieKcal,
        glucides_g: nut.glucides,
        sucres_g: nut.sucres,
      });
      setStatus("ready");
    })();
  }, []);

  function update<K extends keyof FormValues>(key: K, raw: string) {
    const num = Number(raw.replace(",", "."));
    if (Number.isNaN(num)) return;
    setValues((prev) => ({ ...prev, [key]: num }));
    setEdited(true);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status !== "ready") return;
    const id = cuveeIdRef.current;
    if (!id) return;
    setServerError(undefined);
    setIsSubmitting(true);
    const result = await saveNutritionAction(id, values);
    setIsSubmitting(false);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    router.push("/onboarding/premiere-cuvee/apercu");
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

  if (status === "loading") {
    return (
      <div className="rounded-md border border-border bg-background p-6 text-sm text-muted">
        Calcul des valeurs estimées…
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <div className="flex items-start gap-3 rounded-sm border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
        <p className="leading-relaxed">
          Valeurs estimées selon les tables IFV. Vous pouvez les ajuster si
          vous avez fait analyser votre cuvée en laboratoire.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Énergie (kJ)" htmlFor="energie_kj">
          <Input
            id="energie_kj"
            type="number"
            inputMode="numeric"
            step="1"
            min="0"
            value={values.energie_kj}
            onChange={(e) => update("energie_kj", e.target.value)}
          />
        </Field>
        <Field label="Énergie (kcal)" htmlFor="energie_kcal">
          <Input
            id="energie_kcal"
            type="number"
            inputMode="numeric"
            step="1"
            min="0"
            value={values.energie_kcal}
            onChange={(e) => update("energie_kcal", e.target.value)}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Glucides (g / 100 ml)" htmlFor="glucides_g">
          <Input
            id="glucides_g"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            value={values.glucides_g}
            onChange={(e) => update("glucides_g", e.target.value)}
          />
        </Field>
        <Field label="dont sucres (g / 100 ml)" htmlFor="sucres_g">
          <Input
            id="sucres_g"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            value={values.sucres_g}
            onChange={(e) => update("sucres_g", e.target.value)}
          />
        </Field>
      </div>

      <div className="rounded-sm border border-dashed border-border bg-surface p-4">
        <p className="text-xs uppercase tracking-widest text-muted">
          Valeurs réglementaires fixes pour le vin
        </p>
        <div className="mt-2 grid grid-cols-3 gap-3 text-sm">
          <FixedRow label="Matières grasses" value="0 g" />
          <FixedRow label="Protéines" value="0 g" />
          <FixedRow label="Sel" value="0 g" />
        </div>
      </div>

      <FormError message={serverError} />

      <Button type="submit" size="lg" block disabled={isSubmitting}>
        {isSubmitting
          ? "Enregistrement…"
          : edited
            ? "Enregistrer mes valeurs"
            : "Continuer avec ces valeurs"}
      </Button>
    </form>
  );
}

function FixedRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="font-medium text-foreground tabular-nums">{value}</p>
    </div>
  );
}
