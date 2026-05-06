"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wine } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Input";
import { FormError } from "@/components/auth/FormError";
import {
  cuveeInfosSchema,
  type CuveeInfosInput,
  TYPE_VIN_LABELS,
  TYPES_VIN_LIST,
  VOLUMES_ML_LIST,
  type TypeVinValue,
} from "@/lib/onboarding/schemas";
import { setOnboardingCuveeId } from "@/lib/onboarding/storage";
import { cn } from "@/lib/utils";
import { createCuveeAction } from "./actions";

const TYPE_COLORS: Record<TypeVinValue, string> = {
  rouge: "text-[#7c1d1d]",
  blanc: "text-[#c9a961]",
  rose: "text-[#d4859a]",
  effervescent: "text-[#d4af37]",
  liquoreux: "text-[#a16207]",
  autre: "text-muted",
};

export function InfosForm() {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | undefined>();

  const currentYear = new Date().getFullYear();
  const years = React.useMemo(() => {
    const out: number[] = [];
    for (let y = currentYear; y >= 2020; y--) out.push(y);
    return out;
  }, [currentYear]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CuveeInfosInput>({
    resolver: zodResolver(cuveeInfosSchema),
    defaultValues: {
      nom: "",
      millesime: currentYear - 1,
      type_vin: "rouge",
      degre_alcool: 12.5,
      volume_ml: 750,
      sucres_residuels_g_l: 0,
    },
  });

  const onSubmit = async (values: CuveeInfosInput) => {
    setServerError(undefined);
    const result = await createCuveeAction(values);
    if (result.error || !result.cuveeId) {
      setServerError(result.error ?? "Erreur inattendue.");
      return;
    }
    setOnboardingCuveeId(result.cuveeId);
    router.push("/onboarding/premiere-cuvee/ingredients");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <Field
        label="Nom de la cuvée"
        htmlFor="nom"
        required
        error={errors.nom?.message}
      >
        <Input
          id="nom"
          placeholder="Cuvée des Vieilles Vignes"
          aria-invalid={Boolean(errors.nom)}
          {...register("nom")}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Millésime"
          htmlFor="millesime"
          required
          error={errors.millesime?.message}
        >
          <Select
            id="millesime"
            aria-invalid={Boolean(errors.millesime)}
            {...register("millesime", { valueAsNumber: true })}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Volume"
          htmlFor="volume_ml"
          required
          error={errors.volume_ml?.message}
        >
          <Select
            id="volume_ml"
            aria-invalid={Boolean(errors.volume_ml)}
            {...register("volume_ml", { valueAsNumber: true })}
          >
            {VOLUMES_ML_LIST.map((v) => (
              <option key={v} value={v}>
                {v} ml
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field
        label="Type de vin"
        required
        error={errors.type_vin?.message}
      >
        <Controller
          control={control}
          name="type_vin"
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {TYPES_VIN_LIST.map((t) => {
                const selected = field.value === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => field.onChange(t)}
                    className={cn(
                      "flex items-center gap-2 rounded-sm border px-3 py-3 text-sm transition-colors",
                      selected
                        ? "border-accent bg-accent/5 text-foreground"
                        : "border-border bg-background text-muted hover:border-foreground/30 hover:text-foreground",
                    )}
                    aria-pressed={selected}
                  >
                    <Wine
                      className={cn("h-4 w-4 flex-shrink-0", TYPE_COLORS[t])}
                      aria-hidden="true"
                    />
                    <span className="truncate">{TYPE_VIN_LABELS[t]}</span>
                  </button>
                );
              })}
            </div>
          )}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Degré d'alcool (% vol)"
          htmlFor="degre_alcool"
          required
          error={errors.degre_alcool?.message}
        >
          <Input
            id="degre_alcool"
            type="number"
            step="0.1"
            min="8"
            max="15"
            inputMode="decimal"
            aria-invalid={Boolean(errors.degre_alcool)}
            {...register("degre_alcool", { valueAsNumber: true })}
          />
        </Field>

        <Field
          label="Sucres résiduels (g/L)"
          htmlFor="sucres_residuels_g_l"
          error={errors.sucres_residuels_g_l?.message}
          hint={
            !errors.sucres_residuels_g_l
              ? "0 pour un vin sec, 4-12 demi-sec, > 45 liquoreux."
              : undefined
          }
        >
          <Input
            id="sucres_residuels_g_l"
            type="number"
            step="0.1"
            min="0"
            inputMode="decimal"
            aria-invalid={Boolean(errors.sucres_residuels_g_l)}
            {...register("sucres_residuels_g_l", { valueAsNumber: true })}
          />
        </Field>
      </div>

      <FormError message={serverError} />

      <Button type="submit" size="lg" block disabled={isSubmitting}>
        {isSubmitting ? "Création de la cuvée…" : "Continuer"}
      </Button>
    </form>
  );
}
