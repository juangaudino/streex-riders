const FALLBACK_MEASUREMENT_ID = "G-1WJPHXQKSN";
const MEASUREMENT_ID =
  (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined)?.trim() ||
  FALLBACK_MEASUREMENT_ID;

const EXCLUDED_PATH_PREFIXES = ["/admin", "/runner-lab"];

type AnalyticsValue = string | number | boolean | undefined;
type AnalyticsParams = Record<string, AnalyticsValue>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let initialized = false;

export function isAnalyticsAllowed(pathname = window.location.pathname) {
  return !EXCLUDED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
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

export function trackPageView(pathname: string, title = document.title) {
  if (!initialized || !window.gtag || !isAnalyticsAllowed(pathname)) return;

  window.gtag("event", "page_view", {
    page_path: pathname,
    page_title: title,
    page_location: window.location.href,
  });
}

export function trackEvent(name: string, params: AnalyticsParams = {}) {
  if (!initialized || !window.gtag || !isAnalyticsAllowed()) return;
  window.gtag("event", name, params);
}

