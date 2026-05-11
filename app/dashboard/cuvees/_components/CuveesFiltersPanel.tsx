"use client";

import * as React from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { MultiSelect } from "@/components/ui/multi-select";
import { Button } from "@/components/ui/Button";
import { COULEURS, STATUTS } from "@/lib/validations/cuvees";
import type { Couleur, StatutCuvee } from "@/lib/database.types";
import type { CuveesFilters } from "./useCuveesFilters";
import { isResetEnabled } from "./useCuveesFilters";

export interface CuveesFiltersPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: CuveesFilters;
  setFilters: (patch: Partial<CuveesFilters>) => void;
  onReset: () => void;
  availableMillesimes: number[];
  availableRegions: string[];
  availableAppellations: string[];
}

export function CuveesFiltersPanel({
  open,
  onOpenChange,
  filters,
  setFilters,
  onReset,
  availableMillesimes,
  availableRegions,
  availableAppellations,
}: CuveesFiltersPanelProps) {
  const millesimeOptions = React.useMemo(
    () =>
      availableMillesimes.map((m) => ({ value: String(m), label: String(m) })),
    [availableMillesimes],
  );

  const regionOptions = React.useMemo(
    () => availableRegions.map((r) => ({ value: r, label: r })),
    [availableRegions],
  );

  const appellationOptions = React.useMemo(
    () => availableAppellations.map((a) => ({ value: a, label: a })),
    [availableAppellations],
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col p-0">
        <SheetHeader>
          <SheetTitle>Filtres</SheetTitle>
          <SheetDescription>
            Affinez la liste de vos cuvées.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-5">
            <Field label="Millésime" htmlId="filter-millesime">
              <MultiSelect
                label="Millésime"
                options={millesimeOptions}
                selected={filters.millesimes.map(String)}
                onChange={(next) =>
                  setFilters({
                    millesimes: next
                      .map((v) => Number.parseInt(v, 10))
                      .filter((n) => Number.isFinite(n)),
                  })
                }
                searchable
                emptyMessage="Aucun millésime"
              />
            </Field>

            <Field label="Couleur" htmlId="filter-couleur">
              <MultiSelect
                label="Couleur"
                options={COULEURS.map((c) => ({ value: c.value, label: c.label }))}
                selected={filters.couleurs}
                onChange={(next) =>
                  setFilters({ couleurs: next as Couleur[] })
                }
              />
            </Field>

            <Field label="Région" htmlId="filter-region">
              <MultiSelect
                label="Région"
                options={regionOptions}
                selected={filters.regions}
                onChange={(next) => setFilters({ regions: next })}
                searchable
                emptyMessage="Aucune région"
              />
            </Field>

            <Field label="Appellation" htmlId="filter-appellation">
              <MultiSelect
                label="Appellation"
                options={appellationOptions}
                selected={filters.appellations}
                onChange={(next) => setFilters({ appellations: next })}
                searchable
                emptyMessage="Aucune appellation"
              />
            </Field>

            <Field label="Statut" htmlId="filter-statut">
              <MultiSelect
                label="Statut"
                options={STATUTS.map((s) => ({ value: s.value, label: s.label }))}
                selected={filters.statuts}
                onChange={(next) =>
                  setFilters({ statuts: next as StatutCuvee[] })
                }
              />
            </Field>

            <div className="space-y-3 border-t border-border pt-5">
              <ToggleField
                label="Afficher uniquement les non conformes"
                checked={filters.onlyNonConforme}
                onChange={(v) => setFilters({ onlyNonConforme: v })}
              />
              <ToggleField
                label="Grouper par millésime"
                checked={filters.groupByMillesime}
                onChange={(v) => setFilters({ groupByMillesime: v })}
              />
            </div>
          </div>
        </div>

        <SheetFooter>
          <Button
            variant="secondary"
            onClick={onReset}
            disabled={!isResetEnabled(filters)}
          >
            Réinitialiser
          </Button>
          <SheetClose asChild>
            <Button>Fermer</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function Field({
  label,
  htmlId,
  children,
}: {
  label: string;
  htmlId: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlId}
        className="block text-xs font-medium uppercase tracking-wide text-muted"
      >
        {label}
      </label>
      <div id={htmlId}>{children}</div>
    </div>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-sm border border-border bg-background px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-surface">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded-sm border-border"
      />
    </label>
  );
}
