// components/ui/NutritionTable.tsx
import * as React from "react";
import type { NutritionValues } from "@/lib/nutrition";
import { formatNumberFR } from "@/lib/utils";
import { cn } from "@/lib/utils";

export interface NutritionTableProps {
  values: NutritionValues;
  className?: string;
  /** Inclut le titre — désactivable si déjà fourni au-dessus */
  showHeader?: boolean;
}

interface RowProps {
  label: string;
  value: string;
  indent?: boolean;
  bold?: boolean;
}

function Row({ label, value, indent, bold }: RowProps) {
  return (
    <tr className="border-t border-border first:border-t-0">
      <td
        className={cn(
          "py-2 pr-4 text-sm",
          indent && "pl-6 text-muted",
          bold && "font-semibold text-foreground",
        )}
      >
        {label}
      </td>
      <td
        className={cn(
          "py-2 pl-4 text-right text-sm tabular-nums",
          bold ? "font-semibold text-foreground" : "text-foreground",
        )}
      >
        {value}
      </td>
    </tr>
  );
}

export function NutritionTable({
  values,
  className,
  showHeader = true,
}: NutritionTableProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-border bg-background",
        className,
      )}
    >
      {showHeader && (
        <div className="border-b border-border bg-surface px-4 py-3">
          <p className="font-serif text-base font-semibold text-foreground">
            Déclaration nutritionnelle
          </p>
          <p className="text-xs text-muted">Pour 100 ml</p>
        </div>
      )}
      <table className="w-full table-fixed">
        <tbody className="divide-y divide-border">
          <Row
            label="Valeur énergétique"
            value={`${values.energieKj} kJ / ${values.energieKcal} kcal`}
            bold
          />
          <Row
            label="Matières grasses"
            value={`${formatNumberFR(values.matieresGrasses, 0)} g`}
          />
          <Row
            label="dont acides gras saturés"
            value={`${formatNumberFR(values.acidesGrasSatures, 0)} g`}
            indent
          />
          <Row
            label="Glucides"
            value={`${formatNumberFR(values.glucides, 1)} g`}
          />
          <Row
            label="dont sucres"
            value={`${formatNumberFR(values.sucres, 1)} g`}
            indent
          />
          <Row label="Protéines" value={`${formatNumberFR(values.proteines, 0)} g`} />
          <Row label="Sel" value={`${formatNumberFR(values.sel, 0)} g`} />
        </tbody>
      </table>
    </div>
  );
}
