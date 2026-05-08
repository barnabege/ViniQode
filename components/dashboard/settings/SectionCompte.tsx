"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AlertTriangle, Download, KeyRound, Loader2, Trash2 } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import {
  compteSchema,
  type CompteFormValues,
} from "@/lib/validations/parametres";
import type { Profile } from "@/lib/database.types";
import { updateCompte } from "@/app/dashboard/parametres/actions/compte";

interface Props {
  profile: Profile;
  email: string;
  userId: string;
}

export function SectionCompte({ profile, email }: Props) {
  return (
    <div className="space-y-6">
      <IdentityCard profile={profile} />
      <SecurityCard email={email} />
      <DataCard />
      <DangerCard email={email} />
    </div>
  );
}

// ─── Card 1 : Identité ──────────────────────────────────────────────────
function IdentityCard({ profile }: { profile: Profile }) {
  const form = useForm<CompteFormValues>({
    resolver: zodResolver(compteSchema),
    defaultValues: {
      prenom: profile.prenom ?? "",
      nom: profile.nom ?? "",
      fonction: profile.fonction ?? "",
      telephone: profile.telephone ?? "",
      email_contact_public: profile.email_contact_public ?? "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    reset,
  } = form;

  const onSubmit = handleSubmit(async (values) => {
    const result = await updateCompte(values);
    if (result.ok) {
      toast.success("Modifications enregistrées");
      reset(values);
    } else {
      toast.error(result.error);
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Identité</CardTitle>
        <CardDescription>
          Vos informations personnelles. Le prénom et le nom sont visibles dans
          le tableau de bord.
        </CardDescription>
      </CardHeader>

      <form className="mt-6 space-y-5" onSubmit={onSubmit} noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Prénom"
            htmlFor="prenom"
            error={errors.prenom?.message}
          >
            <Input id="prenom" {...register("prenom")} placeholder="Marie" />
          </Field>
          <Field label="Nom" htmlFor="nom" error={errors.nom?.message}>
            <Input id="nom" {...register("nom")} placeholder="Dubois" />
          </Field>
        </div>

        <Field
          label="Fonction"
          htmlFor="fonction"
          hint="optionnel"
          error={errors.fonction?.message}
        >
          <Input
            id="fonction"
            {...register("fonction")}
            placeholder="Vigneronne, Gérant, …"
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Téléphone"
            htmlFor="telephone"
            hint="optionnel"
            error={errors.telephone?.message}
          >
            <Input
              id="telephone"
              type="tel"
              {...register("telephone")}
              placeholder="06 12 34 56 78"
            />
          </Field>

          <Field
            label="Email de contact public"
            htmlFor="email_contact_public"
            hint="affiché sur l'e-label"
            error={errors.email_contact_public?.message}
          >
            <Input
              id="email_contact_public"
              type="email"
              {...register("email_contact_public")}
              placeholder="contact@domaine.fr"
            />
          </Field>
        </div>

        <div className="flex justify-end border-t border-border pt-5">
          <Button type="submit" size="md" disabled={!isDirty || isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

// ─── Card 2 : Sécurité ──────────────────────────────────────────────────
function SecurityCard({ email }: { email: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connexion & sécurité</CardTitle>
        <CardDescription>
          Email et mot de passe utilisés pour vous connecter.
        </CardDescription>
      </CardHeader>

      <div className="mt-6 space-y-5">
        <div className="space-y-1.5">
          <label
            htmlFor="email-auth"
            className="text-sm font-medium text-foreground"
          >
            Email de connexion
          </label>
          <Input id="email-auth" value={email} disabled aria-readonly />
          <p className="text-xs text-muted">
            L&apos;email ne peut pas être modifié pour des raisons de sécurité.
            Contactez le support pour toute demande de changement.
          </p>
        </div>

        <div className="border-t border-border pt-5">
          <Button asChild variant="secondary" size="md">
            <Link href="/forgot-password">
              <KeyRound className="h-4 w-4" />
              Changer mon mot de passe
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ─── Card 3 : Mes données (export RGPD) ─────────────────────────────────
function DataCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mes données</CardTitle>
        <CardDescription>
          Téléchargez l&apos;ensemble de vos données personnelles
          (RGPD article 20 — droit à la portabilité).
        </CardDescription>
      </CardHeader>

      <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          Format JSON · contient profil, cuvées et commandes.
        </p>
        <Button asChild variant="secondary" size="md">
          <a href="/api/account/export" download>
            <Download className="h-4 w-4" />
            Exporter mes données
          </a>
        </Button>
      </div>
    </Card>
  );
}

// ─── Card 4 : Zone de danger ────────────────────────────────────────────
function DangerCard({ email }: { email: string }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [confirmation, setConfirmation] = React.useState("");
  const [pending, startTransition] = React.useTransition();

  const matches =
    confirmation.toLowerCase().trim() === email.toLowerCase().trim();

  const onClose = () => {
    if (pending) return;
    setOpen(false);
    setConfirmation("");
  };

  const onConfirm = () => {
    if (!matches) return;
    startTransition(async () => {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_confirmation: confirmation }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok: boolean; error?: string }
        | null;
      if (res.ok && data?.ok) {
        toast.success("Compte supprimé. À bientôt.");
        router.replace("/connexion");
      } else {
        toast.error(data?.error ?? "Erreur lors de la suppression.");
      }
    });
  };

  return (
    <>
      <Card className="border-red-200 bg-red-50/30">
        <CardHeader>
          <CardTitle className="text-red-700">Zone de danger</CardTitle>
          <CardDescription>
            Actions irréversibles concernant votre compte.
          </CardDescription>
        </CardHeader>

        <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600"
              aria-hidden="true"
            />
            <p className="text-sm text-foreground">
              La suppression efface votre profil et toutes vos cuvées. Cette
              action est <strong>irréversible</strong> au-delà de 30 jours.
            </p>
          </div>
          <Button
            type="button"
            variant="danger"
            size="md"
            onClick={() => setOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Supprimer mon compte
          </Button>
        </div>
      </Card>

      <Modal
        open={open}
        onClose={onClose}
        title="Supprimer mon compte"
        description="Cette action est irréversible. Vos données seront purgées définitivement après 30 jours."
      >
        <div className="space-y-5">
          <div className="rounded-md border border-red-200 bg-red-50/50 p-3 text-xs leading-relaxed text-red-700">
            Pour confirmer, tapez votre email&nbsp;: <strong>{email}</strong>
          </div>

          <Input
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder={email}
            aria-label="Confirmation email"
            autoComplete="off"
            disabled={pending}
          />

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onClose}
              disabled={pending}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="danger"
              size="md"
              onClick={onConfirm}
              disabled={!matches || pending}
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {pending ? "Suppression…" : "Supprimer définitivement"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

// ─── Sous-composant Field ───────────────────────────────────────────────
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
