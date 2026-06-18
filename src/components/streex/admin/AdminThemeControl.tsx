import { Monitor, Moon, Sun } from "lucide-react";
import type { AdminThemePreference } from "./useAdminTheme";

const OPTIONS: { key: AdminThemePreference; label: string; icon: typeof Sun }[] = [
  { key: "light", label: "Light", icon: Sun },
  { key: "dark", label: "Dark", icon: Moon },
  { key: "system", label: "System", icon: Monitor },
];

export function AdminThemeControl({
  value,
  onChange,
}: {
  value: AdminThemePreference;
  onChange: (next: AdminThemePreference) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Admin appearance"
      className="inline-flex items-center gap-0.5 rounded-full border p-0.5"
      style={{ borderColor: "var(--admin-border)", background: "var(--admin-surface)" }}
    >
      {OPTIONS.map((opt) => {
        const selected = opt.key === value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.key}
            type="button"
            role="radio"
            aria-checked={selected}
            title={opt.label}
            onClick={() => onChange(opt.key)}
            className="h-7 w-7 rounded-full flex items-center justify-center transition-colors"
            style={
              selected
                ? { background: "#E6CE20", color: "#0b0b0b" }
                : { color: "var(--admin-fg-muted)" }
            }
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="sr-only">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}