# STREEX Runner Context

## Role In STREEX

STREEX Runner is a premium experiential feature inside STREEX Rides. It gives passengers something memorable and fun while supporting brand recognition, future direct bookings, and contact discovery.

Runner is not:

- A redesign of STREEX
- A separate standalone brand
- A replacement for the passenger landing page
- A reason to disrupt existing booking or production flows

## Current Route And Isolation

- Development route: `/runner-lab`
- Route file: `src/routes/runner-lab.tsx`
- Feature folder: `src/features/runner/`
- The route is hidden and marked `noindex,nofollow`.

Runner should continue to be developed in parallel and integrated deliberately.

## Current Experience

Runner is a lightweight browser-based 2D road game with a rear-view perspective.

Current screen flow:

1. Intro
2. Short transition
3. Gameplay
4. Results, score saving, card saving, and sharing

Important components:

- `RunnerApp.tsx`: screen flow
- `components/RunnerIntro.tsx`: welcome experience
- `components/RunnerTransition.tsx`: short entry transition
- `components/RunnerCanvas.tsx`: gameplay rendering and controls
- `components/RunnerResults.tsx`: results, leaderboard, save, and share
- `components/RunnerLogo.tsx`: official Runner logo presentation
- `engine/`: collision, spawning, and difficulty
- `audio/runnerAudio.ts`: modular FX-first audio layer
- `assets/manifest.ts`: asset registry

## Visual Direction

Target mood:

- Premium
- Cinematic Utah atmosphere
- Deep charcoal and black
- STREEX yellow accents
- White typography
- Subtle pixel soul
- Mobile-first

Avoid:

- Childish arcade styling
- Casino or loot-box feeling
- Generic retro clones
- Loud gamer clutter
- Disconnected visual systems

The official Runner logo is:

`src/features/runner/assets/sprites/runner_logo_official.png`

Do not recreate the logo by cropping the score card frame.

## Gameplay Guardrails

- Keep the game lightweight and browser-based.
- Preserve three-lane gameplay unless a gameplay task explicitly changes it.
- Do not introduce Unity, Unreal, multiplayer, or a new backend.
- Keep visual assets replaceable and registered through the manifest.
- Final premium graphics may replace current assets without rewriting gameplay systems.
- A future PixiJS migration is viable, but it should be planned as a deliberate rendering upgrade rather than mixed into small polish tasks.

## Backend And Records

Runner records use the `runner_scores` table.

Expected flow:

1. Player enters a name after a run.
2. Score is submitted through a server function.
3. Score begins as `pending`.
4. Admin may edit, approve, reject, or delete it.
5. Only approved scores appear in the public leaderboard and ranking calculations.

Relevant files:

- `src/lib/runner-score.functions.ts`
- `src/lib/admin.functions.ts`
- `src/components/streex/AdminPanel.tsx`
- `supabase/migrations/*runner_scores*`

## Results And Sharing

- The in-game results screen should remain clean and celebratory.
- Contact details belong only on the exported/shareable score card.
- The exported card should feel like a collectible memory artifact, not a flyer.
- Share Ride should attempt to share the card plus a warm challenge message and landing link.
- The signature phrase is `Ride Elevated`.

## Audio Direction

Runner uses FX-first hospitality audio:

- No soundtrack required
- No loud arcade beeps
- No aggressive loops
- Ambient world sound should remain subtle
- Rewards should have a clear but restrained hierarchy
