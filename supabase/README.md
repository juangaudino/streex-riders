# Supabase — estado y disciplina operativa

Actualizado 2026-09-05. Referencia técnica; plan/estado global en [ROADMAP](../docs/ROADMAP.md) y reanudación en [HANDOFF](../docs/HANDOFF.md).

## Producción actual

STREEX Rides usa su proyecto Supabase standalone, desplegando la aplicación en Vercel. No está en una migración inicial desde Lovable Cloud. Nunca apuntar a Streex Gig Earnings ni a otro proyecto por semejanza de nombre.

La auditoría del 2026-09-05 verificó en lectura esquema/historia de migraciones, incluidas las tablas de Pricing. El checkpoint documental no volvió a consultar ni modificó producción.

- 20260715035104_multi_tenant_super_admin.sql: base multi-tenant ya existente, no nuevo bootstrap.
- 20260830015239_pricing_engine.sql: aplicada. Profiles/zones/flat rates/promotions/referrals/quotes/redemptions existen.
- Analytics Passenger incluye sessions, events y engagements. Su migración de engagements ya forma parte del baseline auditado.
- Google Calendar OAuth/conexiones por tenant/free-busy/sync confirmed ya existen.
- Auth + memberships DB es la única autorización Admin. No hay ADMIN_ACCESS_KEY de emergencia que se deba activar.

## Qué representan los archivos

- migrations/: historia versionada, no una cola para ejecutar indiscriminadamente. Incluye etapas antiguas y actualizaciones posteriores; comparar historia remota antes de cualquier aplicación.
- production_schema.sql, availability_phase_4_1.sql y booking_service_type_phase_4_2.sql: snapshots/scripts históricos de bootstrap. NO constituyen una instalación nueva completa ni deben repetirse sobre producción.
- tests/prevent_schedule_overlaps.sql: prueba SQL existente. Revisar destino/datos/transacción y obtener autorización antes de ejecutarla; no asumir inocuidad por tener “test” en el nombre.

## Procedimiento para un cambio futuro autorizado

1. Leer la tarjeta correspondiente en EXECUTION_PLAN; confirmar entorno y autoridad, sin imprimir secretos.
2. Inspeccionar esquema e historia de migraciones en lectura. No repetir reparaciones pasadas.
3. Preparar cambio aditivo y pruebas en entorno aislado. Mantener RLS, USING/WITH CHECK y permisos de funciones/Storage acordes al contrato.
4. Si se propone función privilegiada, justificarla, fijar search_path y restringir EXECUTE. Preferir invoker cuando alcance; nunca añadir definer como bypass.
5. Validar dos tenants/usuarios y casos denegados, incluidos Data API directa y tenant suspendido/archivado. El uso actual de un único operador no elimina este riesgo.
6. Revisar migración, rollback/forward recovery y respaldo. Parar antes de tocar producción hasta tener autorización.
7. Aplicar solo la migración nueva aprobada, verificar resultado y registrar por separado commit de código, migración aplicada y QA real.

Migration repair solo registra como aplicada una migración demostrablemente presente. No usarlo para silenciar diferencias desconocidas. No ejecutar db push a ciegas ni exponer service_role. Consultar ayuda/documentación vigente antes de usar comandos CLI.

## Pricing / Maps

GOOGLE_MAPS_SERVER_KEY es server-only y necesita Routes, Places (New) y Geocoding. Su configuración histórica no demuestra que la llamada concreta de hoy esté autorizada. VITE_GOOGLE_MAPS_BROWSER_KEY solo autocomplete.

P01 debe distinguir status de API en HTTP 200, error HTTP, ZERO_RESULTS, denegación y timeout. No registrar claves ni URLs que las contengan. Las tablas aplicadas no prueban que el flujo reserva → quote → envío haya superado QA.

## Avisos y límites actuales

RLS de tablas operativas y suspensión requieren S05. Tablas privadas sin policies/browser grants pueden ser deny-by-default correcto: no abrirlas para eliminar un aviso informativo. Cifrado/token de proveedor, firma de webhook y UI Admin protegida no sustituyen autorización/transacciones/reintentos.

No ampliar permisos, cambiar Auth, configurar secretos, hacer backups/exportaciones con datos reales ni borrar datos durante una tarea documental.
