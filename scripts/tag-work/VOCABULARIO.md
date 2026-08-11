# Vocabulario canónico de tags — carreras (uruguay-labura)

Documento de referencia para enriquecer y unificar los `tags` de `src/content/careers/*.md`.
Cada agente recibe un grupo de carreras (`careers-<grupo>.json`) y debe producir
`tags-<grupo>.json` con la lista FINAL de tags de cada carrera.

## Formato obligatorio de cada tag

- **minúsculas**, **sin tildes** (`diseno`, no `diseño`), **espacios** como separador
  (nunca guiones: `comercio exterior`, no `comercio-exterior`).
- Sustantivos en singular preferentemente (`matematica`, no `matematicas`), excepto
  formas fijas consolidadas (`ciencias sociales`, `recursos humanos`, `relaciones internacionales`).

## Cardinalidad

**3 a 6 tags por carrera.** Estructura ideal: 1-2 tags amplios (dominio) + 2-4 tags
específicos (subdisciplina, especialidad, herramienta, sector de aplicación). No más de 6.
Carreras de nicho (astronomía, estadística, traductorado…) pueden tener 3-4.

## Normalización obligatoria (sinónimos → canónico)

Aplicar SIEMPRE estos reemplazos; el canónico es el término de la derecha:

| Variantes (NO usar) | Canónico (usar) |
|---|---|
| diseño, diseños | diseno |
| diseño grafico | diseno grafico |
| diseño industrial | diseno industrial |
| comercio-exterior | comercio exterior |
| ciencia-de-datos, data science, analytics, analitica, analisis de datos, analitica de datos | ciencia de datos |
| inteligencia-artificial | inteligencia artificial |
| salud-mental, salud mental | salud mental |
| cadena-de-suministros, supply chain | cadena de suministros |
| gestion-de-personas, talento humano, talento, gestion de talento | gestion de personas |
| recursos-humanos, rrhh | recursos humanos |
| marketing-digital | marketing digital |
| politicas-publicas | politicas publicas |
| gestion-del-cambio | gestion del cambio |
| toma-de-decisiones | toma de decisiones |
| artes-escenicas | artes escenicas |
| artes-visuales | artes visuales |
| analisis-de-datos | ciencia de datos (si es analítica de datos) |
| cultura-organizacional | cultura organizacional |
| direccion-comercial | direccion comercial |
| educacion-inicial, primera-infancia | primera infancia |
| industria-alimentaria | industria alimentaria |
| seguridad-informatica | seguridad informatica |
| relaciones-laborales | relaciones laborales |
| inteligencia-emocional | inteligencia emocional |
| habilidades-gerenciales | habilidades gerenciales |
| ensenanza bilingue | educacion bilingue |
| ensenanza (tag suelto) | educacion |
| agro (suelto) | agropecuario |
| ambiente (suelto) | medio ambiente |
| ecommerce | comercio electronico |
| contaduria | contabilidad |
| derecho contractual | contratos |
| derecho de salud | derecho sanitario |
| desarrollo de software | software |
| jung, psicologia junguiana | psicologia analitica |
| inversion | inversiones |
| mercado de capitales, mercados de capitales | mercado de capitales |
| sustentabilidad | sostenibilidad |
| tributaria | tributacion |
| ninos, adolescentes, infancia | ninos y adolescentes (o primera infancia si aplica) |
| altas habilidades, superdotacion | altas habilidades |
| interiorismo, interiores | interiorismo |
| tecnico, tecnicatura, tecnico superior, grado, posgrado, especializacion, maestria (como tag) | ELIMINAR: es tipo de grado, no tema. Sustituir por tags temáticos. |
| acompañamiento-terapeutico | acompanamiento terapeutico |
| pnie, magisterio (solo como tag suelto) | sustituir por tags temáticos (ej: educacion, formacion docente) |
| master en derecho | derecho (ya está implícito en el título; usar tag derecho + especificidad) |
| management | direccion de empresas |
| metodos, procesos (suelto), organizacion (suelto), trabajo (suelto), industria (suelto) | sustituir por el tag temático concreto que corresponda |

## Vocabulario por dominio

