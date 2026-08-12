# Around You — Sol Handoff Report

Status: technical foundation complete; final product/content pass intentionally not started.

## Implemented

Created under `src/features/passenger/around-you/`:

- `around-you-types.ts`: public domain, location, match, selection and engine-state types.
- `around-you-data.ts`: eight-place, bilingual seed catalog with official source URLs.
- `around-you-utils.ts`: Haversine distance, distance formatting, ranking, matching, GPS acceptance,
  last-good freshness and implausible-jump checks.
- `around-you-engine.ts`: pure stable-selection state machine.
- `usePassengerLocation.ts`: browser-only geolocation lifecycle and quality gate.
- `useAroundYouEngine.ts`: accepted-position matching and Passenger-session orchestration.
- `around-you-copy.ts`: structural EN/ES copy.
- `AroundYouHomeCard.tsx`, `AroundYouView.tsx`, `AroundYouPlaceCard.tsx` and
  `AroundYouNearbyList.tsx`: minimal integration proof only.

Also created `tests/around-you.test.mjs` and modified:

- `src/config.ts` for the public `CONFIG.passengerConsole.aroundYou` contract.
- `src/features/passenger/PassengerConsole.tsx` to orchestrate the hooks, internal view, Home card,
  bottom-navigation state and idle attract card.
- `docs/PROJECT_CONTEXT.md` to preserve architecture and privacy decisions.

Architecture decisions:

- The POI catalog is bundled module data, not CONFIG and not a remote CMS.
- Coordinates exist only inside the geolocation hook and pure matching call; UI state contains POI
  matches and status, not the raw tablet position.
- `PassengerConsole` remains the view orchestrator. Around You does not add a route, backend, map,
  provider SDK, analytics event, storage layer or fifth bottom-nav item.
- Home's prior phone-continuation shortcut is replaced by Around You; phone continuation remains in
  Streex. The attract screen replaces its large generic invitation and Meet Juan row with a compact
  Around You entry while preserving music, time/weather, ticker and the global interaction CTA.
- Around You is disabled by default until the official tablet permission/GPS field test. Its
  disabled and unavailable states remain useful bilingual discovery fallbacks.

Public interfaces:

- `usePassengerLocation({ enabled, options }): PassengerLocationState`
- `useAroundYouEngine({ enabled, location, options, places, sessionKey }): AroundYouEngineState`
- `haversineDistanceMeters`, `matchAroundYouPlaces`, `calculateAroundYouScore`,
  `shouldAcceptPassengerPosition`, `isImplausiblePassengerJump`, `isPassengerPositionFresh`
- `createAroundYouSelectionState`, `selectStableAroundYouFeature`

## Engine behavior

GPS acceptance:

- `watchPosition` starts only in a browser, when enabled and while the document is visible.
- The watch is cleared on unmount, disable and document hide; it restarts on visibility recovery.
- First usable position is accepted immediately. Later positions are accepted when at least eight
  seconds elapsed, movement is at least 60 m, or accuracy improves by at least 35 m.
- Positions worse than 180 m accuracy do not switch POIs. A last good position may remain available
  in degraded state for at most 60 seconds, then becomes stale and is removed from engine input.
- Jumps implying more than 85 m/s are rejected conservatively.
- Permission denial, unavailable/timeout, unsupported, requesting, ready, degraded and stale states
  have explicit UI-safe status values.

Ranking:

```text
score = proximity * 0.58
      + normalizedPriority * 0.34
      + insideTriggerRadius ? 0.28 : 0
      + landmark ? 0.08 : 0
```

Only enabled places inside their discovery radius are returned. Results sort by descending score,
then ascending distance.

Stable selection:

- The first eligible trigger candidate is featured immediately.
- A feature is retained through 1.25 times its trigger radius (hysteresis/exit radius).
- While retained, it cannot be replaced during the first 30 seconds.
- After dwell, a challenger must be inside its trigger radius and score at least 1.15 times the
  current score.
- Recently shown IDs remain on a 10-minute in-memory cooldown. Cooldown is soft: a fresh candidate
  is preferred, but a cooled candidate may be used rather than showing nothing.
- Passenger idle/session reset increments the existing `sessionKey`; the hook clears current,
  dwell and cooldown selection state without restarting or changing the permission lifecycle.
- Manual nearby selection lives only in `AroundYouView` and never replaces the live engine feature.

## Configuration

Every value under `CONFIG.passengerConsole.aroundYou`:

