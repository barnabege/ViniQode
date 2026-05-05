import { passwordStrength } from "@/lib/auth/schemas";
import { cn } from "@/lib/utils";

export function PasswordStrengthMeter({ password }: { password: string }) {
  const { level, label } = passwordStrength(password);
  if (!password) return null;
  return (
    <div className="mt-2 space-y-1">
      <div className="flex h-1 gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full",
              i <= level
                ? level >= 3
                  ? "bg-accent"
                  : "bg-orange-400"
                : "bg-border",
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted">Force du mot de passe : {label}</p>
    </div>
  );
}