Elegir los tags de estas listas (amplio + específicos). Si una carrera necesita un tag
que no está listado, crearlo con el formato obligatorio y que sea **preciso de
subdisciplina** (no inventar genéricos nuevos).

### Ciencias de la Salud (área: Ciencias de la Salud, Salud)
- Amplios: `medicina`, `salud publica`, `enfermeria`, `odontologia`, `psicologia`, `farmacia`, `nutricion`, `veterinaria` (si aplica), `salud`
- Específicos: `cardiologia`, `cardiologia pediatrica`, `pediatria`, `ginecologia`, `obstetricia`, `cirugia`, `anestesiologia`, `traumatologia`, `ortopedia`, `neurologia`, `neurocirugia`, `psiquiatria`, `dermatologia`, `oftalmologia`, `otorrinolaringologia`, `urologia`, `nefrologia`, `endocrinologia`, `gastroenterologia`, `hepatologia`, `hematologia`, `oncologia`, `reumatologia`, `alergologia`, `inmunologia`, `infectologia`, `medicina familiar`, `medicina interna`, `medicina de emergencia`, `urgencias`, `medicina intensiva`, `medicina del trabajo`, `medicina legal`, `medicina forense`, `medicina deportiva`, `medicina nuclear`, `imagenologia`, `radiologia`, `diagnostico por imagenes`, `resonancia magnetica`, `tomografia computada`, `anatomia patologica`, `patologia`, `laboratorio clinico`, `bioquimica clinica`, `farmacologia`, `toxicologia`, `epidemiologia`, `bioestadistica`, `salud ocupacional`, `salud mental`, `psicologia clinica`, `psicoterapia`, `neuropsicologia`, `psicopedagogia`, `psicomotricidad`, `fonoaudiologia`, `terapia ocupacional`, `fisioterapia`, `kinesiologia`, `rehabilitacion`, `cuidados paliativos`, `cuidados intensivos`, `enfermeria obstetrica`, `enfermeria pediatrica`, `enfermeria comunitaria`, `enfermeria del trabajo`, `odontopediatria`, `ortodoncia`, `periodoncia`, `endodoncia`, `prostodoncia`, `rehabilitacion oral`, `cirugia maxilofacial`, `implantologia`, `asistente dental`, `higiene dental`, `salud animal`, `farmacia hospitalaria`, `farmacia comunitaria`, `atencion primaria`, `atencion comunitaria`, `geriatria`, `gerontologia`, `nutricion clinica`, `nutricion deportiva`, `alimentacion`, `dispositivos medicos`, `tecnologia medica`, `salud digital`, `telemedicina`, `bioetica`, `genetica`, `biologia molecular`, `cuidados`, `acompanamiento terapeutico`, `equinoterapia`, `actividad fisica`, `deporte`, `final de la vida`, `adultos mayores`, `ninos y adolescentes`, `primera infancia`

