"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import styles from "./ThemeToggle.module.css";

type Theme = "dark" | "light";

const STORAGE_KEY = "jobping-theme";
const THEME_EVENT = "jobping-theme-change";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

function subscribe(onChange: () => void) {
  window.addEventListener(THEME_EVENT, onChange);
  return () => window.removeEventListener(THEME_EVENT, onChange);
}

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, currentTheme, () => "dark");

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    window.localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
    window.dispatchEvent(new CustomEvent<Theme>(THEME_EVENT, { detail: next }));
  };

  const nextTheme = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={styles.toggle}
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
    >
      {theme === "dark" ? <Sun aria-hidden="true" className="h-4 w-4" /> : <Moon aria-hidden="true" className="h-4 w-4" />}
      <span className="hidden text-sm font-medium md:inline">{theme === "dark" ? "Light mode" : "Dark mode"}</span>
    </button>
  );
}

