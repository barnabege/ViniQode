import { AlertCircle } from "lucide-react";

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      className="flex items-start gap-2 rounded-sm border border-error/30 bg-red-50 px-3 py-2 text-sm text-error"
      role="alert"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}
