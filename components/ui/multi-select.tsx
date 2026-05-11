"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  label: string;
  options: MultiSelectOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  searchable?: boolean;
  emptyMessage?: string;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  label,
  options,
  selected,
  onChange,
  searchable = false,
  emptyMessage = "Aucun résultat",
  placeholder,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const selectedSet = React.useMemo(() => new Set(selected), [selected]);
  const count = selected.length;

  const toggle = React.useCallback(
    (value: string) => {
      if (selectedSet.has(value)) {
        onChange(selected.filter((v) => v !== value));
      } else {
        onChange([...selected, value]);
      }
    },
    [selected, selectedSet, onChange],
  );

  const placeholderText = placeholder ?? `Rechercher ${label.toLowerCase()}…`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          className={cn(
            "inline-flex h-10 w-full items-center justify-between gap-2 rounded-sm border px-3 text-sm transition-colors",
            count > 0
              ? "border-foreground bg-surface text-foreground"
              : "border-border bg-background text-foreground hover:bg-surface",
            className,
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <span className="truncate">{label}</span>
            {count > 0 && (
              <span className="rounded-full bg-foreground px-1.5 text-[10px] font-medium leading-4 text-background">
                {count}
              </span>
            )}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] min-w-[220px] p-0"
      >
        <Command
          filter={(value, search) => {
            if (!search) return 1;
            return value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
          }}
        >
          {searchable && (
            <CommandInput placeholder={placeholderText} aria-label={placeholderText} />
          )}
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            {options.map((opt) => {
              const isSelected = selectedSet.has(opt.value);
              return (
                <CommandItem
                  key={opt.value}
                  value={opt.label}
                  onSelect={() => toggle(opt.value)}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-sm border",
                      isSelected
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-background",
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </span>
                  <span className="flex-1 truncate">{opt.label}</span>
                </CommandItem>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
