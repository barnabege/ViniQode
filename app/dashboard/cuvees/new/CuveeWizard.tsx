// app/dashboard/cuvees/new/CuveeWizard.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { NutritionTable } from "@/components/ui/NutritionTable";
import { PhonePreview } from "@/components/ui/PhonePreview";
import { QRCodePreview } from "@/components/ui/QRCodePreview";
import { Badge } from "@/components/ui/Badge";
import {
  APPELLATIONS_FR,
  INGREDIENTS,
  detecterAllergenes,
  libelleAllergenes,
  listeIngredientsLibelle,
  type AllergeneCode,
  type Ingredient,
} from "@/lib/ingredients";
import { calculerNutrition, type NutritionValues } from "@/lib/nutrition";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { generateQrCode, type QrCodeAssets } from "@/lib/qrcode";
import { slugify } from "@/lib/utils";
import type { Cuvee, TypeVin } from "@/lib/database.types";

const STEPS = [
  { label: "Informations", description: "Identité de la cuvée" },
  { label: "Ingrédients", description: "Liste réglementaire" },
  { label: "Nutrition", description: "Valeurs calculées" },
  { label: "Aperçu", description: "Publication ou brouillon" },
];

const TYPES_VIN = [
  { value: "blanc", label: "Blanc" },
  { value: "rouge", label: "Rouge" },
  { value: "rose", label: "Rosé" },
  { value: "effervescent", label: "Effervescent" },
  { value: "liquoreux", label: "Liquoreux" },
  { value: "autre", label: "Autre" },
] as const;

const VOLUMES = [
  { value: 37, label: "37,5 cl" },
  { value: 75, label: "75 cl" },
  { value: 100, label: "1 L" },
  { value: 150, label: "1,5 L" },
] as const;

const MILLESIMES = Array.from({ length: 8 }, (_, i) => 2025 - i);

interface FormState {
  nom: string;
  appellation: string;
  millesime: string;
  type_vin: string;
  degre_alcool: string;
  volume_cl: string;
  sucres_residuels: string;
  ingredients: string[];
}

const INITIAL: FormState = {
  nom: "",
  appellation: "",
  millesime: "",
  type_vin: "",
  degre_alcool: "",
  volume_cl: "",
  sucres_residuels: "0",
  ingredients: ["raisins"],
};

function initialFromCuvee(c: Cuvee): FormState {
  const ings = Array.isArray(c.ingredients)
    ? (c.ingredients as string[])
    : ["raisins"];
  return {
    nom: c.nom ?? "",
    appellation: c.appellation ?? "",
    millesime: c.millesime ? String(c.millesime) : "",
    type_vin: c.type_vin ?? "",
    degre_alcool: c.degre_alcool != null ? String(c.degre_alcool) : "",
    volume_cl: c.volume_cl ? String(c.volume_cl) : "",
    sucres_residuels:
      c.sucres_residuels != null ? String(c.sucres_residuels) : "0",
    ingredients: ings.length > 0 ? ings : ["raisins"],
  };
}

interface BuildFieldsParams {
  form: FormState;
  allergenes: AllergeneCode[];
  nutrition: NutritionValues;
  includeNutrition: boolean;
}

function buildFields({
  form,
  allergenes,
  nutrition,
  includeNutrition,
}: BuildFieldsParams): Record<string, unknown> {
  const fields: Record<string, unknown> = {
    nom: form.nom,
    ingredients: form.ingredients,
    allergenes,
  };
  if (form.appellation) fields.appellation = form.appellation;
  if (form.millesime) fields.millesime = parseInt(form.millesime, 10);
  if (form.type_vin) fields.type_vin = form.type_vin;
  if (form.degre_alcool && !Number.isNaN(parseFloat(form.degre_alcool))) {
    fields.degre_alcool = parseFloat(form.degre_alcool);
  }
  if (form.volume_cl) fields.volume_cl = parseInt(form.volume_cl, 10);
  if (
    form.sucres_residuels !== "" &&
    !Number.isNaN(parseFloat(form.sucres_residuels))
  ) {
    fields.sucres_residuels = parseFloat(form.sucres_residuels);
  }
  if (includeNutrition && form.degre_alcool) {
    fields.valeur_energetique_kj = nutrition.energieKj;
    fields.valeur_energetique_kcal = nutrition.energieKcal;
    fields.glucides = nutrition.glucides;
    fields.sucres_nutritionnels = nutrition.sucres;
  }
  return fields;
}

