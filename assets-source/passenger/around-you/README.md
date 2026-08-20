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

## Reading the inventory

- `image_status` is explicit: `Own local asset`, `Original staged — rights recorded`,
  `Shared fallback`, or `Missing original`.
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
