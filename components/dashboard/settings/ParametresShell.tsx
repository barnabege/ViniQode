"use client";

import * as React from "react";
import { Toaster } from "sonner";
import {
  Bell,
  Building2,
  CreditCard,
  Globe,
  Palette,
  Shield,
  User,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import type { AuditLog, Profile } from "@/lib/database.types";
import type { SupabaseSession } from "@/lib/audit/sessions";
import { SectionDomaine } from "./SectionDomaine";
import { SectionCompte } from "./SectionCompte";
import { SectionFacturation } from "./SectionFacturation";
import { SectionPreferences } from "./SectionPreferences";
import { SectionNotifications } from "./SectionNotifications";
import { SectionPersonnalisation } from "./SectionPersonnalisation";
import { SectionSecurite } from "./SectionSecurite";

interface ParametresShellProps {
  profile: Profile;
  email: string;
  userId: string;
  pendingNewEmail: string | null;
  sessions: SupabaseSession[];
  currentSessionId: string | null;
  mfaEnrolled: boolean;
  initialAuditLogs: AuditLog[];
  initialAuditHasMore: boolean;
}

const TABS = [
  { value: "domaine", label: "Domaine", icon: Building2 },
  { value: "compte", label: "Compte", icon: User },
  { value: "facturation", label: "Facturation", icon: CreditCard },
  { value: "preferences", label: "Préférences", icon: Globe },
  { value: "notifications", label: "Notifications", icon: Bell },
  { value: "personnalisation", label: "Personnalisation", icon: Palette },
  { value: "securite", label: "Sécurité", icon: Shield },
] as const;

export function ParametresShell({
  profile,
  email,
  userId,
  pendingNewEmail,
  sessions,
  currentSessionId,
  mfaEnrolled,
  initialAuditLogs,
  initialAuditHasMore,
}: ParametresShellProps) {
  return (
    <>
      <Tabs defaultValue="domaine" className="space-y-6">
        <TabsList ariaLabel="Sections des paramètres">
          {TABS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} label={label}>
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="domaine">
          <SectionDomaine profile={profile} userId={userId} />
        </TabsContent>
        <TabsContent value="compte">
          <SectionCompte profile={profile} email={email} userId={userId} />
        </TabsContent>
        <TabsContent value="facturation">
          <SectionFacturation profile={profile} userId={userId} />
        </TabsContent>
        <TabsContent value="preferences">
          <SectionPreferences profile={profile} userId={userId} />
        </TabsContent>
        <TabsContent value="notifications">
          <SectionNotifications profile={profile} userId={userId} />
        </TabsContent>
        <TabsContent value="personnalisation">
          <SectionPersonnalisation profile={profile} userId={userId} />
        </TabsContent>
        <TabsContent value="securite">
          <SectionSecurite
            email={email}
            pendingNewEmail={pendingNewEmail}
            sessions={sessions}
            currentSessionId={currentSessionId}
            mfaEnrolled={mfaEnrolled}
            initialAuditLogs={initialAuditLogs}
            initialAuditHasMore={initialAuditHasMore}
          />
        </TabsContent>
      </Tabs>

      <Toaster
        position="bottom-right"
        richColors
        closeButton
        toastOptions={{ duration: 4000 }}
      />
    </>
  );
}
