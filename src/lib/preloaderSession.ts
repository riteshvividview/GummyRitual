/**
 * Tracks whether the preload loader has already run once in this browser
 * tab (sessionStorage, not localStorage) — so a refresh or in-tab
 * navigation skips straight to the site, but closing and reopening the
 * tab shows it again.
 */

const KEY = "gr:preloaderShown";

export function hasLoaderRunThisSession(): boolean {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    // Private-mode storage access can throw — fail open (show the loader)
    // rather than crash.
    return false;
  }
}

export function markLoaderRunThisSession(): void {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    // Nothing to do if storage is unavailable — the loader will just show
    // again next load, which is a harmless degradation.
  }
}
