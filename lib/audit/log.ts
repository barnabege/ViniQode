// lib/audit/log.ts
//
// Helper d'écriture des audit_logs. À appeler depuis les Server Actions,
// route handlers et Server Components après une action sensible (auth,
// security, profile, billing, data).
//
// Best-effort : une erreur d'audit ne casse jamais l'action métier ;
// elle est logguée en console pour investigation.

import { headers } from "next/headers";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import type { EventCategory, EventSeverity } from "@/lib/database.types";
import { eventCategoryOf, type AuditEventType } from "./events";

export interface LogAuditEventParams {
  userId: string;
  eventType: AuditEventType;
  /** Optionnel : déduit du préfixe de eventType si omis. */
  category?: EventCategory;
  severity?: EventSeverity;
  metadata?: Record<string, unknown>;
  success?: boolean;
}

export async function logAuditEvent(
  params: LogAuditEventParams,
): Promise<void> {
  try {
    const h = headers();
    const ip =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      null;
    const userAgent = h.get("user-agent") || null;

    const supabase = createSupabaseServiceClient();
    const { error } = await supabase.from("audit_logs").insert({
      user_id: params.userId,
      event_type: params.eventType,
      event_category: params.category ?? eventCategoryOf(params.eventType),
      severity: params.severity ?? "info",
      ip_address: ip,
      user_agent: userAgent,
      metadata: params.metadata ?? {},
      success: params.success ?? true,
    });

    if (error) {
      console.error("[audit] insert failed:", error.message, {
        eventType: params.eventType,
        userId: params.userId,
      });
    }
  } catch (err) {
    // Capture toute exception (env vars manquantes, network, etc.) sans
    // remonter au caller — l'audit est best-effort.
    console.error("[audit] unexpected error:", err);
  }
}
