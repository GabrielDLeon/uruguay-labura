#!/usr/bin/env node
/**
 * Corrige descripciones de src/content/educacion.
 *
 * Casos:
 *  1. TRUNCADAS  -> la description termina en '…' (cortada a ~460 chars en el import).
 *     Se regenera desde el cuerpo (sección ## Resumen / ## Objetivo / ## Descripción).
 *  2. PLACEHOLDER -> description "X, ofrecido por la Universidad..." (autogenerada).
 *     Se regenera desde el cuerpo si hay sección; si no, queda igual.
 *  3. BASURA -> description capturó nombre de referente académico o URL.
 *     Se reemplaza por descripción editorial factual (verificada contra el CAP).
 *  4. Fuera de alcance: descripciones válidas (correctas, solo breves) NO se tocan.
 *
 * Uso:
 *   node scripts/fix-descriptions.mjs            # dry-run
 *   node scripts/fix-descriptions.mjs --apply    # aplicar
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
let YAML
try {
  YAML = require('yaml')
} catch {
  YAML = require('/home/gabriel/dev/uruguay-labura/node_modules/.pnpm/yaml@2.8.3/node_modules/yaml')
}

const DIR = new URL('../src/content/educacion/', import.meta.url).pathname
const APPLY = process.argv.includes('--apply')
const MAX = 460 // límite original del import

// Descripciones editoriales verificadas contra el CAP (las fuentes no tienen texto narrativo)
const MANUAL = {
  'afrodescendencia-y-politicas-publicas-especializacion-udelar.mdx':
    'Especialización en Afrodescendencia y Políticas Públicas, dictada por la Facultad de Ciencias Sociales de la Universidad de la República (UDELAR). Programa de posgrado orientado a las políticas públicas desde la perspectiva de la afrodescendencia; no se encuentra vigente según el catálogo de posgrados.',
  'carnaval-y-patrimonio-especializacion-udelar.mdx':
    'Especialización en Carnaval y Patrimonio, dictada por la Facultad de Ciencias Sociales de la Universidad de la República (UDELAR). Programa de posgrado en torno al carnaval y el patrimonio cultural; no se encuentra vigente según el catálogo de posgrados.',
  'gestion-de-servicios-de-salud-de-enfermeria-especializacion-udelar.mdx':
    'Especialización en Gestión de Servicios de Salud de Enfermería, dictada por la Facultad de Enfermería de la Universidad de la República (UDELAR). Programa de posgrado orientado a la formación de profesionales de enfermería en la gestión de servicios de salud.',
  'jovenes-juventud-y-politicas-publicas-especializacion-udelar.mdx':
    'Especialización en Jóvenes, Juventud y Políticas Públicas, dictada por la Facultad de Ciencias Sociales de la Universidad de la República (UDELAR). Programa de posgrado sobre juventud y políticas públicas; no se encuentra vigente según el catálogo de posgrados.',
  'todas-las-areas-del-conocimiento-biomedico-maestria-udelar.mdx':
    'Maestría en todas las áreas del conocimiento biomédico, dictada por la Facultad de Medicina de la Universidad de la República (UDELAR). Programa de posgrado de 24 meses de duración y 100 créditos de cursos, según el catálogo de posgrados.',
}

// --- Utilidades --------------------------------------------------------------

function splitFm(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---/)
  return m ? { fm: m[1], body: raw.slice(m[0].length) } : null
}

function cleanText(t) {
  return t
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // markdown links -> texto
    .replace(/[*_>`~]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .trim()
    .replace(/…+$/, '')
    .replace(/\s+$/, '')
}

// primer párrafo de la sección ## Resumen/Objetivo/Descripción
function bodyResumen(body) {
  const headings = ['Resumen', 'Objetivo', 'Descripción', 'Descripcion', 'Sobre la carrera', 'Presentación', 'Presentacion']
  for (const h of headings) {
    const re = new RegExp(`^##\\s+${h}\\s*\\n+([\\s\\S]*?)(?=^## |\\z)`, 'm')
    const m = body.match(re)
    if (!m) continue
    const p = m[1].trim().split(/\n\s*\n/)[0] // primer párrafo
    if (p.length > 40) return cleanText(p)
  }
  return null
}

// truncar limpio en límite de oración/palabra, sin '…'
function truncate(t, max) {
  if (t.length <= max) return t
  const cut = t.slice(0, max)
  const lastSentence = cut.lastIndexOf('. ')
  const lastWord = cut.lastIndexOf(' ')
  const at = lastSentence > max * 0.5 ? lastSentence + 1 : lastWord > 0 ? lastWord : max
  return cut.slice(0, at)
}

// --- Proceso -----------------------------------------------------------------

const files = readdirSync(DIR).filter((f) => f.endsWith('.mdx')).sort()
const stats = { truncadas: 0, regeneradas: 0, placeholders: 0, placeholderFix: 0, manuales: 0, sinFuente: 0 }
const report = []

for (const file of files) {
  const raw = readFileSync(DIR + file, 'utf8')
  const parts = splitFm(raw)
  const doc = YAML.parse(parts.fm)
  const desc = (doc.description || '').trim()
  let newDesc = null
  let reason = ''

  if (desc.includes('…')) {
    stats.truncadas++
    reason = 'truncada'
    const rec = bodyResumen(parts.body)
    if (rec && rec.length > desc.length - 20) {
      newDesc = truncate(rec, MAX)
      stats.regeneradas++
      reason += ' -> regenerada del cuerpo'
    } else {
      stats.sinFuente++
      reason += ' -> sin fuente (se deja igual)'
    }
  } else if (/^[^,]+,\s*ofrecido por la Universidad/.test(desc)) {
    stats.placeholders++
    reason = 'placeholder'
    const rec = bodyResumen(parts.body)
    if (rec) {
      newDesc = truncate(rec, MAX)
      stats.placeholderFix++
      reason += ' -> regenerada del cuerpo'
    } else {
      reason += ' -> sin fuente (se deja igual)'
    }
  } else if (MANUAL[file]) {
    stats.manuales++
    newDesc = MANUAL[file]
    reason = 'basura -> editorial (verificada CAP)'
  }

  if (newDesc && newDesc !== desc) {
    report.push(`${file}\t${reason}`)
    if (APPLY) {
      const block = `description: ${JSON.stringify(newDesc)}`
      const newFm = parts.fm.replace(/^description:.*$/m, block)
      writeFileSync(DIR + file, `---\n${newFm}\n---\n${parts.body}`, 'utf8')
    }
  }
}

// --- Reporte ----------------------------------------------------------------

console.log(`=== FIX DESCRIPTIONS (${APPLY ? 'APPLY' : 'DRY-RUN'}) ===`)
console.log(
  `Truncadas: ${stats.truncadas} | regeneradas del cuerpo: ${stats.regeneradas} | sin fuente: ${stats.sinFuente}`
)
console.log(
  `Placeholders: ${stats.placeholders} | regenerados: ${stats.placeholderFix} | manuales (basura): ${stats.manuales}`
)
console.log(`Total a cambiar: ${report.length}\n`)

for (const line of report) console.log(line)

console.log(`\n${APPLY ? '✅ Aplicado.' : '→ Usar --apply para aplicar (DRY-RUN, no se escribió nada)'}`)
