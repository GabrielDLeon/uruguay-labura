# ADR 0004: Auditoría de carreras UDE

Fecha: 2026-09-28
Estado: aceptado
Alcance: 67 fichas UDE (`website` en `ude.edu.uy`).
Aplica el estándar de ADR 0001; aquí solo lo específico de UDE.

## Fuentes propias

Fichas por facultad en dominio único `ude.edu.uy` + registro MEC
"Universidades y Carreras" (PDF, feb 2026, citado en `sources[]` donde se
afirma reconocimiento). Contacto = formulario/teléfonos por sede (ninguna
ficha publica email; `sperezbarrera@ude.edu.uy` removido de 3 cuerpos por no
figurar en fuente oficial). Costo `Arancelada` sin montos (no publicados).

## Estado inicial

67/67 en `draft`. Ningún espejo `docs/ude`.

## Decisiones UDE-específicas

- `shift` eliminado en las 67 (ninguna ficha UDE publica turno; los horarios
  que existen quedan en el cuerpo). `weeklyHours: "No especificado"` fuera
  (salvo doctorado 30 h y maestría educación 25 h, publicados).
- `location`: UDE publica sede por carrera rara vez; se recorta a lo citado
  (ficha o MEC 2026). EDE + virtual → "Montevideo, Campus Virtual".
- MEC 2026 (feb) manda sobre el registro 2019: Enfermería, Educ. Física y
  RRII **sí reconocidas** (se mantiene `accreditation`); Comercio Exterior
  solo Montevideo; Admin. Empresas/Fisio/Imagenología/Informática/Marketing
  conservan multi-sede verificada.
- 7 maestrías sin `accreditation` → agregada con fuente MEC (Criminológicas,
  Derecho-Integración, Gestión Ambiental, MBA, Marketing, AH académica y
  profesional). Escribanía/Abogacía: trámite = Plan 2024 (nota en cuerpo).
- `degreeType` → `diplomado` donde el título otorgado es Diploma
  (Agronegocios, Commodities, Producción Animal + título alineado).
- Títulos ejecutivos alineados al oficial (Marketing y Dirección Comercial;
  Dirección del Capital Humano); slug Educ. Física → `deportes` (oficial).
- Fechas vencidas quitadas o etiquetadas "consultar próxima convocatoria";
  claves vacías `startDate`/`applicationDeadline` eliminadas.
- Instructor de Equitación Terapéutica: existe pero sin MEC y con
  `degreeType` dudoso ("curso" oficial) → queda en `draft` hasta verificar plan.

## Resultado

66/67 verificadas y visibles, 1 en draft (hold). Rama `feat/ude-careers-audit`.
