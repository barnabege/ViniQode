"use client";

import * as React from "react";
import type { AuditLog } from "@/lib/database.types";
import type { SupabaseSession } from "@/lib/audit/sessions";
import { SectionMotDePasse } from "./SectionMotDePasse";
import { SectionEmail } from "./SectionEmail";
import { SectionSessions } from "./SectionSessions";
import { SectionTwoFactor } from "./SectionTwoFactor";
import { SectionAuditLog } from "./SectionAuditLog";

export interface SectionSecuriteProps {
  email: string;
  pendingNewEmail: string | null;
  sessions: SupabaseSession[];
  currentSessionId: string | null;
  mfaEnrolled: boolean;
  initialAuditLogs: AuditLog[];
  initialAuditHasMore: boolean;
}

export function SectionSecurite({
  email,
  pendingNewEmail,
  sessions,
  currentSessionId,
  mfaEnrolled,
  initialAuditLogs,
  initialAuditHasMore,
}: SectionSecuriteProps) {
  return (
    <div className="space-y-6">
      <SectionMotDePasse />
      <SectionEmail email={email} pendingNewEmail={pendingNewEmail} />
      <SectionSessions
        sessions={sessions}
        currentSessionId={currentSessionId}
      />
      <SectionTwoFactor enrolled={mfaEnrolled} />
      <SectionAuditLog
        initialLogs={initialAuditLogs}
        initialHasMore={initialAuditHasMore}
      />
    </div>
  );
}
