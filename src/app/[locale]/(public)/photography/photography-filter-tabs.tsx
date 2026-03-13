"use client";

import { FilterTabs } from "@/components/ui/filter-tabs";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function PhotographyFilterTabs() {
  const t = useTranslations("photography");

  const tabs = [
    t("filterAll"),
    t("filterFogStudies"),
    t("filterUrbanSilence"),
    t("filterPortraits"),
    t("filterRomania"),
  ];

  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <FilterTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
  );
}
