// app/dashboard/cuvees/new/CuveeWizard.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
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
  type Ingredient,
} from "@/lib/ingredients";
import { calculerNutrition, type NutritionValues } from "@/lib/nutrition";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { generateQrCode, type QrCodeAssets } from "@/lib/qrcode";
import { slugify } from "@/lib/utils";

const STEPS = [
  { label: "Informations", description: "Identité de la cuvée" },
  { label: "Ingrédients", description: "Liste réglementaire" },
  { label: "Nutrition", description: "Valeurs calculées" },
  { label: "Aperçu", description: "Génération du QR" },
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

interface CuveeWizardProps {
  userId: string;
  domaine: string;
}

export function CuveeWizard({ userId, domaine }: CuveeWizardProps) {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [form, setForm] = React.useState<FormState>(INITIAL);
  const [qrAssets, setQrAssets] = React.useState<QrCodeAssets | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleIngredient = (id: string, checked: boolean) => {
    if (id === "raisins") return;
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

  const onGenerate = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: created, error: insertError } = await supabase
        .from("cuvees")
        .insert({
          user_id: userId,
          nom: form.nom,
          appellation: form.appellation,
          millesime: parseInt(form.millesime, 10),
          type_vin: form.type_vin as FormState["type_vin"] as never,
          degre_alcool: parseFloat(form.degre_alcool),
          volume_cl: parseInt(form.volume_cl, 10),
          sucres_residuels: parseFloat(form.sucres_residuels),
          ingredients: form.ingredients,
          allergenes,
          valeur_energetique_kj: nutrition.energieKj,
          valeur_energetique_kcal: nutrition.energieKcal,
          glucides: nutrition.glucides,
          sucres_nutritionnels: nutrition.sucres,
          statut: "actif",
          qr_code_url: null,
          elabel_url: null,
        })
        .select()
        .single();
      if (insertError) throw insertError;

      const elabelUrl = `${window.location.origin}/elabel/${created.id}`;
      const assets = await generateQrCode(elabelUrl);

      await supabase
        .from("cuvees")
        .update({ elabel_url: elabelUrl })
        .eq("id", created.id);

      setQrAssets(assets);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue. Veuillez réessayer ou contacter notre support.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <StepIndicator steps={STEPS} current={step} />

      <div className="rounded-md border border-border bg-background p-6 sm:p-8">
        {step === 0 && (
          <Step1
            form={form}
            update={update}
          />
        )}

        {step === 1 && (
          <Step2
            selected={form.ingredients}
            toggle={toggleIngredient}
            allergenesLibelle={allergenesLibelle}
            ingredientsLibelle={ingredientsLibelle}
          />
        )}

        {step === 2 && <Step3 form={form} update={update} nutrition={nutrition} />}

        {step === 3 && (
          <Step4
            form={form}
            nutrition={nutrition}
            allergenesLibelle={allergenesLibelle}
            ingredientsLibelle={ingredientsLibelle}
            domaine={domaine}
            qrAssets={qrAssets}
            onGenerate={onGenerate}
            submitting={submitting}
            error={error}
            onFinish={() => router.push("/dashboard")}
          />
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={goPrev}
          disabled={step === 0}
        >
          <ArrowLeft className="h-4 w-4" /> Précédent
        </Button>
        {step < STEPS.length - 1 && (
          <Button type="button" onClick={goNext} disabled={!canGoNext}>
            Étape suivante <ArrowRight className="h-4 w-4" />
          </Button>
        )}
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

// ─── Étape 4 : Aperçu et génération ──────────────────────────────────────
function Step4({
  form,
  nutrition,
  allergenesLibelle,
  ingredientsLibelle,
  domaine,
  qrAssets,
  onGenerate,
  submitting,
  error,
  onFinish,
}: {
  form: FormState;
  nutrition: NutritionValues;
  allergenesLibelle: string;
  ingredientsLibelle: string;
  domaine: string;
  qrAssets: QrCodeAssets | null;
  onGenerate: () => void;
  submitting: boolean;
  error: string | null;
  onFinish: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl text-foreground">
          Aperçu et génération
        </h2>
        <p className="mt-1 text-sm text-muted">
          Vérifiez votre page e-label avant la génération du QR code.
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

          {qrAssets ? (
            <>
              <div className="rounded-md border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-foreground">
                Votre QR code a été généré avec succès. Téléchargez-le et
                transmettez-le à votre imprimeur.
              </div>
              <QRCodePreview
                svg={qrAssets.svg}
                pngDataUrl={qrAssets.pngDataUrl}
                url={qrAssets.url}
                filename={`viniqode-${slugify(form.nom || "cuvee")}-${form.millesime || ""}`}
              />
              <Button block size="lg" onClick={onFinish} variant="secondary">
                Retour au tableau de bord
              </Button>
            </>
          ) : (
            <>
              <p className="text-xs text-muted">
                Le QR code est généré en SVG vectoriel et PNG haute résolution
                (300 dpi), prêt pour votre imprimeur.
              </p>
              <Button
                block
                size="lg"
                onClick={onGenerate}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Génération en cours…
                  </>
                ) : (
                  "Générer mon e-label et télécharger le QR code"
                )}
              </Button>
              {error && (
                <p
                  role="alert"
                  className="rounded-sm border border-error/30 bg-red-50 px-3 py-2 text-sm text-error"
                >
                  {error}
                </p>
              )}
            </>
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
