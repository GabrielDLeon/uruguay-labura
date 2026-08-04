#!/usr/bin/env node
/**
 * Dedupe archivos de src/content/careers.
 *
 * Elimina duplicados de scraping de UDELAR (mismo posgrado scrapeado varias veces
 * con códigos internos del CAP en el slug, p.ej. `bioinformatica-especializacion-11-88`).
 *
 * Categorías:
 *  - DELETE: duplicado exacto -> se borra, se conserva el archivo "limpio" (sin código).
 *  - MERGE:  duplicado con contenido superior -> el cuerpo se copia al archivo limpio y se borra.
 *  - RENAME: archivo legítimo pero con slug codificado -> renombrado para claridad.
 *
 * Uso:
 *   node scripts/dedupe-careers.mjs            # dry-run (por defecto)
 *   node scripts/dedupe-careers.mjs --apply    # aplica los cambios
 */
import { readFileSync, writeFileSync, renameSync, unlinkSync, readdirSync } from 'fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
let YAML

try {
  YAML = require('yaml')
} catch {
  YAML = require('/home/gabriel/dev/uruguay-labura/node_modules/.pnpm/yaml@2.8.3/node_modules/yaml')
}

const DIR = new URL('../src/content/careers/', import.meta.url).pathname
const APPLY = process.argv.includes('--apply')

// --- Configuración -----------------------------------------------------------

// file codificado -> file que se conserva (mismo título, mismo institution/degreeType)
const DELETE = {
  'bioinformatica-especializacion-11-88-udelar.mdx': 'bioinformatica-especializacion-udelar.mdx',
  'bioinformatica-especializacion-8-91-udelar.mdx': 'bioinformatica-especializacion-udelar.mdx',
  'bioinformatica-especializacion-9-92-udelar.mdx': 'bioinformatica-especializacion-udelar.mdx',
  'bioinformatica-maestria-11-99-udelar.mdx': 'bioinformatica-maestria-udelar.mdx',
  'bioinformatica-maestria-8-88-udelar.mdx': 'bioinformatica-maestria-udelar.mdx',
  'bioinformatica-maestria-9-3-udelar.mdx': 'bioinformatica-maestria-udelar.mdx',
  'ciencia-y-tecnologia-de-alimentos-maestria-11-25-udelar.mdx': 'ciencia-y-tecnologia-de-alimentos-maestria-udelar.mdx',
  'ciencias-cognitivas-maestria-10-95-udelar.mdx': 'ciencias-cognitivas-maestria-udelar.mdx',
  'ciencias-cognitivas-maestria-8-59-udelar.mdx': 'ciencias-cognitivas-maestria-udelar.mdx',
  'ciencias-nutricionales-maestria-4-99-udelar.mdx': 'ciencias-nutricionales-maestria-udelar.mdx',
  'derechos-de-la-infancia-y-politicas-publicas-maestria-10-54-udelar.mdx': 'derechos-de-la-infancia-y-politicas-publicas-maestria-udelar.mdx',
  'derechos-de-la-infancia-y-politicas-publicas-maestria-14-9-udelar.mdx': 'derechos-de-la-infancia-y-politicas-publicas-maestria-udelar.mdx',
  'derechos-de-la-infancia-y-politicas-publicas-maestria-9-66-udelar.mdx': 'derechos-de-la-infancia-y-politicas-publicas-maestria-udelar.mdx',
  'fisica-especializacion-51-95-udelar.mdx': 'fisica-especializacion-udelar.mdx',
  'gestion-cultural-especializacion-99-99-udelar.mdx': 'gestion-cultural-especializacion-udelar.mdx',
  'gestion-de-servicios-de-salud-especializacion-9-67-udelar.mdx': 'gestion-de-servicios-de-salud-especializacion-udelar.mdx',
  'gestion-y-economia-del-turismo-sustentable-maestria-6-57-udelar.mdx': 'gestion-y-economia-del-turismo-sustentable-maestria-udelar.mdx',
  'industria-carnica-especializacion-12-9-udelar.mdx': 'industria-carnica-especializacion-udelar.mdx',
  'manejo-costero-integrado-del-cono-sur-maestria-14-10-udelar.mdx': 'manejo-costero-integrado-del-cono-sur-maestria-udelar.mdx',
  'manejo-costero-integrado-del-cono-sur-maestria-4-52-udelar.mdx': 'manejo-costero-integrado-del-cono-sur-maestria-udelar.mdx',
  'manejo-costero-integrado-del-cono-sur-maestria-6-58-udelar.mdx': 'manejo-costero-integrado-del-cono-sur-maestria-udelar.mdx',
  'manejo-costero-integrado-del-cono-sur-maestria-8-90-udelar.mdx': 'manejo-costero-integrado-del-cono-sur-maestria-udelar.mdx',
  'manejo-costero-integrado-del-cono-sur-maestria-91-1-udelar.mdx': 'manejo-costero-integrado-del-cono-sur-maestria-udelar.mdx',
  'manejo-costero-integrado-especializacion-14-88-udelar.mdx': 'manejo-costero-integrado-especializacion-udelar.mdx',
  'manejo-costero-integrado-especializacion-4-94-udelar.mdx': 'manejo-costero-integrado-especializacion-udelar.mdx',
  'manejo-costero-integrado-especializacion-6-81-udelar.mdx': 'manejo-costero-integrado-especializacion-udelar.mdx',
  'manejo-costero-integrado-especializacion-8-56-udelar.mdx': 'manejo-costero-integrado-especializacion-udelar.mdx',
  'manejo-costero-integrado-especializacion-91-94-udelar.mdx': 'manejo-costero-integrado-especializacion-udelar.mdx',
  'medicina-nuclear-especializacion-9-32-udelar.mdx': 'medicina-nuclear-especializacion-udelar.mdx',
  'politicas-y-gestion-publica-maestria-6-59-udelar.mdx': 'politicas-y-gestion-publica-maestria-udelar.mdx',
  'seguridad-y-salud-en-el-trabajo-especializacion-11-90-udelar.mdx': 'seguridad-y-salud-en-el-trabajo-especializacion-udelar.mdx',
  'transformacion-organizacional-especializacion-10-96-udelar.mdx': 'transformacion-organizacional-especializacion-udelar.mdx',
  'transformacion-organizacional-especializacion-6-80-udelar.mdx': 'transformacion-organizacional-especializacion-udelar.mdx',
}

