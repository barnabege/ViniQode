// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  style: ["normal", "italic"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://viniqode.fr",
  ),
  title: {
    default:
      "ViniQode — E-label vin UE 2021/2117 | QR code conforme en 10 min",
    template: "%s · ViniQode",
  },
  description:
    "E-label vin conforme UE 2021/2117 en dix minutes. QR code obligatoire pour vignerons : 24 langues, hébergement 10 ans, sans tracking. Gratuit jusqu'à 3 cuvées.",
  keywords: [
    "e-label vin",
    "QR code vin obligatoire",
    "étiquetage vin UE 2021/2117",
    "e-label vigneron",
    "QR code étiquette vin conforme",
    "règlement européen vin",
  ],
  authors: [{ name: "ViniQode" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "ViniQode",
    title: "ViniQode — E-label vin UE 2021/2117 | QR code conforme",
    description:
      "L'outil de la filière viticole pour la conformité e-label. 53 000 exploitations viticoles concernées. Sans publicité, sans tracking. Accessible dix ans.",
    // og:image fournie par app/opengraph-image.tsx (généré dynamiquement)
  },
  twitter: {
    card: "summary_large_image",
    title: "ViniQode — E-label vin conforme",
    description:
      "L'e-label conforme, en dix minutes. Pour les 53 000 exploitations viticoles concernées par le règlement (UE) 2021/2117.",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#FAFAF7",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
