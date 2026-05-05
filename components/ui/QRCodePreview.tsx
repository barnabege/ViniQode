// components/ui/QRCodePreview.tsx
"use client";

import * as React from "react";
import { Download } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

export interface QRCodePreviewProps {
  /** SVG complet du QR code */
  svg: string;
  /** Data URL PNG haute résolution */
  pngDataUrl: string;
  /** URL e-label encodée dans le QR */
  url: string;
  /** Nom de fichier de base (ex: "domaine-cuvee-2024") */
  filename: string;
  className?: string;
}

export function QRCodePreview({
  svg,
  pngDataUrl,
  url,
  filename,
  className,
}: QRCodePreviewProps) {
  const downloadSvg = () => {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const blobUrl = URL.createObjectURL(blob);
    triggerDownload(blobUrl, `${filename}.svg`);
    URL.revokeObjectURL(blobUrl);
  };

  const downloadPng = () => {
    triggerDownload(pngDataUrl, `${filename}.png`);
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-md border border-border bg-background p-6",
        className,
      )}
    >
      <div
        className="h-44 w-44 [&>svg]:h-full [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <p className="break-all text-center text-xs text-muted">{url}</p>
      <p className="text-xs text-muted">Taille minimale d'impression : 2 × 2 cm</p>
      <div className="flex w-full flex-col gap-2 sm:flex-row">
        <Button
          variant="secondary"
          size="sm"
          block
          onClick={downloadSvg}
          type="button"
        >
          <Download className="h-4 w-4" />
          Télécharger SVG
        </Button>
        <Button
          variant="primary"
          size="sm"
          block
          onClick={downloadPng}
          type="button"
        >
          <Download className="h-4 w-4" />
          Télécharger PNG 300 dpi
        </Button>
      </div>
    </div>
  );
}

function triggerDownload(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
