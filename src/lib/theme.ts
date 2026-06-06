import { useEffect, useState } from "react";

export type Theme = "light" | "dark" | "auto";
const KEY = "daleel:theme";

export function getTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return (localStorage.getItem(KEY) as Theme) || "dark";
}

export function setTheme(t: Theme) {
  localStorage.setItem(KEY, t);
  applyTheme(t);
  window.dispatchEvent(new CustomEvent("daleel:theme", { detail: t }));
}

export function applyTheme(t: Theme) {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  el.classList.remove("light", "dark");
  const resolved = t === "auto"
    ? (window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark")
    : t;
  el.classList.add(resolved);
}

export function useTheme(): [Theme, (t: Theme) => void] {
  const [t, set] = useState<Theme>(() => getTheme());
  useEffect(() => {
    const h = (e: Event) => set((e as CustomEvent<Theme>).detail);
    window.addEventListener("daleel:theme", h);
    return () => window.removeEventListener("daleel:theme", h);
  }, []);
  return [t, setTheme];
}