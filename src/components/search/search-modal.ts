// Pagefind JS API types (generated at build time)
interface PagefindResultData {
  url: string
  meta: {
    title?: string
    degreeType?: string
    modality?: string
    [key: string]: string | undefined
  }
  plain_excerpt: string
  excerpt: string
}

interface PagefindResult {
  id: string
  data: () => Promise<PagefindResultData>
}

interface PagefindSearchResponse {
  results: PagefindResult[]
}

interface PagefindAPI {
  search: (query: string) => Promise<PagefindSearchResponse>
}

function escapeHtml(text: string): string {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

function escapeAttribute(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

function debounce<T extends (...args: string[]) => void>(fn: T, ms: number) {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), ms)
  }
}

function createSearchModal() {
  let pagefind: PagefindAPI | null = null
  let activeIndex = -1
  let searchCounter = 0
  let abortController: AbortController | null = null

  const trigger = document.getElementById("search-trigger")
  const dialog = document.getElementById("search-dialog")
  const inputEl = document.getElementById("search-dialog-input")
  const menuEl = document.getElementById("search-results")

  if (!trigger || !dialog || !inputEl || !menuEl) {
    console.warn("[SearchModal] Missing DOM elements")
    return { destroy: () => {} }
  }

  const input = inputEl as HTMLInputElement
  const menu = menuEl

  async function initPagefind(): Promise<PagefindAPI | null> {
    if (pagefind) return pagefind
    try {
      const mod = await import(`/pagefind/${"pagefind"}.js`)
      pagefind = mod as PagefindAPI
      return pagefind
    } catch (err) {
      console.error("[SearchModal] Failed to load Pagefind:", err)
      menu.setAttribute("data-empty", "Error al cargar el buscador")
      return null
    }
  }

  async function doSearch(query: string) {
    const currentId = ++searchCounter
    abortController?.abort()
    abortController = new AbortController()
    const signal = abortController.signal

    if (!query.trim()) {
      if (currentId !== searchCounter) return
      menu.innerHTML = ""
      menu.setAttribute("data-empty", "Escribe para buscar...")
      return
    }

    const pf = await initPagefind()
    if (!pf || signal.aborted || currentId !== searchCounter) return

    try {
      const result = await pf.search(query)
      if (signal.aborted || currentId !== searchCounter) return

      if (result.results.length === 0) {
        menu.innerHTML = ""
        menu.setAttribute("data-empty", "Sin resultados")
        return
      }

      const data = await Promise.all(
        result.results.slice(0, 8).map((r) => r.data())
      )
      if (signal.aborted || currentId !== searchCounter) return

      renderResults(menu, data)
    } catch {
      if (currentId !== searchCounter) return
      menu.innerHTML = ""
      menu.setAttribute("data-empty", "Error al buscar")
    }
  }

  function renderResults(container: HTMLElement, results: PagefindResultData[]) {
    container.removeAttribute("data-empty")
    container.innerHTML = results
      .map(
        (r) => `
    <a
      role="menuitem"
      href="${escapeAttribute(r.url)}"
      class="flex-col items-start"
    >
      <span class="font-medium leading-snug">${escapeHtml(r.meta.title || r.url)}</span>
      <div class="flex gap-1 mt-1">
        ${r.meta.degreeType ? `<span class="badge-secondary text-xs">${escapeHtml(r.meta.degreeType)}</span>` : ""}
        ${r.meta.modality ? `<span class="badge-outline text-xs">${escapeHtml(r.meta.modality)}</span>` : ""}
      </div>
      <span class="text-xs text-muted-foreground truncate mt-1">${escapeHtml((r.plain_excerpt || "").slice(0, 120))}</span>
    </a>
  `
      )
      .join("")
  }

  function updateActive() {
    const items = menu.querySelectorAll<HTMLElement>("[role='menuitem']")
    items.forEach((item, i) => {
      if (i === activeIndex) {
        item.classList.add("active")
        item.scrollIntoView({ block: "nearest" })
      } else {
        item.classList.remove("active")
      }
    })
  }

  // Event handlers
  function onTriggerClick() {
    ;(dialog as HTMLElement & { showPopover: () => void }).showPopover()
  }

  function onDialogToggle(e: Event) {
    const evt = e as ToggleEvent
    if (evt.newState === "open") {
      input.value = ""
      menu.innerHTML = ""
      menu.setAttribute("data-empty", "Escribe para buscar...")
      activeIndex = -1
      searchCounter++
      requestAnimationFrame(() => input.focus())
    }
  }

  const debouncedSearch = debounce((query: string) => doSearch(query), 200)

  function onInput() {
    activeIndex = -1
    debouncedSearch(input.value)
  }

  function onInputKeydown(e: KeyboardEvent) {
    const items = menu.querySelectorAll<HTMLElement>("[role='menuitem']")

    if (e.key === "ArrowDown") {
      e.preventDefault()
      activeIndex = Math.min(activeIndex + 1, items.length - 1)
      updateActive()
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      activeIndex = Math.max(activeIndex - 1, -1)
      updateActive()
      if (activeIndex === -1) input.focus()
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault()
      const item = items[activeIndex]
      if (item) {
        item.click()
        ;(dialog as HTMLElement & { hidePopover: () => void }).hidePopover()
      }
    } else if (e.key === "Escape") {
      ;(dialog as HTMLElement & { hidePopover: () => void }).hidePopover()
    }
  }

  function onGlobalKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault()
      const d = dialog as HTMLElement & { matches: (sel: string) => boolean; showPopover: () => void; hidePopover: () => void }
      if (d.matches(":popover-open")) {
        d.hidePopover()
      } else {
        d.showPopover()
      }
    }
  }

  // Register listeners
  trigger.addEventListener("click", onTriggerClick)
  dialog.addEventListener("toggle", onDialogToggle)
  input.addEventListener("input", onInput)
  input.addEventListener("keydown", onInputKeydown)
  document.addEventListener("keydown", onGlobalKeydown)

  return {
    destroy: () => {
      trigger.removeEventListener("click", onTriggerClick)
      dialog.removeEventListener("toggle", onDialogToggle)
      input.removeEventListener("input", onInput)
      input.removeEventListener("keydown", onInputKeydown)
      document.removeEventListener("keydown", onGlobalKeydown)
      abortController?.abort()
    },
  }
}

export function initSearchModal() {
  return createSearchModal()
}
