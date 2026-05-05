// app/login/LoginForm.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? "Email ou mot de passe incorrect."
          : "Une erreur est survenue. Veuillez réessayer.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <div>
        <h2 className="font-serif text-3xl text-foreground">Se connecter</h2>
        <p className="mt-2 text-sm text-muted">
          Pas encore de compte ?{" "}
          <Link href="/register" className="text-accent hover:underline">
            Créer mon compte
          </Link>
        </p>
      </div>

      <Field label="Email" htmlFor="email" required>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@domaine.fr"
          required
          autoComplete="email"
        />
      </Field>

      <Field label="Mot de passe" htmlFor="password" required>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </Field>

      <div className="flex items-center justify-end text-sm">
        <Link
          href="/reset-password"
          className="text-muted hover:text-foreground"
        >
          Mot de passe oublié ?
        </Link>
      </div>

      {error && (
        <p
          className="rounded-sm border border-error/30 bg-red-50 px-3 py-2 text-sm text-error"
          role="alert"
        >
          {error}
        </p>
      )}

      <Button type="submit" size="lg" block disabled={loading}>
        {loading ? "Connexion en cours…" : "Se connecter"}
      </Button>
    </form>
  );
}
