"use client";

import { useEffect } from "react";
import { addRecentSearch } from "@/components/ui/search-suggestions";

export function SearchTracker({ query }: { query: string }) {
  useEffect(() => {
    if (query) {
      addRecentSearch(query);
    }
  }, [query]);

  return null;
}
