"use client";

import { cn } from "@/lib/utils";

interface FilterTabsProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

export function FilterTabs({
  tabs,
  activeTab,
  onTabChange,
  className,
}: FilterTabsProps) {
  return (
    <div className={cn("flex items-center gap-4 sm:gap-6", className)}>
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onTabChange(tab)}
          className={cn(
            "font-sans text-xs cursor-pointer transition-colors hover:text-text-secondary",
            tab === activeTab
              ? "text-accent font-medium"
              : "text-text-muted",
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