| Key                                                |  Default | Purpose                                           |
| -------------------------------------------------- | -------: | ------------------------------------------------- |
| `enabled`                                          |  `false` | Production gate pending tablet field validation.  |
| `geolocation.enableHighAccuracy`                   |   `true` | Requests vehicle-appropriate GPS accuracy.        |
| `geolocation.timeoutMs`                            |  `15000` | Browser callback timeout.                         |
| `geolocation.maximumAgeMs`                         |  `10000` | Maximum browser-cached position age.              |
| `geolocation.minimumAcceptedIntervalMs`            |   `8000` | Time-based accepted update gate.                  |
| `geolocation.minimumMovementMeters`                |     `60` | Movement-based accepted update gate.              |
| `geolocation.maximumUsableAccuracyMeters`          |    `180` | Rejects misleading fixes.                         |
| `geolocation.maximumLastGoodPositionAgeMs`         |  `60000` | Limits degraded fallback age.                     |
| `geolocation.materialAccuracyImprovementMeters`    |     `35` | Allows useful early accuracy improvements.        |
| `geolocation.maximumPlausibleSpeedMetersPerSecond` |     `85` | Rejects implausible GPS jumps.                    |
| `selection.nearbyLimit`                            |      `5` | Maximum nearby results.                           |
| `selection.minimumFeaturedDwellMs`                 |  `30000` | Minimum stable hero dwell.                        |
| `selection.exitRadiusMultiplier`                   |   `1.25` | Retention-radius hysteresis.                      |
| `selection.challengerScoreRatio`                   |   `1.15` | Required improvement to replace current.          |
| `selection.recentlyShownCooldownMs`                | `600000` | Soft recently-shown cooldown.                     |
| `ui.showHomeCard`                                  |   `true` | Shows Home entry.                                 |
| `ui.showDistance`                                  |   `true` | Shows rounded passenger-friendly distance.        |
| `ui.showAccuracyDebug`                             |  `false` | Reserved public debug switch; no raw coordinates. |
| `ui.showIdleCard`                                  |   `true` | Shows Around You on attract screen.               |

Tune in the real vehicle: usable accuracy, update interval, movement threshold, last-good age,
plausible-speed limit, trigger/discovery radii, dwell, exit multiplier, challenger ratio and POI
priorities. Do not tune from a stationary desktop simulation alone.

## Privacy and lifecycle verification

- No raw coordinates are written to localStorage, sessionStorage, IndexedDB, cookies, URLs,
  Supabase, analytics or server functions.
- No new network request or backend exists for location.
- The GPS watcher is effect-scoped, SSR-safe and always cleaned up.
- Raw callback noise is filtered before state reaches the engine.
- No service-worker change was required; bundled catalog/code follows the existing static-asset
  behavior and dynamic GPS is never cached.
- Existing Spotify, Games, Streex, booking and idle-reset implementations were not replaced.

## Known limitations

- `enabled` remains false until location permission and real GPS quality are validated in Fully
  Kiosk on the Galaxy Tab A9+.
- The seed coordinates and concise facts are suitable for engine proof, but still require final
  editorial/content review before feature activation.
- No final imagery, hero composition, animation, category browsing, large catalog, Explore Utah
  mode or extensive responsive refinement is included.
- Browser geolocation quality varies with Android permission mode, satellite visibility, hotspot
  conditions, power policy and Fully Kiosk/WebView behavior.
- The engine intentionally has no heading/side-of-road inference, destination or route awareness.
- The local development loader needs private Supabase server credentials; when absent, `/passenger`
  cannot render locally even though pure tests, typecheck, lint and production build pass.

## Luna TODO

1. Read this handoff.
2. Read `specs.md`.
3. Do not redesign or replace the Sol architecture unless a demonstrated bug requires it.
4. Complete the product using the existing interfaces.
5. Provision location permission in Fully Kiosk and run a stationary plus real-drive GPS field test.
6. Enable the feature only for that controlled test; capture status/accuracy behavior without
   recording or transmitting raw coordinates.
7. Tune GPS thresholds, POI radii, ranking priorities, dwell, retention and challenger values from
   observed behavior.
8. Expand to the final verified bilingual POI catalog and perform editorial/source review.
9. Design final Home, full-view and attract-screen treatments with final local assets.
10. Add graceful browse/fallback content without adding maps, navigation or a location backend.
11. Validate final portrait-first and landscape tablet layouts, reduced motion and offline recovery.
12. Re-run Passenger regression checks for Music/Spotify, Games, Streex, booking and idle reset.

Do not begin Games/Music integration, seasonal/sports modes, route inference, dynamic place APIs or
analytics in the Luna pass unless separately approved.
