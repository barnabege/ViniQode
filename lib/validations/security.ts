// lib/validations/security.ts
// Schémas Zod pour les forms de l'onglet Sécurité.
// Utilisés client + serveur. Convention : pas de .default() (cf. notes
// dans validations/parametres.ts pour le mismatch RHF + Zod 4).

import { z } from "zod";

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Mot de passe actuel requis"),
    new_password: z
      .string()
      .min(8, "Au moins 8 caractères")
      .regex(/[A-Z]/, "Au moins une majuscule")
      .regex(/[0-9]/, "Au moins un chiffre"),
    confirm_password: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.new_password !== data.confirm_password) {
      ctx.addIssue({
        code: "custom",
        message: "Les mots de passe ne correspondent pas",
        path: ["confirm_password"],
      });
    }
    if (data.current_password === data.new_password) {
      ctx.addIssue({
        code: "custom",
        message: "Le nouveau mot de passe doit être différent",
        path: ["new_password"],
      });
    }
  });

export type ChangePasswordFormValues = z.input<typeof changePasswordSchema>;

export const changeEmailSchema = z.object({
  new_email: z
    .string()
    .trim()
    .min(1, "Email requis")
    .email("Email invalide"),
  current_password: z.string().min(1, "Mot de passe requis"),
});

export type ChangeEmailFormValues = z.input<typeof changeEmailSchema>;

export const disable2FASchema = z.object({
  current_password: z.string().min(1, "Mot de passe requis"),
});

export type Disable2FAFormValues = z.input<typeof disable2FASchema>;

export const totpCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Code à 6 chiffres requis"),
});

export type TotpCodeFormValues = z.input<typeof totpCodeSchema>;

export const recoveryCodeSchema = z.object({
  code: z.string().trim().min(1, "Code requis"),
});

export type RecoveryCodeFormValues = z.input<typeof recoveryCodeSchema>;
