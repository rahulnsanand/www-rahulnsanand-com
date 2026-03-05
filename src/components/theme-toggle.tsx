"use client";

import { Moon, Sun } from "@phosphor-icons/react";
import { useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

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

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  const handleToggle = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    localStorage.setItem(STORAGE_KEY, nextTheme);
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={handleToggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
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
