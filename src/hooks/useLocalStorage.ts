"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Generic hook for syncing React state with localStorage.
 *
 * Handles SSR safely by deferring localStorage reads to useEffect
 * (localStorage is not available during server rendering).
 *
 * Usage:
 *   const [theme, setTheme] = useLocalStorage("theme", "light");
 *
 * The setter accepts both direct values and updater functions,
 * matching the React useState contract:
 *   setTheme("dark");
 *   setTheme((prev) => prev === "light" ? "dark" : "light");
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Start with initialValue to avoid SSR/client hydration mismatch.
  // The real localStorage value is loaded in the effect below.
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount — client only
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        setStoredValue(JSON.parse(raw) as T);
      }
    } catch (err) {
      console.warn(`[useLocalStorage] Failed to read key "${key}":`, err);
    } finally {
      setHydrated(true);
    }
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        setStoredValue((prev) => {
          const next = value instanceof Function ? value(prev) : value;
          try {
            localStorage.setItem(key, JSON.stringify(next));
          } catch (err) {
            console.warn(`[useLocalStorage] Failed to write key "${key}":`, err);
          }
          return next;
        });
      } catch (err) {
        console.warn(`[useLocalStorage] Unexpected error for key "${key}":`, err);
      }
    },
    [key]
  );

  /** Remove the key from localStorage and reset to initialValue */
  const removeValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (err) {
      console.warn(`[useLocalStorage] Failed to remove key "${key}":`, err);
    }
  }, [key, initialValue]);

  // Sync across browser tabs — if another tab updates the same key,
  // reflect the change in this tab too.
  useEffect(() => {
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key !== key) return;
      if (e.newValue === null) {
        setStoredValue(initialValue);
        return;
      }
      try {
        setStoredValue(JSON.parse(e.newValue) as T);
      } catch {
        // Ignore malformed values from other tabs
      }
    };

    window.addEventListener("storage", handleStorageEvent);
    return () => window.removeEventListener("storage", handleStorageEvent);
  }, [key, initialValue]);

  void hydrated; // available for callers that need to gate rendering on hydration

  return [storedValue, setValue, removeValue];
}
