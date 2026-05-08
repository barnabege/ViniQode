// lib/audit/sessions.ts
// Lecture / parsing des sessions Supabase Auth.
// La table auth.sessions n'est pas typée dans Database (schema "public"),
// d'où le cast manuel sur le résultat de la query.

import { createSupabaseServiceClient } from "@/lib/supabase/service";

export interface SupabaseSession {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string | null;
  user_agent: string | null;
  ip: string | null;
}

interface AuthSchemaClient {
  schema: (s: string) => {
    from: (t: string) => {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          order: (
            col: string,
            opts: { ascending: boolean; nullsFirst?: boolean },
          ) => Promise<{
            data: SupabaseSession[] | null;
            error: { message: string } | null;
          }>;
        };
      };
    };
  };
}

export async function listUserSessions(
  userId: string,
): Promise<SupabaseSession[]> {
  const service = createSupabaseServiceClient() as unknown as AuthSchemaClient;
  const { data, error } = await service
    .schema("auth")
    .from("sessions")
    .select("id, user_id, created_at, updated_at, user_agent, ip")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false, nullsFirst: false });

  if (error) {
    console.error("[sessions] list failed:", error.message);
    return [];
  }
  return data ?? [];
}

/**
 * Récupère le `session_id` depuis le claim du JWT d'access token.
 * Permet d'identifier la session courante dans la liste.
 */
export function decodeSessionIdFromJwt(jwt: string): string | null {
  const parts = jwt.split(".");
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1]!.replace(/-/g, "+").replace(/_/g, "/");
    const padding = "=".repeat((4 - (base64.length % 4)) % 4);
    const decoded = Buffer.from(base64 + padding, "base64").toString("utf-8");
    const payload = JSON.parse(decoded) as { session_id?: unknown };
    return typeof payload.session_id === "string" ? payload.session_id : null;
  } catch {
    return null;
  }
}
