import { passwordStrength } from "@/lib/auth/schemas";
import { cn } from "@/lib/utils";

// Gradation 4 niveaux de saturation wine : du plus clair au plus soutenu.
// Chaque segment reçoit sa propre opacité fixe quand il est rempli, ce qui
// crée un effet de progression visuelle indépendant du nombre de segments
// allumés.
const SEGMENT_COLORS = [
  "bg-wine/30",
  "bg-wine/50",
  "bg-wine/75",
  "bg-wine",
] as const;

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
              "h-1 flex-1 rounded-full transition-colors",
              i <= level ? SEGMENT_COLORS[i - 1] : "bg-border",
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted">
        Force du mot de passe :{" "}
        <span
          className={cn(
            "font-medium",
            level >= 3 ? "text-wine" : "text-foreground",
          )}
        >
          {label}
        </span>
      </p>
    </div>
  );
}
