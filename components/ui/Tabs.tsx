"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  value: string;
  setValue: (v: string) => void;
  baseId: string;
  registerTrigger: (value: string, el: HTMLButtonElement | null) => void;
  focusTrigger: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabs(): TabsContextValue {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("Tabs subcomponent used outside <Tabs>");
  return ctx;
}

export interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  className,
  children,
}: TabsProps) {
  const [internal, setInternal] = React.useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;
  const baseId = React.useId();
  const triggerRefs = React.useRef(new Map<string, HTMLButtonElement>());

  const setValue = React.useCallback(
    (v: string) => {
      if (!isControlled) setInternal(v);
      onValueChange?.(v);
    },
    [isControlled, onValueChange],
  );

  const registerTrigger = React.useCallback(
    (v: string, el: HTMLButtonElement | null) => {
      if (el) triggerRefs.current.set(v, el);
      else triggerRefs.current.delete(v);
    },
    [],
  );

  const focusTrigger = React.useCallback((v: string) => {
    triggerRefs.current.get(v)?.focus();
  }, []);

  const ctxValue = React.useMemo(
    () => ({ value: current, setValue, baseId, registerTrigger, focusTrigger }),
    [current, setValue, baseId, registerTrigger, focusTrigger],
  );

  return (
    <TabsContext.Provider value={ctxValue}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export interface TabsListProps {
  ariaLabel: string;
  className?: string;
  children: React.ReactNode;
}

export function TabsList({ ariaLabel, className, children }: TabsListProps) {
  const { value, setValue, focusTrigger } = useTabs();

  const items = React.Children.toArray(children).flatMap((child) => {
    if (!React.isValidElement<TabsTriggerProps>(child)) return [];
    return [
      {
        value: child.props.value,
        label:
          child.props.label ??
          (typeof child.props.children === "string"
            ? child.props.children
            : child.props.value),
      },
    ];
  });

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    if (items.length === 0) return;
    const idx = items.findIndex((it) => it.value === value);
    let next = idx;
    if (e.key === "ArrowLeft") next = (idx - 1 + items.length) % items.length;
    if (e.key === "ArrowRight") next = (idx + 1) % items.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = items.length - 1;
    const nextItem = items[next];
    if (!nextItem) return;
    setValue(nextItem.value);
    requestAnimationFrame(() => focusTrigger(nextItem.value));
  };

  return (
    <>
      <div
        role="tablist"
        aria-label={ariaLabel}
        aria-orientation="horizontal"
        onKeyDown={onKeyDown}
        className={cn(
          "hidden flex-wrap gap-1 border-b border-border md:flex",
          className,
        )}
      >
        {children}
      </div>

      <div className="md:hidden">
        <label className="block">
          <span className="sr-only">{ariaLabel}</span>
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="flex h-11 w-full appearance-none rounded-sm border border-border bg-background bg-[length:14px] bg-[right_12px_center] bg-no-repeat px-3 pr-9 text-sm font-medium text-foreground transition-colors focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
            }}
          >
            {items.map((it) => (
              <option key={it.value} value={it.value}>
                {it.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </>
  );
}

export interface TabsTriggerProps {
  value: string;
  label?: string;
  className?: string;
  children: React.ReactNode;
}

export function TabsTrigger({
  value,
  className,
  children,
}: TabsTriggerProps) {
  const { value: current, setValue, baseId, registerTrigger } = useTabs();
  const active = current === value;

  return (
    <button
      ref={(el) => registerTrigger(value, el)}
      type="button"
      role="tab"
      id={`${baseId}-trigger-${value}`}
      aria-selected={active}
      aria-controls={`${baseId}-panel-${value}`}
      tabIndex={active ? 0 : -1}
      data-value={value}
      onClick={() => setValue(value)}
      className={cn(
        "-mb-px inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
        active
          ? "border-accent text-foreground"
          : "border-transparent text-muted hover:text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

export interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export function TabsContent({ value, className, children }: TabsContentProps) {
  const { value: current, baseId } = useTabs();
  const active = current === value;
  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-trigger-${value}`}
      hidden={!active}
      tabIndex={0}
      className={cn(active ? className : "hidden")}
    >
      {active && children}
    </div>
  );
}
