"use client";

import { FilterTabs } from "@/components/ui/filter-tabs";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function PoetryFilterTabs() {
  const t = useTranslations("poetry");

  const tabs = [
    t("filterAll"),
    t("filterSilence"),
    t("filterIntelligence"),
    t("filterLonging"),
    t("filterRomanian"),
  ];

  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <FilterTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
  );
}
