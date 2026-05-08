"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { AuditLog, EventCategory, EventSeverity } from "@/lib/database.types";
import { eventLabel } from "@/lib/audit/labels";

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const PAGE_SIZE = 50;

export interface AuditFilter {
  category?: EventCategory | "all";
  severity?: EventSeverity | "all";
  /** "24h" | "7d" | "30d" | "90d" | "all" */
  period?: "24h" | "7d" | "30d" | "90d" | "all";
  /** Cursor pagination : "charger plus" passe le created_at du dernier item affiché. */
  cursor?: string | null;
}

function periodToDate(period: AuditFilter["period"]): Date | null {
  if (!period || period === "all") return null;
  const d = new Date();
  if (period === "24h") d.setHours(d.getHours() - 24);
  else if (period === "7d") d.setDate(d.getDate() - 7);
  else if (period === "30d") d.setDate(d.getDate() - 30);
  else if (period === "90d") d.setDate(d.getDate() - 90);
  return d;
}

/**
 * Liste paginée des audit_logs de l'user courant avec filtres optionnels.
 * RLS appliquée : auth.uid() = user_id (cf. policy audit_logs_owner_read).
 */
export async function fetchAuditLogs(
  filter: AuditFilter = {},
): Promise<ActionResult<{ logs: AuditLog[]; hasMore: boolean }>> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Session expirée" };

  let query = supabase
    .from("audit_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE + 1);

  if (filter.category && filter.category !== "all") {
    query = query.eq("event_category", filter.category);
  }
  if (filter.severity && filter.severity !== "all") {
    query = query.eq("severity", filter.severity);
  }
  const since = periodToDate(filter.period);
  if (since) {
    query = query.gte("created_at", since.toISOString());
  }
  if (filter.cursor) {
    query = query.lt("created_at", filter.cursor);
  }

  const { data, error } = await query;
  if (error) return { ok: false, error: error.message };

  const rows = (data ?? []) as AuditLog[];
  const hasMore = rows.length > PAGE_SIZE;
  return { ok: true, data: { logs: rows.slice(0, PAGE_SIZE), hasMore } };
}

/**
 * Export complet (max 5000) des logs filtrés en CSV.
 * Retourne la string CSV — le client crée le Blob et déclenche le download.
 */
export async function exportAuditLogsCsv(
  filter: AuditFilter = {},
): Promise<ActionResult<{ csv: string; filename: string }>> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Session expirée" };

  let query = supabase
    .from("audit_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5000);

  if (filter.category && filter.category !== "all") {
    query = query.eq("event_category", filter.category);
  }
  if (filter.severity && filter.severity !== "all") {
    query = query.eq("severity", filter.severity);
  }
  const since = periodToDate(filter.period);
  if (since) {
    query = query.gte("created_at", since.toISOString());
  }

  const { data, error } = await query;
  if (error) return { ok: false, error: error.message };

  const rows = (data ?? []) as AuditLog[];
  const headers = [
    "Date",
    "Événement",
    "Catégorie",
    "Sévérité",
    "Statut",
    "IP",
    "User Agent",
    "Métadonnées",
  ];
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        r.created_at,
        eventLabel(r.event_type),
        r.event_category,
        r.severity,
        r.success ? "Succès" : "Échec",
        r.ip_address ?? "",
        r.user_agent ?? "",
        JSON.stringify(r.metadata ?? {}),
      ]
        .map(escape)
        .join(","),
    ),
  ];

  const date = new Date().toISOString().split("T")[0];
  return {
    ok: true,
    data: {
      csv: lines.join("\n"),
      filename: `viniqode-audit-${date}.csv`,
    },
  };
}
