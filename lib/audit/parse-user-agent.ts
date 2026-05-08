// lib/audit/parse-user-agent.ts
// Parse minimaliste d'un user-agent string. Pas de dépendance externe :
// ce qu'on extrait suffit à l'affichage UI ("Chrome sur macOS").

export interface ParsedUserAgent {
  browser: string;
  os: string;
  device: "mobile" | "desktop" | "tablet" | "bot" | "unknown";
}

export function parseUserAgent(ua: string | null | undefined): ParsedUserAgent {
  if (!ua) {
    return { browser: "Inconnu", os: "Inconnu", device: "unknown" };
  }

  const lower = ua.toLowerCase();

  let browser = "Navigateur inconnu";
  if (/edg\//.test(lower)) browser = "Edge";
  else if (/opr\/|opera/.test(lower)) browser = "Opera";
  else if (/firefox/.test(lower)) browser = "Firefox";
  else if (/chrome/.test(lower) && !/edg\//.test(lower)) browser = "Chrome";
  else if (/safari/.test(lower) && !/chrome/.test(lower)) browser = "Safari";

  let os = "OS inconnu";
  if (/iphone|ipad|ipod/.test(lower)) os = "iOS";
  else if (/android/.test(lower)) os = "Android";
  else if (/mac os x|macintosh/.test(lower)) os = "macOS";
  else if (/windows/.test(lower)) os = "Windows";
  else if (/linux/.test(lower)) os = "Linux";

  let device: ParsedUserAgent["device"] = "desktop";
  if (/bot|crawler|spider|curl|wget|httpclient/.test(lower)) device = "bot";
  else if (/ipad|tablet/.test(lower)) device = "tablet";
  else if (/mobile|iphone|android.*mobile/.test(lower)) device = "mobile";

  return { browser, os, device };
}
