# STREEX

Aplicación para la operación real de STREEX: Rides (reservas y servicio), Pricing/Admin (cotizaciones y agenda) y Passenger (experiencia en vivo, con Horizon como sub-workstream experiencial).

## Continuar el trabajo

Leer en este orden:

1. [AGENTS.md](AGENTS.md): límites y reglas del repositorio.
2. [HANDOFF maestro](docs/HANDOFF.md): checkpoint, evidencia y siguiente tarea exacta.
3. [ROADMAP maestro](docs/ROADMAP.md): única prioridad y estado global.
4. [Plan de ejecución](docs/EXECUTION_PLAN.md): contrato y verificación de la tarea elegida.

No existen roadmaps activos separados por producto. Una solicitud de “ejecutar la siguiente etapa” se traduce en la siguiente tarea atómica habilitada, no en implementar una fase completa de una vez.

## Dirección aprobada — 2026-09-05

- Primero la operación de Juan: seguridad, reservas, dinero, Pricing y disponibilidad fiables.
- UX/UI es un workstream importante y temprano: Clima es referencia de acabado; Music conserva identidad propia; Rides debe estar diseñado para teléfono, tablet y escritorio.
- Passenger sigue siendo fundamental para el uso actual. Horizon puede evolucionar con un alcance aprobado; no hay reescritura ni cambio de motor autorizado.
- Comercialización SaaS y nuevas altas de conductores están en standby. Seguridad e integridad de los tenants actuales NO se posponen.
- Trabajar en main, un cambio aprobado por vez, con pruebas, checkpoint, commit y push. No hacer migraciones, configurar secretos ni producir efectos reales sin autorización específica.

## Arquitectura y despliegue

React 19, TanStack Start/Router, TypeScript, Vite, Tailwind, Bun y FullCalendar. Producción en Vercel: https://rides.getstreex.com. Backend: proyecto Supabase standalone de STREEX Rides. Lovable es parte del flujo de edición/aprobación visual, no el propietario del backend de producción actual.

Mantener monolito modular, estética negro/amarillo y hospitalidad. No migrar framework ni introducir microservicios para completar este plan.

| Superficie      | Ruta                                                    | Responsabilidad                                                    |
| --------------- | ------------------------------------------------------- | ------------------------------------------------------------------ |
| Rides           | / y /{driver-slug}                                      | Servicio, confianza, contacto y solicitud de reserva               |
| Reserva directa | /request-a-ride                                         | Entrada no-index para QR/perfiles                                  |
| Respuesta       | /booking/accept y /booking/decline                      | Respuestas a cotización; hardening pendiente S01/S02               |
| Admin           | /admin, /admin/bookings, /admin/pricing, /admin/reviews | Operación autenticada y tenant-scoped                              |
| Passenger       | /passenger                                              | Tablet bilingüe, landscape-first, no-index                         |
| Horizon         | /runner-lab                                             | Juego Canvas 2D, no-index; tiene entradas visibles, no es “oculto” |
| Spotify         | /spotify/setup y /spotify/callback                      | Setup del conductor, no acceso público a credenciales              |

## Estado verificado de referencia

Baseline de código c38d98f. La auditoría del 2026-09-05 registró 60 pruebas passing, typecheck/build passing y lint/CI fallando por deuda de formato. No son pruebas nuevas de este checkpoint documental ni certificación completa de producción.

Pricing está implementado y su migración aplicada; Maps/Geocoding y QA completo de cotizaciones siguen abiertos. Calendar OAuth/free-busy/sync de reservas confirmadas existe y tiene validación histórica de producción: no duplicarlo.

Clima Premium, Music Reload, Lite/Accent y analytics por engagements existen. “Implementado” no significa que toda la calidad visual/operativa deseada esté terminada.

## Desarrollo y validación

Usar Bun según package.json y bun.lock:

```sh
bun install --frozen-lockfile
bun run dev
```

Secuencia equivalente a Quality (cada comando debe pasar):

```sh
bun run typecheck
bun run lint
bun test tests/*.test.mjs
bun run build
```

bun run check solo ejecuta typecheck + build. check:full añade lint, pero tampoco sustituye las pruebas. Mientras S03 esté pendiente, declarar la deuda histórica y revisar las pruebas enfocadas del cambio; no limpiar Passenger incidentalmente.

Para cambios solo documentales: comprobar links locales, trazabilidad, formato de documentos activos y git diff --check. No es necesario repetir el build ni pruebas del producto.

Los detalles de QA, pausas, rollback y evidencia están en el [plan único](docs/EXECUTION_PLAN.md#protocolo-de-ejecución-y-verificación).

## Documentación técnica y referencias

- [Contexto técnico](docs/PROJECT_CONTEXT.md): contratos y límites actuales, no otro roadmap.
- [Calendar](docs/GOOGLE_CALENDAR.md): reglas de integración y recuperación.
- [Passenger/Around You](docs/AROUND_YOU.md): GPS transitorio, catálogo y QA de campo.
- [Horizon](docs/RUNNER_CONTEXT.md): arquitectura y reevaluación acotada.
- [Multi-tenant](docs/MULTI_TENANT_ADMIN.md): modelo de autorización; onboarding comercial en standby.
- [Supabase](supabase/README.md): historia y disciplina de migraciones, sin bootstrap automático.
- [Auditoría preservada](docs/audits/2026-09-05-audit.md) y [contexto de lectura](docs/audits/README.md).
- [Archivo documental](docs/archive/README.md): versiones históricas no ejecutables.
- [Optimización general](docs/IMAGE_OPTIMIZATION.md) y [optimización Rides](docs/RIDES_IMAGE_OPTIMIZATION.md): informes históricos, no nuevo backlog.

Variables soportadas en .env.example. Credenciales privadas en Vercel/entorno local; nunca en Git, config pública, screenshots, logs o documentación. GA excluye Passenger/Admin/Horizon/Spotify, pero la protección de URLs sensibles de Rides sigue pendiente S01; no interpretar la intención de privacidad como garantía ya implementada.
