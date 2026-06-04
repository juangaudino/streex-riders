# STREEX Rides Repository Instructions

## Product Context

- This repository is the STREEX Rides passenger-facing application.
- STREEX is a premium private ride experience. Preserve its quiet, hospitality-first visual language.
- The application is hosted and managed through Lovable.
- The backend is Lovable Cloud with its integrated Supabase-compatible database and storage. Do not assume the owner has or needs a separate external Supabase project.
- Never commit secrets. Lovable secrets and local `.env` values must remain private.

## Architecture Rules

- Preserve the existing TanStack Start, React, Vite, TypeScript, and Lovable architecture.
- Prefer existing components, helpers, server functions, and styling patterns.
- Keep changes scoped and reversible. Do not redesign the landing page unless explicitly requested.
- Admin operations must remain server-side and protected by `ADMIN_ACCESS_KEY`.
- Public database access must stay limited by RLS. Use server functions with the service role for privileged reads and writes.
- Treat generated files such as `src/routeTree.gen.ts` carefully and avoid manual edits unless required by the framework.

## STREEX Runner Rules

- Runner is a premium experiential feature inside STREEX, not a separate brand and not a replacement for the landing page.
- Runner currently lives at the hidden, no-index route `/runner-lab`.
- Keep Runner work isolated under `src/features/runner/` and its route unless integration is explicitly requested.
- Preserve gameplay mechanics unless the task specifically asks for gameplay changes.
- Runner must remain a lightweight browser-based 2D game. Do not introduce Unity, Unreal, multiplayer, or a new backend.
- Use swap-ready visual and audio asset slots. Final premium art may replace placeholders later.
- The official Runner logo asset is `src/features/runner/assets/sprites/runner_logo_official.png`.

## Validation

- The project uses Bun and includes `bun.lock`.
- Prefer `bun run check` before completing meaningful code changes.
- Use `bun run check:full` when a task includes repository-wide formatting cleanup. The existing repo currently has historical Prettier lint debt.
- For narrow changes, focused TypeScript, ESLint, and browser verification are acceptable.
- After frontend changes, verify the relevant page on mobile and desktop when practical.

## Persistent Context

- Read `docs/PROJECT_CONTEXT.md` before broad application work.
- Read `docs/RUNNER_CONTEXT.md` before Runner work.
- Update these documents when architecture, routes, backend ownership, or non-negotiable product decisions change.
