# Passenger / Around You — referencia técnica

Actualizado: 2026-09-05. No es un roadmap ni handoff. Orden/estado en [ROADMAP](ROADMAP.md), tareas B02/B07/UX05 en [EXECUTION_PLAN](EXECUTION_PLAN.md).

## Baseline comprobado en fuente

- Código local en src/features/passenger/around-you/. Catálogo actual: 32 entradas, incluidas regiones amplias etiquetadas; no son los 8/19 lugares de los informes históricos. Expandir a 100 no está implementado por escribirlo en el backlog.
- CONFIG aroundYou.enabled true; Home card visible; no primera pestaña Lite; showIdleCard false. Enabled no significa visible en toda navegación.
- Muestreo getCurrentPosition, no watcher continuo: solo Home/Around You visibles, intervalo configurado 5 min; highAccuracy false; permiso/estado soportado por navegador. No restaurar el watchPosition/8 s de la fundación histórica.
- Posición transitoria, filtros de calidad/salto y último fix útil con ventana de 5 min; engine puro con ranking, dwell/hysteresis/cooldown. No usar desktop inmóvil para ajustar calidad real GPS.
- Catálogo, copy EN/ES y assets locales; Explore Utah/offline cuando no hay posición. No mapas, live business scraping ni un backend de geolocalización.

## Privacidad y Clima

El matching Around You es local. No guardar raw GPS, permisos ni historial de posición en URLs/storage/analytics/logs. Clima reutiliza una zona redondeada (~1 km) para su consulta NWS a través del servidor; no afirmar que esa consulta agregada equivale a un historial GPS enviado, ni que ningún dato de ubicación sale jamás del navegador.

No añadir otro tracker al rediseñar Home, Clima o categorías. Pausar muestreo en Music/Games/STREEX/idle. Retener offline UI honesta, no inventar posición actual.

## Verificación de campo pendiente por cambio

Validación previa de permiso en tablet no prueba todas las rutas/umbrales. No pedirla diariamente ni volver a habilitar la feature como si aún estuviera apagada.

Al ejecutar la tarea autorizada: cold start/wake/volver a Home, no permission spam, frecuencia baja, downtown/airport/canyon/Park City, túnel/fix pobre/hotspot offline, estabilidad sin flicker, landscape y EN/ES. Registrar estados/tiempos saneados, nunca coordenadas crudas. Comprobar no regresión en Music/idle/Clima; dispositivo físico lo valida el propietario cuando no esté disponible para el agente.

## Procedencia

[Sol histórico](archive/2026-09-05/AROUND_YOU_SOL_HANDOFF.md) y [Luna histórico](archive/2026-09-05/AROUND_YOU_LUNA_HANDOFF.md) preservan fundación/product pass. Sus flags, GPS, catálogos y órdenes de implementación están superados. No seguir el enlace antiguo a specs.md ni sus instrucciones de habilitación como pasos actuales.
