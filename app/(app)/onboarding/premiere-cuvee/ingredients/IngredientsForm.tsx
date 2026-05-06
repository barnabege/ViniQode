"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FormError } from "@/components/auth/FormError";
import {
  INGREDIENTS,
  type Ingredient,
  libelleAllergenes,
  detecterAllergenes,
} from "@/lib/ingredients";
import { getOnboardingCuveeId } from "@/lib/onboarding/storage";
import { cn } from "@/lib/utils";
import { saveIngredientsAction } from "./actions";

const CATEGORY_LABELS: Record<Ingredient["categorie"], string> = {
  base: "Raisins",
  enrichissement: "Enrichissement",
  "regulateur-acidite": "Régulateurs d'acidité",
  conservateur: "Conservateurs",
  stabilisant: "Stabilisants",
  pratique: "Pratiques œnologiques",
};

const DEFAULT_SELECTED = ["raisins", "e220"];

function ingredientById(id: string): Ingredient | undefined {
  return INGREDIENTS.find((i) => i.id === id);
}

export function IngredientsForm() {
  const router = useRouter();
  const [selected, setSelected] = React.useState<string[]>(DEFAULT_SELECTED);
  const [serverError, setServerError] = React.useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [missingCuvee, setMissingCuvee] = React.useState(false);

  React.useEffect(() => {
    if (!getOnboardingCuveeId()) {
      setMissingCuvee(true);
    }
  }, []);

  const allergenes = React.useMemo(
    () => detecterAllergenes(selected),
    [selected],
  );

  const available = React.useMemo(() => {
    return INGREDIENTS.filter((i) => !selected.includes(i.id));
  }, [selected]);

  const groups = React.useMemo(() => {
    const out = new Map<Ingredient["categorie"], Ingredient[]>();
    for (const ing of available) {
      const list = out.get(ing.categorie) ?? [];
      list.push(ing);
      out.set(ing.categorie, list);
    }
    return out;
  }, [available]);

  function add(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }

  function remove(id: string) {
    const ing = ingredientById(id);
    if (ing?.fixe) return;
    setSelected((prev) => prev.filter((x) => x !== id));
  }

  function move(id: string, dir: -1 | 1) {
    setSelected((prev) => {
      const idx = prev.indexOf(id);
      if (idx === -1) return prev;
      const next = idx + dir;
      if (next < 0 || next >= prev.length) return prev;
      const copy = [...prev];
      const tmp = copy[idx]!;
      copy[idx] = copy[next]!;
      copy[next] = tmp;
      return copy;
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (missingCuvee) return;
    setServerError(undefined);
    setIsSubmitting(true);

    const cuveeId = getOnboardingCuveeId();
    if (!cuveeId) {
      setIsSubmitting(false);
      setMissingCuvee(true);
      return;
    }

    const result = await saveIngredientsAction(cuveeId, selected);
    setIsSubmitting(false);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    router.push("/onboarding/premiere-cuvee/nutrition");
  }

  if (missingCuvee) {
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

  return (
    <form onSubmit={onSubmit} className="space-y-8" noValidate>
      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-lg text-foreground">
            Ingrédients sélectionnés
          </h2>
          <p className="text-xs text-muted">
            Ordre décroissant d&apos;incorporation
          </p>
        </div>

        <ol className="mt-3 space-y-2">
          {selected.map((id, idx) => {
            const ing = ingredientById(id);
            if (!ing) return null;
            const isAllergen =
              ing.allergenes && ing.allergenes.length > 0;
            return (
              <li
                key={id}
                className="flex items-center gap-3 rounded-sm border border-border bg-background p-3"
              >
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-surface text-xs font-medium tabular-nums text-foreground">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground">
                    {ing.nom}
                    {ing.codeE && (
                      <span className="ml-1.5 text-xs text-muted">
                        ({ing.codeE})
                      </span>
                    )}
                  </p>
                  {isAllergen && (
                    <p className="text-xs text-amber-700">
                      Allergène : {libelleAllergenes(ing.allergenes!)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Monter"
                    onClick={() => move(id, -1)}
                    disabled={idx === 0}
                    className="flex h-8 w-8 items-center justify-center rounded-sm text-muted transition-colors hover:bg-surface hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Descendre"
                    onClick={() => move(id, 1)}
                    disabled={idx === selected.length - 1}
                    className="flex h-8 w-8 items-center justify-center rounded-sm text-muted transition-colors hover:bg-surface hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Retirer"
                    onClick={() => remove(id)}
                    disabled={ing.fixe}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-sm text-muted transition-colors hover:bg-surface hover:text-error",
                      ing.fixe && "cursor-not-allowed opacity-30",
                    )}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ol>

        {allergenes.length > 0 && (
          <div className="mt-3 rounded-sm border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <p>
              <strong className="font-semibold">
                Allergènes détectés :
              </strong>{" "}
              {libelleAllergenes(allergenes)}. Ils seront mis en évidence sur
              votre page e-label.
            </p>
          </div>
        )}
      </section>

      <section>
        <h2 className="font-serif text-lg text-foreground">
          Ajouter un ingrédient
        </h2>
        <div className="mt-3 space-y-4">
          {Array.from(groups.entries()).map(([cat, items]) => (
            <div key={cat}>
              <p className="label-eyebrow">{CATEGORY_LABELS[cat]}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {items.map((ing) => (
                  <button
                    key={ing.id}
                    type="button"
                    onClick={() => add(ing.id)}
                    className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-background px-3 py-1.5 text-sm text-foreground transition-colors hover:border-accent hover:bg-accent/5"
                  >
                    <Plus className="h-3.5 w-3.5 text-accent" />
                    <span>{ing.nom}</span>
                    {ing.codeE && (
                      <span className="text-xs text-muted">
                        ({ing.codeE})
                      </span>
                    )}
                    {ing.allergenes && ing.allergenes.length > 0 && (
                      <Badge variant="warning" size="sm">
                        Allergène
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <FormError message={serverError} />

      <Button type="submit" size="lg" block disabled={isSubmitting}>
        {isSubmitting ? "Enregistrement…" : "Continuer"}
      </Button>
    </form>
  );
}
