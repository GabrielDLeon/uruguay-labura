# ADR 0010: Búsquedas guardadas y centro de novedades local

Fecha: 2026-10-07
Estado: aceptado
Alcance: `web/src/lib/saved-searches.ts`, `web/src/lib/search-news.ts`, `web/src/lib/storage.ts`, `web/src/components/jobs/`, `/empleos/guardados`.

## Contexto

El sitio agrega llamados de fuentes externas y ya permite guardar empleos
puntuales en `localStorage` (`savedJobs`, `/empleos/guardados`). Los usuarios
repetían las mismas búsquedas (organismo, tipo de tarea, cupos, texto) para
detectar llamados nuevos, sin forma de saber qué cambió desde la última visita.

Se quiere resolver eso sin sumar infraestructura: nada de login, backend de
usuarios, correo ni push notifications. El sitio es estático (Astro) y el
dataset de llamados se descarga y filtra en el cliente.

## Decisión

1. **Persistencia local, sin cuenta.** Las búsquedas guardadas viven en
   `localStorage` bajo la clave versionada `ul:savedSearches:v1`. La "cuenta" es
   el navegador: limpiar datos o cambiar de dispositivo pierde los datos. Es el
   mismo trade-off ya aceptado para los empleos guardados.
2. **Los criterios son los del tablero.** Una búsqueda guardada reutiliza
   exactamente los mismos filtros que serializa `JobsBoard` en la URL
   (`q`, `org`, `type`, `afro`, `disc`, `trans`, `vict`). El predicado de
   filtrado es uno solo (`filterJobs` en `src/components/jobs/jobs.ts`), así el
   tablero y las búsquedas no divergen.
3. **Novedad = diff contra un snapshot.** Cada búsqueda guardada almacena
   `seenJobIds` (las coincidencias al momento de guardarla o de marcarla como
   vista). Al cargar el dataset, las **novedades** son las coincidencias
   actuales que no están en `seenJobIds`; el badge principal cuenta solo eso.
   El detalle de cada búsqueda muestra **todo el listado vigente** que engloba
   (no solo los nuevos), y marca con “Nuevo” los que son novedad, con un filtro
   “Solo nuevos”. La urgencia por cierre se ve en la columna “Cierre”. Se limpian
   con "Marcar como visto", que reemplaza `seenJobIds` por las coincidencias
   actuales.
4. **Sin push.** El cálculo ocurre al entrar al sitio. No se notifica fuera de
   la app: el dataset solo está disponible en el cliente cuando hay una visita.
   El copy de la página lo dice explícitamente para no prometer avisos en
   background.
5. **Una sola sección de guardados.** Empleos favoritos y búsquedas guardadas
   viven en la misma página `/empleos/guardados`, una sección debajo de la otra
   (primero empleos, después búsquedas). No hay tabs ni badge de novedades en el
   header: el conteo vive en las tarjetas de búsqueda.
6. **Sin detección de cierres.** El dataset solo trae llamados activos (los
   cerrados no llegan al cliente), así que no se puede notificar "este llamado
   cerró". La señal de urgencia es "cierra pronto" por fecha, no un cambio de
   estado.
7. **Refactor de storage.** `savedJobs` y `savedSearches` comparten
   `src/lib/storage.ts` (lectura/escritura seguras ante SSR y cuota, más aviso
   de cambios en la misma pestaña y entre pestañas vía evento `storage`).

## Alternativas consideradas

- **Email o push vía backend** → rechazada: requiere cuentas, envío y
  almacenamiento de suscripciones; contradice la restricción de no sumar
  infraestructura.
- **Notification API del navegador sin backend** → rechazada por ahora: solo
  avisa con la pestaña abierta o con soporte irregular de background sync; no
  cambia el hecho de que hace falta una visita.
- **Guardar los criterios en la URL de la búsqueda** (compartible) → posible a
  futuro; la v1 prioriza el centro de novedades local.

## Consecuencias

- Cero infraestructura nueva; funciona offline respecto de cualquier servicio
  propio.
- La novedad es por navegador: dos dispositivos no comparten estado.
- Si el usuario no entra por mucho tiempo, los llamados que abrieron y cerraron
  en el medio no aparecen como nuevos.
- Los datos quedan en el dispositivo del usuario; conviene mantener el aviso
  visible ("se guarda en tu navegador") en la página de guardados.
