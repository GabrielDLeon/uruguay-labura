export default function remarkTabs() {
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
    const newChildren = [...intro]

    // .tabs wrapper
    const tabsWrapper = {
      type: 'mdxJsxFlowElement',
      name: 'div',
      attributes: [
        { type: 'mdxJsxAttribute', name: 'class', value: 'tabs w-full' },
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
        { type: 'mdxJsxAttribute', name: 'class', value: 'w-full' },
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
        children: [{ type: 'text', value: section.label }],
      })

      const panelAttrs = [
        { type: 'mdxJsxAttribute', name: 'role', value: 'tabpanel' },
        {
          type: 'mdxJsxAttribute',
          name: 'class',
          value: 'rounded-xl bg-[var(--muted)] p-6',
        },
        {
          type: 'mdxJsxAttribute',
          name: 'id',
          value: `${id}-panel-${tabNum}`,
        },
        {
          type: 'mdxJsxAttribute',
          name: 'aria-labelledby',
          value: `${id}-tab-${tabNum}`,
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
