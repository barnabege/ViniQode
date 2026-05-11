// app/_components/connected-home/RecentActivity.tsx
import Link from "next/link";
import { AlertCircle, Globe, QrCode } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { ActivityEvent, ActivityKind } from "@/lib/home-data";

const ICON: Record<ActivityKind, typeof QrCode> = {
  scan: QrCode,
  geo: Globe,
  alerte: AlertCircle,
};

const ICON_TONE: Record<ActivityKind, string> = {
  scan: "text-accent",
  geo: "text-foreground",
  alerte: "text-error",
};

export function RecentActivity({ events }: { events: ActivityEvent[] }) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-medium text-foreground">Activité récente</h2>
      <Card className="p-0">
        {events.length === 0 ? (
          <div className="flex flex-col items-start gap-3 p-6">
            <p className="text-sm text-muted">
              Aucune activité récente. Vos cuvées attendent leurs premiers scans !
            </p>
            <Button asChild size="sm" variant="secondary">
              <Link href="/dashboard/cuvees">Voir mes cuvées</Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {events.map((e) => {
              const Icon = ICON[e.kind];
              return (
                <li key={e.id} className="flex items-start gap-3 px-6 py-3">
                  <Icon
                    className={`mt-0.5 h-4 w-4 flex-shrink-0 ${ICON_TONE[e.kind]}`}
                    aria-hidden="true"
                  />
                  <p className="text-sm text-foreground">{e.message}</p>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </section>
  );
}
