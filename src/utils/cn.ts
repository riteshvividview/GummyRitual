import clsx from "clsx";

/** Thin re-export so call sites import from a project-owned path. */
export function cn(...inputs: Parameters<typeof clsx>) {
  return clsx(...inputs);
}
