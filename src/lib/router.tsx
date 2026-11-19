import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getLenis } from "../hooks/useLenis";
import { ScrollTrigger } from "../animations/gsap/gsapConfig";

/**
 * Minimal history router — three page types don't justify a dependency,
 * and Shopify will own routing in production anyway (/, /collections/all,
 * /products/:handle). Paths mirror the links already in the header/menus:
 *   /            home (Kids or Adults by mode)
 *   /shop        all products
 *   /shop/:id    product buy page
 */
export type Route =
  | { name: "home" }
  | { name: "shop"; filter: "all" | "kids" | "adults" }
  | { name: "product"; id: string }
  | { name: "cart" }
  | { name: "benefits" };

function parse(location: Location): Route {
  const path = location.pathname.replace(/\/+$/, "") || "/";
  const product = path.match(/^\/shop\/([\w-]+)$/);
  if (product) return { name: "product", id: product[1] };
  if (path === "/cart") return { name: "cart" };
  if (path === "/benefits") return { name: "benefits" };
  if (path === "/shop") {
    const f = new URLSearchParams(location.search).get("range");
    return { name: "shop", filter: f === "kids" || f === "adults" ? f : "all" };
  }
  return { name: "home" };
}

/** Paths this prototype actually renders — other links fall through. */
function isAppPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/shop" ||
    pathname === "/cart" ||
    pathname === "/benefits" ||
    /^\/shop\/[\w-]+\/?$/.test(pathname)
  );
}

const RouteContext = createContext<Route>({ name: "home" });

export function navigate(to: string) {
  const url = new URL(to, location.href);
  const samePage = url.pathname + url.search === location.pathname + location.search;
  if (samePage) {
    if (url.hash) scrollToHash(url.hash);
    return;
  }
  history.pushState(null, "", to);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

/** Smooth-scroll to an in-page anchor (Lenis when active). */
export function scrollToHash(hash: string, immediate = false) {
  const el = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!el) return;
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(el, { offset: -90, immediate, duration: 1.4 });
  else el.scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(() => parse(location));
  const key = JSON.stringify(route);

  useEffect(() => {
    const onPop = () => setRoute(parse(location));
    // Intercept plain internal links (<a href="/shop/…">) so every existing
    // anchor in the header, menus and footers becomes client-side.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest?.("a");
      if (!a || a.target || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || !isAppPath(url.pathname)) return;
      e.preventDefault();
      navigate(url.pathname + url.search + url.hash);
    };
    window.addEventListener("popstate", onPop);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("popstate", onPop);
      document.removeEventListener("click", onClick);
    };
  }, []);

  // Every page change starts at the top, then re-measures triggers.
  const [first, setFirst] = useState(true);
  useEffect(() => {
    if (first) {
      setFirst(false);
      return;
    }
    getLenis()?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      // Deep link into the new page (e.g. /benefits#energy).
      if (location.hash) setTimeout(() => scrollToHash(location.hash), 120);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const value = useMemo(() => route, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>;
}

export function useRoute() {
  return useContext(RouteContext);
}
