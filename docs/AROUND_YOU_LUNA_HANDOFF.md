# Around You — Luna Completion Report

Status: product/content implementation complete; the feature gate remains disabled pending an
in-vehicle tablet validation.

## Completed product layer

- Preserved the Sol client-only geolocation, matching, ranking, dwell, hysteresis and cooldown
  engine without structural changes.
- Built the final Passenger view with a live featured place, local story facts, category labels,
  altitude when meaningful, nearby-place selection and a manual return to live context.
- Added an Explore Utah fallback that remains useful when permission is denied, GPS is unavailable,
  the browser is offline, or the car is outside a matching radius. It does not need a map, route
  or network request.
- Added full English and Spanish product copy, semantic controls, focus states, readable image
  fallbacks, and motion that honors `prefers-reduced-motion`.
- Expanded the local catalog to 19 bilingual Utah places, with a public/official source URL per
  item. The four hero-quality local JPEGs are bundled under
  `public/images/passenger/around-you/`; places without a dedicated asset intentionally render the
  branded category fallback instead of requesting remote imagery.
- Integrated the same visual card on Passenger Home and the idle attract screen. Music remains the
  primary visual action and no existing Music, Games, Streex, booking or idle-reset behavior was
  replaced.
- Added catalog and localized-distance test coverage alongside the existing geographic/selection
  tests.

## Privacy and offline boundary

- The POI catalog and visual assets are local static files and benefit from the existing Passenger
  service-worker static cache behavior after first load.
- No coordinates, permissions or chosen places are persisted, placed in URLs, sent to a server or
  emitted to analytics. Around You has no location network request.
- Location is still controlled only by `CONFIG.passengerConsole.aroundYou.enabled`, currently
  `false`. Browser GPS is not activated by the completed visual/browse experience.

## Validation completed in code

- `bun test tests/around-you.test.mjs`: passed (catalog integrity, localized distance, Haversine,
  quality filtering, ranking, dwell, hysteresis, retention, cooldown and session reset).
- `bun run check`: passed (TypeScript and production build).

## Still intentionally not claimed as complete

- A real car route on the Galaxy Tab A9+ is required before enabling GPS for production.
- GPS threshold/radius tuning must follow observed tablet fixes, not desktop simulation.
- Editorial facts and POIs should be periodically reviewed as the catalog grows; the current set
  uses source links as the audit trail.

## Real Vehicle Validation Needed

1. Enable `CONFIG.passengerConsole.aroundYou.enabled` only for the controlled test build and grant
   browser location permission in Fully Kiosk.
2. Verify fresh GPS fixes after cold start, tablet wake, hotspot reconnect and after a passenger
   idle reset; confirm the browser does not request permission repeatedly.
3. Drive through downtown Salt Lake City, airport approach, Parley's Canyon and Park City. Confirm
   the featured card changes only when it should, nearby suggestions are sensible and the display
   does not flicker between neighboring POIs.
4. Observe poor-accuracy periods, tunnels/parking structures and an intentionally offline hotspot.
   Confirm the degraded, stale and Explore Utah states are calm, truthful and still usable.
5. Test portrait and landscape on the mounted tablet, including touch targets, text legibility,
   scrolling only within Around You where content exceeds the screen, and no conflict with the
   global idle attract reset.
6. Confirm no raw coordinates appear in browser history, URLs, local browser storage, service-worker
   cache inspection, network activity or server logs.
7. Test English and Spanish, reduced-motion settings, screen reader/focus navigation if available,
   then test Home, Music/Spotify, Games, Streex, booking and payment QR flows after the route.
