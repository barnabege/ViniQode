"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowRight, ExternalLink, Loader2 } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Badge } from "@/components/ui/Badge";
import {
  facturationSchema,
  FORMES_JURIDIQUES,
  type FacturationFormValues,
} from "@/lib/validations/parametres";
import type { Plan, Profile } from "@/lib/database.types";
import { updateFacturation } from "@/app/dashboard/parametres/actions/facturation";

interface Props {
  profile: Profile;
  userId: string;
}

const PLAN_LABELS: Record<Plan, string> = {
  starter: "Starter",
  essentiel: "Essentiel",
  pro: "Pro",
};

const PLAN_DESCRIPTIONS: Record<Plan, string> = {
  starter: "3 cuvées gratuites · sans carte bancaire",
  essentiel: "QR codes illimités · 99 €/an",
  pro: "Tout illimité · analytics · 149 €/an",
};

export function SectionFacturation({ profile }: Props) {
  const form = useForm<FacturationFormValues>({
    resolver: zodResolver(facturationSchema),
    defaultValues: {
      raison_sociale: profile.raison_sociale ?? "",
      forme_juridique: profile.forme_juridique ?? "",
      adresse_facturation: profile.adresse_facturation ?? "",
      tva_intracommunautaire: profile.tva_intracommunautaire ?? "",
      livraison_identique_facturation:
        profile.livraison_identique_facturation ?? true,
      adresse_livraison: profile.adresse_livraison ?? "",
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty, isSubmitting },
    reset,
  } = form;

  const livraisonIdentique = watch("livraison_identique_facturation");

  const onSubmit = handleSubmit(async (values) => {
    const result = await updateFacturation(values);
    if (result.ok) {
      toast.success("Modifications enregistrées");
      reset(values);
    } else {
      toast.error(result.error);
    }
  });

  const onPortalClick = () => {
    toast.info(
      "Le portail client Stripe sera bientôt connecté. Contact : contact@viniqode.fr",
    );
  };

  return (
    <div className="space-y-6">
      {/* Bloc Plan & abonnement */}
      <Card>
        <CardHeader>
          <CardTitle>Plan & abonnement</CardTitle>
          <CardDescription>
            Gérez votre plan et votre méthode de paiement.
          </CardDescription>
        </CardHeader>

        <div className="mt-6 flex flex-col gap-5 rounded-md border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Badge
              variant={
                profile.plan === "starter"
                  ? "neutral"
                  : profile.plan === "pro"
                    ? "dark"
                    : "success"
              }
              size="md"
            >
              {PLAN_LABELS[profile.plan]}
            </Badge>
            <p className="text-sm text-muted">
              {PLAN_DESCRIPTIONS[profile.plan]}
            </p>
          </div>

          {profile.plan === "starter" ? (
            <Button type="button" size="md" onClick={onPortalClick}>
              Passer à Essentiel — 99 €/an
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onPortalClick}
            >
              <ExternalLink className="h-4 w-4" />
              Gérer mon abonnement
            </Button>
          )}
        </div>

        <div className="mt-6 space-y-2">
          <p className="text-sm font-medium text-foreground">
            Méthode de paiement
          </p>
          <p className="text-sm text-muted">
            Aucune méthode de paiement enregistrée.
          </p>
        </div>

        <div className="mt-6 space-y-2">
          <p className="text-sm font-medium text-foreground">
            Historique des factures
          </p>
          <div className="rounded-md border border-dashed border-border bg-background p-6 text-center">
            <p className="text-sm text-muted">
              Aucune facture pour le moment.
            </p>
          </div>
        </div>
      </Card>

      {/* Bloc Facturation */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de facturation</CardTitle>
          <CardDescription>
            Ces informations apparaîtront sur vos factures et bons de commande.
          </CardDescription>
        </CardHeader>

        <form className="mt-6 space-y-5" onSubmit={onSubmit} noValidate>
          <Field
            label="Raison sociale"
            htmlFor="raison_sociale"
            error={errors.raison_sociale?.message}
          >
            <Input
              id="raison_sociale"
              {...register("raison_sociale")}
              placeholder="Domaine de la Vigne SARL"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Forme juridique"
              htmlFor="forme_juridique"
              error={errors.forme_juridique?.message}
            >
              <Select id="forme_juridique" {...register("forme_juridique")}>
                <option value="">Sélectionner…</option>
                {FORMES_JURIDIQUES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label="N° TVA intracommunautaire"
              htmlFor="tva_intracommunautaire"
              hint="ex: FR12345678901"
              error={errors.tva_intracommunautaire?.message}
            >
              <Input
                id="tva_intracommunautaire"
                {...register("tva_intracommunautaire", {
                  onChange: (e) => {
                    e.target.value = e.target.value.toUpperCase();
                  },
                })}
                placeholder="FR12345678901"
                maxLength={14}
              />
            </Field>
          </div>

          <Field
            label="Adresse de facturation"
            htmlFor="adresse_facturation"
            error={errors.adresse_facturation?.message}
          >
            <Textarea
              id="adresse_facturation"
              rows={3}
              {...register("adresse_facturation")}
              placeholder="5 rue de la Cave, 67000 Strasbourg, France"
            />
          </Field>

          <div className="border-t border-border pt-5">
            <Checkbox
              checked={livraisonIdentique}
              onCheckedChange={(checked) =>
                setValue("livraison_identique_facturation", checked, {
                  shouldDirty: true,
                })
              }
              label="L'adresse de livraison est identique à l'adresse de facturation"
            />
          </div>

          {!livraisonIdentique && (
            <Field
              label="Adresse de livraison"
              htmlFor="adresse_livraison"
              required
              error={errors.adresse_livraison?.message}
            >
              <Textarea
                id="adresse_livraison"
                rows={3}
                {...register("adresse_livraison")}
                placeholder="Adresse différente pour la livraison physique"
              />
            </Field>
          )}

          <div className="flex justify-end border-t border-border pt-5">
            <Button type="submit" size="md" disabled={!isDirty || isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

interface FieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
}: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="flex items-baseline justify-between text-sm font-medium text-foreground"
      >
        <span>
          {label}
          {required && <span className="ml-0.5 text-error">*</span>}
        </span>
        {hint && <span className="text-xs font-normal text-muted">{hint}</span>}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
}