// duplicado cuyo cuerpo es SUPERIOR al del archivo limpio -> copiar cuerpo y borrar
const MERGE = {
  'emergentologia-especializacion-9-58-udelar.mdx': 'emergentologia-especializacion-udelar.mdx',
}

// archivos legítimos con slug codificado -> renombrar (sin referencias externas)
const RENAME = {
  'licenciatura-en-educacion-fisica-0-udelar.mdx': 'licenciatura-en-educacion-fisica-rivera-udelar.mdx',
  'economia-maestria-6-33-udelar.mdx': 'economia-maestria-fcs-udelar.mdx',
}

// --- Utilidades --------------------------------------------------------------

function frontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---/)
  return m ? { fm: m[1], body: raw.slice(m[0].length) } : null
}

function normTitle(t) {
  return (t || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

// --- Validación (siempre, incluso en dry-run) --------------------------------

const files = new Set(readdirSync(DIR).filter((f) => f.endsWith('.mdx')))
let errors = 0

for (const [dup, keep] of Object.entries({ ...DELETE, ...MERGE })) {
  if (!files.has(dup)) { console.error(`❌ No existe: ${dup}`); errors++ }
  if (!files.has(keep)) { console.error(`❌ No existe: ${keep}`); errors++ }
  if (!files.has(dup) || !files.has(keep)) continue

  const d = frontmatter(readFileSync(DIR + dup, 'utf8'))
  const k = frontmatter(readFileSync(DIR + keep, 'utf8'))
  const yaml = YAML
  const df = yaml.parse(d.fm)
  const kf = yaml.parse(k.fm)

  if (normTitle(df.title) !== normTitle(kf.title)) {
    console.error(`❌ Títulos distintos — NO se borra: ${dup} (${df.title}) vs ${keep} (${kf.title})`)
    errors++
  }
  if (df.institution !== kf.institution || df.degreeType !== kf.degreeType) {
    console.error(`❌ institution/degreeType distintos: ${dup}`)
    errors++
  }
}

for (const [from, to] of Object.entries(RENAME)) {
  if (!files.has(from)) { console.error(`❌ No existe: ${from}`); errors++ }
  if (files.has(to)) { console.error(`❌ Ya existe destino: ${to}`); errors++ }
}

if (errors > 0) {
  console.error(`\n${errors} errores de validación. No se aplica nada.`)
  process.exit(1)
}

// --- Plan --------------------------------------------------------------------

console.log(`=== DEDUPE src/content/careers ===`)
console.log(`Modo: ${APPLY ? 'APPLY' : 'DRY-RUN (usar --apply para aplicar)'}\n`)

for (const [dup, keep] of Object.entries(DELETE)) {
  console.log(`🗑️  BORRAR   ${dup}`)
  console.log(`   conserva: ${keep}`)
}
for (const [dup, keep] of Object.entries(MERGE)) {
  console.log(`🔀 FUSIONAR ${dup}`)
  console.log(`   copia cuerpo a: ${keep} (y borra el duplicado)`)
}
for (const [from, to] of Object.entries(RENAME)) {
  console.log(`📝 RENOMBRAR ${from} → ${to}`)
}
console.log(`\nResumen: ${Object.keys(DELETE).length} borrados, ${Object.keys(MERGE).length} fusionados, ${Object.keys(RENAME).length} renombrados`)

// --- Aplicar ----------------------------------------------------------------

if (!APPLY) process.exit(0)

for (const [dup, keep] of Object.entries(MERGE)) {
  const dupRaw = readFileSync(DIR + dup, 'utf8')
  const keepRaw = readFileSync(DIR + keep, 'utf8')
  const dupF = frontmatter(dupRaw)
  const keepF = frontmatter(keepRaw)
  // conservar frontmatter del archivo limpio; tomar el cuerpo del duplicado (más completo)
  const merged = `---\n${keepF.fm}\n---\n${dupF.body}`
  writeFileSync(DIR + keep, merged, 'utf8')
  unlinkSync(DIR + dup)
  console.log(`✅ Fusionado: ${dup} → ${keep}`)
}

for (const dup of Object.keys(DELETE)) {
  unlinkSync(DIR + dup)
  console.log(`✅ Borrado: ${dup}`)
}

for (const [from, to] of Object.entries(RENAME)) {
  renameSync(DIR + from, DIR + to)
  console.log(`✅ Renombrado: ${from} → ${to}`)
}

console.log('\n✅ Dedupe aplicado.')
