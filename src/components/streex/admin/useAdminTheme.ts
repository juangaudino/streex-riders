import { useCallback, useEffect, useState } from "react";

export type AdminThemePreference = "light" | "dark" | "system";
export type ResolvedAdminTheme = "light" | "dark";

const STORAGE_KEY = "streex_admin_theme";

function readStored(): AdminThemePreference {
  if (typeof window === "undefined") return "dark";
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === "light" || raw === "dark" || raw === "system") return raw;
  return "dark";
}

function systemPrefersLight(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-color-scheme: light)").matches;
}

export function useAdminTheme() {
  const [preference, setPreferenceState] = useState<AdminThemePreference>(() => readStored());
  const [resolved, setResolved] = useState<ResolvedAdminTheme>(() => {
    const pref = readStored();
    if (pref === "system") return systemPrefersLight() ? "light" : "dark";
    return pref;
  });

  useEffect(() => {
    if (preference !== "system") {
      setResolved(preference);
      return;
    }
    const mql = window.matchMedia("(prefers-color-scheme: light)");
    const update = () => setResolved(mql.matches ? "light" : "dark");
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [preference]);

  useEffect(() => {
    document.documentElement.dataset.streexAdminTheme = resolved;
    return () => {
      delete document.documentElement.dataset.streexAdminTheme;
    };
  }, [resolved]);

  const setPreference = useCallback((next: AdminThemePreference) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
    setPreferenceState(next);
  }, []);

  return { preference, resolved, setPreference };
}
