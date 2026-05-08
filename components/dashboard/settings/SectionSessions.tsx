"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  LogOut,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  revokeAllOtherSessions,
  revokeSession,
} from "@/app/dashboard/parametres/actions/security";
import {
  parseUserAgent,
  type ParsedUserAgent,
} from "@/lib/audit/parse-user-agent";
import type { SupabaseSession } from "@/lib/audit/sessions";

interface Props {
  sessions: SupabaseSession[];
  currentSessionId: string | null;
}

export function SectionSessions({ sessions, currentSessionId }: Props) {
  const router = useRouter();
  const [pendingId, setPendingId] = React.useState<string | "all" | null>(null);

  const otherSessionsCount = sessions.filter(
    (s) => s.id !== currentSessionId,
  ).length;

  const onRevoke = async (sessionId: string) => {
    setPendingId(sessionId);
    const result = await revokeSession(sessionId);
    setPendingId(null);
    if (result.ok) {
      toast.success("Session déconnectée");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const onRevokeAll = async () => {
    setPendingId("all");
    const result = await revokeAllOtherSessions();
    setPendingId(null);
    if (result.ok) {
      toast.success(
        `${otherSessionsCount} session${otherSessionsCount > 1 ? "s" : ""} déconnectée${otherSessionsCount > 1 ? "s" : ""}`,
      );
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5 text-muted" />
          Sessions actives
        </CardTitle>
        <CardDescription>
          Liste des appareils connectés à votre compte. Déconnectez tout
          appareil suspect.
        </CardDescription>
      </CardHeader>

      <div className="mt-6 flex justify-end">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onRevokeAll}
          disabled={otherSessionsCount === 0 || pendingId !== null}
        >
          {pendingId === "all" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          Déconnecter les {otherSessionsCount} autres sessions
        </Button>
      </div>

      <ul className="mt-4 divide-y divide-border rounded-md border border-border">
        {sessions.length === 0 && (
          <li className="p-6 text-center text-sm text-muted">
            Aucune session active.
          </li>
        )}
        {sessions.map((s) => {
          const parsed = parseUserAgent(s.user_agent);
          const isCurrent = s.id === currentSessionId;
          return (
            <li
              key={s.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <DeviceIcon device={parsed.device} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {parsed.browser} sur {parsed.os}
                    {isCurrent && (
                      <Badge variant="success" size="sm" className="ml-2">
                        Cette session
                      </Badge>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {s.ip ? <code>{s.ip}</code> : "IP inconnue"}
                    {s.updated_at && (
                      <>
                        {" · Dernière activité "}
                        {formatRelative(s.updated_at)}
                      </>
                    )}
                  </p>
                </div>
              </div>

              {!isCurrent && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRevoke(s.id)}
                  disabled={pendingId !== null}
                  className="text-error hover:bg-red-50"
                >
                  {pendingId === s.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <LogOut className="h-3.5 w-3.5" />
                  )}
                  Déconnecter
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function DeviceIcon({ device }: { device: ParsedUserAgent["device"] }) {
  const className = "h-5 w-5 text-muted flex-shrink-0";
  if (device === "mobile") return <Smartphone className={className} />;
  if (device === "tablet") return <Tablet className={className} />;
  return <Monitor className={className} />;
}

function formatRelative(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = Math.max(0, now - then);
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `il y a ${days} j`;
  const months = Math.floor(days / 30);
  if (months < 12) return `il y a ${months} mois`;
  const years = Math.floor(months / 12);
  return `il y a ${years} an${years > 1 ? "s" : ""}`;
}
