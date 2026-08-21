# Around You image corrections — 2026-08-20

This audit records the location corrections supplied by Juan. It is the source of truth for the renamed user originals and prevents a visually plausible but incorrect landmark from being activated in Passenger.

## Corrected source originals

| Previous label | Correct location | Corrected source name |
| --- | --- | --- |
| `city-creek-canyon-02.jpeg` | Utah State Capitol | `utah-state-capitol-detail-03.jpeg` |
| `city-creek-canyon-road.jpeg` | Park City | `park-city-road.jpeg` |
| `ensign-peak-overlook.jpeg` | Kaysville Temple | `kaysville-temple-overlook.jpeg` |
| `historic-main-street.jpeg` | Downtown Salt Lake City | `downtown-salt-lake-city-02.jpeg` |
| `lagoon-amusement-park-night.jpeg` | Layton | `layton-night-01.jpeg` |
| `lagoon-roller-coaster-02.jpeg` | Layton | `layton-street-01.jpeg` |
| `lagoon-roller-coaster-03.jpeg` | Layton | `layton-street-02.jpeg` |
| `ogden-downtown-03/04/05.jpeg` | Hill Aerospace Museum, Clearfield | `hill-aerospace-museum-01/02/03.jpeg` |
| `salt-lake-valley.jpeg` / `-02.jpeg` | Park City | `park-city-valley-01/02.jpeg` |
| `swaner-preserve-wetlands.jpeg` / `-02.jpeg` | Deer Valley, Park City | `deer-valley-wetlands-01/02.jpeg` |
| `temple-square-night.jpeg` | Kaysville Temple | `kaysville-temple-night.jpeg` |
| `temple-square-spires.jpeg` | Kaysville Temple | `kaysville-temple-spires.jpeg` |
| `the-gateway-plaza.jpeg` / `-02.jpeg` | Delta Center | `delta-center-01/02.jpeg` |

## Deleted at user request

- `kimball-junction-winter.jpeg` — location not remembered.
- `park-city.JPG` — location not remembered.

## Passenger catalog actions

- Temple Square, City Creek Canyon, The Gateway, Swaner Preserve and Salt Lake Valley no longer point at the misidentified user WebPs.
- Temple Square now uses a dedicated, verified Wikimedia Commons image downloaded and optimized locally. Its source and license are recorded in `around-you-image-inventory.csv`.
- City Creek Canyon, The Gateway, Swaner Preserve and Salt Lake Valley use an existing local fallback until a dedicated, verified image is available. Each fallback is explicitly marked in `around-you-image-inventory.csv`; it is not presented as proof that the fallback depicts the place.
- Park City uses the existing app-local Park City image. Park City Main Street uses the existing local source asset, which is separate from the misidentified user photo.
- No stale generated WebPs were deleted. They are unreferenced and remain available for reversible cleanup after the catalog audit.

## Web image policy

The tablet must not fetch images live. Any web image must be downloaded, rights-checked, optimized locally, and recorded with a source URL and license before it is activated. The Temple Square image now activated is [`SLC TempleSquare.jpg`](https://commons.wikimedia.org/wiki/File:SLC_TempleSquare.jpg), photographed by Kenneth Hynek and published under CC BY 2.0. Attribution is retained in the inventory; the tablet only serves the optimized local WebP.

## Remaining image gaps

The following active places still need dedicated verified photography: City Creek Canyon, The Gateway, Swaner Preserve and Salt Lake Valley. A user-supplied photo with the location in its filename is the safest path; a rights-verified local web asset is the alternative. The existing source `city-creek-canyon.jpg` was not confidently identifiable, so it remains inactive for that place.
