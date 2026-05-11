// app/_components/connected-home/QuickActions.tsx
import Link from "next/link";
import {
  BarChart3,
  type LucideIcon,
  Plus,
  Settings,
  Sticker,
} from "lucide-react";
import { Card } from "@/components/ui/Card";

interface QuickAction {
  icon: LucideIcon;
  label: string;
  href: string;
}

const ACTIONS: QuickAction[] = [
  { icon: Plus, label: "Créer une cuvée", href: "/dashboard/cuvees/new" },
  { icon: BarChart3, label: "Voir les analytics", href: "/dashboard/analytics" },
  { icon: Sticker, label: "Commander des stickers", href: "/dashboard/store/stickers" },
  { icon: Settings, label: "Paramètres du domaine", href: "/dashboard/parametres" },
];

export function QuickActions() {
  return (
    <section>
      <h2 className="mb-4 text-xl font-medium text-foreground">Actions rapides</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <Link key={a.href} href={a.href} className="block">
              <Card className="cursor-pointer p-5 transition hover:border-accent hover:shadow-sm">
                <Icon className="mb-3 h-5 w-5 text-accent" aria-hidden="true" />
                <p className="text-sm font-medium text-foreground">{a.label}</p>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
