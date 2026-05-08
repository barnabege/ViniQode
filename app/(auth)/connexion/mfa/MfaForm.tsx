"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  verifyMfaTotp,
  verifyRecoveryCodeAction,
} from "./actions";

interface Props {
  redirectTo?: string;
}

export function MfaForm({ redirectTo }: Props) {
  const [mode, setMode] = React.useState<"totp" | "recovery">("totp");
  const [code, setCode] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    const action =
      mode === "totp" ? verifyMfaTotp : verifyRecoveryCodeAction;
    const result = await action(code, redirectTo);
    setPending(false);
    if (!result.ok) setError(result.error);
    // Si ok, l'action effectue un redirect côté serveur.
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {mode === "totp" ? (
        <div className="space-y-1.5">
          <label
            htmlFor="totp"
            className="text-sm font-medium text-foreground"
          >
            Code à 6 chiffres
          </label>
          <Input
            id="totp"
            inputMode="numeric"
            maxLength={6}
            autoComplete="one-time-code"
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="123456"
            className="text-center text-xl tracking-[0.4em]"
          />
        </div>
      ) : (
        <div className="space-y-1.5">
          <label
            htmlFor="recovery"
            className="text-sm font-medium text-foreground"
          >
            Code de récupération
          </label>
          <Input
            id="recovery"
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="xxxxx-xxxxx"
            className="text-center font-mono tracking-wider"
          />
          <p className="text-xs text-muted">
            Saisissez l&apos;un des codes téléchargés à l&apos;activation de la
            2FA. Chaque code n&apos;est utilisable qu&apos;une seule fois.
          </p>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-error">
          {error}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        block
        disabled={pending || code.length === 0}
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? "Vérification…" : "Vérifier"}
      </Button>

      <button
        type="button"
        onClick={() => {
          setMode((m) => (m === "totp" ? "recovery" : "totp"));
          setCode("");
          setError(null);
        }}
        className="block w-full text-center text-sm text-accent hover:underline"
      >
        {mode === "totp"
          ? "Utiliser un code de récupération"
          : "Utiliser le code de mon application"}
      </button>
    </form>
  );
}
