"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { EmailInput } from "@/components/auth/EmailInput";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { FormError } from "@/components/auth/FormError";
import { OAuthGoogleButton } from "@/components/auth/OAuthGoogleButton";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { signupSchema, type SignupInput } from "@/lib/auth/schemas";
import { signupAction } from "./actions";

export function SignupForm() {
  const [serverError, setServerError] = React.useState<string | undefined>();
  const [success, setSuccess] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      prenom: "",
      nom: "",
      email: "",
      password: "",
      confirmPassword: "",
      rgpd: false,
    },
  });

  const password = watch("password");
  const rgpd = watch("rgpd");

  const onSubmit = async (values: SignupInput) => {
    setServerError(undefined);
    const result = await signupAction(values);
    if (result?.error) {
      setServerError(result.error);
      return;
    }
    if (result?.needsEmailConfirmation) {
      setSuccess(
        `Un email de confirmation a été envoyé à ${values.email}. Cliquez sur le lien pour activer votre compte.`,
      );
    } else {
      window.location.assign("/onboarding/bienvenue");
    }
  };

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-accent" aria-hidden="true" />
        <h2 className="font-serif text-xl text-foreground">
          Vérifiez votre boîte de réception.
        </h2>
        <p className="text-sm text-muted">{success}</p>
        <p className="text-xs text-muted">
          Pas reçu ? Vérifiez vos spams ou{" "}
          <Link href="/forgot-password" className="text-accent hover:underline">
            renvoyez un email
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Prénom" htmlFor="prenom" required error={errors.prenom?.message}>
          <Input
            id="prenom"
            autoComplete="given-name"
            aria-invalid={Boolean(errors.prenom)}
            {...register("prenom")}
          />
        </Field>
        <Field label="Nom" htmlFor="nom" required error={errors.nom?.message}>
          <Input
            id="nom"
            autoComplete="family-name"
            aria-invalid={Boolean(errors.nom)}
            {...register("nom")}
          />
        </Field>
      </div>

      <Field label="Email" htmlFor="email" required error={errors.email?.message}>
        <EmailInput
          id="email"
          autoComplete="email"
          placeholder="votre@domaine.fr"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
      </Field>

      <Field
        label="Mot de passe"
        htmlFor="password"
        required
        error={errors.password?.message}
        hint={!errors.password ? "Au moins 8 caractères, 1 majuscule, 1 chiffre." : undefined}
      >
        <PasswordInput
          id="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
        <PasswordStrengthMeter password={password ?? ""} />
      </Field>

      <Field
        label="Confirmer le mot de passe"
        htmlFor="confirmPassword"
        required
        error={errors.confirmPassword?.message}
      >
        <PasswordInput
          id="confirmPassword"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.confirmPassword)}
          {...register("confirmPassword")}
        />
      </Field>

      <div>
        <Checkbox
          checked={rgpd}
          onCheckedChange={(v) =>
            setValue("rgpd", v, { shouldValidate: true, shouldDirty: true })
          }
          label={
            <span>
              J'accepte les{" "}
              <Link href="/cgv" className="text-accent hover:underline">
                CGV
              </Link>{" "}
              et la{" "}
              <Link href="/confidentialite" className="text-accent hover:underline">
                politique de confidentialité
              </Link>
              .
            </span>
          }
        />
        {errors.rgpd && (
          <p className="mt-1 text-xs text-error">{errors.rgpd.message}</p>
        )}
      </div>

      <FormError message={serverError} />

      <Button type="submit" size="lg" block disabled={isSubmitting}>
        {isSubmitting ? "Création en cours…" : "Créer mon compte"}
      </Button>

      <AuthDivider />

      <OAuthGoogleButton onError={setServerError} />
    </form>
  );
}
