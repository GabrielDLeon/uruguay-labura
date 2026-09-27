# ADR 0001: Estándar de verificación de carreras (todas las instituciones)

Fecha: 2026-09-27
Estado: aceptado
Alcance: todas las fichas en `web/src/content/careers/`, cualquier institución.
Primera aplicación: ADR 0002 (UTEC).

## Contexto

La auditoría UTEC (43 carreras) mostró los males típicos: campos ausentes o con
"No informada" aunque la fuente los publica, sedes erróneas, turnos inferidos,
emails sin confirmar, fechas de convocatoria vencidas presentadas como vigentes,
slugs divergentes de la URL oficial y snapshots internos sin fecha compitiendo
con la fuente real. Sin estándar escrito, "calidad excepcional" no es verificable
y cada institución se auditaría con una vara distinta.

## Decisión

1. **La fuente oficial manda.** Jerarquía ante conflicto:
   1. ficha oficial de la carrera en el sitio de la institución;
   2. documentos oficiales del dominio institucional (planes de estudio PDF,
      resoluciones, catálogos);
   3. noticias oficiales del dominio institucional (válidas, p. ej. para un email
      de contacto que la ficha no publica);
   4. prensa y terceros: solo corroboración secundaria, nunca fuente.
   Los snapshots internos (`docs/<institucion>/` y similares) son material de
   trabajo transitorio: se **borran** al cerrar cada auditoría.
2. **Checklist de carrera verificada** (100% para pasar a visible, `draft: false`):
   - `website` responde 200 y es la ficha oficial de esa carrera;
   - `title/short/institution/degreeType/area` correctos;
   - `modality/shift/duration/location/cost` verificados; prohibido "No informada"
     si la fuente lo publica; si la fuente no lo publica, se omite la clave
     (los campos opcionales) en vez de inventar;
   - `description` sin marketing inventado; `contactEmail` solo si confirmado;
   - `sources[]` con al menos la URL oficial (+ documentos citados, si aplican).
3. **Grados de evidencia.** Confirmado en ficha/documento oficial → se publica.
   Corroboración secundaria → se publica solo si no hay mejor fuente y se cita la
   mejor disponible. No verificado → se quita (el campo es opcional) hasta confirmar;
   no bloquea la visibilidad del resto de la ficha.
4. **Títulos intermedios no son duplicados.** Tramo de una carrera plena con título
   propio → ficha propia linkeada con `similar:`. Solo se elimina ante repetido
   directo (misma página oficial y mismo nivel).
5. **Carrera inexistente o descontinuada → se borra** (commit `remove:`), con
   redirect si aplica. No se esconde en `draft`.
6. **Fechas y cohortes.** Nunca publicar fechas vencidas como vigentes:
   `startDate`/`applicationDeadline` solo con valores futuros, si no se quitan;
   en cuerpo, etiquetar "última cohorte / preinscripción cerrada" o
   "sin convocatoria vigente". Las convocatorias rotan: re-chequear por ciclo.
7. **Slugs canónicos.** El nombre de archivo debe coincidir con el slug de la URL
   oficial. Renombrar es barato pre-producción; con tráfico real exige redirect 301.
8. **Workflow.** Rama `feat/<institucion>-careers-audit`, un commit por carrera en
   inglés one-line (`fix(<inst>): verify <slug> against official source`), sin
   mergear sin OK del dueño. Glosario afectado vive en `web/CONTEXT.md`.

## Alternativas consideradas

- Vara parcial para visibilizar rápido → rechazada: fija un estándar bajo que el
  resto hereda.
- Conservar snapshots internos como fuente → rechazada: compiten con la fuente
  oficial y se pudren sin fecha.
- Un solo commit por institución → rechazado: pierde trazabilidad por carrera.

## Consecuencias

- Cada institución se audita con este checklist sin re-grillear; su ADR de
  aplicación solo registra lo específico (fuentes propias, casos raros, cierre).
- Requiere fetch real del sitio vivo por carrera; lo no verificable se quita,
  no se inventa.
