/// <reference types="google.maps" />
let loadPromise: Promise<typeof google> | null = null;

declare global {
  interface Window {
    __lovableGmapsInit?: () => void;
    google: typeof google;
  }
}

export function loadGoogleMaps(): Promise<typeof google> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only load in the browser"));
  }
  if (typeof window.google?.maps?.importLibrary === "function") {
    return Promise.resolve(window.google);
  }
  if (loadPromise) return loadPromise;

  const key = (import.meta.env.VITE_GOOGLE_MAPS_BROWSER_KEY ||
    import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY) as string | undefined;
  const channel = (import.meta.env.VITE_GOOGLE_MAPS_TRACKING_ID ||
    import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID) as string | undefined;

  if (!key) {
    return Promise.reject(new Error("Google Maps browser key is missing"));
  }

  loadPromise = new Promise((resolve, reject) => {
    window.__lovableGmapsInit = () => {
      resolve(window.google);
    };
    const script = document.createElement("script");
    const params = new URLSearchParams({
      key,
      v: "weekly",
      loading: "async",
      libraries: "places",
      callback: "__lovableGmapsInit",
    });
    if (channel) params.set("channel", channel);
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Failed to load Google Maps JS"));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
