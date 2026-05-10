// app/opengraph-image.tsx
//
// Image OpenGraph générée dynamiquement par Next.js (edge runtime).
// 1200x630, design aligné avec la direction Linear/Vercel : monochrome
// warm, wine #5C1A2B en accent rature uniquement, italique pour la
// rupture éditoriale ("conforme,").
//
// Polices : système (next/og ne charge pas Fraunces sans bundle de font
// distant — coût latence pas justifié pour cet asset). Le rendu est
// cohérent avec la palette ; les italiques système suffisent.

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ViniQode — L'e-label conforme, en dix minutes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#FAFAF7",
          display: "flex",
          flexDirection: "column",
          padding: 72,
          fontFamily:
            'ui-serif, "Times New Roman", Georgia, Cambria, serif',
        }}
      >
        {/* En-tête : folio + référence + date */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 14,
            color: "#5C5B57",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            fontFamily:
              'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
            fontWeight: 500,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span
              style={{
                fontFamily:
                  'ui-serif, "Times New Roman", Georgia, serif',
                fontStyle: "italic",
                fontSize: 18,
                color: "#5C1A2B",
                letterSpacing: 0,
                textTransform: "none",
              }}
            >
              Nº 00
            </span>
            <span
              style={{
                width: 40,
                height: 1,
                background: "#E5E3DD",
                display: "block",
              }}
            />
            <span>Règlement (UE) 2021/2117</span>
          </div>
          <span>Établi 2026</span>
        </div>

        {/* Titre central */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingTop: 24,
          }}
        >
          <div
            style={{
              fontSize: 104,
              color: "#0F0F0E",
              lineHeight: 1.02,
              fontWeight: 500,
              letterSpacing: "-0.04em",
              fontFamily:
                'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
              <span>L&apos;e-label</span>
              <span
                style={{
                  fontFamily:
                    'ui-serif, "Times New Roman", Georgia, Cambria, serif',
                  fontStyle: "italic",
                  color: "#5C1A2B",
                }}
              >
                conforme,
              </span>
            </div>
            <span>en dix minutes.</span>
          </div>
        </div>

        {/* Pied : marque + URL */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily:
              'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span
              style={{
                width: 40,
                height: 2,
                background: "#5C1A2B",
                display: "block",
              }}
            />
            <span
              style={{
                fontSize: 28,
                color: "#0F0F0E",
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
            >
              ViniQode
            </span>
          </div>
          <span style={{ fontSize: 14, color: "#5C5B57" }}>viniqode.fr</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
