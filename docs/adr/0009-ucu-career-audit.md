# ADR 0009: Auditoría de carreras UCU

Fecha: 2026-09-30
Estado: aceptado
Alcance: 91 fichas UCU (`website` en `carreras.ucu.edu.uy`).
Aplica el estándar de ADR 0001; aquí solo lo específico de UCU.

## Fuentes propias

Catálogo único `carreras.ucu.edu.uy/programas/ver/<slug>--<sede>--<modalidad>`
(la URL codifica sede y modalidad: evidencia para `location`/`modality`);
postgrados redirigen a `postgrados.ucu.edu.uy` (las URLs siguen resolviendo
200 vía redirect). Contacto = genéricos de campus (ninguna ficha publica
email por programa, salvo doctorados: `doctoradoingenieria@`,
`doctoradopsicologia@`). Costo `Arancelada` sin montos (no publicados).

## Estado inicial

91/91 en `draft`. Todas con `weeklyHours: "No especificado"`.

## Decisiones UCU-específicas

- `location` por sede publicada en la ficha (Montevideo / Salto / Punta del
  Este o combinaciones); nunca multi-sede asumida.
- Pares presencial/semipresencial (Psicología, Psicopedagogía) = fichas
  propias distintas (distinta URL oficial), no duplicados. Títulos
  intermedios con ficha propia se conservan (ADR 0001.4).
- Turno "Intermedio" (13:50–18:10) no mapea al enum `shift` → se omite la
  clave y el horario queda documentado en cuerpo (Fisioterapia,
  Fonoaudiología, Psicomotricidad, Acompañamiento Terapéutico).
- `accreditation` solo si la ficha la respalda; si dice "en proceso" →
  "En trámite de reconocimiento (MEC)" o se quita (Filosofía, Marketing,
  Ciencias del Comportamiento, 9 ingenierías nuevas).
- Bajas (`remove:`, 404 en ambos dominios + ausentes del catálogo):
  diploma-en-diseno-y-desarrollo-curricular,
  diploma-en-innovacion-educativa (oferta reemplazada),
  maestria-en-curriculum-y-aprendizaje,
  maestria-en-epidemiologia-y-salud-digital. Refs `similar:` podadas en
  13 fichas UDE/ORT/UTEC/Udelar/UCU que las citaban.

## Resultado

87 visibles (`draft: false`), 4 eliminadas, 0 en draft.
Rama `feat/ucu-careers-audit` (7 commits por lane + prune de refs).
