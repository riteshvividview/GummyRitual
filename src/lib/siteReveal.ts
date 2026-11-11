/**
 * One-shot "the site is visible" signal. Entrance animations wait on it
 * so they don't play behind the preload loader (first visit in a tab);
 * when the loader is skipped it resolves immediately.
 */
let revealed = false;
const listeners = new Set<() => void>();

export function markSiteRevealed() {
  if (revealed) return;
  revealed = true;
  listeners.forEach((fn) => fn());
  listeners.clear();
}

/** Runs `fn` once the site is revealed (immediately if it already is). Returns an unsubscribe. */
export function onSiteRevealed(fn: () => void): () => void {
  if (revealed) {
    fn();
    return () => {};
  }
  listeners.add(fn);
  return () => listeners.delete(fn);
}
