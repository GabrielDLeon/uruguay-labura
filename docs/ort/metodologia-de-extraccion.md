# Metodología de extracción de carreras de ORT Uruguay

Este documento explica, a alto nivel, cómo se realizó la extracción de información de
todas las carreras de grado y posgrado de la Universidad ORT Uruguay para generar los
archivos de esta carpeta. Sirve como referencia para volver a hacer la extracción en el
futuro (por ejemplo, cuando ORT actualice su oferta académica).

## Contexto general

Toda la información proviene del sitio web oficial de la universidad y de sus sedes
físicas, sin ningún dato inventado. La extracción se hizo de forma **automática y
reproducible** en tres etapas:

1. **Obtener el catálogo completo de carreras** (lista de todo lo que ofrece ORT).
2. **Descargar la página oficial de cada carrera** y su plan de estudios.
3. **Estructurar la información** en archivos Markdown con un formato fijo.

No se usaron bases de datos internas de ORT, APIs privadas ni información confidencial:
todo se obtuvo de páginas públicas.

## Etapa 1: Cómo se obtuvo el catálogo completo

El sitio de ORT (www.ort.edu.uy) funciona sobre un gestor de contenidos llamado
**InnovaPortal**. Cuando el usuario navega la sección "Carreras y postgrados", el sitio
carga el listado de carreras desde un **servicio interno (endpoint)** que devuelve los
datos en formato JSON.

**Hallazgo clave:** en lugar de copiar la información de las páginas una por una, se
descubrió que existe una dirección de internet (endpoint) que entrega el catálogo
completo de ofertas académicas en un solo archivo JSON. Consultando ese endpoint se
obtiene:

- El nombre de cada carrera.
- Su nivel (carrera universitaria, tecnicatura, postgrado, etc.).
- La facultad a la que pertenece.
- La URL directa de la página oficial de la carrera.

De ese catálogo (170 ofertas) se filtraron las **98 carreras de grado y posgrado**
(30 universitarias + 24 tecnicaturas + 44 postgrados). Las restantes son cursos de
actualización profesional, seminarios y certificados, que no forman parte de este
trabajo.

> Nota técnica para el futuro: el endpoint se llama `/ORTContents/LoadDataProduct`
> (acción `loadProductsNextBeginnigs`). Puede cambiar de dirección; lo importante es
> saber que el sitio carga el catálogo por JavaScript desde un servicio JSON.

## Etapa 2: Fuentes de información de cada carrera

Cada carrera tiene su **página oficial** en el subdominio de su facultad
(ej.: `fi.ort.edu.uy/ingenieria-en-sistemas`). De esa página se obtuvieron dos tipos de
datos:

### 2.1. Datos estructurados (JSON-LD)

Cada página incluye, oculto en su código, un bloque de datos estructurados según el
estándar de Google **schema.org**, específicamente el tipo `EducationalOccupationalProgram`.
De allí se extrajeron datos verificables y consistentes:

- Nombre y descripción oficial.
- Duración de la carrera (en meses).
- Requisitos de ingreso.
- Información de becas.

Estos datos son los mismos que usa Google para mostrar la carrera en los resultados de
búsqueda, por lo que son muy confiables.

### 2.2. Secciones de texto de la página

El cuerpo de cada página está dividido en "cajas" de información con títulos
identificables (Requisitos de ingreso, Duración y horarios, Modalidad de cursado,
Perfil de los graduados, Títulos y reconocimientos, Requisito de graduación, Valor de
las cuotas, Becas, Reválidas). Cada caja se extrajo y se volcó en el archivo de la
carrera correspondiente.

### 2.3. Plan de estudios

Cada carrera tiene una subpágina de plan de estudios (en `.../plan-de-estudios`) con la
malla curricular completa, organizada por **año → semestre/trimestre/módulo → materia →
descripción**. Se extrajo esa estructura para documentar el plan en los archivos.

## Etapa 3: Cómo se armó cada archivo

Todos los archivos siguen el mismo formato (encabezado, ficha de metadatos, resumen,
plan de estudio, secciones de detalle y fuentes). Los campos se completaron así:

| Campo | Origen |
|---|---|
| Nombre, área, nivel | Catálogo JSON |
| Tipo (licenciatura, maestría, etc.) | Inferido del nombre y del nivel |
| Modalidad, turno, duración | Texto de las cajas + JSON-LD |
| Requisitos de ingreso | JSON-LD + caja de la página |
| Perfil de egreso y salida laboral | Caja "Perfil de los graduados" |
| Becas | JSON-LD + caja "Becas" |
| Título intermedio | Caja "Títulos y reconocimientos" |
| Página oficial | Catálogo JSON |

## Reglas de calidad aplicadas

- **No se inventó información.** Si un dato no aparece en ninguna fuente, se escribió
  `No encontrado` (o `No aplica` cuando corresponde, por ejemplo un posgrado sin título
  intermedio).
- **Se documentan las contradicciones.** Cuando dos fuentes oficiales difieren (por
  ejemplo, la página dice "18 meses" y el JSON-LD dice "25 meses"), el archivo muestra
  ambos valores y lo aclara.
- **Se limpió el contenido** para evitar: símbolos raros de codificación, textos de
  formularios ("Solicitá más información"), íconos de la web y restos del menú.
- **Se citan las fuentes** al final de cada archivo: página oficial, plan de estudios,
  listado de carreras y página de becas.

## Aspectos a tener en cuenta para el futuro

- **El catálogo puede cambiar de formato o dirección.** La universidad podría rediseñar
  el sitio; si el endpoint ya no existe, la alternativa es recorrer los listados
  públicos de carreras (`ort.edu.uy/carreras-universitarias`, `/tecnicaturas`,
  `/postgrados`) y entrar a cada página.
- **Los planes de estudio no tienen todos el mismo formato.** La mayoría se estructuran
  por semestres; algunos (doctorados, ciertos posgrados) describen el plan en texto
  libre. Ambos casos se documentaron igual.
- **La oferta académica cambia con el tiempo.** Antes de reutilizar estos datos, conviene
  verificar si la carrera sigue vigente y si su plan de estudios se actualizó.
- **Los valores de cuotas no se publican en línea.** ORT solo informa los precios en una
  entrevista personal con sus asesores; por eso el campo "Costo" indica que es arancelado
  sin dar un número.

## Estructura de esta carpeta

- Un archivo `.md` por carrera, con slug en minúsculas y sin acentos
  (ej.: `ingenieria-en-sistemas.md`, `master-en-administracion-de-empresas-mba.md`).
- Este documento de metodología.