### Naturaleza, Ciencias Exactas y Hábitat (área: Tecnologías y Ciencias de la Naturaleza y el Hábitat)
- Amplios: `biologia`, `quimica`, `fisica`, `matematica`, `geologia`, `agronomia`, `medio ambiente`, `veterinaria`, `ciencias naturales`, `ciencias exactas`
- Específicos: `botanica`, `zoologia`, `ecologia`, `genetica`, `microbiologia`, `bioquimica`, `biologia molecular`, `biotecnologia`, `bioinformatica`, `biomedicina`, `neurociencias`, `astronomia`, `astrofisica`, `cosmologia`, `estadistica`, `probabilidad`, `econometria`, `algebra`, `analisis matematico`, `computacion cientifica`, `quimica organica`, `quimica inorganica`, `quimica analitica`, `quimica industrial`, `fisicoquimica`, `fisica nuclear`, `fisica medica`, `geofisica`, `geoquimica`, `hidrogeologia`, `paleontologia`, `mineralogia`, `oceanografia`, `meteorologia`, `climatologia`, `hidrologia`, `recursos hidricos`, `agua`, `suelos`, `edafologia`, `agroecologia`, `agroindustria`, `agropecuario`, `agronegocios`, `produccion animal`, `produccion vegetal`, `produccion forestal`, `silvicultura`, `forestal`, `ganaderia`, `lecheria`, `granos`, `cultivos`, `pasturas`, `fitopatologia`, `sanidad vegetal`, `biotecnologia agricola`, `agricultura de precision`, `riego`, `equinos`, `produccion equina`, `equitacion`, `bienestar animal`, `salud animal`, `nutricion animal`, `veterinaria clinica`, `medicina veterinaria preventiva`, `parasitologia`, `virologia`, `bacteriologia`, `inmunologia`, `toxicologia ambiental`, `contaminacion`, `residuos`, `gestion ambiental`, `evaluacion de impacto ambiental`, `conservacion`, `biodiversidad`, `areas protegidas`, `recursos naturales`, `energia`, `energias renovables`, `energia solar`, `energia eolica`, `bioenergia`, `hidrogeno verde`, `transicion energetica`, `cambio climatico`, `sostenibilidad`, `desarrollo sostenible`, `ordenamiento territorial`, `paisaje`, `ciencias de la tierra`, `ciencias del mar`, `pesca`, `acuicultura`, `alimentos`, `ciencia y tecnologia de alimentos`, `tecnologia de alimentos`, `industria alimentaria`, `calidad alimentaria`, `inocuidad alimentaria`, `bromatologia`, `enologia`, `vitivinicultura`, `cerveceria`, `lacteos`, `carnes`, `higiene de los alimentos`

### Social, Humanidades y Artes (área: Social y Artística)
- Amplios: `ciencias sociales`, `derecho`, `historia`, `letras`, `arte`, `filosofia`, `humanidades`, `educacion`, `psicologia`, `economia`, `ciencia politica`, `sociologia`, `antropologia`
- Específicos derecho: `derecho civil`, `derecho penal`, `derecho laboral`, `derecho administrativo`, `derecho constitucional`, `derecho internacional`, `derecho de familia`, `derecho comercial`, `derecho societario`, `derecho corporativo`, `derecho tributario`, `derecho economico`, `derecho procesal`, `litigacion`, `derecho notarial`, `notariado`, `escribania`, `derecho agrario`, `derecho ambiental`, `derecho del consumidor`, `derecho de seguros`, `derecho penal economico`, `derecho sanitario`, `derecho y tecnologia`, `legaltech`, `ciencias juridicas`, `criminologia`, `psicologia forense`, `peritaje`, `contratos`, `arbitraje`, `mediacion`, `justicia`, `derechos humanos`, `propiedad intelectual`, `derecho digital`, `traduccion juridica`, `derecho financiero`, `derecho bancario`, `derecho portuario`, `derecho aduanero`, `aduanas`
- Específicos sociales: `politicas publicas`, `gestion publica`, `administracion publica`, `trabajo social`, `sociologia`, `antropologia`, `arqueologia`, `demografia`, `analisis sociodemografico`, `ciencia politica`, `relaciones internacionales`, `diplomacia`, `integracion regional`, `desarrollo`, `desarrollo local`, `desarrollo territorial`, `cooperacion internacional`, `economia social`, `genero`, `diversidad`, `afrodescendencia`, `migraciones`, `interculturalidad`, `comunicacion comunitaria`, `participacion ciudadana`, `derechos humanos`, `seguridad ciudadana`, `criminologia`, `sindicatos`, `relaciones laborales`, `trabajo`, `funcion publica`, `sector publico`, `gobierno`, `gobernanza`, `gobernanza digital`, `politicas digitales`, `urbanismo`, `territorio`, `familia`, `infancia`, `adolescencia`, `vejez`, `envejecimiento`, `juventud`, `genero`
- Específicos humanidades: `filosofia`, `etica`, `logica`, `estetica`, `epistemologia`, `historia`, `historia del arte`, `historia contemporanea`, `historia economica`, `letras`, `linguistica`, `literatura`, `literatura uruguaya`, `literatura latinoamericana`, `semiotica`, `traduccion`, `interpretacion`, `idiomas`, `lengua inglesa`, `lengua portuguesa`, `lengua espanola`, `lenguas extranjeras`, `estudios culturales`, `religion`, `teologia`, `estudios biblicos`, `patrimonio`, `patrimonio cultural`, `archivologia`, `bibliotecologia`, `museologia`, `humanidades digitales`
- Específicos artes: `musica`, `canto`, `interpretacion musical`, `composicion`, `direccion de orquesta`, `musicologia`, `arte sonoro`, `arte y cultura visual`, `artes visuales`, `artes escenicas`, `teatro`, `actuacion`, `danza`, `fotografia`, `cine`, `audiovisual`, `animacion`, `ilustracion`, `pintura`, `escultura`, `grabado`, `ceramica`, `arte contemporaneo`, `curaduria`, `gestion cultural`, `industrias creativas`, `produccion artistica`

