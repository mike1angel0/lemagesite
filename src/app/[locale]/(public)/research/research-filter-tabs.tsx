"use client";

import { FilterTabs } from "@/components/ui/filter-tabs";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function ResearchFilterTabs() {
  const t = useTranslations("research");

  const tabs = [
    t("filterAll"),
    t("filterNlp"),
    t("filterAttention"),
    t("filterPhilosophyAi"),
    t("filterPoeticsMl"),
  ];

  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <FilterTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
  );
}
