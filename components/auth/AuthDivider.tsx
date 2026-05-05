export function AuthDivider({ label = "ou" }: { label?: string }) {
  return (
    <div className="relative my-6 text-center">
      <span className="relative z-10 bg-background px-3 text-xs uppercase tracking-widest text-muted">
        {label}
      </span>
      <span className="absolute left-0 top-1/2 -z-0 h-px w-full bg-border" />
    </div>
  );
}