### Negocios, Administración y Comunicación (áreas: Administración y Negocios, Comunicación)
- Amplios: `administracion`, `negocios`, `economia`, `finanzas`, `contabilidad`, `marketing`, `recursos humanos`, `comunicacion`, `logistica`, `turismo`, `derecho` (si aplica)
- Específicos negocios: `administracion de empresas`, `direccion de empresas`, `gestion empresarial`, `gestion organizacional`, `gestion`, `estrategia`, `estrategia de negocios`, `estrategia comercial`, `planificacion estrategica`, `liderazgo`, `habilidades gerenciales`, `toma de decisiones`, `consultoria`, `asesoramiento empresarial`, `emprendimiento`, `emprendedurismo`, `innovacion`, `innovacion de productos`, `mba`, `finanzas corporativas`, `finanzas personales`, `banca`, `banca digital`, `seguros`, `reaseguros`, `mercado de capitales`, `inversiones`, `gestion de riesgos`, `riesgos`, `fintech`, `compliance`, `auditoria`, `auditoria interna`, `auditoria externa`, `auditoria de estados financieros`, `control de gestion`, `gestion contable`, `impuestos`, `tributacion`, `tributacion internacional`, `contabilidad de costos`, `costos`, `presupuesto`, `presupuestos`, `control interno`, `comercio exterior`, `comercio internacional`, `negocios internacionales`, `aduanas`, `comercio electronico`, `ecommerce`, `ventas`, `direccion comercial`, `gestion comercial`, `comercializacion`, `marketing digital`, `publicidad`, `marcas`, `branding`, `investigacion de mercados`, `analitica de negocios`, `business intelligence`, `gestion de personas`, `recursos humanos`, `cultura organizacional`, `cambio organizacional`, `gestion del cambio`, `clima laboral`, `seleccion de personal`, `capacitacion laboral`, `reclutamiento`, `compensaciones`, `bienestar laboral`, `talento`, `gestion del conocimiento`, `administracion publica`, `gestion publica`, `politicas publicas`, `agronegocios`, `commodities`, `granos`, `administracion de agronegocios`, `turismo`, `hoteleria`, `gastronomia`, `eventos`, `gestion de destinos`, `turismo sostenible`, `administracion de servicios de salud`, `gestion sanitaria`, `gestion de salud`, `administracion deportiva`, `gestion deportiva`, `deporte`, `gestion de proyectos`, `gestion de operaciones`, `operaciones`, `cadena de suministros`, `logistica`, `logistica internacional`, `transporte`, `distribucion`, `compras`, `gestion de inventarios`, `gestion de la calidad`, `calidad`, `gestion ambiental`, `sostenibilidad`, `responsabilidad social`, `gestion de la innovacion`, `gestion del conocimiento`, `gobierno corporativo`, `familia empresaria`, `empresas familiares`, `pymes`, `franchising`, `franquicias`, `evaluacion de proyectos`, `evaluacion de inversiones`, `econometria`, `analisis economico`, `politica economica`, `economia internacional`, `economia del desarrollo`, `economia de la salud`, `economia ambiental`, `economia circular`
- Específicos comunicación: `periodismo`, `comunicacion digital`, `comunicacion organizacional`, `comunicacion interna`, `comunicacion externa`, `comunicacion corporativa`, `comunicacion institucional`, `comunicacion estrategica`, `comunicacion politica`, `comunicacion publica`, `comunicacion comercial`, `comunicacion ambiental`, `comunicacion comunitaria`, `relaciones publicas`, `publicidad`, `marketing`, `marketing digital`, `redes sociales`, `contenidos digitales`, `produccion de contenidos`, `periodismo digital`, `periodismo deportivo`, `periodismo cientifico`, `opinion publica`, `reputacion corporativa`, `crisis de comunicacion`, `dircom`, `direccion de comunicacion`, `branding`, `marcas`, `audiovisual`, `cine`, `television`, `radio`, `podcast`, `fotografia`, `diseno grafico`, `comunicacion visual`, `redaccion`, `edicion`, `correccion de estilo`, `traduccion`, `prensa`, `medios`, `multimedia`, `videojuegos`, `gamificacion`, `experiencia de usuario`, `ux`, `comunicacion cientifica`, `comunicacion de datos`, `storytelling`, `narrativa transmedia`

