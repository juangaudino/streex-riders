# STREEX Rides Repository Instructions

## Product Context

- This repository is the STREEX Rides passenger-facing application.
- STREEX is a premium private ride experience. Preserve its quiet, hospitality-first visual language.
- The application is deployed on Vercel and uses the existing standalone Supabase project.
- Never commit secrets. Lovable secrets and local `.env` values must remain private.

## Architecture Rules

- Preserve the existing TanStack Start, React, Vite, TypeScript, and Lovable architecture.
- Prefer existing components, helpers, server functions, and styling patterns.
- Keep changes scoped and reversible. Do not redesign the landing page unless explicitly requested.
- Admin operations must remain server-side and protected by Supabase Auth plus database-backed tenant memberships. Production has no emergency Admin bypass key.
- Never authorize from `user_metadata` or from a tenant id supplied by the browser without membership verification.
- Keep all driver-owned data and Storage paths isolated by tenant. STREEX Horizon remains global.
- Public database access must stay limited by RLS. Use server functions with the service role for privileged reads and writes.
- Treat generated files such as `src/routeTree.gen.ts` carefully and avoid manual edits unless required by the framework.

## STREEX Runner Rules

- Runner is a premium experiential feature inside STREEX, not a separate brand and not a replacement for the landing page.
- Horizon/Runner lives at `/runner-lab`, a no-index route with visible entry points. Do not confuse no-index with hidden or access-controlled.
- Keep Runner work isolated under `src/features/runner/` and its route unless integration is explicitly requested.
- Preserve gameplay mechanics unless the task specifically asks for gameplay changes.
- Runner must remain a lightweight browser-based 2D game. Do not introduce Unity, Unreal, multiplayer, or a new backend.
- Use swap-ready visual and audio asset slots. Final premium art may replace placeholders later.
- Preserve the current logo rendered by `RunnerLogo` through `assets/manifest.ts`; historical Runner logo files are not permission to replace the current Horizon identity.

## Validation

- The project uses Bun and includes `bun.lock`.
- Prefer `bun run check` before completing meaningful code changes.
- Use `bun run check:full` when a task includes repository-wide formatting cleanup. The existing repo currently has historical Prettier lint debt.
- For narrow changes, focused TypeScript, ESLint, and browser verification are acceptable.
- After frontend changes, verify the relevant page on mobile and desktop when practical.

## Persistent Context

- Start with `docs/HANDOFF.md`, then `docs/ROADMAP.md` and only the selected task in `docs/EXECUTION_PLAN.md`.
- There is exactly one active master roadmap, handoff and execution plan for Rides, Pricing/Admin, Passenger and Horizon. Product-specific technical documents are not competing work queues.
- Read `docs/PROJECT_CONTEXT.md` for technical contracts and `docs/RUNNER_CONTEXT.md` before Horizon work. Historical documents under `docs/archive/` and the preserved audit do not override the master priorities.
- The owner prioritizes their current operation. SaaS onboarding, subscriptions, multi-driver commercialization and commercial Spotify assessment are standby; current security, tenant isolation and money integrity are not.
- UX/UI is a first-class workstream: Climate Premium is the quality reference, Music retains STREEX identity, Rides must have deliberate mobile/tablet/desktop layouts. This is planning direction, not blanket permission to redesign a surface.
- Work on main when requested, one approved task/substep at a time. A request to continue from the checkpoint selects the next eligible atomic task, not the whole phase. Stop at its authorization/decision gates.
- Do not modify Passenger/Horizon implementation during unrelated Rides work. An explicitly approved Passenger/Horizon task may change only its named scope; H01-H03 do not authorize a renderer rewrite.
- Keep roadmap state and the handoff next-task pointer synchronized in the change checkpoint. Distinguish code, automated checks, authenticated browser, migration application, production and physical-device evidence.
- For documentation-only checkpoints validate links, task traceability, active Markdown formatting and diff scope; do not rerun product build/tests merely because documentation changed.
