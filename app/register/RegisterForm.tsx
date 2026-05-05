// app/register/RegisterForm.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { REGIONS_VITICOLES } from "@/lib/ingredients";
import { createSupabaseBrowserClient } from "@/lib/supabase";

const NB_CUVEES = ["1-3", "4-8", "9-15", "16+"] as const;

interface FormState {
  prenom: string;
  nom: string;
  email: string;
  password: string;
  nomDomaine: string;
  region: string;
  nbCuvees: string;
  rgpd: boolean;
}

const INITIAL: FormState = {
  prenom: "",
  nom: "",
  email: "",
  password: "",
  nomDomaine: "",
  region: "",
  nbCuvees: "",
  rgpd: false,
};

function passwordStrength(pwd: string): {
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

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = React.useState<FormState>(INITIAL);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const strength = passwordStrength(form.password);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.rgpd) {
      setError("Veuillez accepter les CGV et la politique de confidentialité.");
      return;
    }
    if (form.password.length < 8) {
      setError("Votre mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            prenom: form.prenom,
            nom: form.nom,
            nom_domaine: form.nomDomaine,
            region: form.region,
            nb_cuvees: form.nbCuvees,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (signUpError) throw signUpError;
      router.push("/dashboard");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Une erreur est survenue. Veuillez réessayer ou contacter notre support.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });
      if (oauthError) throw oauthError;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Connexion Google indisponible pour le moment.",
      );
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <div>
        <h2 className="font-serif text-3xl text-foreground">Créer mon compte</h2>
        <p className="mt-2 text-sm text-muted">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Connectez-vous
          </Link>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Prénom" htmlFor="prenom" required>
          <Input
            id="prenom"
            value={form.prenom}
            onChange={(e) => update("prenom", e.target.value)}
            required
            autoComplete="given-name"
          />
        </Field>
        <Field label="Nom" htmlFor="nom" required>
          <Input
            id="nom"
            value={form.nom}
            onChange={(e) => update("nom", e.target.value)}
            required
            autoComplete="family-name"
          />
        </Field>
      </div>

      <Field label="Email professionnel" htmlFor="email" required>
        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder="votre@domaine.fr"
          required
          autoComplete="email"
        />
      </Field>

      <Field
        label="Mot de passe"
        htmlFor="password"
        required
        hint={
          form.password
            ? `Force du mot de passe : ${strength.label}`
            : "Au moins 8 caractères, majuscule et chiffre recommandés."
        }
      >
        <Input
          id="password"
          type="password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />
        {form.password && (
          <div className="mt-2 flex h-1 gap-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={
                  "h-1 flex-1 rounded-full " +
                  (i <= strength.level
                    ? strength.level >= 3
                      ? "bg-accent"
                      : "bg-orange-400"
                    : "bg-border")
                }
              />
            ))}
          </div>
        )}
      </Field>

      <Field label="Nom du domaine viticole" htmlFor="nomDomaine" required>
        <Input
          id="nomDomaine"
          value={form.nomDomaine}
          onChange={(e) => update("nomDomaine", e.target.value)}
          placeholder="Domaine de la Vigne"
          required
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Région viticole" htmlFor="region" required>
          <Select
            id="region"
            value={form.region}
            onChange={(e) => update("region", e.target.value)}
            required
          >
            <option value="">Choisir…</option>
            {REGIONS_VITICOLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Nombre de cuvées estimé" htmlFor="nbCuvees">
          <Select
            id="nbCuvees"
            value={form.nbCuvees}
            onChange={(e) => update("nbCuvees", e.target.value)}
          >
            <option value="">Choisir…</option>
            {NB_CUVEES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Checkbox
        checked={form.rgpd}
        onCheckedChange={(v) => update("rgpd", v)}
        label={
          <span>
            J'accepte les{" "}
            <Link href="/cgv" className="text-accent hover:underline">
              CGV
            </Link>{" "}
            et la{" "}
            <Link
              href="/confidentialite"
              className="text-accent hover:underline"
            >
              politique de confidentialité
            </Link>
            .
          </span>
        }
      />

      {error && (
        <p
          className="rounded-sm border border-error/30 bg-red-50 px-3 py-2 text-sm text-error"
          role="alert"
        >
          {error}
        </p>
      )}

      <Button type="submit" size="lg" block disabled={loading}>
        {loading ? "Création en cours…" : "Créer mon compte gratuitement"}
      </Button>

      <div className="relative my-2 text-center">
        <span className="relative z-10 bg-background px-3 text-xs uppercase tracking-widest text-muted">
          ou
        </span>
        <span className="absolute left-0 top-1/2 -z-0 h-px w-full bg-border" />
      </div>

      <Button
        type="button"
        variant="secondary"
        size="lg"
        block
        onClick={onGoogle}
      >
        Continuer avec Google
      </Button>
    </form>
  );
}