### Ingeniería, TI, Mecatrónica y Arquitectura (áreas: Ingeniería, Tecnologías de la Información, Mecatrónica, Logística y Biomédica, Arquitectura)
- Amplios: `ingenieria`, `informatica`, `software`, `programacion`, `arquitectura`, `electronica`, `mecatronica`, `telecomunicaciones`, `energia`, `construccion`, `diseno`
- Específicos ingeniería: `ingenieria civil`, `ingenieria estructural`, `ingenieria hidraulica`, `ingenieria ambiental`, `ingenieria sanitaria`, `ingenieria quimica`, `ingenieria industrial`, `ingenieria mecanica`, `ingenieria electrica`, `ingenieria electronica`, `ingenieria de software`, `ingenieria de sistemas`, `ingenieria informatica`, `ingenieria biomedica`, `ingenieria en alimentos`, `ingenieria agronomica`, `ingenieria forestal`, `ingenieria de materiales`, `ingenieria de procesos`, `procesos industriales`, `automatizacion`, `robotica`, `automatizacion industrial`, `control de procesos`, `instrumentacion`, `mecatronica`, `sistemas mecanicos`, `mecanica`, `electricidad`, `electrotecnia`, `instalaciones electricas`, `energia renovable`, `energia solar`, `energia eolica`, `energia termica`, `generacion de energia`, `distribucion de energia`, `transmision de energia`, `eficiencia energetica`, `electromovilidad`, `vehiculos electricos`, `hidrogeno`, `petroleo`, `gas`, `mineria`, `industria naval`, `aeronautica`, `aeroespacial`, `nanotecnologia`, `optica`, `fotonica`, `acustica`, `diseño mecanico`, `diseño de productos`, `fabricacion digital`, `manufactura`, `impresion 3d`, `calidad industrial`, `seguridad industrial`, `higiene industrial`, `gestion de proyectos`, `gestion de operaciones`, `cadena de suministros`, `logistica`, `transporte`, `movilidad`, `infraestructura`, `obras`, `vialidad`, `puentes`, `caminos`, `geotecnia`, `topografia`, `agrimensura`, `cartografia`, `sistemas de informacion geografica`, `sig`, `construccion`, `materiales de construccion`, `presupuesto de obras`, `direccion de obras`, `gestion de la construccion`, `construccion sostenible`, `building information modeling`, `bim`
- Específicos TI: `programacion`, `desarrollo web`, `desarrollo movil`, `desarrollo de aplicaciones`, `software`, `ingenieria de software`, `arquitectura de software`, `arquitectura de sistemas`, `base de datos`, `bases de datos`, `gestion de datos`, `ciencia de datos`, `big data`, `machine learning`, `inteligencia artificial`, `procesamiento de lenguaje natural`, `vision por computadora`, `analitica de datos`, `business intelligence`, `computacion en la nube`, `cloud computing`, `infraestructura`, `servidores`, `redes`, `telecomunicaciones`, `telematica`, `ciberseguridad`, `seguridad informatica`, `seguridad de la informacion`, `hacking etico`, `pentesting`, `seguridad en la nube`, `devops`, `cloud`, `sistemas operativos`, `sistemas embebidos`, `internet de las cosas`, `iot`, `realidad virtual`, `realidad aumentada`, `videojuegos`, `desarrollo de videojuegos`, `experiencia de usuario`, `ux`, `interfaz de usuario`, `ui`, `frontend`, `backend`, `full stack`, `testing`, `calidad de software`, `gestion de proyectos it`, `metodologias agiles`, `scrum`, `gobierno de ti`, `gobernanza de internet`, `transformacion digital`, `digitalizacion`, `tecnologia educativa`, `sistemas de informacion`, `erp`, `sap`, `blockchain`, `criptomonedas`, `fintech`, `inteligencia artificial generativa`, `analista funcional`, `soporte tecnico`, `help desk`, `administracion de sistemas`, `administrador de servidores`, `redes de datos`, `protocolos de red`, `fibra optica`, `comunicaciones inalambricas`, `5g`
- Específicos arquitectura: `arquitectura`, `diseno arquitectonico`, `urbanismo`, `ordenamiento territorial`, `paisajismo`, `arquitectura del paisaje`, `interiorismo`, `diseño de interiores`, `arquitectura sostenible`, `arquitectura bioclimatica`, `construccion en madera`, `arquitectura de madera`, `patrimonio arquitectonico`, `restauracion`, `rehabilitacion de edificios`, `gestion de proyectos`, `construccion`, `building information modeling`, `bim`, `visualizacion arquitectonica`, `modelado 3d`, `diseno computacional`, `fabricacion digital`, `eficiencia energetica`, `arquitectura de interiores`, `espacios comerciales`, `escenografia`, `iluminacion`, `acustica arquitectonica`

