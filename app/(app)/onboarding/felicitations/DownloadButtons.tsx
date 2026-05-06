"use client";

import * as React from "react";
import Link from "next/link";
import { Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface DownloadButtonsProps {
  svg: string;
  pngDataUrl: string;
  elabelUrl: string;
  filenameBase: string;
}

export function DownloadButtons({
  svg,
  pngDataUrl,
  elabelUrl,
  filenameBase,
}: DownloadButtonsProps) {
  function downloadSvg() {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, `${filenameBase}.svg`);
    URL.revokeObjectURL(url);
  }

  function downloadPng() {
    triggerDownload(pngDataUrl, `${filenameBase}.png`);
  }

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <Button type="button" variant="secondary" onClick={downloadSvg}>
        <Download className="h-4 w-4" />
        SVG vectoriel
      </Button>
      <Button type="button" variant="secondary" onClick={downloadPng}>
        <Download className="h-4 w-4" />
        PNG haute déf
      </Button>
      <Button asChild variant="secondary">
        <Link href={elabelUrl} target="_blank" rel="noopener">
          <Smartphone className="h-4 w-4" />
          Tester
        </Link>
      </Button>
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
