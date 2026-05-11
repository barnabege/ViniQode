// app/_components/connected-home/KpiCard.tsx
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface KpiCardBaseProps {
  label: string;
  className?: string;
}

interface KpiNumericProps extends KpiCardBaseProps {
  value: string;
}

export function KpiCard({ label, value, className }: KpiNumericProps) {
  return (
    <Card className={cn("p-5", className)}>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </Card>
  );
}

interface KpiBadgeProps extends KpiCardBaseProps {
  badge: React.ReactNode;
  href?: string;
}

export function KpiBadgeCard({ label, badge, href, className }: KpiBadgeProps) {
  const inner = (
    <Card
      className={cn(
        "p-5",
        href && "transition hover:border-accent hover:shadow-sm",
        className,
      )}
    >
      <p className="text-sm text-muted">{label}</p>
      <div className="mt-2">{badge}</div>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}

export function ConformiteBadge({
  statut,
  count,
}: {
  statut: "conforme" | "incomplet" | "vide";
  count: number;
}) {
  if (statut === "conforme") {
    return (
      <Badge variant="success" size="md">
        Conforme
      </Badge>
    );
  }
  if (statut === "incomplet") {
    return (
      <Badge variant="warning" size="md">
        {count} cuvée{count > 1 ? "s" : ""} à compléter
      </Badge>
    );
  }
  return (
    <Badge variant="neutral" size="md">
      Aucune cuvée publiée
    </Badge>
  );
}
