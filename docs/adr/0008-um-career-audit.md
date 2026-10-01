# ADR 0008: Auditoría de carreras UM

Fecha: 2026-09-30
Estado: aceptado
Alcance: 81 fichas UM (`website` en `*.um.edu.uy`, `ieem.edu.uy`).
Aplica el estándar de ADR 0001; aquí solo lo específico de UM.

## Fuentes propias

Fichas por facultad en `um.edu.uy` + IEEM (`ieem.edu.uy/mba`) + catálogo
`catalogo.um.edu.uy` (mejor fuente disponible donde no hay ficha individual:
especialidades en terapias contextuales). Contacto = teléfonos/formulario por
sede (emails por programa solo donde publicados: `cpi@`, `umpe@`,
`postgradospsicologia@`, `biomedicas@`, `ingenieria@` confirmados en ficha o
noticia oficial). Costo `Arancelada` sin montos (no publicados).

## Estado inicial

81/81 en `draft`. Todas con `weeklyHours: "No especificado"` y `shift`
sin verificar.

## Decisiones UM-específicas

- `shift`/`weeklyHours` eliminados salvo turno publicado en la ficha
  (conservados donde hay horario: ej. Lic. en Informática nocturna,
  diplomas UMPE con días/horas, MBA Senior jueves mañana).
- `degreeType` alineado al título oficial (Postgrados de Especialización →
  `especializacion`; Diplomas → `diplomado`; Maestrías/Masters/MBA/LLM →
  `maestria`; Magisterio/Profesorado documentados según título oficial).
- 4 postgrados UMPE con nota "sin registrar en el MEC" (dato de la propia
  fuente oficial, análogo a ORT "en trámite").
- Fechas vencidas reetiquetadas ("consultar próxima convocatoria"); próximos
  módulos/inicios futuros solo mencionados en cuerpo, sin `startDate` salvo
  día confirmado.
- Sin renombres de slug (postgrado-gestión-contable conserva slug aunque el
  título oficial pasó a "Asesoramiento Contable").

## Resultado

81/81 verificadas y visibles, 0 en draft, 0 eliminadas.
Rama `feat/um-careers-audit` (6 commits por lane).
