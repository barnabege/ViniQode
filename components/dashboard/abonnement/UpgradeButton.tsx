"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface UpgradeButtonProps {
  plan: "essentiel" | "pro";
  label: string;
  variant: "primary" | "outline";
}

export function UpgradeButton({ plan, label, variant }: UpgradeButtonProps) {
  const [loading, setLoading] = React.useState(false);

  const onClick = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = (await res.json()) as {
        url?: string | null;
        message?: string;
      };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      toast.info(
        "Le paiement Stripe sera bientôt connecté. Contact : contact@viniqode.fr",
      );
    } catch {
      toast.error("Impossible de lancer la souscription. Réessayez plus tard.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      block
      variant={variant}
      onClick={onClick}
      disabled={loading}
      aria-label={`${label} (abonnement annuel)`}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {loading ? "Patientez…" : label}
    </Button>
  );
}
