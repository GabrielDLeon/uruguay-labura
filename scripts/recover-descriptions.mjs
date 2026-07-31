#!/usr/bin/env node
/**
 * Recupera descripciones completas para carreras cuya description quedó truncada a ~460 chars.
 *
 * Fuentes:
 *  - UDELAR posgrado (cap.posgrados.udelar.edu.uy): descarga la ficha PDF oficial del CAP
 *    y extrae el texto de la sección donde arranca la descripción actual.
 *  - ORT (facs.ort.edu.uy / fi.ort.edu.uy): usa el <meta name="description"> de la página.
 *  - Resto (UDELAR grado): no recuperable automáticamente -> se elimina el '…' final.
 *
 * Uso:
 *   node scripts/recover-descriptions.mjs            # dry-run (descarga y cachea, no escribe)
 *   node scripts/recover-descriptions.mjs --apply    # escribe los cambios
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs'
import { createRequire } from 'node:module'
import zlib from 'node:zlib'
import crypto from 'node:crypto'

const require = createRequire(import.meta.url)
let YAML
try {
  YAML = require('yaml')
} catch {
  YAML = require('/home/gabriel/dev/uruguay-labura/node_modules/.pnpm/yaml@2.8.3/node_modules/yaml')
}

const DIR = new URL('../src/content/educacion/', import.meta.url).pathname
const CACHE = '/tmp/desc_cache'
const APPLY = process.argv.includes('--apply')
const MAX = 460
const CONCURRENCY = 8

mkdirSync(CACHE, { recursive: true })

// --- Utilidades --------------------------------------------------------------

function splitFm(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---/)
  return m ? { fm: m[1], body: raw.slice(m[0].length) } : null
}

function ascii(t) {
  return t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function cleanText(t) {
  return t
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u0080-\u009F]/g, '')
    .replace(/[»•]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/…+$/, '')
}

function truncate(t, max) {
  if (t.length <= max) return t
  const cut = t.slice(0, max)
  const lastSentence = cut.lastIndexOf('. ')
  const lastWord = cut.lastIndexOf(' ')
  const at = lastSentence > max * 0.5 ? lastSentence + 1 : lastWord > 0 ? lastWord : max
  return cut.slice(0, at)
}

function decodeEntities(t) {
  return t
    .replace(/&aacute;/gi, 'á').replace(/&eacute;/gi, 'é').replace(/&iacute;/gi, 'í')
    .replace(/&oacute;/gi, 'ó').replace(/&uacute;/gi, 'ú').replace(/&ntilde;/gi, 'ñ')
    .replace(/&Aacute;/gi, 'Á').replace(/&Eacute;/gi, 'É').replace(/&Iacute;/gi, 'Í')
    .replace(/&Oacute;/gi, 'Ó').replace(/&Uacute;/gi, 'Ú').replace(/&Ntilde;/gi, 'Ñ')
    .replace(/&uuml;/gi, 'ü').replace(/&iexcl;/gi, '¡').replace(/&iquest;/gi, '¿')
    .replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#39;/gi, "'")
}

// --- PDF (CAP) ---------------------------------------------------------------

function pdfText(pdf) {
  const s = pdf.toString('latin1')
  const out = []
  let pos = 0
  while (true) {
    const start = s.indexOf('stream\n', pos)
    if (start === -1) break
    const end = s.indexOf('endstream', start + 7)
    if (end === -1) break
    try {
      const data = zlib.inflateSync(Buffer.from(s.slice(start + 7, end), 'latin1')).toString('latin1')
      const tj = data.match(/\((?:\\.|[^\\()])*\)\s*Tj/g)
      if (tj)
        for (const t of tj) out.push(t.slice(1, t.lastIndexOf(')')).replace(/\\\(/g, '(').replace(/\\\)/g, ')'))
    } catch {}
    pos = end + 9
  }
  return out.join('')
}

// encuentra la sección del PDF que contiene el inicio de la descripción actual
function recoverFromPdf(pdfBuf, descStart) {
  const text = cleanText(pdfText(pdfBuf))
  if (text.length < 200) return null
  const asciiText = ascii(text)
  const key = ascii(descStart.slice(0, 60))
  const idx = asciiText.indexOf(key)
  if (idx === -1) return null
  // cortar en la próxima sección (heading en el flujo continuo)
  const sections = [
    'Perfil de egreso', 'Perfil de egresado', 'Programa de estudios', 'Programa analítico',
    'Requisitos de ingreso', 'Requisitos para postular', 'Estructura del programa',
    'Objetivos específicos', 'Plan de estudios', 'Carga horaria', 'Título otorgado',
    'Modalidad', 'Duración', 'Inscripciones', 'Contacto', 'Referentes académicos',
    'Fecha de revisión',
  ]
  let end = text.length
  for (const sec of sections) {
    const j = asciiText.indexOf(ascii(sec), idx + key.length)
    if (j !== -1 && j < end) end = j
  }
  let chunk = text.slice(idx, end)
  // si la sección completa es enorme, truncar en párrafos (doble espacio no existe: cortar por frases)
  return truncate(chunk, MAX + 400)
}

// para placeholders (sin texto previo): tomar la sección Objetivos/Resumen del PDF
function recoverFromPdfByHeading(pdfBuf) {
  const text = cleanText(pdfText(pdfBuf))
  if (text.length < 200) return null
  const asciiText = ascii(text)
  const headings = ['Objetivos', 'Objetivo', 'Resumen', 'Descripción', 'Descripcion', 'Fundamentación', 'Fundamentacion']
  for (const h of headings) {
    const idx = asciiText.indexOf(ascii(h))
    if (idx === -1) continue
    const sections = [
      'Perfil de egreso', 'Perfil de egresado', 'Programa de estudios', 'Programa analítico',
      'Requisitos de ingreso', 'Requisitos para postular', 'Estructura del programa',
      'Objetivos específicos', 'Plan de estudios', 'Carga horaria', 'Título otorgado',
      'Modalidad', 'Duración', 'Inscripciones', 'Contacto', 'Referentes académicos',
      'Fecha de revisión', 'Datos generales', 'Datos de control',
    ]
    let end = text.length
    for (const sec of sections) {
      const j = asciiText.indexOf(ascii(sec), idx + ascii(h).length)
      if (j !== -1 && j < end) end = j
    }
    const chunk = text.slice(idx + ascii(h).length, end)
    const clean = cleanText(chunk).replace(/Fecha de revisi[oó]n:\s*\d{2}\/\d{2}\/\d{4}/g, '')
    if (clean.length > 80) return clean
  }
  return null
}

// --- Descarga con caché ------------------------------------------------------

async function fetchCached(url) {
  const key = crypto.createHash('sha1').update(url).digest('hex').slice(0, 32)
  const file = `${CACHE}/${key}`
  if (existsSync(file)) return readFileSync(file)
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(25000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  writeFileSync(file, buf)
  return buf
}

// --- Proceso ----------------------------------------------------------------

const files = readdirSync(DIR).filter((f) => f.endsWith('.mdx')).sort()
const todo = []

for (const file of files) {
  const raw = readFileSync(DIR + file, 'utf8')
  const parts = splitFm(raw)
  const doc = YAML.parse(parts.fm)
  const desc = (doc.description || '').trim()
  const placeholder =
    desc.includes('…') ||
    desc === 'Información no disponible en el catálogo de posgrados de Udelar.' ||
    /^https?:/.test(desc) ||
    /^Link de pagina/.test(desc)
  if (!placeholder) continue
  todo.push({ file, desc, website: doc.website || '', isTruncated: desc.includes('…') })
}

console.log(`=== RECOVER DESCRIPTIONS (${APPLY ? 'APPLY' : 'DRY-RUN'}) ===`)
console.log(`A procesar: ${todo.length} (truncadas + placeholders)\n`)

const results = { pdf: [], ort: [], strip: [], fail: [] }

async function worker(item) {
  const { file, desc, website, isTruncated } = item
  const descStart = desc.slice(0, 100)
  let newDesc = null
  let source = ''

  try {
    if (website.includes('cap.posgrados.udelar.edu.uy')) {
      const m = website.match(/idServicio=(\d+)&idPosgrado=(\d+)/)
      if (m) {
        const pdfUrl = `https://cap.posgrados.udelar.edu.uy/fpdf/posgradoPDF.php?idServicio=${m[1]}&idPosgrado=${m[2]}`
        const pdf = await fetchCached(pdfUrl)
        const rec = isTruncated
          ? recoverFromPdf(pdf, descStart)
          : recoverFromPdfByHeading(pdf)
        if (rec && rec.length > (isTruncated ? desc.length - 20 : 80)) {
          newDesc = truncate(rec, MAX)
          source = 'pdf CAP'
        }
      }
    } else if (website.includes('ort.edu.uy')) {
      const html = (await fetchCached(website)).toString('utf8')
      const md = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)
      if (md && md[1].trim().length > 60) {
        newDesc = truncate(cleanText(decodeEntities(md[1])), MAX)
        source = 'meta ORT'
      }
    }
  } catch (e) {
    results.fail.push(`${file}\t${e.message}`)
    return
  }

  if (newDesc) {
    results[source === 'pdf CAP' ? 'pdf' : 'ort'].push({ file, newDesc, oldLen: desc.length })
  } else if (isTruncated) {
    // sin fuente: solo quitar el '…'
    newDesc = desc.replace(/…+$/, '').trim()
    results.strip.push({ file, newDesc, oldLen: desc.length })
  } else {
    results.fail.push(`${file}\tsin recuperar (se conserva el placeholder)`)
  }
}

const pool = [...todo]
let i = 0
async function run() {
  const workers = Array.from({ length: Math.min(CONCURRENCY, pool.length) }, async () => {
    while (i < pool.length) {
      const item = pool[i++]
      await worker(item)
    }
  })
  await Promise.all(workers)
}
await run()

for (const r of results.pdf) console.log(`📄 PDF   ${r.file}\t${r.oldLen}→${r.newDesc.length}`)
for (const r of results.ort) console.log(`🌐 ORT   ${r.file}\t${r.oldLen}→${r.newDesc.length}`)
console.log(`\n— Sin fuente (solo se quita '…'): ${results.strip.length}`)
for (const r of results.strip) console.log(`   ✂️  ${r.file}\t${r.oldLen}→${r.newDesc.length}`)
if (results.fail.length) {
  console.log(`\n— Fallos de descarga: ${results.fail.length}`)
  for (const f of results.fail) console.log(`   ⚠️  ${f}`)
}
console.log(
  `\nResumen: ${results.pdf.length} via PDF, ${results.ort.length} via ORT, ${results.strip.length} solo-quita-'…', ${results.fail.length} fallos`
)

// --- Aplicar ----------------------------------------------------------------

if (APPLY) {
  const all = [...results.pdf, ...results.ort, ...results.strip]
  for (const { file, newDesc } of all) {
    const raw = readFileSync(DIR + file, 'utf8')
    const parts = splitFm(raw)
    const newFm = parts.fm.replace(/^description:.*$/m, `description: ${JSON.stringify(newDesc)}`)
    writeFileSync(DIR + file, `---\n${newFm}\n---\n${parts.body}`, 'utf8')
  }
  console.log(`\n✅ Aplicado a ${all.length} archivos.`)
}
