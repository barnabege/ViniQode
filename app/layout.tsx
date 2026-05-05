// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://viniqode.fr"),
  title: {
    default:
      "ViniQode — E-label QR code pour vignerons | Conforme (UE) 2021/2117",
    template: "%s · ViniQode",
  },
  description:
    "Créez votre e-label QR code conforme en 10 minutes. Solution dédiée aux vignerons artisanaux de moins de 50 ha. Gratuit pour vos 3 premières cuvées.",
  keywords: [
    "e-label vin",
    "QR code vin réglementation",
    "étiquetage vin UE 2021/2117",
    "e-label vigneron",
    "QR code étiquette vin conforme",
  ],
  authors: [{ name: "ViniQode" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "ViniQode",
    title: "ViniQode — E-label QR code conforme pour vignerons",
    description:
      "47 000 vignerons doivent afficher un QR code sur leurs bouteilles. ViniQode est la solution la plus simple du marché.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "ViniQode — La conformité e-label simplifiée",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ViniQode — E-label QR code conforme",
    description: "Créez votre e-label QR code conforme en 10 minutes.",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
