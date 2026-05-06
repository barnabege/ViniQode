"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type State = "idle" | "loading" | "sent" | "error";

export interface RenvoyerEmailButtonProps {
  email: string;
  variant?: "outline" | "link";
}

export function RenvoyerEmailButton({
  email,
  variant = "outline",
}: RenvoyerEmailButtonProps) {
  const [state, setState] = React.useState<State>("idle");

  const onClick = async () => {
    setState("loading");
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.resend({ type: "signup", email });
      setState(error ? "error" : "sent");
    } catch {
      setState("error");
    }
  };

  if (state === "sent") {
    return (
      <p className="text-sm text-green-700">
        Email renvoyé. Vérifiez votre boîte de réception.
      </p>
    );
  }

  if (state === "error") {
    return (
      <p className="text-sm text-error">
        Renvoi impossible. Réessayez dans quelques instants.
      </p>
    );
  }

  if (variant === "link") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={state === "loading"}
        className="text-sm font-bold underline hover:text-orange-900 disabled:opacity-60"
      >
        {state === "loading" ? "Envoi…" : "Renvoyer l'email"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state === "loading"}
      className="inline-flex items-center gap-1 rounded-sm border border-green-700 px-3 py-1.5 text-sm font-medium text-green-700 transition-colors hover:bg-green-50 disabled:opacity-60"
    >
      {state === "loading" ? "Envoi…" : "Confirmer"}
      <ArrowRight className="h-3.5 w-3.5" />
    </button>
  );
}
