#!/usr/bin/env node
/**
 * Normaliza el formato del campo `duration` en src/content/careers.
 *
 * Formato canónico (duración expresada en años):
 *  - "N año(s)"            años exactos (p.ej. "1 año", "5 años")
 *  - "N.5 años"            medios años exactos con punto decimal (p.ej. "1.5 años")
 *  - "N años y M mes(es)"  resto no múltiplo de 6 meses (p.ej. "1 año y 3 meses")
 *  - "N meses"             solo duraciones menores a 1 año (p.ej. "10 meses")
 *  - "N horas"             cursos medidos en horas, sin paréntesis
 *                            (los créditos ya viven en el campo `credits`)
 *  - "N semanas"           unidades no convertibles a años (p.ej. "6 semanas")
 *  - "A-B ..."            rangos con ambos extremos ya normalizados
 *                            (p.ej. "1-2 años", "2-2.5 años", "3-5 años")
 *  - Sin campo cuando la duración no está publicada (se muestra "-" en la UI)
 *
 * Conversiones:
 *  - "18 meses"                         -> "1.5 años"
 *  - "60 meses"                         -> "5 años"
 *  - "25 meses"                         -> "2 años y 1 mes"
 *  - "1 año y medio"                    -> "1.5 años"
 *  - "2,5 años"                         -> "2.5 años" (coma -> punto)
 *  - "3 semestres"                      -> "1.5 años"
 *  - "Tres semestres + Práctica ..."    -> "1.5 años"
 *  - "4 años + 1 semestre de internado" -> "4.5 años" (+ con cantidad suma)
 *  - "4 años + 3 meses (portafolio)"    -> "4 años y 3 meses"
 *  - "2 años + Tesis"                   -> "2 años" (+ sin cantidad se descarta)
 *  - "1 año (160 horas, 16 créditos)"   -> "1 año" (paréntesis se descarta)
 *  - "24 a 30 meses"                    -> "2-2.5 años"
 *  - "No especificado"/"No informada"   -> se elimina el campo
 *
 * Uso:
 *   node scripts/normalize-duration.mjs          # dry-run (por defecto)
 *   node scripts/normalize-duration.mjs --apply  # aplica los cambios
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const DIR = join(process.cwd(), 'src/content/careers')
const APPLY = process.argv.includes('--apply')

const SPELLED = {
  un: 1, uno: 1, una: 1,
  dos: 2, tres: 3, cuatro: 4, cinco: 5,
  seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10,
}

function parseNumber(token) {
  const t = token.trim().toLowerCase()
  if (/^\d+([.,]\d+)?$/.test(t)) return Number(t.replace(',', '.'))
  if (SPELLED[t] !== undefined) return SPELLED[t]
  return undefined
}

/** "1 año" (singular) vs "N años". */
function fmtYears(n) {
  return n === 1 ? '1 año' : `${n} años`
}

/** "1 mes" (singular) vs "N meses". */
function fmtMonths(n) {
  return n === 1 ? '1 mes' : `${n} meses`
}

/**
 * Convierte un total de meses a su forma canónica:
 * 12 -> "1 año", 18 -> "1.5 años", 25 -> "2 años y 1 mes", 8 -> "8 meses".
 */
function monthsToCanonical(total) {
  if (total < 12) return fmtMonths(total)
  const years = Math.floor(total / 12)
  const rest = total % 12
  if (rest === 0) return fmtYears(years)
  if (rest === 6) {
    const dec = `${years}.5`
    return `${dec} años`
  }
  return `${fmtYears(years)} y ${fmtMonths(rest)}`
}

/** Parsea una cantidad con unidad a meses. Retorna undefined si no matchea. */
function chunkToMonths(chunk) {
  let m = /^([\d.,]+|\w+)\s+años?\s*(y\s+medio)?$/.exec(chunk)
  if (m) {
    const n = parseNumber(m[1])
    if (n === undefined) return undefined
    return Math.round(n * 12) + (m[2] ? 6 : 0)
  }
  m = /^([\d.,]+|\w+)\s+meses?$/.exec(chunk)
  if (m) {
    const n = parseNumber(m[1])
    return n === undefined ? undefined : Math.round(n)
  }
  m = /^([\d.,]+|\w+)\s+semestres?$/.exec(chunk)
  if (m) {
    const n = parseNumber(m[1])
    return n === undefined ? undefined : Math.round(n * 6)
  }
  return undefined
}

/**
 * Normaliza un tramo simple (sin "+...", sin paréntesis, sin rango).
 * Retorna el string canónico o undefined si no lo reconoce.
 */
function normalizeSingle(value) {
  const v = value.trim().replace(/\s+/g, ' ')
  if (v === '') return undefined

  const months = chunkToMonths(v.toLowerCase())
  if (months !== undefined) {
    return monthsToCanonical(months)
  }

  let m = /^(\d+)\s+horas?$/.exec(v.toLowerCase())
  if (m) return `${Number(m[1])} horas`

  m = /^(\d+)\s+semanas?$/.exec(v.toLowerCase())
  if (m) {
    const n = Number(m[1])
    return n === 1 ? '1 semana' : `${n} semanas`
  }

  return undefined
}

