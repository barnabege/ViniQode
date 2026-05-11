"use client";

import * as React from "react";
import { toast } from "sonner";
import { AlertTriangle, Check, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Props {
  codes: string[];
}

export function RecoveryCodesPanel({ codes }: Props) {
  const [copied, setCopied] = React.useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(codes.join("\n"));
      setCopied(true);
      toast.success("Codes copiés dans le presse-papier");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier");
    }
  };

  const onDownload = () => {
    const text =
      "ViniQode — Codes de récupération 2FA\n" +
      "Conservez ces codes en lieu sûr. Chaque code n'est utilisable qu'une seule fois.\n" +
      `Généré le ${new Date().toLocaleDateString("fr-FR")}\n\n` +
      codes.join("\n") +
      "\n";
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "viniqode-recovery-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Fichier téléchargé");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        <AlertTriangle
          className="mt-0.5 h-4 w-4 flex-shrink-0"
          aria-hidden="true"
        />
        <p className="leading-relaxed">
          Conservez ces codes en lieu sûr. Ils vous permettront de vous
          reconnecter en cas de perte d&apos;accès à votre application
          d&apos;authentification.{" "}
          <strong>Ils ne seront plus jamais affichés.</strong>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-md border border-border bg-surface p-4 font-mono text-sm tabular-nums">
        {codes.map((code) => (
          <span
            key={code}
            className="select-all rounded-sm bg-background px-2 py-1.5 text-center text-foreground"
          >
            {code}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          variant="secondary"
          size="md"
          block
          onClick={onCopy}
        >
          {copied ? (
            <Check className="h-4 w-4 text-success" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied ? "Copié" : "Copier"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="md"
          block
          onClick={onDownload}
        >
          <Download className="h-4 w-4" />
          Télécharger en .txt
        </Button>
      </div>
    </div>
  );
}
