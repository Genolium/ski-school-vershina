/**
 * UTM Tracking Module for Ski School Vershina
 *
 * Automatically parses, captures, and persists UTM attribution tags
 * (utm_source, utm_medium, utm_campaign, utm_content, utm_term) across
 * the user session to ensure 100% end-to-end marketing attribution.
 */

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

export const UTM_STORAGE_KEY = "vershina_utm_params";

export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export type UTMKey = (typeof UTM_KEYS)[number];

/**
 * Parses UTM query parameters from a search string or current window location.
 */
export function parseUTMParams(searchStr?: string): UTMParams {
  if (typeof window === "undefined" && !searchStr) {
    return {};
  }

  const query =
    searchStr !== undefined
      ? searchStr
      : typeof window !== "undefined"
        ? window.location.search
        : "";

  if (!query) {
    return {};
  }

  try {
    const params = new URLSearchParams(query);
    const utm: UTMParams = {};
    let hasUtm = false;

    for (const key of UTM_KEYS) {
      const val = params.get(key);
      if (val && val.trim() !== "") {
        utm[key] = val.trim();
        hasUtm = true;
      }
    }

    return hasUtm ? utm : {};
  } catch {
    return {};
  }
}

/**
 * Saves UTM parameters to sessionStorage with localStorage fallback.
 */
export function saveUTMParams(params: UTMParams): void {
  if (typeof window === "undefined" || !params || Object.keys(params).length === 0) {
    return;
  }

  const serialized = JSON.stringify(params);

  try {
    sessionStorage.setItem(UTM_STORAGE_KEY, serialized);
  } catch {
    try {
      localStorage.setItem(UTM_STORAGE_KEY, serialized);
    } catch {
      // Storage unavailable (e.g. strict private browsing or disabled storage)
    }
  }
}

/**
 * Retrieves stored UTM parameters from sessionStorage (with fallback to localStorage).
 */
export function getStoredUTMParams(): UTMParams {
  if (typeof window === "undefined") {
    return {};
  }

  // 1. Try reading from sessionStorage
  try {
    const rawSession = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (rawSession) {
      const parsed = JSON.parse(rawSession);
      if (parsed && typeof parsed === "object") {
        return parsed as UTMParams;
      }
    }
  } catch {
    // Fall through to localStorage
  }

  // 2. Fallback to localStorage
  try {
    const rawLocal = localStorage.getItem(UTM_STORAGE_KEY);
    if (rawLocal) {
      const parsed = JSON.parse(rawLocal);
      if (parsed && typeof parsed === "object") {
        return parsed as UTMParams;
      }
    }
  } catch {
    // Storage read error
  }

  return {};
}

/**
 * Clears stored UTM parameters from both sessionStorage and localStorage.
 */
export function clearStoredUTMParams(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(UTM_STORAGE_KEY);
  } catch {}
  try {
    localStorage.removeItem(UTM_STORAGE_KEY);
  } catch {}
}

/**
 * Initializes UTM tracking: if UTM parameters exist in current URL,
 * parses and persists them into storage.
 */
export function initUTM(): UTMParams {
  if (typeof window === "undefined") {
    return {};
  }

  const currentUTMs = parseUTMParams();
  if (Object.keys(currentUTMs).length > 0) {
    saveUTMParams(currentUTMs);
    return currentUTMs;
  }

  return getStoredUTMParams();
}

// Automatically initialize on import if in browser environment
if (typeof window !== "undefined") {
  initUTM();
}
