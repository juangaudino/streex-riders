import { useCallback, useEffect, useId, useRef, useState } from "react";
import { loadGoogleMaps } from "@/lib/google-maps-loader";

type Suggestion = {
  id: string;
  primary: string;
  secondary: string;
  full: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Country bias, ISO 3166-1 alpha-2 codes */
  regionCodes?: string[];
};

export function PlacesAutocompleteInput({
  value,
  onChange,
  placeholder,
  required,
  className,
  style,
  regionCodes = ["us"],
}: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const placesLibRef = useRef<google.maps.PlacesLibrary | null>(null);
  const placesReadyRef = useRef<Promise<google.maps.PlacesLibrary> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | null>(null);
  const requestIdRef = useRef(0);
  const listId = useId();
  const skipNextFetchRef = useRef(false);

  const ensurePlacesLibrary = useCallback(() => {
    if (placesLibRef.current) return Promise.resolve(placesLibRef.current);
    if (placesReadyRef.current) return placesReadyRef.current;

    placesReadyRef.current = loadGoogleMaps()
      .then(async (g) => {
        const lib = (await g.maps.importLibrary("places")) as google.maps.PlacesLibrary;
        placesLibRef.current = lib;
        sessionTokenRef.current = new lib.AutocompleteSessionToken();
        return lib;
      })
      .catch((error) => {
        placesReadyRef.current = null;
        throw error;
      });
    return placesReadyRef.current;
  }, []);

  useEffect(() => {
    let cancelled = false;
    ensurePlacesLibrary()
      .then(() => {
        if (cancelled) return;
        setLoadError(false);
      })
      .catch((e) => {
        console.warn("Google Maps load failed", e);
        setLoadError(true);
      });
    return () => {
      cancelled = true;
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [ensurePlacesLibrary]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const mapNewSuggestions = (items: google.maps.places.AutocompleteSuggestion[]): Suggestion[] =>
    items.flatMap((item) => {
      const prediction = item.placePrediction;
      if (!prediction) return [];
      const primary = prediction.mainText?.toString() ?? prediction.text.toString();
      const secondary = prediction.secondaryText?.toString() ?? "";
      return [
        {
          id: prediction.placeId || prediction.text.toString(),
          primary,
          secondary,
          full: prediction.text.toString(),
        },
      ];
    });

  const runFetch = async (input: string) => {
    const requestId = ++requestIdRef.current;
    if (!input || input.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    let lib: google.maps.PlacesLibrary;
    try {
      lib = await ensurePlacesLibrary();
    } catch (error) {
      console.warn("Google Maps load failed", error);
      setSuggestions([]);
      setOpen(false);
      setLoadError(true);
      return;
    }
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new lib.AutocompleteSessionToken();
    }
    let timeoutId: number | undefined;
    try {
      const result = await Promise.race([
        lib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input,
          sessionToken: sessionTokenRef.current,
          region: regionCodes[0],
        }),
        new Promise<never>((_, reject) => {
          timeoutId = window.setTimeout(
            () => reject(new Error("Places API (New) timed out")),
            4_000,
          );
        }),
      ]);
      if (requestId !== requestIdRef.current) return;
      const mapped = mapNewSuggestions(result.suggestions);
      setSuggestions(mapped);
      setOpen(mapped.length > 0);
      setLoadError(false);
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      console.warn("Google Places autocomplete failed", error);
      setSuggestions([]);
      setOpen(false);
      setLoadError(true);
    } finally {
      if (timeoutId) window.clearTimeout(timeoutId);
    }
  };

  const handleChange = (v: string) => {
    onChange(v);
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false;
      return;
    }
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => runFetch(v), 180);
  };

  const pick = (item: Suggestion) => {
    skipNextFetchRef.current = true;
    onChange(item.full);
    setOpen(false);
    setSuggestions([]);
    // New session after a selection per Google billing model
    if (placesLibRef.current) {
      sessionTokenRef.current = new placesLibRef.current.AutocompleteSessionToken();
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        className={className}
        style={style}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
      />
      {open && suggestions.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full mt-2 z-50 max-h-64 overflow-y-auto rounded-xl bg-[#141414] border border-white/10 shadow-2xl backdrop-blur-xl"
        >
          {suggestions.map((item) => (
            <li
              key={item.id}
              role="option"
              aria-selected={false}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(item);
              }}
              className="px-4 py-3 cursor-pointer hover:bg-white/[0.06] border-b border-white/5 last:border-b-0"
            >
              <div className="text-sm text-white">{item.primary}</div>
              {item.secondary && (
                <div className="text-xs text-white/50 mt-0.5">{item.secondary}</div>
              )}
            </li>
          ))}
        </ul>
      )}
      {loadError && value.trim().length >= 2 && !open && (
        <p className="mt-1.5 px-1 text-[10px] text-amber-300/70">
          Address suggestions are temporarily unavailable. You can still enter the address manually.
        </p>
      )}
    </div>
  );
}
