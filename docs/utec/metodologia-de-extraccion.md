# Metodología de extracción de carreras de UTEC

Este documento explica, a alto nivel, cómo se realizó la extracción de información de
todas las carreras de grado y posgrado de la Universidad Tecnológica del Uruguay (UTEC)
para generar los archivos de esta carpeta. Sirve como referencia para volver a hacer la
extracción en el futuro (por ejemplo, cuando UTEC actualice su oferta académica).

## Contexto general

Toda la información proviene del sitio web oficial de la universidad, sin ningún dato
inventado. La extracción se hizo de forma **manual y reproducible** en tres etapas:

1. **Obtener el catálogo completo de carreras** (lista de todo lo que ofrece UTEC).
2. **Visitar la página oficial de cada carrera** y su ficha de información.
3. **Estructurar la información** en archivos Markdown con un formato fijo.

No se usaron bases de datos internas de UTEC, APIs privadas ni información confidencial:
todo se obtuvo de páginas públicas.

## Etapa 1: Cómo se obtuvo el catálogo completo

El sitio de UTEC (utec.edu.uy) organiza su oferta académica en dos secciones públicas:

- **Carreras de grado y pregrado:** `https://utec.edu.uy/es/educacion/carreras/`
- **Posgrados:** `https://utec.edu.uy/es/educacion/posgrados/`

Además existe un **portal de descubrimiento** de carreras llamado **Descubrí UTEC**
(`https://descubri.utec.edu.uy/`), que agrega la oferta completa de la universidad en un
solo lugar, con buscador y filtros por área y localidad.

De estas fuentes se obtuvo el catálogo completo de **43 carreras**:

- **7 ingenierías** (Mecatrónica, Logística, Control y Automática, Biomédica, Agua y
  Desarrollo Sostenible, Energías Renovables, Agroambiental).
- **5 licenciaturas** (TI, Ingeniería de Datos e IA, Ciencia y Tecnología de Lácteos,
  Análisis Alimentario, Jazz y Música Creativa).
- **18 tecnologías/técnicos/tecnicaturas**, incluyendo títulos intermedios.
- **4 maestrías** (Tecnología Educativa, Diseño de Ambientes de Aprendizaje, Robótica e
  IA, Evaluación Transformadora para la Sostenibilidad).
- **7 especializaciones** (Ciberseguridad, Ciencia de Datos e IA, Tecnología Educativa,
  Fabricación Digital, Robótica e IA, Educación Superior, Turismo Sostenible).
- **2 programas de posgrado** (Agua y Desarrollo Sostenible, Biociencias y Sostenibilidad
  Alimentaria).

> Nota: a diferencia de otros sitios (como el de ORT), el sitio de UTEC no expone un
> endpoint JSON con el catálogo completo. La lista se armó recorriendo los listados
> públicos de carreras y posgrados y el portal Descubrí UTEC.

## Etapa 2: Fuentes de información de cada carrera

Cada carrera tiene su **página oficial** en el sitio de UTEC. De esa página se obtuvieron
los siguientes datos:

### 2.1. Ficha de la carrera

Las páginas de UTEC presentan una ficha estructurada con los datos principales de la
carrera: duración, modalidad, requisitos de ingreso, localidades donde se dicta, título
otorgado y títulos intermedios (si los hay). De allí se extrajeron los datos verificables:

- Nombre y descripción oficial.
- Duración de la carrera (en años o semestres).
- Modalidad (presencial o híbrida) y turno.
- Localidades/sedes donde se dicta.
- Título intermedio obtenible.

### 2.2. Descripción institucional

Cada ficha incluye un texto de presentación con el perfil de egreso y las áreas de
formación. Se volcó en el archivo de la carrera correspondiente.

### 2.3. Posgrados

Para las maestrías, especializaciones y programas de posgrado se usó el listado de
`utec.edu.uy/es/educacion/posgrados/` y las fichas individuales de cada programa. En
varios casos la información de duración o modalidad no se publica en línea, por lo que
esos campos quedaron como "No encontrado".

## Etapa 3: Cómo se armó cada archivo

Todos los archivos siguen el mismo formato (encabezado, ficha de datos, resumen,
requisitos de ingreso y fuentes). Los campos se completaron así:

| Campo | Origen |
|---|---|
| Nombre, tipo de carrera | Listados públicos de carreras/posgrados |
| Duración, modalidad, turno | Ficha de la carrera |
| Localidades | Ficha de la carrera + Descubrí UTEC |
| Requisitos de ingreso | Ficha de la carrera |
| Descripción y perfil de egreso | Texto de presentación de la página |
| Título intermedio | Ficha de la carrera |
| Costo | Información general de UTEC (gratuita) |
| Página oficial | Listados públicos |

## Reglas de calidad aplicadas

- **No se inventó información.** Si un dato no aparece en ninguna fuente, se escribió
  `No encontrado`.
- **Se citan las fuentes** al final de cada archivo: página oficial de la carrera, listado
  de carreras y portal Descubrí UTEC.
- **Se usa un slug en minúsculas y sin acentos** para cada archivo
  (ej.: `ingenieria-en-logistica.md`, `licenciatura-en-ti.md`).
- **Se agrupó la oferta por tipo de carrera** (ingenierías, licenciaturas, tecnologías,
  maestrías, especializaciones, programas) para facilitar la navegación.

## Aspectos a tener en cuenta para el futuro

- **La oferta académica cambia con el tiempo.** Antes de reutilizar estos datos, conviene
  verificar si la carrera sigue vigente y si su ficha se actualizó.
- **Los listados pueden cambiar de dirección.** UTEC podría rediseñar el sitio; si las URL
  ya no existen, la alternativa es buscar en el portal Descubrí UTEC o en el sitio
  principal de UTEC.
- **Los posgrados tienen menos datos publicados en línea** que las carreras de grado. Para
  datos como costo o requisitos específicos puede ser necesario contactar a UTEC
  directamente.
- **Algunas carreras comparten nombre pero se dictan en sedes distintas.** Es común que un
  mismo programa se ofrezca en varias localidades con las mismas características.

## Estructura de esta carpeta

- Un archivo `.md` por carrera, con slug en minúsculas y sin acentos
  (ej.: `ingenieria-en-mecatronica.md`, `maestria-en-tecnologia-educativa.md`).
- Un `index.md` con el índice completo de la oferta, agrupado por tipo de carrera.
- Este documento de metodología.
