import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  hint,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  accent?: boolean;
  hint?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-border bg-card p-5 shadow-[var(--shadow-card)]",
        accent && "border-primary/40",
      )}
    >
      {accent && (
        <div className="absolute -top-12 -right-12 size-32 rounded-full bg-primary/20 blur-2xl" />
      )}
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            {label}
          </div>
          <div className="mt-2 text-3xl font-display font-bold tracking-tight">
            {value}
          </div>
          {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
        </div>
        {Icon && (
          <div className="grid place-items-center size-10 rounded-md bg-primary/10 text-primary border border-primary/20">
            <Icon className="size-5" />
          </div>
        )}
      </div>
    </div>
  );
}
