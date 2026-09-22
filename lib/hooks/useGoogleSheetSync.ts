"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { GoogleSheetsSyncResult } from "@/types/googleSheets";
import { notifyDataChanged } from "@/lib/repositories/storageAdapter";

interface UseGoogleSheetSyncOptions {
  autoSyncOnMount?: boolean;
  revalidateOnFocus?: boolean;
  pollIntervalMs?: number; // default 30000 (30 seconds)
}

export function useGoogleSheetSync(options: UseGoogleSheetSyncOptions = {}) {
  const {
    autoSyncOnMount = true,
    revalidateOnFocus = true,
    pollIntervalMs = 30000,
  } = options;

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<GoogleSheetsSyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastSyncTimeRef = useRef<number>(0);
  const isSyncingRef = useRef<boolean>(false);

  const syncNow = useCallback(
    async (customSheetUrl?: string, silent = false): Promise<GoogleSheetsSyncResult | null> => {
      // Prevent concurrent sync executions
      if (isSyncingRef.current) return null;

      // Throttle rapid repeated automatic calls (minimum 10 seconds between automatic syncs)
      const now = Date.now();
      if (silent && now - lastSyncTimeRef.current < 10000) {
        return null;
      }

      isSyncingRef.current = true;
      if (!silent) setIsSyncing(true);
      setError(null);

      try {
        const res = await fetch("/api/sync/google-sheets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(customSheetUrl ? { sheetUrl: customSheetUrl } : {}),
        });

        const data: GoogleSheetsSyncResult = await res.json();
        setSyncResult(data);
        lastSyncTimeRef.current = Date.now();

        if (data.success) {
          // Trigger app-wide data reload on successful sync
          notifyDataChanged();
        } else {
          if (!silent) setError(data.message || "Sync failed");
        }

        return data;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to sync with Google Sheets";
        if (!silent) setError(msg);
        return null;
      } finally {
        isSyncingRef.current = false;
        if (!silent) setIsSyncing(false);
      }
    },
    []
  );

  // 1. Initial sync on mount
  useEffect(() => {
    if (autoSyncOnMount) {
      syncNow(undefined, true);
    }
  }, [autoSyncOnMount, syncNow]);

  // 2. Periodic background polling
  useEffect(() => {
    if (!pollIntervalMs || pollIntervalMs <= 0) return;

    const interval = setInterval(() => {
      syncNow(undefined, true);
    }, pollIntervalMs);

    return () => clearInterval(interval);
  }, [pollIntervalMs, syncNow]);

  // 3. Sync when browser tab gains focus (e.g. user returns from Google Sheets)
  useEffect(() => {
    if (!revalidateOnFocus) return;

    const handleFocus = () => {
      syncNow(undefined, true);
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        syncNow(undefined, true);
      }
    });

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [revalidateOnFocus, syncNow]);

  return {
    isSyncing,
    syncResult,
    error,
    syncNow,
  };
}
