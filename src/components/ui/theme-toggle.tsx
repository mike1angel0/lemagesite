"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const next = () => {
    const order: Array<"dark" | "light" | "system"> = ["dark", "light", "system"];
    const idx = order.indexOf(theme);
    setTheme(order[(idx + 1) % order.length]);
  };

  return (
    <button
      onClick={next}
      aria-label={`Theme: ${theme}`}
      className="p-1.5 text-text-muted hover:text-text-secondary transition-colors"
    >
      {theme === "dark" && <Moon className="size-3.5" />}
      {theme === "light" && <Sun className="size-3.5" />}
      {theme === "system" && <Monitor className="size-3.5" />}
    </button>
  );
}
