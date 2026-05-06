"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Input";
import { EmailInput } from "@/components/auth/EmailInput";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { FormError } from "@/components/auth/FormError";
import { OAuthGoogleButton } from "@/components/auth/OAuthGoogleButton";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { loginSchema, type LoginInput } from "@/lib/auth/schemas";
import { loginAction } from "./actions";

interface LoginFormProps {
  redirectTo?: string;
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const [serverError, setServerError] = React.useState<string | undefined>();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginInput) => {
    setServerError(undefined);
    const result = await loginAction(values, redirectTo);
    if (result?.error) setServerError(result.error);
  };

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

      <Field
        label="Mot de passe"
        htmlFor="password"
        required
        error={errors.password?.message}
      >
        <PasswordInput
          id="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
      </Field>

      <div className="flex items-center justify-end text-sm">
        <Link
          href="/forgot-password"
          className="text-muted transition-colors hover:text-foreground"
        >
          Mot de passe oublié ?
        </Link>
      </div>

      <FormError message={serverError} />

      <Button type="submit" size="lg" block disabled={isSubmitting}>
        {isSubmitting ? "Connexion en cours…" : "Se connecter"}
      </Button>

      <AuthDivider />

      <OAuthGoogleButton redirectTo={redirectTo} onError={setServerError} />
    </form>
  );
}