### Educación, Diseño, Sostenibilidad y otros (áreas: Educación, Educación innovación y tecnología, Diseño, Sostenibilidad ambiental, Alimentos, Sin clasificar, Innovación y Emprendimientos)
- Amplios: `educacion`, `formacion docente`, `diseno`, `sostenibilidad`, `medio ambiente`, `alimentos`, `innovacion`, `emprendimiento`
- Específicos educación: `formacion docente`, `profesorado`, `magisterio`, `educacion inicial`, `primera infancia`, `educacion primaria`, `educacion media`, `educacion secundaria`, `educacion superior`, `educacion tecnica`, `educacion tecnologica`, `educacion profesional`, `educacion de adultos`, `educacion especial`, `educacion inclusiva`, `atencion a la diversidad`, `altas habilidades`, `educacion rural`, `educacion intercultural`, `educacion bilingue`, `educacion artistica`, `educacion fisica`, `educacion musical`, `educacion emocional`, `educacion sexual`, `educacion ambiental`, `educacion para la salud`, `pedagogia`, `pedagogia social`, `didactica`, `curriculum`, `diseno curricular`, `evaluacion educativa`, `evaluacion de aprendizajes`, `gestion educativa`, `direccion de centros`, `liderazgo educativo`, `supervision educativa`, `politicas educativas`, `educacion y tecnologia`, `tecnologia educativa`, `innovacion educativa`, `innovacion pedagogica`, `metodologias activas`, `aprendizaje basado en proyectos`, `educacion a distancia`, `educacion virtual`, `elearning`, `educacion inclusiva`, `atencion temprana`, `psicopedagogia`, `psicologia educacional`, `orientacion educativa`, `orientacion vocacional`, `educacion especial`, `dificultades de aprendizaje`, `neuroeducacion`, `neuropsicologia infantil`, `educacion en primera infancia`, `educacion inicial`, `juego`, `ludica`, `educacion no formal`, `educacion comunitaria`, `educacion popular`, `educacion de adultos`, `alfabetizacion`, `lectoescritura`, `matematica educativa`, `ensenanza de ciencias`, `ensenanza de lenguas`, `ensenanza del español`, `ensenanza del ingles`, `educacion bilingue`, `formacion profesional`, `formacion en oficios`, `educacion tecnico profesional`, `cetp`, `utucu`, `interculturalidad`
- Específicos diseño: `diseno grafico`, `comunicacion visual`, `diseno de productos`, `diseno industrial`, `diseno de interiores`, `interiorismo`, `diseno de moda`, `indumentaria`, `moda`, `diseno textil`, `diseno de joyas`, `diseno editorial`, `tipografia`, `ilustracion`, `animacion`, `diseno digital`, `diseno web`, `diseno ux`, `experiencia de usuario`, `interfaz de usuario`, `diseno de servicios`, `diseno de experiencia`, `diseño de indumentaria`, `patronaje`, `moldería`, `tendencia`, `moda sostenible`, `diseno de espacios`, `escenografia`, `visual merchandising`, `diseño de packaging`, `envases`, `branding`, `identidad visual`, `marcas`, `ilustracion digital`, `arte digital`, `multimedia`, `motion graphics`, `video`, `fotografia`, `diseño de juegos`, `game design`
- Específicos sostenibilidad: `sostenibilidad`, `desarrollo sostenible`, `agenda 2030`, `ods`, `economia circular`, `gestion ambiental`, `evaluacion de impacto ambiental`, `educacion ambiental`, `comunicacion ambiental`, `energias renovables`, `transicion energetica`, `cambio climatico`, `adaptacion climatica`, `mitigacion`, `residuos`, `gestion de residuos`, `reciclaje`, `economia verde`, `finanzas sostenibles`, `inversion de impacto`, `responsabilidad social empresarial`, `rse`, `sostenibilidad corporativa`, `triple impacto`, `biodiversidad`, `conservacion`, `recursos naturales`, `agua`, `saneamiento`, `movilidad sostenible`, `ciudades sostenibles`, `urbanismo sostenible`, `construccion sostenible`, `arquitectura sostenible`, `agricultura sostenible`, `agroecologia`, `produccion sostenible`, `consumo responsable`, `huella de carbono`, `compensacion de carbono`, `certificaciones ambientales`, `leed`
- Específicos alimentos: `alimentos`, `ciencia y tecnologia de alimentos`, `tecnologia de alimentos`, `industria alimentaria`, `seguridad alimentaria`, `inocuidad alimentaria`, `calidad alimentaria`, `bromatologia`, `microbiologia de alimentos`, `quimica de alimentos`, `procesamiento de alimentos`, `conservacion de alimentos`, `enologia`, `vitivinicultura`, `cerveceria`, `carnes`, `lacteos`, `panificacion`, `confiteria`, `gastronomia`, `cocina`, `pasteleria`, `sommelier`, `analisis sensorial`, `etiquetado`, `regulacion alimentaria`, `nutricion`, `alimentacion saludable`, `food design`, `desperdicio alimentario`
- Específicos innovación: `innovacion`, `emprendimiento`, `emprendedurismo`, `creatividad`, `design thinking`, `metodologias agiles`, `lean startup`, `modelo de negocios`, `canvas`, `prototipado`, `gestion de la innovacion`, `intraemprendimiento`, `innovacion social`, `triple impacto`, `economia naranja`, `industrias creativas`, `propiedad intelectual`, `transferencia tecnologica`, `vinculacion tecnologica`, `incubacion`, `aceleracion`, `venture capital`, `inversiones`, `startups`, `negocios digitales`

