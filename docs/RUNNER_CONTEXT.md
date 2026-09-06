# STREEX Horizon — contexto técnico y reevaluación

Actualizado: 2026-09-05. Runner es el nombre interno del código de Horizon. Este documento no tiene una cola propia: [ROADMAP](ROADMAP.md) prioriza H01–H03 dentro del workstream Passenger; [EXECUTION_PLAN](EXECUTION_PLAN.md) contiene pruebas/gates y [HANDOFF](HANDOFF.md) la siguiente tarea global.

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
- The route is marked `noindex,nofollow`, but has visible entry points. It is not hidden or access-controlled.

Keep implementation isolated and integrate deliberately only within the approved task. A shared master plan does not remove these code boundaries.

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

The currently rendered Horizon logo is `RUNNER_SPRITES.horizonLogo` in `assets/manifest.ts`, used by `RunnerLogo`. Historical `runner_logo_official` files remain assets, not an instruction to restore an older identity.

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
5. Only approved scores should determine the public leaderboard and a comparable public ranking. Current source lists approved scores but rank/count queries include pending (anything not rejected): H02 must resolve that inconsistency. Do not claim the desired rule is already fully implemented.

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

## Reevaluación explícita — evidencia y potencial, 2026-09-05

Esta profundización responde a una pregunta nueva del propietario: cómo evolucionar Horizon con sentido hoy, no repetir la auditoría general ni reescribirlo porque haya modelos más potentes. No se modificó ningún archivo de juego.

### Qué existe y conservaría exactamente

- Canvas 2D y tres carriles: controles inmediatos, rear-view RAV4 y carretera Utah reconocibles. No hay evidencia que obligue a PixiJS/3D.
- RunnerApp separa intro/transition/playing/results; engine/collision, difficulty y spawnEngine ya ofrecen límites útiles. Preservar contratos mientras se aísla el mínimo step/clock para testear.
- Assets WebP/manifest swap-ready, paisaje multicapa y FX-first audio modular con warm/dispose. Mejorar composición/peso donde una medición lo justifique, no reemplazar todo arte ni añadir soundtrack invasivo.
- Moderación de récords, replay y tarjeta de recuerdo exportable. Publicación opcional y contacto en tarjeta, no bloqueo del juego por registro.
- Aislamiento del booking y del backend transaccional. Horizon sigue global; integración tablet actual es teaser/QR a teléfono. Juego táctil dentro de Passenger sería una decisión nueva, no un cambio automático de H01.

### Hallazgos concretos adicionales

| Evidencia                                                                                         | Interpretación / alcance                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RunnerCanvas.tsx:280 suma Math.max(1, floor(...delta...)) por frame                               | El componente base del score depende del número de frames; 30/60/120 Hz no tienen equivalencia garantizada. Corregir y probar en H01; no se hizo benchmark de dispositivos durante esta planificación.      |
| RunnerCanvas.tsx:247 usa time-startedAt antes del bloque paused; resume solo reinicia lastFrameAt | Dificultad usa tiempo de pausa; timers/visibility necesitan reloj de simulación activo. El renderer sigue dibujando en pausa; medir ahorro antes de una optimización gráfica amplia.                        |
| spawnEngine usa Math.random; lane segura elegida por wave                                         | Falta reproducción por seed. Lane libre por wave no demuestra un trayecto alcanzable entre waves a velocidad alta: oportunidad de simulación, no prueba de que todas las partidas actuales sean imposibles. |
| runner-score.functions: lista approved; rank/count usan neq rejected                              | Ranking puede incluir pending y discrepar con la lista. En la observación pública hubo rango/total con lista approved vacía. Corregir H02; no llamar a cada score “pasajero único”.                         |
| Score POST recibe número del cliente, acotado y moderado                                          | Moderación no certifica resultado ni es anti-cheat. Rate limiting R03 primero; no construir servidor autoritativo para un juego casual sin necesidad real.                                                  |
| RunnerCanvas ~2.065 líneas; RunnerResults ~839                                                    | Mezcla renderer/UI/clock hace costoso cambiar con seguridad. Extraer mínimo necesario con tests, no reescritura basada solo en tamaño.                                                                      |

No hay suite de engine Horizon entre las 14 pruebas originales. H01 agrega caracterización antes de cambiar reglas. Se observó intro/resultados en navegador y se inició una partida sin guardar score; no se certificaron FPS, física ni controles en tablet montada.

### Dónde veo el mayor margen

1. Calidad funcional: tiempo/pause/score justo, regreso tras background y resultado/ranking confiables. Más importante que un shader nuevo.
2. Interacción y presentación: onboarding de un gesto, feedback legible y sobrio, HUD/pausa/salida accesibles, replay sin fricción y tarjeta de recuerdo después de la acción principal. Desktop/tablet deben tener composición propia; el teléfono conserva prioridad.
3. Contenido y ritmo: escenarios Utah con lenguaje distinto (aeropuerto/canyon/valley), objetivos cortos, microeventos y oleadas curadas. No solo “más tráfico más rápido”.
4. Inteligencia local, no LLM runtime: selector de patrones reproducible, anti-repetición, dificultad acotada y comprobación de ruta alcanzable. Un eventual ajuste de ayuda según errores sería local, transparente y sin perfil del pasajero; requiere consentimiento de producto y pruebas, no está aprobado.
5. Generación durante desarrollo: usar modelos para proponer patrones/datos/editorial, contrastados por simulación y revisión humana; distribuir contenido verificado/offline. No pedir una respuesta de IA en mitad de la partida.

La mejor evolución inicial sería un vertical slice opcional de 60–90 segundos (ejemplo: Airport Run o Wasatch Cruise) que demuestre variedad y final propio sobre el mismo núcleo. Mantener endless como referencia/fallback. Antes de ampliarlo, comparar comprensión, equidad y replay en uso real, sin inventar métricas de retención.

### Qué no justifica todavía cambiar motor

No se demostró un límite de Canvas que impida esos objetivos. El renderer ya tiene perspectiva/capas/assets y la mayoría del valor está en reloj/testabilidad, ritmo, contenido y UX. Solo reabrir renderer si un perfil reproducible en dispositivo o una capacidad aprobada no puede resolverse razonablemente dentro del actual. No Unity, Unreal, multiplayer, backend nuevo, ubicación real o integración musical como mecánica incidental.

### Modelos suficientes

- Luna Medio: copy/estilos/assets slots y fixtures ya especificados, sin tocar timing/física.
- Terra Alto/Muy alto: H01/H02 y generador/simulación H03, por las dependencias entre clock, inputs, colisión, score y ranking. Es el implementador principal recomendado.
- Sol Alto: revisión limitada de una propiedad difícil de reachability/equilibrio si Terra muestra un límite concreto tras intentos documentados; no necesario para una nueva pantalla.
- Astra Alto/Muy alto: valoración de un slice que realmente cambie varios contratos/experiencia, o V01 global. No volver por cada asset ni asignar Max por entusiasmo.

Los criterios de aceptación, dependencias, política de récords legacy y permisos están únicamente en las tarjetas H01–H03 del plan maestro. Esta sección no activa sus implementaciones.
