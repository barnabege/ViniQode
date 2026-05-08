"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AtSign, Clock, Loader2 } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  changeEmailSchema,
  type ChangeEmailFormValues,
} from "@/lib/validations/security";
import { changeEmail } from "@/app/dashboard/parametres/actions/security";

interface Props {
  email: string;
  pendingNewEmail: string | null;
}

export function SectionEmail({ email, pendingNewEmail }: Props) {
  const form = useForm<ChangeEmailFormValues>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { new_email: "", current_password: "" },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    reset,
  } = form;

  const onSubmit = handleSubmit(async (values) => {
    const result = await changeEmail(values);
    if (result.ok) {
      toast.success(
        `Vérifiez votre boîte mail (${values.new_email}) pour confirmer le changement.`,
      );
      reset({ new_email: "", current_password: "" });
    } else {
      toast.error(result.error);
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AtSign className="h-5 w-5 text-muted" />
          Email
        </CardTitle>
        <CardDescription>
          Changement d&apos;adresse email de connexion. Confirmation par email
          requise.
        </CardDescription>
      </CardHeader>

      <div className="mt-6 space-y-3">
        <Field label="Email actuel" htmlFor="current_email">
          <Input id="current_email" value={email} disabled aria-readonly />
        </Field>
        {pendingNewEmail && (
          <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <Clock
              className="mt-0.5 h-4 w-4 flex-shrink-0"
              aria-hidden="true"
            />
            <div>
              <p className="font-medium">Changement en attente</p>
              <p className="mt-1 text-xs">
                Un lien de confirmation a été envoyé à{" "}
                <strong>{pendingNewEmail}</strong>. Cliquez dessus pour
                finaliser.
              </p>
            </div>
            <Badge variant="warning" size="sm" className="ml-auto">
              En attente
            </Badge>
          </div>
        )}
      </div>

      <form className="mt-6 space-y-5 border-t border-border pt-6" onSubmit={onSubmit} noValidate>
        <Field
          label="Nouvel email"
          htmlFor="new_email"
          required
          error={errors.new_email?.message}
        >
          <Input
            id="new_email"
            type="email"
            autoComplete="email"
            {...register("new_email")}
            placeholder="nouvel-email@domaine.fr"
          />
        </Field>

        <Field
          label="Mot de passe actuel"
          htmlFor="current_password_email"
          required
          hint="pour confirmer votre identité"
          error={errors.current_password?.message}
        >
          <Input
            id="current_password_email"
            type="password"
            autoComplete="current-password"
            {...register("current_password")}
          />
        </Field>

        <div className="flex justify-end">
          <Button type="submit" size="md" disabled={!isDirty || isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? "Demande en cours…" : "Demander le changement"}
          </Button>
        </div>
      </form>
    </Card>
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
