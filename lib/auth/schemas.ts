import { z } from "zod";

const email = z
  .string()
  .min(1, "L'email est requis.")
  .email("Format d'email invalide.");

const password = z
  .string()
  .min(8, "Au moins 8 caractères requis.")
  .regex(/[A-Z]/, "Au moins une majuscule requise.")
  .regex(/[0-9]/, "Au moins un chiffre requis.");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Le mot de passe est requis."),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    prenom: z.string().min(1, "Le prénom est requis."),
    nom: z.string().min(1, "Le nom est requis."),
    email,
    password,
    confirmPassword: z.string().min(1, "Veuillez confirmer le mot de passe."),
    rgpd: z
      .boolean()
      .refine((v) => v === true, {
        message: "Vous devez accepter les CGV et la politique de confidentialité.",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });
export type SignupInput = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({ email });
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export function passwordStrength(pwd: string): {
  level: 0 | 1 | 2 | 3 | 4;
  label: string;
} {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const labels = ["—", "Faible", "Moyen", "Bon", "Excellent"] as const;
  const level = (pwd.length === 0 ? 0 : score) as 0 | 1 | 2 | 3 | 4;
  return { level, label: labels[level] };
}
