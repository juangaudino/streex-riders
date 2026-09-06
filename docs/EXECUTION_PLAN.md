# STREEX — plan único de ejecución

Contrato de trabajo aprobado como dirección de planificación: 2026-09-05. No implica autorización de ejecutar todas las recomendaciones ahora. Orden/estado solo en [ROADMAP](ROADMAP.md); tarea/subpaso exacto y evidencia en [HANDOFF](HANDOFF.md). La auditoría es referencia histórica, no una cola rival.

## Protocolo de ejecución y verificación

### Reanudar sin volver a auditar todo

1. Leer AGENTS → HANDOFF → fila ROADMAP → tarjeta de este documento → referencia técnica necesaria. No cargar todos los históricos.
2. Confirmar main, HEAD/diff y alcance. Preservar cambios del usuario. No hacer pull/rebase sobre modificaciones superpuestas ni incluir archivos ajenos en un commit.
3. Exponer objetivo, archivos previstos, pruebas y exclusiones del próximo cambio. Una orden “continúa/ejecuta la siguiente etapa” habilita solo el próximo ID/subpaso listo. Si falta una decisión de producto, el siguiente paso es resolverla, no inventarla.
4. Implementar un cambio pequeño. Si la tarjeta tiene varios subpasos, cerrar solo el subpaso indicado en HANDOFF. No ejecutar varios IDs porque compartan archivo. Sin agentes paralelos salvo petición expresa.
5. Añadir regresión que reproduzca el fallo, ejecutar controles proporcionales y QA por superficie. No enviar correo/pagos ni crear/modificar reservas reales como efecto colateral de tests.
6. Revisar diff y evidencia. Actualizar estado ROADMAP y HANDOFF en el mismo checkpoint que el cambio. Commit con paths explícitos; push normal a main según autorización del usuario. Nunca force-push ni commits de secretos/artefactos temporales.
7. Verificar push y CI. Parar y entregar resultado, limitaciones y siguiente ID. No encadenar la siguiente tarea automáticamente. Si CI falla por deuda conocida, no llamarla verde; si la regresión es nueva, no marcar HECHA.

### Qué se considera completo

Por tarjeta: criterios de aceptación + pruebas enfocadas + control común + evidencia de la capa requerida. Registrar por separado:

- Código/commit y diff.
- Unit/integration/browser tests, comando y resultado.
- Migración: no requerida / preparada / aplicada con evidencia y entorno.
- QA autenticado: sí/no y recorrido.
- Producción/tablet real: sí/no; no convertir pruebas locales en evidencia física.
- Push/CI: hash y estado, incluidas excepciones.

“Implementado; QA pendiente” nunca equivale a HECHA. No fijar un conteo de tests como meta: 60 es la referencia anterior, no garantía de cobertura.

### Controles comunes

- Documentación: links/rutas actuales, tabla 27→IDs, un solo roadmap/handoff activo, formato de documentos activos, git diff --check. No repetir tests/build del producto por Markdown.
- Código: typecheck, lint enfocado, tests del cambio, bun test tests/\*.test.mjs y build. Tras S03, lint global también debe pasar. bun run check no ejecuta tests/lint; check:full tampoco ejecuta tests.
- Frontend: navegador real de la superficie, mobile/desktop según matriz UX, teclado/foco/errores/reduced motion. Screenshots antes/después con datos ficticios o saneados.
- Dinero/estado: concurrencia, doble click/retry, errores por paso, transición inválida, tenant ajeno; centavos y snapshot auditables.
- DB/Auth: fixtures aislados, matriz de denegaciones por Data API directa y funciones server-side, Storage legítimo, RLS/EXECUTE y rollback/recovery. Nunca fiarse solo de UI.
- Integraciones: mocks para fallos/token/timeout y prueba autorizada de un caso real. No pedir ni imprimir valores de secretos.
- Passenger: 1280×800 como referencia y Galaxy Tab A9+ real en landscape, EN/ES, touch, idle/resume, reload, hotspot caído, stale, pairing cuando corresponda. Portrait Passenger sigue diferido.

### Commits, migraciones y pausas

Cada tarjeta/subpaso termina en un checkpoint revisable y commit/push del cambio aprobado. Separar migración, contrato y UI cuando no puedan validarse como unidad pequeña. Antes de aplicar datos/secrets/Auth/efectos reales, detenerse y pedir autorización específica. Un commit de migración no prueba su aplicación.

Rollback de código: revert dirigido del commit propio, nunca reset destructivo. Datos: preferir cambios aditivos/compatibles y forward recovery; no borrar quotes/récords/analytics para hacer pasar QA. No ejecutar rollback de DB sin destino, respaldo y aprobación.

Si falta una dependencia externa, registrar BLOQUEO en HANDOFF y no fingir cierre. Puede proponerse la siguiente tarjeta independiente según orden ROADMAP, explicando la excepción; nunca usarlo para saltarse un P0 ni para abrir SaaS.

### Modelos y coste

Luna Medio para formato, documentación, copy, UI y fixtures con contrato cerrado. Terra Alto para lógica coordinada; Muy alto para permisos, transacciones y simulación. No usar razonamiento Mínimo para dinero/seguridad. Max no se necesita por defecto.

