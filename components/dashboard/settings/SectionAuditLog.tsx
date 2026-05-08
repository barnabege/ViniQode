"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  History,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  exportAuditLogsCsv,
  fetchAuditLogs,
  type AuditFilter,
} from "@/app/dashboard/parametres/actions/audit";
import { eventLabel } from "@/lib/audit/labels";
import type { AuditLog, EventCategory } from "@/lib/database.types";

interface Props {
  initialLogs: AuditLog[];
  initialHasMore: boolean;
}

const CATEGORY_LABELS: Record<EventCategory | "all", string> = {
  all: "Toutes les catégories",
  auth: "Authentification",
  security: "Sécurité",
  profile: "Profil",
  billing: "Facturation",
  data: "Données",
};

const PERIOD_LABELS: Record<NonNullable<AuditFilter["period"]>, string> = {
  "24h": "Dernières 24h",
  "7d": "7 derniers jours",
  "30d": "30 derniers jours",
  "90d": "90 derniers jours",
  all: "Tout l'historique",
};

const SEVERITY_LABELS = {
  all: "Toutes les sévérités",
  info: "Info",
  warning: "Avertissement",
  critical: "Critique",
} as const;

const CATEGORY_BADGE: Record<EventCategory, "neutral" | "info" | "warning" | "success" | "error" | "dark"> = {
  auth: "info",
  security: "warning",
  profile: "neutral",
  billing: "dark",
  data: "success",
};

export function SectionAuditLog({ initialLogs, initialHasMore }: Props) {
  const [logs, setLogs] = React.useState<AuditLog[]>(initialLogs);
  const [hasMore, setHasMore] = React.useState(initialHasMore);
  const [filter, setFilter] = React.useState<AuditFilter>({
    category: "all",
    severity: "all",
    period: "30d",
  });
  const [loading, setLoading] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);

  const refetch = React.useCallback(async (next: AuditFilter) => {
    setLoading(true);
    const res = await fetchAuditLogs({ ...next, cursor: null });
    setLoading(false);
    if (res.ok) {
      setLogs(res.data.logs);
      setHasMore(res.data.hasMore);
    } else {
      toast.error(res.error);
    }
  }, []);

  const onChangeFilter = (patch: Partial<AuditFilter>) => {
    const next = { ...filter, ...patch };
    setFilter(next);
    void refetch(next);
  };

  const onLoadMore = async () => {
    const last = logs[logs.length - 1];
    if (!last) return;
    setLoading(true);
    const res = await fetchAuditLogs({ ...filter, cursor: last.created_at });
    setLoading(false);
    if (res.ok) {
      setLogs((prev) => [...prev, ...res.data.logs]);
      setHasMore(res.data.hasMore);
    } else {
      toast.error(res.error);
    }
  };

  const onExport = async () => {
    setExporting(true);
    const res = await exportAuditLogsCsv(filter);
    setExporting(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    const blob = new Blob([res.data.csv], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = res.data.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Export téléchargé");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-muted" />
          Journal d&apos;activité
        </CardTitle>
        <CardDescription>
          Toutes les actions sensibles effectuées sur votre compte. Conservé 1 an.
        </CardDescription>
      </CardHeader>

      {/* Filtres */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Select
          aria-label="Filtre catégorie"
          value={filter.category}
          onChange={(e) =>
            onChangeFilter({
              category: e.target.value as EventCategory | "all",
            })
          }
        >
          {Object.entries(CATEGORY_LABELS).map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </Select>

        <Select
          aria-label="Filtre période"
          value={filter.period}
          onChange={(e) =>
            onChangeFilter({
              period: e.target.value as AuditFilter["period"],
            })
          }
        >
          {Object.entries(PERIOD_LABELS).map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </Select>

        <Select
          aria-label="Filtre sévérité"
          value={filter.severity}
          onChange={(e) =>
            onChangeFilter({
              severity: e.target.value as AuditFilter["severity"],
            })
          }
        >
          {Object.entries(SEVERITY_LABELS).map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-3 flex justify-end">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onExport}
          disabled={exporting || logs.length === 0}
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Exporter en CSV
        </Button>
      </div>

      {/* Liste */}
      <ul className="mt-4 divide-y divide-border rounded-md border border-border">
        {loading && logs.length === 0 && (
          <li className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted" />
          </li>
        )}
        {!loading && logs.length === 0 && (
          <li className="p-6 text-center text-sm text-muted">
            Aucun événement à afficher.
          </li>
        )}
        {logs.map((log) => (
          <li
            key={log.id}
            className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="flex items-start gap-3 min-w-0">
              {log.success ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
              ) : (
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-error" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {eventLabel(log.event_type)}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  <span title={new Date(log.created_at).toLocaleString("fr-FR")}>
                    {formatRelative(log.created_at)}
                  </span>
                  {log.ip_address && (
                    <>
                      {" · "}
                      <code>{log.ip_address}</code>
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="flex flex-shrink-0 gap-1.5">
              <Badge variant={CATEGORY_BADGE[log.event_category]} size="sm">
                {log.event_category}
              </Badge>
              {log.severity !== "info" && (
                <Badge
                  variant={log.severity === "critical" ? "error" : "warning"}
                  size="sm"
                >
                  {log.severity}
                </Badge>
              )}
            </div>
          </li>
        ))}
      </ul>

      {hasMore && (
        <div className="mt-4 flex justify-center">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onLoadMore}
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Charger 50 événements de plus
          </Button>
        </div>
      )}
    </Card>
  );
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return "à l'instant";
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `il y a ${days} j`;
  const months = Math.floor(days / 30);
  if (months < 12) return `il y a ${months} mois`;
  return `il y a ${Math.floor(months / 12)} an(s)`;
}
