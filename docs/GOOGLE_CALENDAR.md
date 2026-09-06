# Google Calendar — contrato técnico y operación

Actualizado: 2026-09-05. Este documento reemplaza GOOGLE_CALENDAR_ROADMAP como referencia técnica; no mantiene un roadmap paralelo. Prioridad/estado en [ROADMAP](ROADMAP.md), ejecución en R01/R02 de [EXECUTION_PLAN](EXECUTION_PLAN.md), reanudación en [HANDOFF](HANDOFF.md).

## Baseline existente

OAuth, free-busy y sync de reservas confirmed están implementados y tienen evidencia histórica de producción, incluyendo confirmación/cancelación/notificaciones. Este checkpoint documental no repitió esos ensayos. No crear una segunda sincronización.

- Conexiones/tokens cifrados y OAuth state de un solo uso vinculados al tenant.
- Selección de calendarios y connect/disconnect en Admin.
- Lectura busy server-side de calendarios seleccionados; no exponer detalles privados de eventos.
- Free-busy timeout 5 s y cache exitosa 60 s. Si una conexión activa no puede comprobarse, disponibilidad falla cerrada.
- Sync idempotente de confirmed con google_calendar_id/google_event_id/estado y retry manual.
- Crear/update/delete del evento cuando corresponda según estado STREEX; no invitar pasajeros automáticamente.

## Autoridad y privacidad

STREEX manda en el estado de reserva. Un evento Google movido/borrado no cancela ni modifica silenciosamente un booking. Leer busy del calendario personal y del dedicado configurados; escribir solo en el dedicado STREEX Rides.

El evento operativo existente incluye nombre, contacto y viaje para el conductor; mantenerlo privado, con extended property de booking y permisos mínimos. No enviar esos datos a Passenger/analytics ni copiar logs de eventos a documentos.

## Límites y decisiones pendientes

La recuperación programada de fallos parciales y la reconciliación completa no se consideran terminadas. R02 define su orden y necesita una decisión sobre restauración manual/automática de eventos editados en Google. Retry manual es la referencia hasta aprobar otra política, no una nueva función asumida.

Watch channels, su renovación y sync tokens son una posible extensión de R02, diferida mientras recuperación acotada aporte más valor. No existe otra cola “Phase 3” que prevalezca sobre el roadmap maestro.

Duración predeterminada de un booking y ausencia de buffers no prueban viabilidad de un trayecto; R01 debe mantener los triggers existentes y cubrir duración operativa. Adyacencia exacta es válida en el modelo actual, salvo buffer explícito acordado.

## Contrato de QA para cambios autorizados

- Busy elimina slots superpuestos, incluido Hourly y límites overnight/DST.
- Confirmación repetida no crea dos eventos.
- Cambio/cancelación/completado siguen la política acordada y no dañan otro tenant.
- Revocación/timeout/outage tienen estado visible y recuperación; no doble reserva silenciosa.
- Reintento repetido y evento manualmente borrado/movido no pierden autoridad STREEX.
- Correo y Calendar son efectos externos: deben deduplicarse/reintentarse fuera de la transacción DB.
- Validación autenticada y un caso real autorizado se registran por separado de mocks y tests locales.

No conectar cuentas, aplicar migraciones, crear schedulers o enviar notificaciones durante una tarea documental. No volver a configurar OAuth solo porque un handoff antiguo lo presente como pendiente.