La recomendación es de ingeniería, no una promesa de cuota/precio. Se consultó [OpenAI Models](https://developers.openai.com/api/docs/models). Sol/Astra solo en los checkpoints definidos al final. No cambiar silenciosamente el modelo configurado: si no coincide, comunicar la recomendación y dejar que el usuario elija.

## F1 — seguridad

### S01 — contención de Analytics sensible

- Origen: A1. Dependencias: ninguna. Modelo: Terra Alto; coordina inicialización, navegación y saneado sin ampliar arquitectura. Riesgo: Medio.
- Modificar: src/lib/analytics.ts, tests/analytics.test.mjs y solo el wiring de inicialización/rutas necesario si se demuestra dependencia. Excluir /booking/accept, /booking/decline y cualquier preview con token desde primera carga y navegación SPA. Nunca enviar query/hash sensibles en page_location/page_referrer ni eventos.
- No tocar: respuestas de booking, tarifas, RLS, Passenger/Horizon/Spotify, destinos de pago, claves. No convertir esta contención en una migración general de analytics.
- Pruebas: URLs sintéticas con id/previewToken, primera visita y navegación público→sensible→público, SSR sin window, eventos legítimos de reserva conservados. Stub de gtag/dataLayer y captura de requests con datos de prueba, sin transmitir tokens reales.
- Aceptación: scripts/eventos no se inician en rutas sensibles; ruta permitida conserva solo URL saneada; referrer no reintroduce la query. Contención no cambia la reserva ni bloquea el funnel permitido.
- Parar: si sanear exige cambiar un flujo funcional fuera de alcance, presentar el mínimo cambio. Documentar que GET aún muta hasta S02.
- Checkpoint: un commit de contención + tests + HANDOFF; siguiente S02. No cerrar A1 completo todavía.

### S02 — respuestas deliberadas y capacidades limitadas

- Origen: A1. Depende S01. Modelo: Terra Muy alto; tokens, compatibilidad y transiciones merecen revisión conjunta. Riesgo: Alto.
- Modificar: rutas booking.accept/decline, booking.functions, generación de enlaces de quote y helper server-only. GET solo revisa estado mínimo; POST explícito con token firmado ligado a booking, acción y caducidad; compare-and-set/idempotencia.
- No tocar: precio, Calendar duplicado, datos personales innecesarios de respuesta, rediseño landing. No guardar secretos/tokens en analytics o logs.
- Subpasos/checkpoints: S02.1 aprobar duración y manejo de emails existentes; S02.2 implementación + pruebas; S02.3 QA de correo/respuesta autorizado. Recomendación: enlaces UUID anteriores abren pantalla neutral de enlace desactualizado/renovación controlada, no conservan mutación UUID-only indefinida. No romper emails activos sin explicar/revisar transición con el propietario.
- Pruebas: GET/prefetch sin writes/emails, firma inválida, acción cruzada, caducidad, reserva ajena, doble click, aceptación vs rechazo concurrentes, ya respondida. Fixtures; no probar con links reales de clientes.
- Aceptación: ninguna visita automática decide; una respuesta válida cambia una sola vez; no se duplican efectos. Hasta P08, preservar transición condicional y registrar límites de recuperación existentes.
- Parar antes de aplicar nuevos secretos, reemitir emails o invalidar enlaces activos. No introducir un bypass temporal permanente.

### S03 — CI verde sin refactor de producto

- Origen Q1/I8. Depende S02. Modelo Luna Medio: formato y comandos exactos. Riesgo Bajo.
- Modificar exclusivamente los errores de formato enumerados y, si se aprueba, scripts/Quality para un check completo equivalente. Snapshot anterior: WeatherAtmosphere, usePassengerState, spotify.server, weather.server y weather.ts; confirmar líneas actuales. Archivos Passenger requieren aprobación de ese alcance acotado.
- No tocar lógica, clima visual, playback ni actualizar dependencias en este commit.
- Pruebas: diff sin cambio semántico, prettier/lint, typecheck, test suite y build; verificar el run nuevo de CI. Las warnings se documentan; no suprimir reglas para pintar verde.
- Aceptación: mismo comportamiento, pipeline vuelve a ser útil. Checkpoint único; siguiente S04. Parar si un error no es mecánico y necesita una tarea propia.

### S04 — dependencias vulnerables dirigidas

- Origen A2. Depende S03. Terra Alto; compatibilidad SSR/server functions. Riesgo Medio.
- Modificar package.json/bun.lock por familias compatibles, comenzando por TanStack/Seroval afectados en la auditoría. Verificar advisories/versiones vigentes al ejecutar; no repetir auditoría de toda la app.
- No hacer upgrades mayores indiscriminados, sustituir framework o tratar cada aviso dev como explotación de producción.
- Pruebas: árbol/lock resuelto, audit enfocado, SSR, auth, server functions, reserva/Pricing y build. Aceptación: rangos prioritarios afectados fuera del árbol o excepción justificada, sin nuevas regresiones.
- Checkpoint por familia compatible. Parar si requiere cambio mayor: presentar ruta mínima y riesgo antes de continuar.

### S05 — permisos, suspensión y aislamiento actual

- Origen A3. Depende S04. Terra Muy alto; matrices RLS/Storage/servidor. Riesgo Alto. NO standby SaaS.
- Modificar admin-auth, tenant lifecycle/preview y políticas de tablas operativas estrictamente necesarias. Matriz owner/admin/superadmin × draft/active/suspended/archived; acceso directo no debe saltarse procesos server-owned. Preservar uploads legítimos y SELECT necesario para UPDATE.
- No tocar billing/onboarding ni crear conductores reales para probar. No abrir tablas privadas sin policies solo para quitar avisos.
- Subpasos/checkpoints: S05.1 matriz y fixtures aislados; S05.2 migración/código y tests locales; S05.3 aplicación/QA autorizado. Migración preparada no cierra permiso de producción.
- Pruebas: usuario A/B, cambio de header tenant, reasignación de ownership, suspensión/archivo, preview válido en estado no permitido, Storage insert/update/delete y superadmin. Probar Data API además de server functions.
- Aceptación: denegaciones y acciones legítimas coinciden con matriz; no bypass por tenant/membership obsoleta. Revisar EXECUTE/search_path de helpers y plan de recuperación de acceso.
- Parar ante política ambigua o cualquier cambio DB/roles real. No reemplazar controles actuales con user_metadata.

### S06 — seguridad de contraseña y recuperación

- Origen Q4. Depende S05. Terra Medio; cambio pequeño pero sensible. Riesgo Medio.
- Modificar configuración Auth solo con propietario autorizado; protección de contraseñas filtradas si soportada; validar recuperación. MFA puede evaluarse, no activarse sin método de recuperación.
- No manejar passwords nuevos por el usuario ni restaurar emergency keys. No bloquear al único operador fuera de la cuenta.
- Pruebas/aceptación: login y recuperación confirmados, resultado del asesor; si plan no soporta función, documentar limitación/decisión explícita. No declarar resuelto por redactar el runbook.
- Checkpoint documental con evidencia saneada, sin valores secretos. Parar ante coste/cambio de plan o configuración no autorizada.

## UX00 — contrato visual temprano

- Origen I6/O3 y nueva prioridad del propietario. Depende G0. Terra Alto para criterio y jerarquía; Luna Medio puede ordenar matriz/fixtures visuales. Riesgo Bajo: todavía diseño/prototipo, no lógica de producción.
- Entregable: una dirección aprobada y ejemplos representativos por superficie, no diseñar todas las pantallas. Usar Lovable para aprobación visual cuando sea el flujo acordado. Mantener la decisión y referencias aprobadas dentro de esta tarjeta/HANDOFF o anexos de diseño, no crear otro roadmap.
- Clima como referencia: actual→próximas horas→días; dato protagonista, tipografía contrastada, superficies con profundidad contenida, atmósfera semántica y estados stale/error honestos. Trasladar principios, NO lluvia/partículas a todas las pantallas ni cambiar NWS/GPS.
- Rides: promesa/CTA/reserva/confianza, fotos reales aprobadas, composición específica por ancho. Admin: densidad operativa, estado/envío/error y precio claramente separados de settings. Music: arte/track/controles como protagonista, búsqueda/Top 50/vibes jerarquizados, vacíos tan cuidados como playback; identidad propia, no copia Spotify.
- Passenger: lectura inmediata a distancia y 48–56 px como objetivo de touch; Home/idle coherentes con Music/Clima. Horizon mantiene su lenguaje de carretera Utah y recuerdo coleccionable, con controles/resultados comprensibles.
- Matriz Rides/Admin: 360×800, 390×844, 430×932; tablet 768×1024 y 1024×768; escritorio 1280×800 y 1440×900. Comprobar anchos intermedios, 200% texto/zoom y teclado virtual. Sin scroll horizontal de página, CTAs cortados, modales fuera de viewport o desktop como columna móvil estirada. Tablas pueden tener scroll local explícito.
- Matriz Passenger: 1280×800 y viewport real Fully landscape, EN/ES, reduced motion, textos largos/arte ausente/offline. No reabrir portrait automáticamente.
- Aceptación: propietario aprueba dirección y alcance por superficie; lista de estados y referencias de antes/después, sin alterar producción. No reutilizar una aprobación de Clima como permiso de rediseñar toda Passenger.
- Checkpoint: contrato visual; volver a P01. Si no hay imágenes aprobadas, diseñar con fallbacks actuales y marcar assets pendientes, no inventar destinos Storage.

## F2 — Pricing y dinero

### P01 — Maps/Geocoding diagnosticable

- Origen Q3. Depende F1; UX00 no es dependencia técnica. Terra Medio; Luna Medio solo mensajes/fixtures tras diagnóstico. Riesgo Bajo.
- Modificar pricing-maps.server/errores enfocados si logs existentes no bastan. Separar HTTP, status API en HTTP 200, ZERO_RESULTS, denegación y timeout. La migración ya está aplicada.
- No cambiar direcciones, billing o keys a ciegas; no loguear URL con key/PII. No tocar browser autocomplete si el error es server-side.
- Pruebas: respuestas simuladas + una zona/llamada real autorizada. Aceptación: causa exacta identificada, mensaje útil/saneado, timeout y camino válido comprobados. Si acceso externo falta, dejar QA bloqueado, no ejecutar llamadas repetitivas pagadas.
- Checkpoint diagnóstico primero; un fix distinto solo con causa y alcance. Próximo independiente P02 si Maps real sigue bloqueado.

### P02 — reserva vinculada coherente

- Origen I1. Depende S05; P01 para QA real. Terra Alto; contrato UI/validador/server. Riesgo Medio.
- Modificar PricingPanel y esquema/prepareQuote; contrato discriminado manual vs bookingId, datos de reserva autoritativos server-side, fecha/direcciones visibles correctas. No aceptar datos ajenos confiando en browser.
- No cambiar fórmulas ni permitir enviar reservas no pending.
- Pruebas: draft vacío→seleccionar booking, cambiar booking, desvincular, manual válido, booking de otro tenant/estado inválido. Aceptación: lo visible coincide con lo calculado y seleccionar una reserva no exige editar direcciones ocultas.
- Checkpoint único con regresión. Parar si se necesita cambiar la estructura de servicios de booking más allá de este contrato.

### P03 — fechas y timezone

- Origen I3. Depende P02. Terra Alto; conversión explícita y DST. Riesgo Medio.
- Modificar helpers/campos Pricing usando zona IANA de perfil/operador; eliminar slice UTC interpretado como local. Reutilizar convenciones existentes de availability.
- No cambiar timezone global de reservas antiguas ni corregir timestamps existentes sin evidencia/plan.
- Pruebas: round-trip sin editar, Denver/navegador en otra zona, medianoche, DST faltante/duplicada, vigencia promo. Aceptación: guardar sin editar conserva instante y horario mostrado es inequívoco.
- Parar ante fecha ambigua: resolver política en UI/contrato. Commit separado; datos históricos no se reinterpretan automáticamente.

### P04 — matriz tarifaria aprobada

- Origen I4. Depende P02/P03; Maps simulado permitido. Terra Alto para contrato; Luna Medio para tabla/fixtures. Riesgo Bajo en documentación.
- Entregable: ejemplos entrada→line items→recomendado→final→comisión con importes aprobados por Juan. Decidir Hourly sin destino, millas incluidas/exceso, stops fuera de Flat Rate, desempate de zonas, radio/retorno, vigencia/hold, referral sobre recomendado o final y rounding/override.
- Conservar Flat Rate primero y positioning interno. No inventar tarifas reales a partir de los valores temporales del perfil ni modificar Passenger.
- Pruebas: fixtures deterministas esperados cubren cada servicio, límites/redondeo, promo y referral por separado. Diferenciar valor publicitado y perfil fuente de verdad.
- Aceptación: propietario aprueba matriz y decisiones. Parar antes de P05/P08 si siguen ambiguas. Checkpoint documental versionado; no recalcular historial.

### P05 — cerrar reglas aprobadas

- Origen I4. Depende P04. Terra Alto; Luna Medio para fixtures cerrados. Riesgo Medio.
- Modificar motor puro/types/prepareQuote estrictamente para los gaps acordados. Hourly sin ruta no debe geocodificar “Hourly service”; pedir solo métricas que el contrato necesite.
- No reescribir algoritmo completo, cambiar precedencia o utilizar LLM para precios.
- Pruebas/aceptación: matriz P04 completa, edge cases de paradas/zonas, mínimos, descuentos/comisiones, dinero en centavos y snapshot explicable; public copy coherente en el alcance aprobado.
- Checkpoint por familia de reglas si no cabe en un diff revisable. Parar si una regla cambia precios existentes sin autorización o requiere nuevos datos.

### P06 — preview vigente y override consciente

- Origen I2/A8. Depende P02/P03/P05. Terra Alto; versión de inputs/UI/server. Riesgo Medio.
- Modificar PricingPanel y contrato de cálculo/guardado. Invalidar al cambiar inputs relevantes; descartar respuesta vieja; guardar versión revisada del cálculo desde servidor. Mostrar override como elección explícita con motivo según contrato, no arrastre accidental de finalCents.
- No confiar en snapshot firmado por el browser ni introducir cache indefinida de tarifas/Maps. No eliminar override aprobado.
- Pruebas: editar después de calcular, dos previews fuera de orden, perfil/promo modificados antes de guardar, cache vencida, tenant ajeno, draft recuperado. Aceptación: UI y persistencia refieren la misma versión y ninguna edición reutiliza precio obsoleto silenciosamente.
- Checkpoint de contrato y lógica; coordinar P08 sin mezclar envío en este cambio. Parar si requiere nueva persistencia: aprobación de migración.

### P07 — lifecycle de rechazo/completado

- Origen A4. Depende S02/P04. Terra Alto; caminos pequeños con consecuencias monetarias. Riesgo Medio.
- Modificar booking response/admin/pricing-lifecycle para aplicar transición equivalente desde todos los entrypoints; decline/cancel void, completed payable solo si corresponde; conservar idempotencia.
- No borrar redemptions/quotes ni cambiar el contrato de consumo promocional sin P04/P08.
- Pruebas: decline público/admin, cancel, complete con/sin referral, repetición y error de actualización. Aceptación: booking/snapshot/comisión coherentes; fallos visibles/recuperables, nunca éxito silencioso.
- Checkpoint focalizado antes de refactor transaccional. Parar ante transición sin política definida.

### P08 — transición atómica y envío recuperable

- Origen A4/I8. Depende P04/P06/P07/S05. Terra Muy alto para contrato/transacción; Terra Alto para adaptadores; Luna Medio para estados/fixtures definidos. Riesgo Alto.
- Modificar orquestación común manual/calculada, estados/DB y envío: compare-and-set, idempotency key, transacción de escrituras propias y bandeja de tareas externas persistidas. No enviar correo/Google dentro de la transacción DB.
- Subpasos/checkpoints: P08.1 aprobar state table, significado de sent/delivered/pending/error y cuándo consumir promo; P08.2 persistencia/migración + tests aislados; P08.3 adaptador email/retry + UI; P08.4 aplicación y QA real autorizado. Nunca consumir promo otra vez al retry. Entrega de email no se infiere de haberlo encolado.
- No cambiar precios, reemitir todas las cotizaciones viejas ni implementar pagos SaaS. Respetar snapshots y bookings existentes con compatibilidad explícita.
- Pruebas: fallar cada paso, doble envío concurrente, aceptación/rechazo concurrente, retry tras timeout incierto del proveedor, promo agotada, transición stale, reintento tras reload. Aceptación: una transición válida, efectos deduplicados, estados parciales recuperables sin borrar datos.
- Parar antes de schema/producción/semántica comercial; no marcar HECHA sin evidencia end-to-end requerida.

## F3 — operación fiable

### R01 — agenda que representa el viaje real

- Origen A5. Depende P08 y contrato P04. Terra Alto; Muy alto solo concurrencia. Riesgo Alto.
- Modificar duración operativa editable, buffers, capacidad y revalidación antes del compromiso; después sugerencia Maps si aprobada. Preservar triggers de overlap y semántica pending/quoted/confirmed.
- No mover reservas automáticamente, asumir que todo trayecto dura 60 min ni que Google puede participar en transacción local.
- Subpasos/checkpoints: R01.1 aprobar duración/buffer/hold/capacidad y ejemplos; R01.2 código/fixtures/migración si necesaria; R01.3 QA autorizado.
- Pruebas: viaje largo, hourly, adyacencia con/sin buffer, overnight/DST, bloque manual, cambio de duración, Google busy posterior y concurrencia. Aceptación: no se ofrece/promete un slot inviable según reglas aprobadas; conflictos explicables y reversibles.
- Parar ante conflicto real existente: informar, no cancelar/mover clientes por cuenta propia.

### R02 — recuperación de integraciones

- Origen A8. Depende P06/P08/R01. Terra Alto; Muy alto solo reconciliación bidireccional futura. Riesgo Medio.
- Modificar estado/retry/timeouts/deduplicación de Calendar/correo/Maps, aprovechando outbox. Reusar preview válido y limitar consultas no necesarias; no duplicar sync confirmed existente.
- Subpasos/checkpoints: timeout/dedup, recuperación programada autorizada, UI/runbook. Propuesta para eventos Google movidos/borrados: mostrar divergencia y restaurar por Retry hasta que Juan apruebe otra autoridad; no restaurar silenciosamente por defecto.
- Pruebas: expiración/revocación, free-busy outage fail-closed, webhook duplicado, evento borrado/movido, retry manual/programado. Aceptación: indicador honesto de última sincronización/error y recuperación sin duplicados.
- Parar antes de scheduler/deploy/secrets o cambiar reglas de Google manual. Push notifications/watch-renewal/sync tokens completos quedan diferidos hasta justificar latencia/volumen; se reabre esta tarjeta con un subpaso nuevo aprobado, no otro roadmap Calendar.

### R03 — protección pública proporcional

- Origen A7. Depende S05/P08. Terra Alto; cuotas y legitimidad. Riesgo Medio.
- Modificar límites distribuidos, validación/idempotencia/honeypot en reservas/reseñas, ingesta y scores; empezar por endpoints con writes/coste. Comprobar si ya hay defensa hosting relevante, sin asumirla.
- No bloquear viajeros por una sola IP compartida, añadir captcha por defecto, guardar identificadores personales permanentes ni cambiar gameplay/semántica analytics.
- Pruebas: ráfaga, retry legítimo, NAT compartida, cuotas por acción/tenant, body sobredimensionado, proveedor fallando. Aceptación: abuso acotado y flujo normal disponible; señal técnica mínima y con retención acordada.
- Checkpoint por endpoint/familia; aprobación específica si se toca Passenger/Horizon server. Parar ante nuevos proveedores/costes/permisos.

### R04 — dinero, datos y recuperación del operador actual

- Origen A6/A10. Depende S05/P08/R03. Terra Alto; Luna Medio para inventario/runbook. Riesgo Medio, Alto si se aplican operaciones de datos.
- Modificar solo lo necesario para verificar destinos actuales de pago, copy de “enlace vs cobrado”, privacidad/inventario/retención mínima y respaldo-restauración. Si los destinos son correctos, registrar evidencia y no refactorizar todos los defaults comerciales.
- No activar otro driver, construir billing/offboarding SaaS, exportar PII a documentación ni borrar datos para limpiar un test. La neutralización completa comercial sigue C01.
- Subpasos/checkpoints: R04.1 inventario de dinero/datos y política; R04.2 corrección actual si existe; R04.3 ensayo de recuperación en entorno aislado. Retención con borrado requiere decisión/dry run aprobados; no implementarla por presunción legal.
- Pruebas/aceptación: contactos/destinatarios de Juan correctos en Rides/Passenger, no secretos en config, copia de privacidad fiel, restauración aislada demostrada y sin afectar producción. Prueba de tip/payout real solo con acción autorizada del propietario; un link abierto no valida cobro.
- Parar ante coste, datos reales o riesgo de pérdida. Registrar lo no comprobado en vez de inventar backups existentes.

## F4/F5 — experiencia profesional

### UX01 — reserva accesible y entendible

- Origen I5. Depende G1/UX00. Terra Alto para modal/estado; Luna Medio para labels/copy. Riesgo Medio.
- Modificar BookingFormModal con primitives existentes, asociaciones label/error, foco/Escape/restauración y fondo inactivo. Reordenar viaje/contacto solo según prototipo aprobado, aclarando solicitud vs confirmación.
- No tocar precios/transiciones/Calendar; componente compartido exige smoke Passenger sin rediseñarlo.
- Pruebas: teclado/lector de pantalla, validación y reload, móvil con teclado abierto, zoom/texto largo y error API. Aceptación: foco no escapa, todos los campos se entienden y recorrido completo sin envío real no autorizado.
- Checkpoint accesibilidad primero, orden visual después si son diffs separados. Parar si se necesita cambiar contrato de booking.

### UX02 — responsive Rides deliberado

- Origen I6 + instrucción explícita responsive. Depende UX00/UX01/G1. Terra Alto para composición; Luna Medio para bloques aprobados. Riesgo Medio.
- Modificar layout landing/secciones/config slots solo aprobados: excelente teléfono; tablet/escritorio con composición propia, anchura/columnas/ritmo definidos. Mantener CTA de reserva principal y contacto secundario; confianza/foto auténtica cerca de la decisión.
- No modificar engine Horizon, Passenger CSS global, backend o tarifas; recolocar el enlace del juego solo con aprobación visual. No añadir imagen pesada para llenar espacio.
- Pruebas: matriz UX00 completa, anchos intermedios, Chrome/Safari cuando disponibles, keyboard/zoom/safe areas, imágenes loading/error, rutas de driver sin activar nuevos tenants. Aceptación: no overflow global, columnas que no estiran tipografía, CTA visible/usable, modales dentro del viewport y móvil no degradado.
- Checkpoint por región aprobada (hero/estructura, luego secciones). Parar para aprobación de fotografía/mapeo de assets, no inventar usos compartidos.

### UX03 — Admin/Pricing para operar sin ruido

- Origen I6. Depende UX00/P08/R02. Terra Alto; Luna Medio para componentes definidos. Riesgo Medio.
- Modificar organización de PricingPanel/Admin: cotizar vs configurar, readiness de perfil/base/zonas, resumen persistente, estado de envío/retry/override legible y acciones contextualizadas.
- No cambiar reglas, permisos, snapshot ni ocultar errores para simplificar. Extraer solo componentes necesarios; no rehacer Admin entero.
- Pruebas: sesión autenticada owner/superadmin controlada, lista larga/empty/loading/error, tablet/escritorio/teléfono operativo, flujo completo cotizar→enviar→retry. Aceptación: misma lógica, menos ambigüedad, no acciones peligrosas descontextualizadas.
- Checkpoint de un panel a la vez. Sin sesión de QA: VALIDACIÓN PENDIENTE, no certificar el Admin por screenshots de login.

### PA01 — métricas privadas exactas

- Origen I7. Depende S05/R03. Terra Alto; Luna Medio para datos sintéticos. Riesgo Medio.
- Modificar agregación server/SQL y paginación de detalles, no semántica engagement. Comparar con count exacto; el límite efectivo remoto no se presume.
- No reiniciar Start beta measurement, borrar ingeniería pasada, añadir GPS/persona ni confundir sesiones con viajes.
- Pruebas: más de 1.000 eventos, varios rangos/tenants, DST y beta cutoff, empate/orden de páginas. Aceptación: totals/rutas concuerdan con fixtures; snapshot Admin exacto sin truncamiento silencioso.
- Checkpoint de contrato y agregación; migración si necesaria con aprobación. No sustituir exactitud por subir límite indefinidamente.

### PA02 — tablet actual confiable, no plataforma de flotas

- Origen A7/O3. Depende S05/R03; PA01 para QA de métrica. Terra Alto; Riesgo Medio.
- Modificar solo credencial de instalación/tenant revocable, ingesta confiable/test separada y estados/recovery de pairing actual que se justifiquen. Mantener cookie HTTP-only y tokens de Spotify server-side.
- No borrar storage/cookies del único tablet, reemparejar a diario, cambiar cuenta Spotify ni activar onboarding de otros conductores. Multiinstalación comercial C01.
- Pruebas: credencial caducada/revocada, envío de otra instalación/tenant, retry offline, idle/reload, no dispositivo de audio, recuperación autorizada. Aceptación: métricas/control atribuibles a instalación confiable sin identificar pasajero; experiencia no pierde pairing incidentalmente.
- Checkpoint antes de UI Music. Parar para cambios de secretos/permisos/dispositivo; usar el propietario para pairing real.

### UX04 — Music con acabado STREEX

- Origen O3 + prioridad nueva. Depende UX00/PA02. Terra Alto para jerarquía/estados; Luna Medio para ejecución visual cerrada. Riesgo Medio.
- Modificar presentación propia: arte + track + estado + controles; búsqueda/Top 50/vibes, vacíos y errores consistentes. Texto genérico quieto/legible en vez de marquee recortado; títulos reales largos con tratamiento accesible. Evaluar luces/glow por legibilidad, no añadir efectos por sí mismos.
- No clonar Spotify, añadir playlists personales, cambiar SDK/OAuth/playback source-of-truth ni rediseñar Clima.
- Pruebas: playing/paused/no track/no device/unpaired/error/offline, arte ausente y títulos EN/ES largos, touch y teclado; tablet real con sesión autorizada. Aceptación: cada estado está tan terminado como la referencia Clima, controles dominantes y truthful, sin nuevas llamadas costosas.
- Checkpoint por región/estado aprobado en Lovable. No implementar varios conceptos visuales a la vez ni llamar completo al happy path solamente.

### UX05 — coherencia Passenger Home/idle/navegación

- Origen O3. Depende UX00/UX04/PA01. Terra Alto para foco/idle; Luna Medio para copy/layout cerrado. Riesgo Medio.
- Modificar únicamente destinos redundantes, jerarquía Home/idle/fallback y accesibilidad; preservar cadencia, Music hero y Clima compartido. Fondo inactivo no recibe foco/click; evitar botones anidados.
- No cambiar GPS/NWS, lógica de juegos, reservas/pagos ni introducir nuevos temas/modos. RELOAD y Launch Visual Theme no se reordenan como efecto colateral.
- Pruebas: landscape 1280×800 + Fully real, EN/ES, idle/resume/reload/Android suspension, reduced motion, offline y contador de engagements. Aceptación: navegación inequívoca, fondo realmente inactivo, ningún reset provoca ruido de métricas o pérdida de conexión.
- Checkpoint por región. Limitación de interacción en navegador automatizado se reproduce antes de llamarla bug; no generalizarla al vehículo sin evidencia.

### H01 — Horizon: corrección temporal sin reescritura

- Origen: reevaluación explícita del 2026-09-05, ver RUNNER_CONTEXT. Depende G1; antes de nueva variedad H03. Terra Muy alto para simulación y compatibilidad; Luna Medio solo fixtures una vez definido contrato. Riesgo Alto por compatibilidad de récords.
- Modificar RunnerCanvas/engine mediante extracción mínima del reloj/step y RNG inyectable, manteniendo Canvas 2D, carriles, colisión e identidad. Puntaje por tiempo activo/distancia, no mínimo de un punto por frame; pausa/hidden no incrementan dificultad/score/timers.
- Subpasos/checkpoints: H01.1 test harness de caracterización y política scoreVersion/legacy aprobada; H01.2 reloj/score/visibility y tests; H01.3 QA teléfono/tablet relevante. Conservar récords existentes; si una nueva versión exige tabla/campo/leaderboard separado, pedir migración, no borrarlos.
- Pruebas: misma seed/input/tiempo activo a 30/60/120 Hz, pausa larga/hidden/resume, input rápido/límites carril, choque/ice y replay. Aceptación: puntaje/resultado equivalente con tolerancia aprobada (objetivo ≤1% para score por tiempo), dificultad no avanza en pausa, no salto al volver y legacy identificable.
- No sustituir renderer por Pixi/Unity ni rediseñar game loop entero sin perfil/evidencia. Parar si la equivalencia requiere alterar física: explicar y aprobar el cambio antes de tuning.

### H02 — Horizon: resultados veraces y presentación

- Origen: reevaluación + O3. Depende H01/UX00/R03. Terra Alto para ranking/estados; Luna Medio para UX/copy aprobados. Riesgo Medio.
- Modificar contrato ranking aprobado vs pending y UI de intro/HUD/pausa/resultados: enseñar gesto/teclas en segundos, retry accesible, resultado + replay visibles antes del formulario/card, copy coherente; rank sobre universo explícito, no “riders” como personas únicas.
- No volver competitivo/verificado un score aportado por cliente, prometer anti-cheat, enviar scores automáticamente ni tocar pagos/bookings. Mantener moderación y tarjeta coleccionable; contacto en export, no saturando gameplay.
- Pruebas: cero approved, solo pending, mezcla rejected/approved, tie, no red, guardar duplicado, cancel share, safe areas/teclado/zoom, teclado/touch y reduced motion. Aceptación: ranking/leaderboard no se contradicen; volver/jugar no exige nombre ni publicación; estado viejo y scoreVersion no se mezclan.
- Checkpoint ranking separado del visual si afecta contrato. QA de score usa fixtures; publicar uno real necesita autorización.

## F6 — crecimiento de calidad/valor después del núcleo

### O01 — rendimiento y mantenibilidad medidos

- Origen A9. Depende I8 transversal/G1 y baseline visual UX00. Terra Alto para límites/perfil; Luna Medio para extracciones mecánicas. Riesgo Medio.
- Medir recursos por ruta, carga fría/cache, main-thread/frame time en dispositivo y CSS compartido. Extraer por dominio solo el hotspot elegido, reducir CSS cruzado/calls/allocations según evidencia.
- No convertir conteo de líneas en razón suficiente para reescribir Admin/Passenger ni tocar índices por “unused” sin query plan.
- Pruebas/aceptación: presupuesto antes/después aprobado con misma red/CPU/viewport, comportamiento y screenshots equivalentes, reducción verificable sin mover coste a otra ruta.
- Checkpoint un hotspot por commit. Parar sin cuello de botella medido; registrar “sin cambio necesario” en vez de fabricar optimización.

### O02 — continuidad comercial para Juan

- Origen O2. Depende P08/R04/UX03. Terra Alto para estados; Luna Medio plantillas. Riesgo Medio.
- Elegir un primer caso: quote de marca con vigencia/inclusiones, seguimiento autorizado o solicitar viaje similar. Reusar los flujos, sin CRM general.
- No inferir pago, reenviar masivamente, duplicar reservas al repetir ni introducir billing SaaS.
- Pruebas: expiry/retry/consentimiento, datos modificados, confirmación explícita de nueva solicitud. Aceptación: ahorro de pasos demostrado con estado honesto y sin mensajes duplicados.
- Checkpoint por caso aprobado; detenerse para política de comunicaciones/dinero. Depósitos y tip real tienen gate B06, no se ejecutan incidentalmente.

### O03 — Driver MC mínimo

- Origen O3/B04 legado. Depende PA02/UX05. Terra Alto; riesgo Alto si controla dispositivo.
- Primero contrato de Home/reset/idle y estado de conexión; interfaz privada del conductor. Separar capability soportada por web, integración Fully y no disponible. No prometer battery/temperature/brightness/Android power-off desde PWA.
- No añadir Complete/Kids/contexto de reservas automáticamente, GPS persistido ni panel de flotas. No distraer al conductor con operación compleja durante conducción.
- Pruebas: auth/revocación/tenant, comando duplicado/offline/expirado, acknowledge real y estado fail, tablet sin puente. Aceptación: comando seguro, acotado e idempotente; no se muestra ejecutado si no hay confirmación.
- Checkpoint contrato→implementación mínima→QA dispositivo; parar antes de habilitar bridge/permisos/red/secretos. Sin hardware disponible, no afirmar función completada.

### H03 — evolución Horizon por un vertical slice

- Origen reevaluación explícita. Depende H01/H02 y aprobación conceptual. Terra Alto para diseño; Muy alto para generador/reachability. Riesgo Medio.
- Proponer una experiencia acotada de 60–90 s opcional, por ejemplo “Airport Run” o “Wasatch Cruise”: scene/objetivos curados, oleadas reproducibles, ritmo y desenlace propio. Son ideas, no nuevo modo autorizado. Preservar endless actual como referencia/fallback.
- Evolución útil: RNG con seed, catálogo de patrones seguros, variety/cooldown, curva suave de dificultad y misiones ligeras; pruebas de camino alcanzable considerando tiempo de cambio de carril y oleadas anteriores. Una lane libre en cada wave NO prueba por sí sola solvencia temporal.
- No usar LLM durante la partida, generar obstáculos/texto de red en tiempo real, usar GPS real/Spotify como lógica, multiplayer ni backend nuevo. Modelos ayudan a diseñar/probar contenido offline y datos, no son un requisito runtime.
- Pruebas: muchas seeds reproducibles, patrones alcanzables, límites de densidad, equivalencia FPS, budgets en teléfono/tablet y feedback de primera partida. Aceptación: vertical slice claramente mejor/diverso y justo, sin degradar el modo existente.
- Checkpoint prototipo y decisión continuar/descartar antes de expandir. Sol Alto solo si Terra no resuelve una propiedad concreta de generación/equilibrio tras dos intentos documentados; Astra Alto para revisión del slice completo si hay decisión de arquitectura real. No usarlos para cambiar colores/assets.

## Backlog preservado — contratos de reactivación

Estas fichas son parte del mismo plan, no órdenes actuales. Cada reactivación debe convertirse en un subpaso acotado en HANDOFF, conservar su ID y detallar archivos. Todas heredan controles/commit/stop comunes.

| ID  | Modifica / valor                                                            | Dependencias, límites y parada                                                                                | Modelo / riesgo                                                                                | Pruebas y aceptación                                                                                                                                                 |
| --- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B01 | Tokens visualTheme y piloto Halloween, sin duplicar liteTheme               | UX04/UX05, assets/visual aprobados; parar antes de activación programada; no APIs/flags/modos dentro del tema | Terra Alto contrato; Luna Medio tokens/copy; riesgo Medio                                      | Completitud, unknown/expired→Original, manual vs schedule Denver, kidsSafe, contraste/reduced motion; no regresión Music/Clima; un tema primero                      |
| B02 | Category-first Around You y catálogo curado por lotes hacia 100             | Validar catálogo actual y campo; sin mapa/scraping/servidor GPS; assets/fuentes aprobados                     | Terra Alto selección/UX; Luna Medio datos verificados; riesgo Medio                            | Categorías offline/EN/ES, fuentes/licencias, matching estable, batería y GPS transitorio; calidad de lote antes del siguiente                                        |
| B03 | Juegos locales adicionales                                                  | B02 estable salvo Horizon explícito; no backend/identidad                                                     | Luna Medio para juego basado en patrón; Terra Alto si regla nueva; riesgo Bajo/Medio           | Rondas/reset/idle, accesibilidad, offline, repetición; una mecánica aprobada por vez                                                                                 |
| B04 | Complete/Kids, personalización y MC extendido                               | O03/PA02; decisión de privacidad antes de contexto; modos ≠ temas ≠ sesión; no inferir destino                | Terra Muy alto contrato; Luna solo UI especificada; riesgo Alto                                | Expiry/session reset, identidad no expuesta, Kids restrictivo, comandos autorizados, capability real; no feature flags incoherentes                                  |
| B05 | Pulse opcional/recuerdo de fin de viaje                                     | Señal de conductor autorizada, no GPS departure; evitar teclado/identidad                                     | Terra Medio contrato; Luna Medio UI; riesgo Medio                                              | Opt-in, dismiss, reset, datos mínimos; ninguna solicitud insistente ni PII                                                                                           |
| B06 | Validación de tip/payout y reseñas live; conservar checkout QR ya unificado | R04, decisión de pagos/reseñas; parar antes de cobro o payout real; no repetir la unificación publicada       | Terra Alto para contrato/validación; Luna Medio solo si se aprueba copy; riesgo Alto si dinero | Preservar Venmo, Cash App y una opción Apple Pay/Google Pay/Card vía Stripe; receptor correcto, review approved only; propietario valida cobro/payout si lo autoriza |
| B07 | Evidencia Fully/Lite/test controls/backup de equipo                         | Reutilizar setup existente; no reset único dispositivo ni re-pair diario; retratar solo parte no demostrada   | Terra Medio runbook; Alto para bridge; riesgo Medio                                            | Idle90/rail30, modo test15/10 aislado, cold/wake/offline en tablet; backup solo spare/reinstall autorizado; no confundir screen-off/power-off                        |
| B08 | Assets finales por superficie                                               | Mapa propietario; sin asumir theme slots no existentes ni cambiar imágenes de otra superficie                 | Luna Medio optimización/slots existentes; Terra Medio si contrato nuevo; riesgo Bajo           | Crop/orientación/peso/licencia/alt/fallback, fotos auténticas, Storage por tenant; región aprobada sin rediseño incidental                                           |

## SaaS en standby — ninguna dependencia artificial de UX actual

| ID  | Modifica / valor futuro                                                                     | Dependencias y no tocar                                                         | Modelo / riesgo                                            | Reactivación, pruebas y cierre                                                                                                                        |
| --- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| C01 | Defaults neutrales, payments/contact propios, onboarding/publicación y nuevas instalaciones | S05/R04/PA02; preservar Juan; no altas públicas de prueba                       | Terra Alto/Muy alto contrato; Luna Medio UI; riesgo Alto   | Decisión de incorporar otro operador; fixtures A/B, ningún pago heredado, draft incompleto no publica; migración controlada                           |
| C02 | Evaluación de oferta musical/licencias y fallback comercial                                 | Propietario/proveedor; no detener mejoras personales seguras por este estudio   | Terra Alto análisis; riesgo Bajo en evaluación             | Decisión comercial escrita antes de prometer/monetizar; un modelo no otorga permiso legal. Problema de uso actual vuelve a PA02 con alcance explícito |
| C03 | Piloto 3–5 drivers, métricas de soporte/ahorro/disposición a pagar                          | C01, V01 y oferta aprobada; no convertir la app en marketplace                  | Terra Medio plan; Luna Medio materiales; riesgo Medio      | Reactivación expresa de comercialización; criterios éxito/fracaso previos y evidencia real, no solo encuestas positivas                               |
| C04 | Suscripción SaaS/entitlements/billing/soporte                                               | C03 validado; separado del cobro del viaje                                      | Terra Muy alto billing; Luna Medio onboarding; riesgo Alto | Webhooks duplicate/out-of-order, cancel/past_due/recovery, aislamiento y límites; probar sandbox antes de dinero real                                 |
| C05 | Exportación/baja autoservicio, condiciones y operación multi-cliente                        | C01/C03, profesional competente cuando corresponda; no borrar clientes actuales | Terra Alto flujos; Luna Medio docs; riesgo Alto            | Tenant export/delete aislado, backups/retención claros y recuperación; aprobación humana antes de datos reales                                        |

## Cuándo debe volver Astra

### Revisión intermedia G1 — condicional, no dependencia rutinaria

Terra Muy alto verifica normalmente las matrices y evidencias de F1–F3. Volver a Astra Alto/Muy alto antes de ampliar UX solo si queda una tensión real entre autorización, transacción, promo, Calendar o compatibilidad que Terra no haya resuelto de forma fiable, o el cambio aprobado ha alterado varios contratos de alto riesgo a la vez. Entregar caso mínimo, diff, decisiones y tests; no pedir otra auditoría desde cero. No usar Astra para aprobar un formulario cuyo contrato ya esté cerrado.

### Horizon — escalada limitada

H01/H02 no necesitan Astra como implementador. H03 puede justificar Sol Alto para revisar una propiedad concreta del generador y Astra Alto para valorar una evolución sistémica con prototipo/evidencia. Condición: Terra documenta límite/fracaso o hay una decisión real de arquitectura/experiencia, no simplemente deseo de gráficos mejores.

### V01 — auditoría final solicitada

- Modelo: Astra Muy alto; Max solo si aparecen conflictos especialmente difíciles, nunca por defecto. Riesgo Bajo porque es read-only. No implementar fixes durante la auditoría final.
- Antes: F1–F5 cerrados con evidencia o excepciones explícitas aceptadas que no sean P0/integridad abierta; F6 ejecutado o diferido conscientemente; SaaS/B backlog identificado standby. No exigir comercialización para reauditar la operación actual.
- Entregar: auditoría original, ROADMAP/HANDOFF, commits/CI, migraciones aplicadas, matrices tarifarias/permisos, fallos inyectados/retry, comparativas visuales responsive, QA autenticado y tablet real, regresiones Horizon/FPS y política legacy.
- Revisar: cada hallazgo corregido contra su reproducción original; permisos reales tras migraciones, flujo money/Calendar, rendimiento medido vs baseline, accesibilidad/estados vacíos y calidad visual completa. Distinguir código correcto de evidencia de producción/vehículo.
- Cierre: lista de resueltos, parciales y nuevos hallazgos con severidad; ningún P0 abierto ni pérdidas de datos/dinero conocidas; no reactivar C01–C05 por curiosidad. Si no se puede comprobar una capa, declararla pendiente en vez de emitir certificación total.
- Checkpoint V01: informe final y actualización maestro en un cambio documental autorizado; no cambios automáticos de producto ni commit de PII.
