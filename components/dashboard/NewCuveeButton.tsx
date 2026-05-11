"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { QuotaExceededModal } from "./QuotaExceededModal";

export interface NewCuveeButtonProps {
  used: number;
  limit: number;
  planLabel: string;
  label?: string;
}

export function NewCuveeButton({
  used,
  limit,
  planLabel,
  label = "Nouvelle cuvée",
}: NewCuveeButtonProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const reached = Number.isFinite(limit) && used >= limit;

  function onClick() {
    if (reached) {
      setOpen(true);
      return;
    }
    router.push("/dashboard/cuvees/new");
  }

  return (
    <>
      <Button onClick={onClick}>
        <Plus className="h-4 w-4" />
        {label}
      </Button>
      <QuotaExceededModal
        open={open}
        onClose={() => setOpen(false)}
        planLabel={planLabel}
        limit={limit}
      />
    </>
  );
}
