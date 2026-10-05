import { useEffect, useState } from "react";

/** Live-tracks an arbitrary media query; used to branch animation weight by viewport. */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handleChange = (event: MediaQueryListEvent) => setMatches(event.matches);

    setMatches(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}

/** Convenience preset matching the project's mobile breakpoint (see styles/variables.css). */
export function useIsMobile() {
  return useMediaQuery("(max-width: 767px)");
}
