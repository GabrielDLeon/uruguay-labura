import bookOpenOutline from '@iconify-icons/mdi/book-open-outline.js'
import calendarTextOutline from '@iconify-icons/mdi/calendar-text-outline.js'
import clipboardAccountOutline from '@iconify-icons/mdi/clipboard-account-outline.js'

/** @type {Record<string, { width: number, height: number, body: string }>} */
const DEFAULT_TAB_ICONS = {
  Resumen: bookOpenOutline,
  Ingreso: clipboardAccountOutline,
  'Plan de Estudio': calendarTextOutline,
}

const PROSE_CLASS = 'prose prose-sm dark:prose-invert max-w-none'

/**
 * Transforma las secciones (`##` de nivel 2) en un contenedor de tabs.
 *
 * Emite nodos `html` de MDAST (raw HTML) en lugar de nodos JSX de MDX, para que
 * funcione con el procesador de Markdown plano (sin @astrojs/mdx), que preserva
 * el HTML crudo vía rehype-raw.
 *
 * @param {{ tabIcons?: Record<string, { width: number, height: number, body: string }> }} [options]
 */
export default function remarkTabs(options) {
  const tabIcons = { ...DEFAULT_TAB_ICONS, ...options?.tabIcons }

  return (tree) => {
    const sections = []
    let intro = []
    let currentSection = null

    for (const node of tree.children) {
      if (node.type === 'heading' && node.depth === 2) {
        if (currentSection) sections.push(currentSection)
        currentSection = { label: extractText(node), children: [] }
      } else if (currentSection) {
        currentSection.children.push(node)
      } else {
        intro.push(node)
      }
    }
    if (currentSection) sections.push(currentSection)
    if (sections.length === 0) return

    const id = slugify(sections[0].label)
    const newChildren = []

    // Wrap intro content (before first h2) in a prose div
    if (intro.length > 0) {
      newChildren.push({ type: 'html', value: `<div class="${PROSE_CLASS}">` })
      newChildren.push(...intro)
      newChildren.push({ type: 'html', value: '</div>' })
    }

    // .tabs wrapper
    newChildren.push({ type: 'html', value: `<div class="tabs" id="${id}">` })

    // nav[role="tablist"] with the tab buttons
    let nav =
      '<nav role="tablist" aria-orientation="horizontal" class="flex flex-wrap gap-x-3">'
    sections.forEach((section, i) => {
      nav += buildButtonHtml(section.label, id, i + 1, i === 0, tabIcons)
    })
    nav += '</nav>'
    newChildren.push({ type: 'html', value: nav })

    // Tab panels. Content of each section is emitted as raw MDAST nodes in
    // between the raw opening/closing panel tags so Markdown keeps processing it.
    sections.forEach((section, i) => {
      const tabNum = i + 1
      newChildren.push({
        type: 'html',
        value:
          `<div role="tabpanel" id="${id}-panel-${tabNum}" aria-labelledby="${id}-tab-${tabNum}" tabindex="-1" class="${PROSE_CLASS}"${i !== 0 ? ' hidden' : ''}>`,
      })
      newChildren.push(...section.children)
      newChildren.push({ type: 'html', value: '</div>' })
    })

    newChildren.push({ type: 'html', value: '</div>' })
    tree.children = newChildren
  }
}

/**
 * Build the HTML string for a tab button: optional SVG icon + escaped label.
 *
 * @param {string} label
 * @param {string} id
 * @param {number} tabNum
 * @param {boolean} isFirst
 * @param {Record<string, { width: number, height: number, body: string }>} iconMap
 * @returns {string}
 */
function buildButtonHtml(label, id, tabNum, isFirst, iconMap) {
  const icon = iconMap[label]
  const selected = isFirst ? 'true' : 'false'
  const tabindex = isFirst ? '0' : '-1'
  const children =
    (icon
      ? `<svg class="inline-block w-5 h-5 mr-1.5 align-middle shrink-0" width="${icon.width}" height="${icon.height}" viewBox="0 0 ${icon.width} ${icon.height}" fill="currentColor" aria-hidden="true">${icon.body}</svg>`
      : '') + escapeHtml(label)
  return (
    `<button type="button" role="tab" id="${id}-tab-${tabNum}" aria-controls="${id}-panel-${tabNum}" aria-selected="${selected}" tabindex="${tabindex}">${children}</button>`
  )
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function extractText(node) {
  if (node.type === 'text') return node.value
  if (node.children) {
    return node.children.map(extractText).join('')
  }
  return ''
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/^$/, 'tabs')
}