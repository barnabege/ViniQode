// app/api/qrcode/download/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateQRCodeSVG, generateQRCodePNG } from "@/lib/qrcode";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cuveeId = searchParams.get("id");
  const format = searchParams.get("format") || "png"; // "svg" ou "png"
  const nomCuvee = searchParams.get("nom") || "cuvee";

  if (!cuveeId) {
    return NextResponse.json({ error: "ID manquant" }, { status: 400 });
  }

  try {
    if (format === "svg") {
      // Téléchargement SVG vectoriel
      const svg = await generateQRCodeSVG(cuveeId);
      
      return new NextResponse(svg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Content-Disposition": 
            `attachment; filename="QR_${nomCuvee}_viniqode.svg"`,
        },
      });

    } else {
      // Téléchargement PNG haute résolution
      const base64 = await generateQRCodePNG(cuveeId);
      
      // Convertir base64 en buffer
      const base64Data = base64.replace(/^data:image\/png;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": 
            `attachment; filename="QR_${nomCuvee}_viniqode.png"`,
          "X-QR-Resolution": "800x800px — 300 DPI recommandé",
        },
      });
    }

  } catch (error) {
    return NextResponse.json(
      { error: "Erreur génération" },
      { status: 500 }
    );
  }
}