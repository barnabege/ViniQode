// app/elabel/[lang]/[id]/_actions.ts
//
// Server Action de logging des scans QR code.
//
// Contraintes :
//   - Fire-and-forget : aucune erreur ne doit remonter au consommateur.
//     Toute exception est avalée et loggée serveur uniquement.
//   - RGPD : on ne touche jamais à l'IP brute. Vercel résout country/region/
//     city côté edge et nous expose des headers x-vercel-ip-* — on persiste
//     uniquement ces valeurs déjà agrégées. En local (next dev) ces headers
//     sont absents → on logge `null`, c'est attendu.
//   - INSERT via service_role (lib/supabase/service.ts) : la table public.scans
//     n'a pas de policy INSERT pour anon (la page /elabel est publique).

"use server";

import { createSupabaseServiceClient } from "@/lib/supabase/service";

type DeviceType = "mobile" | "desktop" | "tablet" | "bot";

interface LogScanInput {
  cuveeId: string;
  userId: string;
  lang: string;
  country: string | null;
  region: string | null;
  city: string | null;
  userAgent: string | null;
}

// Détection device basique à partir du user-agent. Ordre important :
// bot avant tout (priorité absolue pour exclure des KPIs), puis tablet avant
// mobile (certains UA Android tablet contiennent « Mobile »).
const BOT_REGEX =
  /bot|crawler|spider|crawling|googlebot|bingbot|yandexbot|duckduckbot|baiduspider|slurp|facebookexternalhit|whatsapp|telegrambot|preview/i;
const TABLET_REGEX = /ipad|tablet|playbook|silk|kindle/i;
const MOBILE_REGEX =
  /mobile|android|iphone|ipod|blackberry|iemobile|opera mini|webos/i;

function detectDeviceType(ua: string | null): DeviceType {
  if (!ua) return "desktop";
  if (BOT_REGEX.test(ua)) return "bot";
  if (TABLET_REGEX.test(ua)) return "tablet";
  if (MOBILE_REGEX.test(ua)) return "mobile";
  return "desktop";
}

// Vercel percent-encode region/city dans les headers x-vercel-ip-*
// (ex. « Saint-Marcellin » → « Saint%2DMarcellin »). On décode pour
// persister du texte lisible. Le country est en ISO 2 lettres, pas concerné.
function safeDecode(value: string | null): string | null {
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function logScan(input: LogScanInput): Promise<void> {
  try {
    const supabase = createSupabaseServiceClient();
    const device_type = detectDeviceType(input.userAgent);

    const { error } = await supabase.from("scans").insert({
      cuvee_id: input.cuveeId,
      user_id: input.userId,
      country: input.country,
      region: safeDecode(input.region),
      city: safeDecode(input.city),
      device_type,
      user_agent: input.userAgent,
      language: input.lang,
    });

    if (error) {
      console.error("[logScan] insert failed", {
        code: error.code,
        message: error.message,
        cuveeId: input.cuveeId,
      });
    }
  } catch (err) {
    console.error("[logScan] unexpected error", err);
  }
}
