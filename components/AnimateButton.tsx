"use client";

import { useCallback, useEffect, useState } from "react";

const POLL_MS = 15000;

export function AnimateButton() {
  const [onCooldown, setOnCooldown] = useState(false);
  const [busy, setBusy] = useState(false);

  const refreshStatus = useCallback(async () => {
    const res = await fetch("/api/animate/status", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setOnCooldown(Boolean(data.onCooldown));
  }, []);

  useEffect(() => {
    refreshStatus();
    const interval = setInterval(refreshStatus, POLL_MS);
    return () => clearInterval(interval);
  }, [refreshStatus]);

  async function handleClick() {
    if (onCooldown || busy) return;
    setBusy(true);
    setOnCooldown(true);
    try {
      const res = await fetch("/api/animate", { method: "POST" });
      if (!res.ok) {
        await refreshStatus();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      className="animate-btn"
      onClick={handleClick}
      disabled={onCooldown || busy}
    >
      Animar a beber👏
    </button>
  );
}
