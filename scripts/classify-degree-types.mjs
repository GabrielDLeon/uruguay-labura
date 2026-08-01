#!/usr/bin/env node
/**
 * Reclasifica las carreras de src/content/educacion marcadas con
 * `degreeType: "otro"` que en realidad corresponden a tipos existentes
 * (o nuevos: `carrera` y `ciclo`).
 *
 * También marca los Ciclos Iniciales Optativos (CIO) con `listable: false`
 * para que no se listen ni se indexen, aunque su página siga existiendo.
 *
 * Categorías:
 *  - ciclo:       ciclos iniciales optativos (no son carreras terminales)
 *  - tecnologo:   tecnólogos Udelar y LSU
 *  - tecnicatura: tecnicaturas, técnicos y cursos devenidos en tecnicatura
 *  - carrera:     carreras de grado profesionales (Abogacía, Notariado, etc.)
 *  - licenciatura: licenciaturas FHCE y traductorados públicos
 *  - otro:        programas de posgrado paraguas (se conservan como otro)
 *  - DELETE:      duplicado de "Bachiller en Ciencias Químicas"
 *
 * Uso:
 *   node scripts/classify-degree-types.mjs          # dry-run (por defecto)
 *   node scripts/classify-degree-types.mjs --apply  # aplica los cambios
 */
import { readFileSync, writeFileSync, unlinkSync, readdirSync } from 'fs'
import { join } from 'path'

const DIR = join(process.cwd(), 'src/content/educacion')
const APPLY = process.argv.includes('--apply')

// --- Configuración -----------------------------------------------------------

const CICLO = /^(ciclo|cio)-/
const TECNOLOGO = /^(tecnologo-|interpretacion-lsu-espanol-lsu-)/

const CARRERA = new Set([
  'abogacia-udelar',
  'notariado-udelar',
  'contador-publico-udelar',
  'contador-publico-ort',
  'odontologia-udelar',
  'obstetra-partera-udelar',
  'arquitectura-udelar',
  'carrera-de-arquitectura-ort',
  'quimica-farmaceutica-udelar',
  'quimico-udelar',
  'bioquimico-clinico-udelar',
])

const TECNICATURA = new Set([
  'asistente-en-odontologia-udelar',
  'higienista-en-odontologia-udelar',
  'laboratorista-en-odontologia-udelar',
  'auxiliar-de-farmacia-hospitalaria-udelar',
  'correccion-de-estilo-udelar',
  'curso-de-guardavidas-udelar',
  'tecnico-en-administracion-udelar',
  'bachiller-en-ciencias-quimicas-udelar',
])

const LICENCIATURA = new Set([
  'antropologia-udelar',
  'archivologia-udelar',
  'bibliotecologia-udelar',
  'educacion-udelar',
  'filosofia-udelar',
  'historia-udelar',
  'letras-udelar',
  'linguistica-udelar',
  'dramaturgia-udelar',
  'traductorado-publico-aleman-udelar',
  'traductorado-publico-frances-udelar',
  'traductorado-publico-ingles-udelar',
  'traductorado-publico-italiano-udelar',
  'traductorado-publico-portugues-udelar',
])

// Duplicado de `bachiller-en-ciencias-quimicas-udelar` (misma descripción y
// mismo sitio oficial): se conserva el de título correcto.
const DELETE = new Set(['tecnico-bach-en-csquimicas-udelar.mdx'])

function classify(file) {
  const base = file.replace(/\.mdx$/, '')
  if (CICLO.test(base)) return { type: 'ciclo', listable: false }
  if (TECNOLOGO.test(base)) return { type: 'tecnologo' }
  if (CARRERA.has(base)) return { type: 'carrera' }
  if (TECNICATURA.has(base)) return { type: 'tecnicatura' }
  if (LICENCIATURA.has(base)) return { type: 'licenciatura' }
  // Programas de posgrado paraguas de UTEC: no encajan en ningún tipo.
  if (base.startsWith('programa-de-posgrado-')) return { type: 'otro' }
  return null
}

// --- Ejecución ---------------------------------------------------------------

const files = readdirSync(DIR).filter((f) => f.endsWith('.mdx'))
const pending = files.filter(
  (f) =>
    !DELETE.has(f) &&
    /^degreeType: "otro"$/m.test(readFileSync(join(DIR, f), 'utf8')),
)

const unclassified = []
const changes = []

for (const file of pending) {
  const result = classify(file)
  if (!result) {
    unclassified.push(file)
    continue
  }
  changes.push({ file, ...result })
}

if (unclassified.length > 0) {
  console.error(`ERROR: ${unclassified.length} archivo(s) sin clasificar:`)
  for (const f of unclassified) console.error(`  - ${f}`)
  process.exit(1)
}

const deletes = files.filter((f) => DELETE.has(f))

console.log(
  `Reclasificando ${changes.length} archivos (${deletes.length} a eliminar):`,
)
const byType = {}
for (const c of changes) {
  byType[c.type] = (byType[c.type] ?? 0) + 1
}
for (const [type, count] of Object.entries(byType)) {
  console.log(`  ${type}: ${count}`)
}

if (!APPLY) {
  console.log('\nDry-run: no se aplicaron cambios. Usá --apply para aplicarlos.')
  process.exit(0)
}

let modified = 0
for (const { file, type, listable } of changes) {
  const path = join(DIR, file)
  let content = readFileSync(path, 'utf8')
  const frontmatter = content.split('---')[1]
  if (!frontmatter.includes('degreeType: "otro"')) continue
  let updated = frontmatter.replace(/^degreeType: "otro"$/m, `degreeType: "${type}"`)
  if (listable === false) {
    updated = updated.replace(/^(draft: )/m, 'listable: false\n$1')
  }
  if (updated === frontmatter) {
    console.error(`  WARN: sin cambios en ${file}`)
    continue
  }
  content = content.replace(frontmatter, updated)
  writeFileSync(path, content)
  modified++
}

for (const file of deletes) {
  unlinkSync(join(DIR, file))
  console.log(`  borrado: ${file}`)
}

console.log(`\nAplicado: ${modified} archivos modificados, ${deletes.length} eliminados.`)
