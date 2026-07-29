import bookOpenOutline from '@iconify-icons/mdi/book-open-outline.js'
import calendarTextOutline from '@iconify-icons/mdi/calendar-text-outline.js'
import certificateOutline from '@iconify-icons/mdi/certificate-outline.js'
import schoolOutline from '@iconify-icons/mdi/school-outline.js'
import accountGroupOutline from '@iconify-icons/mdi/account-group-outline.js'

/** @type {Record<string, { width: number, height: number, body: string }>} */
const DEFAULT_TAB_ICONS = {
  Resumen: bookOpenOutline,
  'Plan de Estudio': calendarTextOutline,
  'Títulos intermedios': certificateOutline,
  'Ciclo Inicial Optativo': schoolOutline,
  Comunidades: accountGroupOutline,
}

const PROSE_CLASS = 'prose prose-sm dark:prose-invert max-w-none'

/**
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
      newChildren.push({
        type: 'mdxJsxFlowElement',
        name: 'div',
        attributes: [
          { type: 'mdxJsxAttribute', name: 'class', value: PROSE_CLASS },
        ],
        children: intro,
      })
    }

    // .tabs wrapper
    const tabsWrapper = {
      type: 'mdxJsxFlowElement',
      name: 'div',
      attributes: [
        { type: 'mdxJsxAttribute', name: 'class', value: 'tabs' },
        { type: 'mdxJsxAttribute', name: 'id', value: id },
      ],
      children: [],
    }

    // nav[role="tablist"]
    const tablist = {
      type: 'mdxJsxFlowElement',
      name: 'nav',
      attributes: [
        { type: 'mdxJsxAttribute', name: 'role', value: 'tablist' },
        {
          type: 'mdxJsxAttribute',
          name: 'aria-orientation',
          value: 'horizontal',
        },
        {
          type: 'mdxJsxAttribute',
          name: 'class',
          value: 'flex flex-wrap gap-x-3',
        },
      ],
      children: [],
    }

    sections.forEach((section, i) => {
      const tabNum = i + 1

      tablist.children.push({
        type: 'mdxJsxFlowElement',
        name: 'button',
        attributes: [
          { type: 'mdxJsxAttribute', name: 'type', value: 'button' },
          { type: 'mdxJsxAttribute', name: 'role', value: 'tab' },
          {
            type: 'mdxJsxAttribute',
            name: 'id',
            value: `${id}-tab-${tabNum}`,
          },
          {
            type: 'mdxJsxAttribute',
            name: 'aria-controls',
            value: `${id}-panel-${tabNum}`,
          },
          {
            type: 'mdxJsxAttribute',
            name: 'aria-selected',
            value: i === 0 ? 'true' : 'false',
          },
          {
            type: 'mdxJsxAttribute',
            name: 'tabindex',
            value: i === 0 ? '0' : '-1',
          },
        ],
        children: buildButtonChildren(section.label, tabIcons),
      })

      // Build panel attributes
      const panelAttrs = [
        { type: 'mdxJsxAttribute', name: 'role', value: 'tabpanel' },
        { type: 'mdxJsxAttribute', name: 'id', value: `${id}-panel-${tabNum}` },
        {
          type: 'mdxJsxAttribute',
          name: 'aria-labelledby',
          value: `${id}-tab-${tabNum}`,
        },
        { type: 'mdxJsxAttribute', name: 'tabindex', value: '-1' },
        {
          type: 'mdxJsxAttribute',
          name: 'class',
          value: PROSE_CLASS,
        },
      ]
      if (i !== 0) {
        panelAttrs.push({
          type: 'mdxJsxAttribute',
          name: 'hidden',
          value: null,
        })
      }

      tabsWrapper.children.push({
        type: 'mdxJsxFlowElement',
        name: 'div',
        attributes: panelAttrs,
        children: section.children,
      })
    })

    tabsWrapper.children.unshift(tablist)
    newChildren.push(tabsWrapper)
    tree.children = newChildren
  }
}

/**
 * Build the children nodes for a tab button: optional SVG icon + label text.
 *
 * @param {string} label
 * @param {Record<string, { width: number, height: number, body: string }>} iconMap
 * @returns {import('mdast').Content[]}
 */
function buildButtonChildren(label, iconMap) {
  const icon = iconMap[label]
  const children = []

  if (icon) {
    children.push({
      type: 'mdxJsxTextElement',
      name: 'svg',
      attributes: [
        { type: 'mdxJsxAttribute', name: 'class', value: 'inline-block w-5 h-5 mr-1.5 align-middle shrink-0' },
        { type: 'mdxJsxAttribute', name: 'width', value: String(icon.width) },
        { type: 'mdxJsxAttribute', name: 'height', value: String(icon.height) },
        { type: 'mdxJsxAttribute', name: 'viewBox', value: `0 0 ${icon.width} ${icon.height}` },
        { type: 'mdxJsxAttribute', name: 'fill', value: 'currentColor' },
        { type: 'mdxJsxAttribute', name: 'aria-hidden', value: 'true' },
      ],
      children: parseSvgBody(icon.body),
    })
  }

  children.push({ type: 'text', value: label })
  return children
}

/**
 * Parse a simple SVG body HTML string (e.g. `<path fill="currentColor" d="..."/>`)
 * into an array of MDAST `mdxJsxTextElement` nodes so MDX renders them as real
 * SVG child elements instead of escaping the markup as text.
 *
 * @param {string} html — the icon body from @iconify-icons/*
 * @returns {import('mdast').Content[]}
 */
function parseSvgBody(html) {
  const nodes = []
  const tagRegex = /<(\w+)((?:\s+\w+(?:\s*=\s*(?:"[^"]*"|'[^']*'|\S+))?)*)\s*\/?>/g
  const attrRegex = /(\w+)\s*=\s*"([^"]*)"/g

  let match
  while ((match = tagRegex.exec(html)) !== null) {
    const [, tagName, attrsStr] = match
    const attrs = []
    let attrMatch
    attrRegex.lastIndex = 0
    while ((attrMatch = attrRegex.exec(attrsStr)) !== null) {
      attrs.push({
        type: 'mdxJsxAttribute',
        name: attrMatch[1],
        value: attrMatch[2],
      })
    }
    nodes.push({
      type: 'mdxJsxTextElement',
      name: tagName,
      attributes: attrs,
      children: [],
    })
  }

  return nodes
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