## Verificación final por carrera

- 3-6 tags, formato correcto, sin duplicados, sin sinónimos en la lista de NO usar.
- Sin tags de tipo de grado (`maestria`, `especializacion`, `tecnicatura`, `tecnologo`, `diplomado`, `doctorado`, `posgrado`, `carrera`, `grado`, `licenciatura`, `ingenieria` — excepto cuando es el tema real, p.ej. `ingenieria civil`).
- `programa-roberto-rocca` solo si la carrera pertenece a ese programa (revisar si aparece en el título/descripción o es un programa del área).

## Formato de salida

Escribir `scripts/tag-work/tags-<grupo>.json` con TODOS los tags finales de CADA carrera del grupo (la lista reemplaza completamente a la actual):

```json
{
  "slug-de-la-carrera": ["tag amplio", "tag especifico 1", "tag especifico 2"],
  ...
}
```

- Un slug por cada carrera del grupo (todas, sin omitir ninguna).
- Tags ya normalizados y en el formato obligatorio.
- Verificar al final que el JSON sea válido (validar con `node -e "JSON.parse(require('fs').readFileSync('scripts/tag-work/tags-<grupo>.json','utf8'))"`).
- No editar ningún archivo de src/content: solo escribir el JSON.
- Responder al final solo con: número de carreras procesadas, ruta del archivo, y confirmación de validación JSON.
