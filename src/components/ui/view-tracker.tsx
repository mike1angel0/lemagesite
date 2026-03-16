"use client";

import { useEffect } from "react";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("view_session_id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("view_session_id", id);
  }
  return id;
}

export function ViewTracker({
  contentType,
  contentId,
}: {
  contentType: string;
  contentId: string;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      const sessionId = getSessionId();
      if (!sessionId) return;
      fetch("/api/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType, contentId, sessionId }),
      }).catch(() => {});
    }, 3000);

    return () => clearTimeout(timer);
  }, [contentType, contentId]);

  return null;
}
