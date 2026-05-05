// lib/qrcode.ts
import QRCode from "qrcode";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Génère l'URL de la page e-label
export function getElabelUrl(cuveeId: string): string {
  return `${APP_URL}/elabel/${cuveeId}`;
}

// Génère le QR code en SVG (vectoriel — pour l'imprimeur)
export async function generateQRCodeSVG(cuveeId: string): Promise<string> {
  const url = getElabelUrl(cuveeId);
  
  const svgString = await QRCode.toString(url, {
    type: "svg",
    width: 300,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
    errorCorrectionLevel: "H", // Haute correction — résiste aux dégâts
  });

  return svgString;
}

// Génère le QR code en PNG base64 (pour l'aperçu dans le navigateur)
export async function generateQRCodePNG(cuveeId: string): Promise<string> {
  const url = getElabelUrl(cuveeId);

  const base64 = await QRCode.toDataURL(url, {
    width: 800,      // Haute résolution
    margin: 2,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
    errorCorrectionLevel: "H",
  });

  return base64; // Format : "data:image/png;base64,xxxx..."
}

// Génère les deux formats en une seule fois
export async function generateQRCode(cuveeId: string): Promise<{
  svg: string;
  png: string;
  url: string;
}> {
  const [svg, png] = await Promise.all([
    generateQRCodeSVG(cuveeId),
    generateQRCodePNG(cuveeId),
  ]);

  return {
    svg,
    png,
    url: getElabelUrl(cuveeId),
  };
}

// Variante consommée côté client (CuveeWizard) : prend l'URL e-label
// déjà construite et renvoie les deux formats sous une forme adaptée
// au composant <QRCodePreview> (`pngDataUrl` plutôt que `png`).
export interface QrCodeAssets {
  svg: string;
  pngDataUrl: string;
  url: string;
}

export async function generateQrCode(elabelUrl: string): Promise<QrCodeAssets> {
  const [svg, pngDataUrl] = await Promise.all([
    QRCode.toString(elabelUrl, {
      type: "svg",
      width: 300,
      margin: 2,
      color: { dark: "#000000", light: "#FFFFFF" },
      errorCorrectionLevel: "H",
    }),
    QRCode.toDataURL(elabelUrl, {
      width: 800,
      margin: 2,
      color: { dark: "#000000", light: "#FFFFFF" },
      errorCorrectionLevel: "H",
    }),
  ]);

  return { svg, pngDataUrl, url: elabelUrl };
}