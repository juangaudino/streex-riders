import { useEffect, useId, useRef, useState } from "react";
import { loadGoogleMaps } from "@/lib/google-maps-loader";

type Suggestion = {
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
  const [suggestions, setSuggestions] = useState<
    Array<{ suggestion: Suggestion; raw: google.maps.places.AutocompleteSuggestion }>
  >([]);
  const [open, setOpen] = useState(false);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(
    null,
  );
  const placesLibRef = useRef<google.maps.PlacesLibrary | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | null>(null);
  const listId = useId();
  const skipNextFetchRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then(async (g) => {
        const lib = (await g.maps.importLibrary("places")) as google.maps.PlacesLibrary;
        if (cancelled) return;
        placesLibRef.current = lib;
        sessionTokenRef.current = new lib.AutocompleteSessionToken();
      })
      .catch((e) => console.warn("Google Maps load failed", e));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const runFetch = (input: string) => {
    const lib = placesLibRef.current;
    if (!lib || !input || input.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new lib.AutocompleteSessionToken();
    }
    lib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
      input,
      sessionToken: sessionTokenRef.current,
      includedRegionCodes: regionCodes,
    })
      .then(({ suggestions }) => {
        const mapped = suggestions
          .map((s) => {
            const p = s.placePrediction;
            if (!p) return null;
            const primary = p.mainText?.toString() ?? "";
            const secondary = p.secondaryText?.toString() ?? "";
            const full = p.text?.toString() ?? `${primary} ${secondary}`.trim();
            return {
              suggestion: { primary, secondary, full } as Suggestion,
              raw: s,
            };
          })
          .filter(Boolean) as Array<{
          suggestion: Suggestion;
          raw: google.maps.places.AutocompleteSuggestion;
        }>;
        setSuggestions(mapped);
        setOpen(mapped.length > 0);
      })
      .catch(() => {
        setSuggestions([]);
      });
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

  const pick = (item: { suggestion: Suggestion }) => {
    skipNextFetchRef.current = true;
    onChange(item.suggestion.full);
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
          {suggestions.map((item, i) => (
            <li
              key={i}
              role="option"
              aria-selected={false}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(item);
              }}
              className="px-4 py-3 cursor-pointer hover:bg-white/[0.06] border-b border-white/5 last:border-b-0"
            >
              <div className="text-sm text-white">{item.suggestion.primary}</div>
              {item.suggestion.secondary && (
                <div className="text-xs text-white/50 mt-0.5">
                  {item.suggestion.secondary}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}