"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type Route = {
  path: string;
  params: Record<string, string>;
};

function parseHash(): Route {
  const raw =
    typeof window !== "undefined"
      ? window.location.hash.replace(/^#/, "")
      : "";
  if (!raw) return { path: "/", params: {} };
  const [path, query] = raw.split("?");
  const params: Record<string, string> = {};
  if (query) {
    new URLSearchParams(query).forEach((v, k) => {
      params[k] = v;
    });
  }
  return { path: path || "/", params };
}

// Cache the snapshot so useSyncExternalStore sees a stable reference until the
// hash string actually changes (required to avoid infinite render loops).
let cachedHash: string | null = null;
let cachedRoute: Route = { path: "/", params: {} };
const SERVER_SNAPSHOT: Route = { path: "/", params: {} };

function readSnapshot(): Route {
  if (typeof window === "undefined") return SERVER_SNAPSHOT;
  const h = window.location.hash;
  if (h !== cachedHash) {
    cachedHash = h;
    cachedRoute = parseHash();
  }
  return cachedRoute;
}

// External store subscription to window.location.hash
function subscribe(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

function getSnapshot(): Route {
  return readSnapshot();
}

function getServerSnapshot(): Route {
  return SERVER_SNAPSHOT;
}

type RouterValue = {
  route: Route;
  navigate: (to: string) => void;
};

const RouterContext = createContext<RouterValue | null>(null);

export function RouterProvider({ children }: { children: ReactNode }) {
  const route = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Ensure an initial hash exists (external system update — not React state)
  useEffect(() => {
    if (!window.location.hash) {
      window.history.replaceState(null, "", "#/");
    }
  }, []);

  // Scroll to top on path change (external system update)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [route.path]);

  const navigate = useCallback((to: string) => {
    const clean = to.startsWith("#") ? to.slice(1) : to;
    if (`#${clean}` === window.location.hash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    window.location.hash = clean;
  }, []);

  return (
    <RouterContext.Provider value={{ route, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter(): RouterValue {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useRouter must be used within RouterProvider");
  return ctx;
}

export function useRoute(): Route {
  return useRouter().route;
}

/** Match a path pattern like "/product/:slug" against a path string. */
export function matchPath(
  pattern: string,
  path: string
): Record<string, string> | null {
  const pp = pattern.split("/").filter(Boolean);
  const ap = path.split("/").filter(Boolean);
  if (pp.length !== ap.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < pp.length; i++) {
    if (pp[i].startsWith(":")) {
      params[pp[i].slice(1)] = decodeURIComponent(ap[i]);
    } else if (pp[i] !== ap[i]) {
      return null;
    }
  }
  return params;
}
