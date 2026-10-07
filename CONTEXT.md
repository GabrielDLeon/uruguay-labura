# Uruguay Labura

Sitio que centraliza oportunidades en Uruguay: educación (carreras, instituciones, becas) como núcleo de contenido, y empleo (llamados) de forma más ligera vía agregación de fuentes externas.

## Language

**Institución**
Organización que imparte carreras (universidad, instituto, UTU). Puede ser pública o privada.
_Avoid_: facultad, escuela, centro

**Carrera**
Programa de estudios conducente a un título, ofrecido por una institución.
_Avoid_: curso, programa, carrera universitaria

**Beca**
Ayuda de financiamiento (estatal, privada o internacional) para estudiar.
_Avoid_: subsidio, crédito, financiación

**Nivel**
Etapa educativa del beneficiario, común a becas y carreras: grado, posgrado, técnico, diplomado o educación media.
_Avoid_: ciclo, nivel educativo, grupo

**Tipo de grado**
Categoría específica del título: maestría, doctorado, licenciatura, tecnicatura, ingeniería…
_Avoid_: grado, nivel

**Fuente oficial**
Página de la carrera en el sitio de la institución (para UTEC: `utec.edu.uy` y `descubri.utec.edu.uy`). Es la única fuente que manda ante conflicto; notas internas como `docs/utec/` son material de trabajo transitorio, no fuente.
_Avoid_: fuente secundaria, nota interna como fuente

**Carrera verificada**
Carrera cuya ficha pasó el checklist contra su fuente oficial: website responde 200 y es la ficha oficial, title/short/institution/degreeType/area correctos, modality/shift/duration/location/cost/contacto verificados, description sin inventos, y `sources[]` con URL oficial + fecha de verificación. Sin esto no se considera completa por más campos llenos que tenga.
_Avoid_: carrera completa (sin verificar), carrera actualizada (sin fecha)

**Carrera visible**
Carrera con `draft: false` (más `listable: true`). Solo una carrera verificada al 100% del checklist puede pasar a visible. `draft: true` = en trabajo, no se genera ni se lista.
_Avoid_: carrera publicada, carrera activa

**Título intermedio**
Título otorgado al completar un tramo de una carrera plena (ej: Tecnólogo en Logística al 3er año de Ingeniería en Logística). No es duplicado: se modela como carrera propia linkeada vía `similar:` a la carrera plena.
_Avoid_: duplicado, subtítulo

**Llamado**
Oferta de empleo publicada, típicamente apertura de concurso (a menudo en el sector público).
_Avoid_: concurso, empleo, puesto

**Búsqueda guardada**
Conjunto de criterios de filtrado de llamados que el usuario persiste en su navegador, sin cuenta. El criterio es el mismo que el tablero de llamados serializa en la URL.
_Avoid_: alerta, suscripción, filtro

**Novedad**
Llamado que coincide con una búsqueda guardada y que es nuevo respecto de la última visita registrada a esa búsqueda. Se calcula en el navegador al entrar al sitio; no implica push ni aviso fuera de la app. “Cierra pronto” es una señal aparte, no una novedad.
_Avoid_: notificación (implica push/sistema operativo), alerta
