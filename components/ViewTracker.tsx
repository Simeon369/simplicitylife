"use client";

import { useEffect, useRef } from "react";

const VISITOR_ID_KEY = "simplicity_visitor_id";

function getVisitorId(): string {
  if (typeof window === "undefined") return "";

  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}

interface ViewTrackerProps {
  postId: string;
}

export default function ViewTracker({ postId }: ViewTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current || !postId) return;
    tracked.current = true;

    const visitorId = getVisitorId();
    if (!visitorId) return;

    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, visitorId }),
    }).catch(() => {});
  }, [postId]);

  return null;
}