interface CuveeWizardProps {
  userId: string;
  domaine: string;
  existingCuvee?: Cuvee | null;
}

export function CuveeWizard({
  userId,
  domaine,
  existingCuvee,
}: CuveeWizardProps) {
  const router = useRouter();

  const [savedCuveeId, setSavedCuveeId] = React.useState<string | null>(
    existingCuvee?.id ?? null,
  );
  const [currentStatut, setCurrentStatut] = React.useState<
    "actif" | "brouillon"
  >(existingCuvee?.statut === "actif" ? "actif" : "brouillon");

  const [step, setStep] = React.useState(0);
  const [form, setForm] = React.useState<FormState>(
    existingCuvee ? initialFromCuvee(existingCuvee) : INITIAL,
  );
  const [qrAssets, setQrAssets] = React.useState<QrCodeAssets | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [draftMsg, setDraftMsg] = React.useState<string | null>(null);
  const [draftMsgKind, setDraftMsgKind] = React.useState<"ok" | "err">("ok");
  const [submitDone, setSubmitDone] = React.useState(false);
  const [publishOnSubmit, setPublishOnSubmit] = React.useState<boolean>(
    existingCuvee?.statut === "actif",
  );
  const [showCancelDialog, setShowCancelDialog] = React.useState(false);

  const isEditMode = Boolean(existingCuvee || savedCuveeId);

  // Refs pour le handler beforeunload (registered once, lit toujours la dernière valeur).
  const dirtyRef = React.useRef(false);
  const formRef = React.useRef(form);
  const savedCuveeIdRef = React.useRef(savedCuveeId);
  const allergenesRef = React.useRef<AllergeneCode[]>([]);
  const nutritionRef = React.useRef<NutritionValues | null>(null);
  const submitDoneRef = React.useRef(submitDone);

  React.useEffect(() => {
    formRef.current = form;
  }, [form]);
  React.useEffect(() => {
    savedCuveeIdRef.current = savedCuveeId;
  }, [savedCuveeId]);
  React.useEffect(() => {
    submitDoneRef.current = submitDone;
  }, [submitDone]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    dirtyRef.current = true;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const toggleIngredient = (id: string, checked: boolean) => {
    if (id === "raisins") return;
    dirtyRef.current = true;
    setForm((f) => ({
      ...f,
      ingredients: checked
        ? [...f.ingredients, id]
        : f.ingredients.filter((i) => i !== id),
    }));
  };

  const allergenes = detecterAllergenes(form.ingredients);
  const allergenesLibelle = libelleAllergenes(allergenes);
  const ingredientsLibelle = listeIngredientsLibelle(form.ingredients);

  const nutrition: NutritionValues = React.useMemo(
    () =>
      calculerNutrition({
        degreAlcool: parseFloat(form.degre_alcool) || 0,
        sucresResiduels: parseFloat(form.sucres_residuels) || 0,
      }),
    [form.degre_alcool, form.sucres_residuels],
  );

  React.useEffect(() => {
    allergenesRef.current = allergenes;
    nutritionRef.current = nutrition;
  }, [allergenes, nutrition]);

  // Auto-save silencieux à la fermeture de la page.
  React.useEffect(() => {
    const handler = () => {
      if (submitDoneRef.current) return;
      if (!dirtyRef.current) return;
      const f = formRef.current;
      if (!f.nom.trim()) return;
      const fields = buildFields({
        form: f,
        allergenes: allergenesRef.current,
        nutrition: nutritionRef.current ?? {
          energieKj: 0,
          energieKcal: 0,
          matieresGrasses: 0,
          acidesGrasSatures: 0,
          glucides: 0,
          sucres: 0,
          proteines: 0,
          sel: 0,
          source: "table",
        },
        includeNutrition: Boolean(f.degre_alcool),
      });
      const payload = JSON.stringify({
        id: savedCuveeIdRef.current,
        fields,
      });
      try {
        navigator.sendBeacon(
          "/api/cuvees/draft",
          new Blob([payload], { type: "application/json" }),
        );
      } catch {
        // best effort
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  const canGoNext = (() => {
    if (step === 0) {
      return Boolean(
        form.nom &&
          form.appellation &&
          form.millesime &&
          form.type_vin &&
          form.degre_alcool &&
          form.volume_cl,
      );
    }
    return true;
  })();

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const goPrev = () => setStep((s) => Math.max(s - 1, 0));

  function flashDraftMsg(msg: string, kind: "ok" | "err") {
    setDraftMsg(msg);
    setDraftMsgKind(kind);
    window.setTimeout(() => {
      setDraftMsg(null);
    }, 4000);
  }

  async function saveDraft(): Promise<{ ok: boolean; id?: string }> {
    if (!form.nom.trim()) {
      flashDraftMsg("Le nom de la cuvée est requis pour sauvegarder.", "err");
      return { ok: false };
    }
    setSubmitting(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const fields = buildFields({
        form,
        allergenes,
        nutrition,
        includeNutrition: Boolean(form.degre_alcool),
      });

      if (savedCuveeId) {
        // UPDATE en préservant le statut existant.
        const { error: updateError } = await supabase
          .from("cuvees")
          .update(fields as never)
          .eq("id", savedCuveeId);
        if (updateError) throw updateError;
        dirtyRef.current = false;
        flashDraftMsg(
          currentStatut === "actif"
            ? "Modifications enregistrées."
            : "Brouillon sauvegardé.",
          "ok",
        );
        return { ok: true, id: savedCuveeId };
      }

      const { data, error: insertError } = await supabase
        .from("cuvees")
        .insert({
          user_id: userId,
          ...(fields as Record<string, unknown>),
          statut: "brouillon",
        } as never)
        .select("id")
        .single<{ id: string }>();
      if (insertError) throw insertError;
      setSavedCuveeId(data.id);
      setCurrentStatut("brouillon");
      dirtyRef.current = false;
      flashDraftMsg("Brouillon sauvegardé.", "ok");
      return { ok: true, id: data.id };
    } catch (err) {
      flashDraftMsg(
        err instanceof Error
          ? err.message
          : "Sauvegarde impossible. Réessayez.",
        "err",
      );
      return { ok: false };
    } finally {
      setSubmitting(false);
    }
  }

  // Soumission finale depuis l'étape 4 — UPDATE/INSERT avec statut explicite,
  // génère le QR si on publie une cuvée qui n'avait pas encore d'e-label.
  const onSubmitFinal = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const targetStatut: "actif" | "brouillon" = publishOnSubmit
        ? "actif"
        : "brouillon";
      const fields = {
        ...buildFields({
          form,
          allergenes,
          nutrition,
          includeNutrition: true,
        }),
        statut: targetStatut,
      };

      let cuveeId: string;

      if (savedCuveeId) {
        const { error: updateError } = await supabase
          .from("cuvees")
          .update(fields as never)
          .eq("id", savedCuveeId);
        if (updateError) throw updateError;
        cuveeId = savedCuveeId;
      } else {
        const { data: created, error: insertError } = await supabase
          .from("cuvees")
          .insert({
            user_id: userId,
            ...fields,
            qr_code_url: null,
            elabel_url: null,
          } as never)
          .select("id")
          .single<{ id: string }>();
        if (insertError) throw insertError;
        cuveeId = created.id;
        setSavedCuveeId(cuveeId);
      }

      setCurrentStatut(targetStatut);

      if (targetStatut === "actif" && !existingCuvee?.elabel_url) {
        const elabelUrl = `${window.location.origin}/elabel/${cuveeId}`;
        await supabase
          .from("cuvees")
          .update({ elabel_url: elabelUrl })
          .eq("id", cuveeId);
      }

      dirtyRef.current = false;

      if (targetStatut === "actif") {
        router.push(`/onboarding/felicitations?cuvee_id=${cuveeId}`);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue. Veuillez réessayer ou contacter notre support.",
      );
      setSubmitting(false);
    }
  };

  function onCancelClick() {
    if (!dirtyRef.current && !submitting) {
      router.push("/dashboard");
      return;
    }
    setShowCancelDialog(true);
  }

  async function onSaveAndLeave() {
    setShowCancelDialog(false);
    const r = await saveDraft();
    if (r.ok) router.push("/dashboard");
  }

  function onLeaveWithoutSaving() {
    dirtyRef.current = false;
    setShowCancelDialog(false);
    router.push("/dashboard");
  }

  const finalButtonLabel = (() => {
    if (existingCuvee) return "Enregistrer les modifications";
    return publishOnSubmit ? "Publier" : "Sauvegarder en brouillon";
  })();

  const finalButtonLoadingLabel = (() => {
    if (existingCuvee) return "Enregistrement…";
    return publishOnSubmit ? "Publication…" : "Sauvegarde…";
  })();

  const draftButtonLabel = isEditMode
    ? "Sauvegarder les modifications"
    : "Sauvegarder en brouillon";

  return (
    <div className="space-y-8">
      <StepIndicator steps={STEPS} current={step} />

      <div className="rounded-md border border-border bg-background p-6 sm:p-8">
        {step === 0 && <Step1 form={form} update={update} />}

        {step === 1 && (
          <Step2
            selected={form.ingredients}
            toggle={toggleIngredient}
            allergenesLibelle={allergenesLibelle}
            ingredientsLibelle={ingredientsLibelle}
          />
        )}

        {step === 2 && (
          <Step3 form={form} update={update} nutrition={nutrition} />
        )}

        {step === 3 && (
          <Step4
            form={form}
            nutrition={nutrition}
            allergenesLibelle={allergenesLibelle}
            ingredientsLibelle={ingredientsLibelle}
            domaine={domaine}
            submitting={submitting}
            error={error}
            currentStatut={currentStatut}
            isEdit={Boolean(existingCuvee)}
            publishOnSubmit={publishOnSubmit}
            setPublishOnSubmit={(v) => {
              dirtyRef.current = true;
              setPublishOnSubmit(v);
            }}
            onSubmitFinal={onSubmitFinal}
          />
        )}
      </div>

      {draftMsg && (
        <p
          role="status"
          className={
            "text-sm " +
            (draftMsgKind === "ok" ? "text-green-700" : "text-error")
          }
        >
          {draftMsg}
        </p>
      )}

      {!submitDone && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancelClick}
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={goPrev}
              disabled={step === 0 || submitting}
            >
              <ArrowLeft className="h-4 w-4" /> Précédent
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() => void saveDraft()}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-sm border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {draftButtonLabel}
            </button>
            {step < STEPS.length - 1 && (
              <Button type="button" onClick={goNext} disabled={!canGoNext}>
                Étape suivante <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {showCancelDialog && (
        <CancelDialog
          submitting={submitting}
          onSaveAndLeave={onSaveAndLeave}
          onLeaveWithoutSaving={onLeaveWithoutSaving}
          onClose={() => setShowCancelDialog(false)}
        />
      )}
    </div>
  );
}

// ─── Dialog d'annulation ─────────────────────────────────────────────────
function CancelDialog({
  submitting,
  onSaveAndLeave,
  onLeaveWithoutSaving,
  onClose,
}: {
  submitting: boolean;
  onSaveAndLeave: () => void;
  onLeaveWithoutSaving: () => void;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
    >
      <div className="w-full max-w-sm rounded-md border border-border bg-background p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-serif text-lg text-foreground">
            Sauvegarder avant de quitter ?
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="text-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-sm text-muted">
          Vos modifications ne sont pas encore enregistrées.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Button onClick={onSaveAndLeave} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Sauvegarde…
              </>
            ) : (
              "Sauvegarder et quitter"
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={onLeaveWithoutSaving}
            disabled={submitting}
          >
            Quitter sans sauvegarder
          </Button>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Annuler
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Étape 1 ─────────────────────────────────────────────────────────────
function Step1({
  form,
  update,
}: {
  form: FormState;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl text-foreground">
          Informations générales
        </h2>
        <p className="mt-1 text-sm text-muted">
          Identifiez votre cuvée et ses caractéristiques techniques.
        </p>
      </div>

      <Field label="Nom de la cuvée" htmlFor="nom" required>
        <Input
          id="nom"
          value={form.nom}
          onChange={(e) => update("nom", e.target.value)}
          placeholder="Cuvée des Vieilles Vignes"
          required
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Appellation" htmlFor="appellation" required>
          <Select
            id="appellation"
            value={form.appellation}
            onChange={(e) => update("appellation", e.target.value)}
            required
          >
            <option value="">Choisir…</option>
            {APPELLATIONS_FR.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Millésime" htmlFor="millesime" required>
          <Select
            id="millesime"
            value={form.millesime}
            onChange={(e) => update("millesime", e.target.value)}
            required
          >
            <option value="">Choisir…</option>
            {MILLESIMES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Type de vin" htmlFor="type_vin" required>
          <Select
            id="type_vin"
            value={form.type_vin}
            onChange={(e) => update("type_vin", e.target.value)}
            required
          >
            <option value="">Choisir…</option>
            {TYPES_VIN.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Degré alcoolique (%)"
          htmlFor="degre_alcool"
          required
          hint="Ex. 12,5"
        >
          <Input
            id="degre_alcool"
            type="number"
            min="0"
            max="20"
            step="0.1"
            value={form.degre_alcool}
            onChange={(e) => update("degre_alcool", e.target.value)}
            required
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Volume de la bouteille" htmlFor="volume_cl" required>
          <Select
            id="volume_cl"
            value={form.volume_cl}
            onChange={(e) => update("volume_cl", e.target.value)}
            required
          >
            <option value="">Choisir…</option>
            {VOLUMES.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Sucres résiduels (g/L)"
          htmlFor="sucres_residuels"
          hint="0 pour un vin sec"
        >
          <Input
            id="sucres_residuels"
            type="number"
            min="0"
            step="0.1"
            value={form.sucres_residuels}
            onChange={(e) => update("sucres_residuels", e.target.value)}
          />
        </Field>
      </div>
    </div>
  );
}

// ─── Étape 2 : Ingrédients ───────────────────────────────────────────────
function Step2({
  selected,
  toggle,
  allergenesLibelle,
  ingredientsLibelle,
}: {
  selected: string[];
  toggle: (id: string, checked: boolean) => void;
  allergenesLibelle: string;
  ingredientsLibelle: string;
}) {
  const groups: { title: string; categorie: Ingredient["categorie"] }[] = [
    { title: "Ingrédients de base", categorie: "base" },
    { title: "Enrichissement", categorie: "enrichissement" },
    { title: "Régulateurs d'acidité", categorie: "regulateur-acidite" },
    {
      title: "Conservateurs et antioxydants",
      categorie: "conservateur",
    },
    { title: "Agents stabilisants", categorie: "stabilisant" },
    { title: "Autres pratiques œnologiques", categorie: "pratique" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl text-foreground">Ingrédients</h2>
        <p className="mt-1 text-sm text-muted">
          Listez tous les ingrédients et additifs utilisés dans la
          fabrication de cette cuvée. Les raisins sont ajoutés
          automatiquement en premier.
        </p>
      </div>

      <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        Sélectionnez ce qui s'applique à cette cuvée. La liste finale est
        constituée par ordre décroissant d'incorporation.
      </div>

      <div className="space-y-8">
        {groups.map((g) => {
          const items = INGREDIENTS.filter((i) => i.categorie === g.categorie);
          return (
            <div key={g.title}>
              <h3 className="font-serif text-base text-foreground">{g.title}</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {items.map((ing) => (
                  <Checkbox
                    key={ing.id}
                    checked={selected.includes(ing.id)}
                    disabled={ing.fixe}
                    onCheckedChange={(v) => toggle(ing.id, v)}
                    label={
                      <span>
                        {ing.nom}
                        {ing.codeE && (
                          <span className="ml-1 text-muted">({ing.codeE})</span>
                        )}
                        {ing.allergenes && (
                          <Badge variant="warning" className="ml-2">
                            allergène
                          </Badge>
                        )}
                      </span>
                    }
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-3 rounded-md border border-border bg-surface p-5">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted">
            Liste réglementaire
          </p>
          <p className="mt-1 text-sm text-foreground">{ingredientsLibelle}</p>
        </div>
        {allergenesLibelle && (
          <div>
            <p className="text-xs uppercase tracking-widest text-muted">
              Allergènes détectés
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {allergenesLibelle}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Étape 3 : Nutrition ─────────────────────────────────────────────────
function Step3({
  form,
  update,
  nutrition,
}: {
  form: FormState;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  nutrition: NutritionValues;
}) {
  const [manuel, setManuel] = React.useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl text-foreground">
          Valeurs nutritionnelles
        </h2>
        <p className="mt-1 text-sm text-muted">
          ViniQode calcule automatiquement vos valeurs nutritionnelles selon
          les tables de référence officielles DGCCRF/IFV. Vous pouvez
          affiner manuellement si vous disposez d'analyses de laboratoire.
        </p>
      </div>

      <NutritionTable values={nutrition} />

      <p className="text-xs text-muted">
        Calcul basé sur : degré alcoolique {form.degre_alcool || "—"}° et
        sucres résiduels {form.sucres_residuels || "0"} g/L selon les tables
        DGCCRF.
      </p>

      <div className="border-t border-border pt-6">
        <Checkbox
          checked={manuel}
          onCheckedChange={setManuel}
          label="Saisir des valeurs manuelles (analyse de laboratoire)"
          description="À utiliser uniquement si vous disposez d'un rapport d'analyse certifié."
        />
        {manuel && (
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Sucres résiduels (g/L)" htmlFor="sucres_manuel">
              <Input
                id="sucres_manuel"
                type="number"
                step="0.1"
                value={form.sucres_residuels}
                onChange={(e) => update("sucres_residuels", e.target.value)}
              />
            </Field>
            <Field label="Degré alcoolique (%)" htmlFor="degre_manuel">
              <Input
                id="degre_manuel"
                type="number"
                step="0.1"
                value={form.degre_alcool}
                onChange={(e) => update("degre_alcool", e.target.value)}
              />
            </Field>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Étape 4 : Aperçu et soumission ──────────────────────────────────────
function Step4({
  form,
  nutrition,
  allergenesLibelle,
  ingredientsLibelle,
  domaine,
  submitting,
  error,
  currentStatut,
  isEdit,
  publishOnSubmit,
  setPublishOnSubmit,
  onSubmitFinal,
}: {
  form: FormState;
  nutrition: NutritionValues;
  allergenesLibelle: string;
  ingredientsLibelle: string;
  domaine: string;
  submitting: boolean;
  error: string | null;
  currentStatut: "actif" | "brouillon";
  isEdit: boolean;
  publishOnSubmit: boolean;
  setPublishOnSubmit: (v: boolean) => void;
  onSubmitFinal: () => void;
}) {
  // Cas B : édition d'une cuvée actuellement publiée. Cas A sinon.
  const isCasB = isEdit && currentStatut === "actif";

  const checkboxLabel = isCasB
    ? "Cette cuvée est publiée"
    : "Publier cette cuvée maintenant";

  const checkboxDescription = isCasB
    ? "Décocher pour la dépublier. Le QR code restera valide mais la page e-label affichera « Cuvée non disponible »."
    : "Le QR code sera actif et la page e-label accessible aux consommateurs. Vous pourrez modifier ou dépublier cette cuvée à tout moment.";

  // Couleur + libellé du bouton final selon le cas.
  const buttonLabel = (() => {
    if (isCasB) {
      return publishOnSubmit
        ? "Enregistrer les modifications"
        : "Dépublier et enregistrer";
    }
    return publishOnSubmit
      ? "Publier et générer le QR code →"
      : "Sauvegarder en brouillon";
  })();

  const loadingLabel = (() => {
    if (isCasB) return publishOnSubmit ? "Enregistrement…" : "Dépublication…";
    return publishOnSubmit ? "Publication…" : "Sauvegarde…";
  })();

  const buttonClasses = (() => {
    if (isCasB) {
      return publishOnSubmit
        ? "bg-green-600 hover:bg-green-700 text-white"
        : "bg-orange-600 hover:bg-orange-700 text-white";
    }
    return publishOnSubmit
      ? "bg-green-600 hover:bg-green-700 text-white"
      : "border border-gray-300 bg-background text-gray-700 hover:bg-gray-50";
  })();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl text-foreground">
          Aperçu et publication
        </h2>
        <p className="mt-1 text-sm text-muted">
          Vérifiez votre page e-label avant de publier ou de sauvegarder en
          brouillon.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-xs uppercase tracking-widest text-muted">
            Aperçu de la page e-label
          </p>
          <PhonePreview>
            <ELabelPreviewContent
              form={form}
              nutrition={nutrition}
              allergenesLibelle={allergenesLibelle}
              ingredientsLibelle={ingredientsLibelle}
              domaine={domaine}
            />
          </PhonePreview>
        </div>

        <div className="space-y-5">
          <div className="rounded-md border border-border bg-surface p-5">
            <p className="text-xs uppercase tracking-widest text-muted">
              À imprimer sur l'étiquette physique
            </p>
            <p className="mt-2 font-mono text-sm text-foreground">
              E = {nutrition.energieKj} kJ / {nutrition.energieKcal} kcal
            </p>
            {allergenesLibelle && (
              <p className="mt-1 font-mono text-sm text-foreground">
                Contient : {allergenesLibelle.toLowerCase()}
              </p>
            )}
          </div>

          <div className="mt-6 rounded-lg border border-gray-200 p-6">
            <Checkbox
              checked={publishOnSubmit}
              onCheckedChange={setPublishOnSubmit}
              label={checkboxLabel}
              description={checkboxDescription}
            />
          </div>

          <button
            type="button"
            onClick={onSubmitFinal}
            disabled={submitting}
            className={
              "inline-flex h-12 w-full items-center justify-center gap-2 rounded-sm px-6 text-base font-medium transition-colors disabled:opacity-60 " +
              buttonClasses
            }
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {loadingLabel}
              </>
            ) : (
              buttonLabel
            )}
          </button>

          {error && (
            <p
              role="alert"
              className="rounded-sm border border-error/30 bg-red-50 px-3 py-2 text-sm text-error"
            >
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ELabelPreviewContent({
  form,
  nutrition,
  allergenesLibelle,
  ingredientsLibelle,
  domaine,
}: {
  form: FormState;
  nutrition: NutritionValues;
  allergenesLibelle: string;
  ingredientsLibelle: string;
  domaine: string;
}) {
  const typeLabel =
    TYPES_VIN.find((t) => t.value === form.type_vin)?.label ?? "—";

  return (
    <div className="space-y-4">
      <div className="space-y-1 border-b border-border pb-3">
        <p className="text-[10px] uppercase tracking-widest text-muted">
          (UE) 2021/2117
        </p>
        <p className="font-serif text-base text-foreground">
          {form.nom || "Nom de la cuvée"}
        </p>
        <p className="text-xs text-muted">
          {form.appellation || "Appellation"} · {form.millesime || "—"} ·{" "}
          {typeLabel}
        </p>
        <p className="text-xs text-muted">{domaine}</p>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted">
          Ingrédients
        </p>
        <p className="mt-1 text-xs leading-relaxed text-foreground">
          {ingredientsLibelle}
          {allergenesLibelle && (
            <>
              {" — contient des "}
              <strong>{allergenesLibelle.toLowerCase()}</strong>.
            </>
          )}
        </p>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted">
          Déclaration nutritionnelle
        </p>
        <p className="text-[10px] text-muted">Pour 100 ml</p>
        <table className="mt-1 w-full text-[11px]">
          <tbody>
            <tr className="border-t border-border">
              <td className="py-1 font-semibold">Énergie</td>
              <td className="py-1 text-right font-semibold tabular-nums">
                {nutrition.energieKj} kJ / {nutrition.energieKcal} kcal
              </td>
            </tr>
            <tr className="border-t border-border">
              <td className="py-1">Matières grasses</td>
              <td className="py-1 text-right tabular-nums">0 g</td>
            </tr>
            <tr className="border-t border-border">
              <td className="py-1 pl-3 text-muted">dont saturés</td>
              <td className="py-1 text-right tabular-nums">0 g</td>
            </tr>
            <tr className="border-t border-border">
              <td className="py-1">Glucides</td>
              <td className="py-1 text-right tabular-nums">
                {nutrition.glucides.toString().replace(".", ",")} g
              </td>
            </tr>
            <tr className="border-t border-border">
              <td className="py-1 pl-3 text-muted">dont sucres</td>
              <td className="py-1 text-right tabular-nums">
                {nutrition.sucres.toString().replace(".", ",")} g
              </td>
            </tr>
            <tr className="border-t border-border">
              <td className="py-1">Protéines</td>
              <td className="py-1 text-right tabular-nums">0 g</td>
            </tr>
            <tr className="border-t border-border">
              <td className="py-1">Sel</td>
              <td className="py-1 text-right tabular-nums">0 g</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
