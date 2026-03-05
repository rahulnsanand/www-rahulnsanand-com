"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const THEME_EVENT = "themechange";
const LOGO_WIDTH = 61;
const LOGO_HEIGHT = 36;

function getThemeSnapshot(): Theme {
  if (typeof document !== "undefined") {
    if (document.documentElement.classList.contains("dark")) {
      return "dark";
    }
    if (document.documentElement.classList.contains("light")) {
      return "light";
    }
  }

  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  return "light";
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

export function ThemeLogo() {
  const theme = useSyncExternalStore(
    subscribeThemeStore,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  const logoSrc = theme === "dark" ? "/logo-dark.png" : "/logo-light.png";

  return (
    <Image
      src={logoSrc}
      alt="Rahul NS Anand logo"
      className="site-logo-image"
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      priority
    />
  );
}
