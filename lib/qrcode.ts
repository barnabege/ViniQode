// lib/qrcode.ts
import QRCode from "qrcode";

export interface QrCodeAssets {
  /** SVG vectoriel pour impression */
  svg: string;
  /** PNG haute résolution data URL (≈300 DPI à 2x2 cm) */
  pngDataUrl: string;
  /** URL e-label pointée par le QR code */
  url: string;
}

/**
 * Génère un QR code conforme aux exigences GS1 Digital Link.
 * Le QR doit rester scannable à partir de 2×2 cm — niveau de
 * correction "M" est un bon compromis qualité/densité.
 */
export async function generateQrCode(elabelUrl: string): Promise<QrCodeAssets> {
  const options = {
    errorCorrectionLevel: "M" as const,
    margin: 2,
    color: {
      dark: "#111827",
      light: "#FFFFFF",
    },
  };

  const svg = await QRCode.toString(elabelUrl, {
    ...options,
    type: "svg",
    width: 512,
  });

  // 2 cm × 300 DPI ≈ 236 px ; on monte à 1024 pour confort imprimeur
  const pngDataUrl = await QRCode.toDataURL(elabelUrl, {
    ...options,
    type: "image/png",
    width: 1024,
  });

  return { svg, pngDataUrl, url: elabelUrl };
}
