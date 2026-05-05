// lib/supabase.ts
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Cast nécessaire : @supabase/ssr@0.5 forwarde 3 génériques alors que
// @supabase/supabase-js@2.105 attend désormais une signature à 5 (avec
// `SchemaNameOrClientOptions` en position 2). Le re-typage force les
// defaults corrects et restaure l'inférence de schéma.
export function createSupabaseBrowserClient(): SupabaseClient<Database, "public"> {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  ) as unknown as SupabaseClient<Database, "public">;
}
