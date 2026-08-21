# Around You image intake

The inventory contains **100 places** for the Around You content plan:

- **32 active places** already represented in the Passenger catalog.
- **68 candidates** reserved for review and future activation. Candidates are
  not shown to passengers until their coordinates, copy, image rights, and
  trigger radius have been verified.

Place original photos in this folder using the exact `requested_filename`
listed in `around-you-image-inventory.xlsx` (or its CSV companion). Originals
are intentionally kept out of `public/`; after review, they will be cropped and
optimized to WebP under `public/images/passenger/around-you/`.

## P1.3 user-photo review

Juan supplied 44 STREEX-owned original photos in `user-originals/`. Every
original was inspected for dimensions, orientation, EXIF, and GPS metadata.
The original files remain local and are ignored by Git because they contain
private capture metadata. The review is recorded in
`user-photo-review.csv` using only a coarse distance bucket; it never stores
raw coordinates.

Eighteen photos were selected as the first P1.3 hero set and optimized to
1600×900 WebP (quality 82) under
`public/images/passenger/around-you/user/`. The public copies are metadata-free
and are the only files referenced by the Passenger catalog. The other 26
photos remain available locally for a later catalog pass.

The raw intake files have been renamed semantically in place under
`user-originals/` so they are easier to review without exposing their camera
filenames. The complete old-to-new mapping is in
`user-original-renames.csv`; this mapping is also the safe reference for any
future rotation set.

The selected assets use one hero image per place, not a collage. The inventory
records the source filename, selected place, rights confirmation, and final
public path. For new photos, keep originals in `user-originals/`, then review
and strip EXIF/GPS before adding any public copy.

## Reading the inventory

- `image_status` is explicit: `Own local asset`, `Curated Commons asset`,
  `Original staged — rights recorded`, `Shared fallback`, or `Missing original`.
- `Original staged — rights recorded` means a real source image has been
  downloaded into this intake folder and its Commons file page, author, and
  license are recorded in the same row. It is not public in the app yet.
- `image_needed` is `Yes` whenever a dedicated original is still required;
  staged originals are marked `No` while they wait for the optimization and
  activation pass.
- `app_catalog_status` distinguishes places active in the app from future
  candidates.
- `copy_status` tracks whether English and Spanish editorial copy is ready.
- `coordinates_status` identifies rows that still need GPS verification before
  catalog import.
- `source_url`, `source_or_author_to_fill`, and `license_or_permission` record
  provenance and rights. Do not add an image until the rights fields are
  complete or the asset is confirmed as STREEX-owned.

Each place is designed around **one landscape hero image**. The UI may vary
which approved hero is shown later, but it should not assemble a collage of
multiple photos inside a single place card. If a dedicated photo is not ready,
the app can use a local category fallback; it must never render an empty image
area.

Prefer a landscape photo with the landmark clearly visible and no unlicensed
logos, text overlays, or identifiable people as the main subject. Keep the
original filename exactly as requested so the later optimization pass can be
automated safely.

## P1.2 assisted sourcing

The first assisted sourcing pass staged one verified landscape JPEG for each
active place that previously had `Missing original` (15 files). All 15 came
from Wikimedia Commons and retain a per-file source page, author, and license
in the inventory. The files are working originals only; P1.3 will crop and
optimize them to WebP before any Passenger catalog path is changed.

Do not remove the attribution/license fields when moving an image into the
public app bundle. For CC BY/CC BY-SA assets, preserve attribution and the
share-alike obligation in the app's content/credits record before release.

The P1.3 user-owned originals supersede the staged Commons image for a place
when a selected public path is present. Commons attribution remains in the
inventory for any staged source that is still retained or used as a fallback.

For the current image cleanup, seven active places were refreshed: Capitol,
Temple Square, University of Utah, Red Butte Garden, SLC Airport, Lagoon, and
Kimball Junction. The inventory marks each final public path and provenance;
the catalog continues to use one hero image per place.
