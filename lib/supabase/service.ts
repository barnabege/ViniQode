// lib/supabase/service.ts
//
// ⚠️ SERVEUR UNIQUEMENT — ne JAMAIS importer côté client.
//
// Client Supabase avec service_role key → bypass RLS.
// À utiliser pour les opérations d'administration :
//   - Écriture des audit_logs (le user n'a que SELECT en RLS)
//   - Lecture/écriture des recovery_codes (aucune policy RLS)
//   - Listing/révocation de sessions (table auth.sessions)
//   - MFA admin operations
//
// La SERVICE_ROLE_KEY a un accès complet à la DB. Toute fuite côté
// client = compromission totale. Le bundler ne doit jamais l'embarquer.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

let cachedClient: SupabaseClient<Database, "public"> | null = null;

export function createSupabaseServiceClient(): SupabaseClient<
  Database,
  "public"
> {
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Service Supabase indisponible : NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquante.",
    );
  }

  cachedClient = createClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  }) as unknown as SupabaseClient<Database, "public">;

  return cachedClient;
}
