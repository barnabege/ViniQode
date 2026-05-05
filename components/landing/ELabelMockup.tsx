// components/landing/ELabelMockup.tsx
import * as React from "react";

/**
 * Aperçu statique de page e-label utilisé dans le mockup
 * de téléphone sur la landing page et l'étape 4.
 */
export function ELabelMockup() {
  return (
    <div className="space-y-4 font-sans">
      <div className="space-y-1 border-b border-border pb-3">
        <p className="text-[10px] uppercase tracking-widest text-muted">
          (UE) 2021/2117
        </p>
        <p className="font-serif text-base text-foreground">
          Cuvée des Vieilles Vignes
        </p>
        <p className="text-xs text-muted">Bordeaux · 2022 · Rouge</p>
        <p className="text-xs text-muted">Domaine de la Vigne</p>
      </div>

      <div className="space-y-1.5">
        <p className="text-[10px] uppercase tracking-widest text-muted">
          Ingrédients
        </p>
        <p className="text-xs leading-relaxed text-foreground">
          Raisins, contient des <strong>sulfites</strong>.
        </p>
      </div>

      <div className="space-y-1.5">
        <p className="text-[10px] uppercase tracking-widest text-muted">
          Déclaration nutritionnelle
        </p>
        <p className="text-[10px] text-muted">Pour 100 ml</p>
        <table className="w-full text-[11px]">
          <tbody>
            <Row label="Énergie" value="328 kJ / 79 kcal" bold />
            <Row label="Matières grasses" value="0 g" />
            <Row label="dont saturés" value="0 g" indent />
            <Row label="Glucides" value="0,3 g" />
            <Row label="dont sucres" value="0,3 g" indent />
            <Row label="Protéines" value="0 g" />
            <Row label="Sel" value="0 g" />
          </tbody>
        </table>
      </div>

      <p className="border-t border-border pt-3 text-[10px] leading-relaxed text-muted">
        Aucune donnée personnelle n'est collectée lors de la consultation
        de cette page.
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  indent,
  bold,
}: {
  label: string;
  value: string;
  indent?: boolean;
  bold?: boolean;
}) {
  return (
    <tr className="border-t border-border first:border-t-0">
      <td
        className={
          "py-1 " +
          (indent ? "pl-3 text-muted" : "text-foreground") +
          (bold ? " font-semibold" : "")
        }
      >
        {label}
      </td>
      <td
        className={
          "py-1 text-right tabular-nums " +
          (bold ? "font-semibold text-foreground" : "text-foreground")
        }
      >
        {value}
      </td>
    </tr>
  );
}
