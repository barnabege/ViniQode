"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Input";
import { EmailInput } from "@/components/auth/EmailInput";
import { FormError } from "@/components/auth/FormError";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/auth/schemas";
import { forgotPasswordAction } from "./actions";

export function ForgotPasswordForm() {
  const [serverError, setServerError] = React.useState<string | undefined>();
  const [sentTo, setSentTo] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordInput) => {
    setServerError(undefined);
    const result = await forgotPasswordAction(values);
    if (result?.error) {
      setServerError(result.error);
      return;
    }
    if (result?.success) {
      setSentTo(values.email);
    }
  };

  if (sentTo) {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-accent" aria-hidden="true" />
        <h2 className="font-serif text-xl text-foreground">Email envoyé.</h2>
        <p className="text-sm text-muted">
          Si un compte est associé à <strong className="text-foreground">{sentTo}</strong>,
          vous recevrez sous peu un lien pour réinitialiser votre mot de passe.
        </p>
        <Link
          href="/connexion"
          className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <Field
        label="Email"
        htmlFor="email"
        required
        error={errors.email?.message}
      >
        <EmailInput
          id="email"
          autoComplete="email"
          placeholder="votre@domaine.fr"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
      </Field>

      <FormError message={serverError} />

      <Button type="submit" size="lg" block disabled={isSubmitting}>
        {isSubmitting ? "Envoi en cours…" : "Recevoir le lien de réinitialisation"}
      </Button>

      <Link
        href="/connexion"
        className="flex items-center justify-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour à la connexion
      </Link>
    </form>
  );
}
