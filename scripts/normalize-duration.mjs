#!/usr/bin/env node
/**
 * Normaliza el formato del campo `duration` en src/content/educacion.
 *
 * Formato canónico:
 *  - "N años"  para duraciones enteras (p.ej. "5 años")
 *  - "N meses" para duraciones menores al año o no exactas (p.ej. "18 meses")
 *  - "N1-N2 años" para rangos (p.ej. "1-2 años")
 *  - Sin campo cuando la duración no está publicada (se muestra "-" en la UI)
 *
 * Conversiones:
 *  - "60 meses (5 años)"            -> "5 años"
 *  - "1 año y medio"                -> "18 meses"
 *  - "2 años + trabajo final"       -> "2 años"
 *  - "1 año (hasta 2 años)"         -> "1-2 años"
 *  - "3 semestres y una práctica"   -> "18 meses"
 *  - "No especificado"/"No informada" -> se elimina el campo
 *
 * Uso:
 *   node scripts/normalize-duration.mjs          # dry-run (por defecto)
 *   node scripts/normalize-duration.mjs --apply  # aplica los cambios
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'

const DIR = join(process.cwd(), 'src/content/educacion')
const APPLY = process.argv.includes('--apply')

function normalize(value) {
  const v = value.trim()
  if (v === 'No especificado' || v === 'No informada' || v === '') {
    return null // eliminar campo
  }

  // "60 meses (5 años)" -> "5 años"
  let m = /^(\d+)\s+meses?\s+\((\d+)\s+años?\)$/.exec(v)
  if (m) return Number(m[2]) === 1 ? '1 año' : `${Number(m[2])} años`

  // "1 año (hasta 2 años)" -> "1-2 años"
  if (/^(\d+)\s+años?\s+\(hasta\s+(\d+)\s+años?\)$/.test(v)) {
    return v.replace(/^(\d+)\s+años?\s+\(hasta\s+(\d+)\s+años?\)$/, '$1-$2 años')
  }

  // "N años + trabajo final" -> "N años"
  m = /^(\d+)\s+años?\s+\+/.exec(v)
  if (m) return Number(m[1]) === 1 ? '1 año' : `${Number(m[1])} años`

  // "N años y medio" -> "(N*12+6) meses"
  m = /^(\d+)\s+años?\s+y\s+medio/.exec(v)
  if (m) return `${Number(m[1]) * 12 + 6} meses`

  // "3 semestres y una práctica profesional" -> "18 meses"
  if (/^\d+\s+semestres/.test(v)) {
    const s = /^(\d+)\s+semestres/.exec(v)
    return `${Number(s[1]) * 6} meses`
  }

  // "N años" / "N meses" ya canónicos
  if (/^\d+\s+años?$/.test(v)) return v
  if (/^\d+\s+meses$/.test(v)) return v

  return undefined // no reconocido
}

const files = readdirSync(DIR).filter((f) => f.endsWith('.mdx'))
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
    } else if (result !== raw) {
      lines[i] = `duration: "${result}"`
    }
    modified = true
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
