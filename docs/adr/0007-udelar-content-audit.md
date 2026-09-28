# ADR 0007: Auditoría de contenido UDELAR (verificación contra fuente oficial)

Fecha: 2026-09-28
Estado: aceptado
Alcance: `web/src/content/careers/*udelar.md` (458 → 456 fichas).
Rama: `fix/udelar-careers-quality`.
Aplica el estándar de ADR 0001; aquí solo lo específico de Udelar.

## Método

11 lanes paralelos con listas de fichas disjuntas (verificado: cubren las 458
sin solaparse), cada uno contra ficha `udelar.edu.uy/carrera/<slug>` + sitio
de facultad/sede + CAP (`cap.posgrados.udelar.edu.uy`, campo Vigente para
posgrados). Sin commits de los lanes; consolidación, `pnpm check` y commits
por lane en el parent.

## Resultado

455 fichas: **448 visibles (`draft: false`), 7 en draft** (dato puntual sin publicar, documentado abajo), 3 eliminadas. `pnpm check` limpio, 0 `similar` rotos,
0 placeholders (`No especificado`, `shift` inventado, deadlines con texto).

- Grado (143): 143/143 visibles. 18 duraciones corregidas en salud (el
  `Duración (meses)=60` genérico del catálogo estaba mal en casi todo
  EUTM/Parteras; mandan los planes de FMed), Medicina 5→7 años, Odontología
  5→5,5, Lic. en Computación 5→4, Tecnólogos contra plan Fing/CURE.
- Posgrados (313): 290 visibles. Descripciones truncadas/artefactos PDF
  reescritas; 81 links muertos a `egradu.fmed.edu.uy` eliminados;
  `applicationDeadline` basura fuera; títulos con typos corregidos en
  `title` (Énfasis, MBA, Transfusional, Cuidados) conservando slug.
- Bajas (`remove:`): gestión-y-economía-del-turismo-sustentable
  (CAP `Vigente: No`, última inscripción 2013),
  intervenciones-comunitarias (ficha CAP mínima sin duración/créditos,
  sin modificar desde 2018) y políticas-públicas-en-crimen-e-inseguridad
  (CAP `Vigente: No`; FCS la sustituyó por el Diploma en Políticas
  Públicas 2026-2028). Refs `similar:` podadas en las fichas que las
  citaban.

## Decisiones Udelar-específicas

1. **Créditos FMed se publican literales del CAP** (hasta 1690 en
   Neurocirugía): es la escala oficial del servicio, aunque no equivalga al
   crédito Udelar de 15 h. p_med_a los omitió por desconfianza; se acepta la
   disparidad documentada antes que la invención.
2. **Costo de posgrados FMed/Fenf/FO/Psico: `Gratuita`** donde el CAP publica
   `Cobro de derechos universitarios: No`. Aranceles FCEA/Derecho en $/UR del
   CAP van en `cost` + detalle en cuerpo.
3. **Planes de facultad mandan sobre el catálogo central** en duración
   (patrón repetido en Medicina, Fing, CURE, FVET-equina 225→254 cr).
4. **Desviación de ADR 0001.8**: un commit por carrera es inviable a esta
   escala; se commiteó por lane (11) + prune de refs. Trazabilidad por ficha
   en los reportes de lane, no en el log.
5. Slugs con typo (`ciudados`, `orientancion`, `transplantes`) se conservan
   por ahora con título corregido; renombre pendiente con actualización de
   `similar:` (barato pre-producción).

## Ronda de resolución de drafts (2026-09-28, parent)

15 de los 23 drafts se resolvieron contra la fuente de facultad/sede:
FCEA publica oferta e inscripciones 2026 (gestion-TI, sist-info-mae,
 sist-info-esp, econ-inclusión: vigencia + precios confirmados en sus
páginas); FDer publica costo (141,75 UR), horarios y créditos (64) de
Derecho Procesal; CEINBIO reglamenta la Maestría en Alimentos sin cobro;
Artes confirma cursado presencial de sus tres maestrías en convocatoria
compartida (costo registrado gratuito por programa hermano sin cobro y
convocatoria sin arancel, con nota); FIC confirma segunda cohorte 2026 de
Comunicación de la Ciencia; ANEP confirma modalidad presencial y estado
(En curso / Próximamente) de geografía, educación-ambiental y gramática;
FCS mantiene viva la Maestría en Sociología y Métodos (se publica con
nota sobre la discrepancia CAP–facultad en créditos y vigencia).

## Pendiente (7 drafts, no bloquean)

- auditoría (FCEA): sin oferta 2026, última inscripción 2018, modalidad
  no publicada. contabilidad-y-auditoría (FCEA): última inscripción 2017
  y monto CAP inconsistente ($ 0,00).
- didáctica-primaria, educación-desarrollo, gestión-inst-educativas
  (convenio ANEP): fichas CAP mínimas; sin página ANEP/CFE que confirme
  modalidad ni cohorte (el portal ANEP solo lista geografía,
  ed-ambiental y gramática). Ojo contexto: CODICEN dejó sin efecto en
  feb-2026 la ordenanza de posgrados propios del CFE.
- gestión-enfermería (Fenf): CAP sin objetivo/programa/duración y monto
  $ 0,00.
- hemato-oncología-pediátrica (FMed): vigente (llamado ago-2026) pero
  CAP sin duración ni costo.
Re-chequear por ciclo de convocatorias (regla ADR 0001.6).
