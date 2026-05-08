"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "@/lib/validations/security";
import { changePassword } from "@/app/dashboard/parametres/actions/security";
import { PasswordStrength } from "./PasswordStrength";

export function SectionMotDePasse() {
  const [show, setShow] = React.useState(false);
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty, isSubmitting },
    reset,
  } = form;

  const newPassword = watch("new_password");

  const onSubmit = handleSubmit(async (values) => {
    const result = await changePassword(values);
    if (result.ok) {
      toast.success(
        "Mot de passe modifié. Vos autres sessions ont été déconnectées.",
      );
      reset({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } else {
      toast.error(result.error);
    }
  });

  const inputType = show ? "text" : "password";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-muted" />
          Mot de passe
        </CardTitle>
        <CardDescription>
          Choisissez un mot de passe robuste. Vos autres sessions seront
          automatiquement déconnectées après changement.
        </CardDescription>
      </CardHeader>

      <form className="mt-6 space-y-5" onSubmit={onSubmit} noValidate>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground"
          >
            {show ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
            {show ? "Masquer" : "Afficher"} les mots de passe
          </button>
        </div>

        <Field
          label="Mot de passe actuel"
          htmlFor="current_password"
          required
          error={errors.current_password?.message}
        >
          <Input
            id="current_password"
            type={inputType}
            autoComplete="current-password"
            {...register("current_password")}
          />
        </Field>

        <Field
          label="Nouveau mot de passe"
          htmlFor="new_password"
          required
          error={errors.new_password?.message}
        >
          <Input
            id="new_password"
            type={inputType}
            autoComplete="new-password"
            {...register("new_password")}
          />
          <PasswordStrength value={newPassword ?? ""} />
        </Field>

        <Field
          label="Confirmer le nouveau mot de passe"
          htmlFor="confirm_password"
          required
          error={errors.confirm_password?.message}
        >
          <Input
            id="confirm_password"
            type={inputType}
            autoComplete="new-password"
            {...register("confirm_password")}
          />
        </Field>

        <div className="flex justify-end border-t border-border pt-5">
          <Button type="submit" size="md" disabled={!isDirty || isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? "Modification…" : "Changer le mot de passe"}
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
  error?: string;
  children: React.ReactNode;
}

function Field({ label, htmlFor, required, error, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-foreground"
      >
        {label}
        {required && <span className="ml-0.5 text-error">*</span>}
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
