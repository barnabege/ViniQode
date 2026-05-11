// app/dashboard/analytics/_components/ScansChart.tsx
"use client";

import { LineChart as LineChartIcon } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BucketPoint } from "../_lib/queries";

interface Props {
  data: BucketPoint[];
  granularity: "day" | "week";
}

export function ScansChart({ data, granularity }: Props) {
  // État vide : tous les buckets à zéro. Le graphique vide est moche.
  const allZero = data.every((d) => d.count === 0);
  if (allZero) return <EmptyState />;

  return (
    <div className="h-[200px] w-full sm:h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 12, bottom: 0, left: -8 }}
        >
          <CartesianGrid stroke="#E5E3DD" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(value: string) => formatTick(value)}
            stroke="#A3A29C"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: "#E5E3DD" }}
            minTickGap={24}
          />
          <YAxis
            allowDecimals={false}
            stroke="#A3A29C"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={32}
          />
          <Tooltip
            cursor={{ stroke: "#5C1A2B", strokeOpacity: 0.2 }}
            contentStyle={{
              background: "#FAFAF7",
              border: "1px solid #E5E3DD",
              borderRadius: 6,
              fontSize: 12,
            }}
            labelFormatter={(label) =>
              formatTooltipLabel(String(label ?? ""), granularity)
            }
            formatter={(value) => {
              const n = Number(value ?? 0);
              return [`${n} scan${n > 1 ? "s" : ""}`, ""] as [string, string];
            }}
            separator=""
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#5C1A2B"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#5C1A2B" }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Clé YYYY-MM-DD → « 11 mai ». Parse en UTC pour éviter qu'un fuseau négatif
// décale d'un jour côté client.
function formatTick(key: string): string {
  const d = new Date(`${key}T00:00:00Z`);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(d);
}

function formatTooltipLabel(
  key: string,
  granularity: "day" | "week",
): string {
  const d = new Date(`${key}T00:00:00Z`);
  const base = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
  return granularity === "week" ? `Semaine du ${base}` : base;
}

function EmptyState() {
  return (
    <div className="flex h-[200px] flex-col items-center justify-center gap-3 rounded-md bg-surface text-center sm:h-[300px]">
      <LineChartIcon className="h-8 w-8 text-subtle" aria-hidden />
      <p className="max-w-xs text-sm text-muted">
        Les scans apparaîtront ici dès que vos consommateurs flasheront vos
        QR codes.
      </p>
    </div>
  );
}
