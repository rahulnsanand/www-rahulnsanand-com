"use client";

import { Moon, Sun } from "@phosphor-icons/react";
import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "theme";
const THEME_EVENT = "themechange";

function applyTheme(theme: Theme): void {
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(theme);
  document.documentElement.style.colorScheme = theme;
}

function getInitialTheme(): Theme {
  if (typeof document !== "undefined") {
    if (document.documentElement.classList.contains("dark")) {
      return "dark";
    }
    if (document.documentElement.classList.contains("light")) {
      return "light";
    }
  }

  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  return "light";
}

function getThemeSnapshot(): Theme {
  return getInitialTheme();
}

function getServerThemeSnapshot(): Theme {
  return "light";
}

function subscribeThemeStore(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const notify = () => onStoreChange();

  window.addEventListener("storage", notify);
  window.addEventListener(THEME_EVENT, notify);
  mediaQuery.addEventListener("change", notify);

  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener(THEME_EVENT, notify);
    mediaQuery.removeEventListener("change", notify);
  };
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeThemeStore,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  const handleToggle = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    localStorage.setItem(STORAGE_KEY, nextTheme);
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  const nextModeLabel = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={handleToggle}
      aria-label={`Switch to ${nextModeLabel} mode`}
      title="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun size={20} weight="duotone" aria-hidden="true" />
      ) : (
        <Moon size={20} weight="duotone" aria-hidden="true" />
      )}
    </button>
  );
}
