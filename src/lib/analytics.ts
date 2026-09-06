const FALLBACK_MEASUREMENT_ID = "G-1WJPHXQKSN";
const MEASUREMENT_ID =
  (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined)?.trim() || FALLBACK_MEASUREMENT_ID;

const EXCLUDED_PATH_PREFIXES = [
  "/admin",
  "/booking/accept",
  "/booking/decline",
  "/passenger",
  "/runner-lab",
  "/spotify",
];
const PREVIEW_SEARCH_PARAM = "preview";

type AnalyticsValue = string | number | boolean | undefined;
type AnalyticsParams = Record<string, AnalyticsValue>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let initialized = false;

function getBrowserLocation() {
  if (typeof window === "undefined") return null;

  return window.location;
}

export function isAnalyticsAllowed(pathname?: string, search?: string) {
  const location = getBrowserLocation();
  const resolvedPathname = pathname ?? location?.pathname;
  const resolvedSearch = search ?? location?.search;

  if (!resolvedPathname) return false;

  return (
    !EXCLUDED_PATH_PREFIXES.some(
      (prefix) => resolvedPathname === prefix || resolvedPathname.startsWith(`${prefix}/`),
    ) && !new URLSearchParams(resolvedSearch).has(PREVIEW_SEARCH_PARAM)
  );
}

export function sanitizeAnalyticsUrl(value: string) {
  try {
    const url = new URL(value, getBrowserLocation()?.origin);
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return undefined;
  }
}

export function getAnalyticsPageParams(locationUrl: string, referrerUrl?: string): AnalyticsParams {
  const pageLocation = sanitizeAnalyticsUrl(locationUrl);
  const pageReferrer = referrerUrl ? sanitizeAnalyticsUrl(referrerUrl) : undefined;

  return {
    ...(pageLocation ? { page_location: pageLocation } : {}),
    ...(pageReferrer ? { page_referrer: pageReferrer } : {}),
  };
}

function getCurrentPageParams() {
  const location = getBrowserLocation();
  if (!location || typeof document === "undefined") return {};

  return getAnalyticsPageParams(location.href, document.referrer);
}

export function initializeAnalytics() {
  if (
    initialized ||
    typeof window === "undefined" ||
    !import.meta.env.PROD ||
    !MEASUREMENT_ID ||
    !isAnalyticsAllowed()
  ) {
    return;
  }

  initialized = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = (...args: unknown[]) => {
    window.dataLayer?.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID, {
    send_page_view: false,
    anonymize_ip: true,
  });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
  document.head.appendChild(script);
}

export function trackPageView(pathname: string, title?: string) {
  if (
    !initialized ||
    typeof window === "undefined" ||
    !window.gtag ||
    !isAnalyticsAllowed(pathname)
  ) {
    return;
  }

  window.gtag("event", "page_view", {
    page_path: pathname,
    page_title: title ?? (typeof document === "undefined" ? "" : document.title),
    ...getCurrentPageParams(),
  });
}

export function trackEvent(name: string, params: AnalyticsParams = {}) {
  if (!initialized || typeof window === "undefined" || !window.gtag || !isAnalyticsAllowed()) {
    return;
  }

  window.gtag("event", name, { ...params, ...getCurrentPageParams() });
}