function normalize(value) {
  const v = value.trim().replace(/\s+/g, ' ')
  if (v === 'No especificado' || v === 'No informada' || v === '') {
    return null
  }

  let m = /^(.+?)\s*-\s*(.+?)\s+años?$/.exec(v)
  if (m) {
    const withUnit = (s) =>
      /\d|uno|dos|tres|cuatro|cinco/.test(s) && !/(años?|meses?|semestres?)/.test(s.toLowerCase())
        ? `${s.trim()} años`
        : s.trim()
    const a = chunkToMonths(withUnit(m[1]).toLowerCase())
    const b = chunkToMonths(withUnit(m[2]).toLowerCase())
    if (a !== undefined && b !== undefined) {
      const fa = monthsToCanonical(a)
      const fb = monthsToCanonical(b)
      const ua = fa.match(/\d(?:\.\d+)?\s+(año(?:s)?|mes(?:es)?)$/)
      const ub = fb.match(/\d(?:\.\d+)?\s+(año(?:s)?|mes(?:es)?)$/)
      const sameUnit = ua && ub && ua[1][0] === ub[1][0]
      if (sameUnit) {
        const numA = fa.replace(/\s+(años?|meses?)$/, '')
        return `${numA}-${fb}`
      }
      return `${fa} a ${fb}`
    }
  }

  m = /^(\d+)\s+a\s+(\d+)\s+meses?$/.exec(v.toLowerCase())
  if (m) {
    const fa = monthsToCanonical(Number(m[1]))
    const fb = monthsToCanonical(Number(m[2]))
    const numA = fa.replace(/\s+(años?|meses?)$/, '')
    const unitB = fb.match(/\s+(años?|meses?)$/)?.[0] ?? ''
    const unitA = fa.match(/\s+(años?|meses?)$/)?.[0] ?? ''
    if (unitA === unitB) return `${numA}-${fb}`
    return `${fa} a ${fb}`
  }

  m = /^entre\s+(\d+)\s+y\s+(\d+)\s+meses?\b/.exec(v.toLowerCase())
  if (m) {
    const a = Number(m[1])
    const b = Number(m[2])
    if (b <= 12) return `${a}-${b} meses`
    const fa = monthsToCanonical(a)
    const fb = monthsToCanonical(b)
    const numA = fa.replace(/\s+(años?|meses?)$/, '')
    const unitB = fb.match(/\s+(años?|meses?)$/)?.[0] ?? ''
    const unitA = fa.match(/\s+(años?|meses?)$/)?.[0] ?? ''
    if (unitA === unitB) return `${numA}-${fb}`
    return `${fa} a ${fb}`
  }

  let base = v
  if (base.includes(',')) {
    const first = base.split(',')[0].trim()
    if (chunkToMonths(first.toLowerCase()) !== undefined) base = first
  }

  base = base.replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim()

  if (base.includes('+')) {
    const parts = base.split('+').map((p) => p.trim()).filter(Boolean)
    let total = 0
    for (const part of parts) {
      const head = /^([\d.,]+|\w+)\s+(años?|meses?|semestres?)\b/.exec(part.toLowerCase())
      const months = head ? chunkToMonths(`${head[1]} ${head[2]}`) : chunkToMonths(part.toLowerCase())
      if (months === undefined) {
        if (total === 0) return undefined
        continue
      }
      total += months
    }
    if (total === 0) return undefined
    return monthsToCanonical(total)
  }

  return normalizeSingle(base)
}

const files = readdirSync(DIR).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
const changes = []
const unknown = []

for (const file of files) {
  const path = join(DIR, file)
  const content = readFileSync(path, 'utf8')
  const parts = content.split('---')
  if (parts.length < 3) continue
  const frontmatter = parts[1]

  const lines = frontmatter.split('\n')
  let modified = false
  for (let i = 0; i < lines.length; i++) {
    const match = /^duration:\s*(.*)$/.exec(lines[i])
    if (!match) continue
    const raw = match[1].replace(/^["']|["']$/g, '')
    const result = normalize(raw)
    if (result === undefined) {
      unknown.push(`${file}: ${raw}`)
      continue
    }
    if (result === null) {
      lines.splice(i, 1)
      i--
      modified = true
    } else if (result !== raw) {
      lines[i] = `duration: "${result}"`
      modified = true
    }
  }

  if (modified) {
    changes.push({ file, before: content, after: parts[0] + '---' + lines.join('\n') + '---' + parts.slice(2).join('---') })
  }
}

if (unknown.length > 0) {
  console.error(`ERROR: ${unknown.length} valor(es) sin reconocer:`)
  for (const u of unknown) console.error(`  - ${u}`)
  process.exit(1)
}

const removed = changes.filter((c) => {
  const before = c.before.split('---')[1]
  const after = c.after.split('---')[1]
  return before.includes('duration:') && !after.includes('duration:')
}).length

console.log(`Normalizando ${changes.length} archivos (${removed} sin duración):`)
for (const c of changes) {
  const before = c.before.split('---')[1].match(/^duration:\s*(.*)$/m)?.[1] ?? '-'
  const after = c.after.split('---')[1].match(/^duration:\s*(.*)$/m)?.[1] ?? '(eliminado)'
  console.log(`  ${c.file}: ${before} -> ${after}`)
}

if (!APPLY) {
  console.log('\nDry-run: no se aplicaron cambios. Usá --apply para aplicarlos.')
  process.exit(0)
}

for (const c of changes) {
  writeFileSync(join(DIR, c.file), c.after)
}

console.log(`\nAplicado: ${changes.length} archivos modificados.`)
