import { appIcons, iconToSvg } from "@/lib/icons";

// Institution logos keyed by institution slug. Logo filenames match the
// institution slugs (e.g. ort-logo.jpg -> "ort"), so we can build the map
// from the assets directory at build time.
const institutionLogoUrls = import.meta.glob<string>("/src/assets/*-logo.*", {
  eager: true,
  import: "default",
  query: "?url",
});

const INSTITUTION_LOGO_BY_SLUG: Record<string, string> = {};
for (const [path, url] of Object.entries(institutionLogoUrls)) {
  const slug = path.match(/([^/]+)-logo\.\w+$/)?.[1];
  if (slug) INSTITUTION_LOGO_BY_SLUG[slug] = url;
}

function getInstitutionLogo(slug: string | undefined): string | undefined {
  return slug ? INSTITUTION_LOGO_BY_SLUG[slug] : undefined;
}

// Pagefind JS API types (generated at build time)
interface PagefindResultData {
  url: string;
  meta: {
    title?: string;
    degreeType?: string;
    modality?: string;
    kind?: string;
    [key: string]: string | undefined;
  };
  plain_excerpt: string;
  excerpt: string;
}

interface PagefindResult {
  id: string;
  data: () => Promise<PagefindResultData>;
}

interface PagefindSearchResponse {
  results: PagefindResult[];
}

interface PagefindAPI {
  search: (query: string) => Promise<PagefindSearchResponse>;
}

type ResultKind = "carrera" | "institucion" | "beca" | "pagina";

const KIND_ORDER: ResultKind[] = ["pagina", "institucion", "beca", "carrera"];

const KIND_CONFIG: Record<
  ResultKind,
  { icon: string; label: string; groupLabel: string; badge: string }
> = {
  pagina: {
    icon: iconToSvg(appIcons.page),
    label: "Sección",
    groupLabel: "Secciones",
    badge: "badge--pagina",
  },
  carrera: {
    icon: iconToSvg(appIcons.school),
    label: "Carrera",
    groupLabel: "Carreras",
    badge: "badge--carrera",
  },
  institucion: {
    icon: iconToSvg(appIcons.institution),
    label: "Institución",
    groupLabel: "Instituciones",
    badge: "badge--institucion",
  },
  beca: {
    icon: iconToSvg(appIcons.scholarship),
    label: "Beca",
    groupLabel: "Becas",
    badge: "badge--beca",
  },
};

function getKind(meta: PagefindResultData["meta"]): ResultKind {
  if (meta.kind === "pagina") return "pagina";
  if (meta.kind === "carrera") return "carrera";
  if (meta.kind === "beca") return "beca";
  return "institucion";
}

const RESULT_LIMIT = 8;
const DESCRIPTION_MAX = 200;

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function escapeAttribute(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function debounce<T extends (...args: string[]) => void>(fn: T, ms: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), ms);
  };
}

function createSearchModal() {
  let pagefind: PagefindAPI | null = null;
  let activeIndex = -1;
  let searchCounter = 0;
  let abortController: AbortController | null = null;

  const trigger = document.getElementById("search-trigger");
  const dialog = document.getElementById("search-dialog");
  const closeBtn = document.getElementById("search-dialog-close");
  const inputEl = document.getElementById("search-dialog-input");
  const menuEl = document.getElementById("search-results");

  if (!trigger || !dialog || !closeBtn || !inputEl || !menuEl) {
    console.warn("[SearchModal] Missing DOM elements");
    return { destroy: () => {} };
  }

  const input = inputEl as HTMLInputElement;
  const menu = menuEl;
  const dialogEl = dialog as HTMLElement & {
    showPopover: () => void;
    hidePopover: () => void;
  };

  const getItems = () => menu.querySelectorAll<HTMLElement>('[role="option"]');

  function showEmpty(message: string) {
    menu.innerHTML = "";
    menu.setAttribute("data-empty", message);
  }

  function renderResultItem(
    result: PagefindResultData,
    kind: ResultKind,
    index: number,
  ): string {
    const cfg = KIND_CONFIG[kind];
    const match = result.url.match(/\/educacion\/(?:carreras\/)?([^/?#]+)/);
    const url =
      kind === "carrera" && match
        ? `/educacion/carreras/${match[1]}`
        : result.url;
    const description =
      result.meta.description || result.plain_excerpt || result.excerpt || "";

    const institutionLogo =
      kind === "institucion"
        ? getInstitutionLogo(
            result.url.match(/\/educacion\/instituciones\/([^/?#]+)/)?.[1],
          )
        : undefined;

    const leading = institutionLogo
      ? `<img src="${institutionLogo}" alt="${escapeAttribute(result.meta.title || "")}" class="size-9 shrink-0 rounded-lg object-contain" loading="lazy" />`
      : `<div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)] text-muted-foreground">
          ${cfg.icon}
        </div>`;

    return `
    <a
      role="option"
      id="search-result-${index}"
      tabindex="-1"
      href="${escapeAttribute(url)}"
      class="flex items-start gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
    >
      ${leading}
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-foreground leading-snug">${escapeHtml(result.meta.title || result.url)}</span>
          <span class="badge text-[10px] px-1.5 py-0.5 leading-none ${cfg.badge}">${cfg.label}</span>
        </div>
        ${
          description
            ? `<p class="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">${escapeHtml(description.slice(0, DESCRIPTION_MAX))}</p>`
            : ""
        }
      </div>
    </a>
  `;
  }

  function renderResults(results: PagefindResultData[]) {
    activeIndex = -1;
    menu.removeAttribute("data-empty");

    const byKind = new Map<ResultKind, PagefindResultData[]>();
    for (const result of results) {
      const kind = getKind(result.meta);
      const group = byKind.get(kind) ?? [];
      group.push(result);
      byKind.set(kind, group);
    }

    let remaining = RESULT_LIMIT;
    let itemIndex = 0;
    const groupsHtml: string[] = [];

    for (const kind of KIND_ORDER) {
      const items = byKind.get(kind);
      if (!items || items.length === 0) continue;

      const slice = items.slice(0, remaining);
      remaining -= slice.length;

      groupsHtml.push(
        `<div class="px-3 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">${KIND_CONFIG[kind].groupLabel}</div>`,
        ...slice.map((result) => renderResultItem(result, kind, itemIndex++)),
      );
    }

    menu.innerHTML = groupsHtml.join("");
    input.removeAttribute("aria-activedescendant");
  }

  async function doSearch(query: string) {
    const currentId = ++searchCounter;
    abortController?.abort();
    abortController = new AbortController();
    const signal = abortController.signal;

    if (!query.trim()) {
      if (currentId !== searchCounter) return;
      showEmpty("Escribe para buscar...");
      return;
    }

    if (!pagefind) {
      try {
        const pagefindUrl = `${import.meta.env.BASE_URL}pagefind/pagefind.js`;
        const mod = await import(pagefindUrl);
        pagefind = mod as PagefindAPI;
      } catch (err) {
        console.error("[SearchModal] Failed to load Pagefind:", err);
        if (currentId !== searchCounter) return;
        showEmpty("Error al cargar el buscador");
        return;
      }
    }

    if (signal.aborted || currentId !== searchCounter) return;

    try {
      const result = await pagefind.search(query);
      if (signal.aborted || currentId !== searchCounter) return;

      if (result.results.length === 0) {
        showEmpty("Sin resultados");
        return;
      }

      const data = await Promise.all(
        result.results.slice(0, RESULT_LIMIT).map((r) => r.data()),
      );
      if (signal.aborted || currentId !== searchCounter) return;

      renderResults(data);
    } catch {
      if (currentId !== searchCounter) return;
      showEmpty("Error al buscar");
    }
  }

  const debouncedSearch = debounce((query: string) => doSearch(query), 200);

  function updateActive() {
    const items = getItems();
    items.forEach((item, i) => {
      if (i === activeIndex) {
        item.classList.add("active");
        item.setAttribute("aria-selected", "true");
        item.scrollIntoView({ block: "nearest" });
      } else {
        item.classList.remove("active");
        item.removeAttribute("aria-selected");
      }
    });

    if (activeIndex >= 0 && items[activeIndex]) {
      input.setAttribute("aria-activedescendant", items[activeIndex].id);
    } else {
      input.removeAttribute("aria-activedescendant");
    }
  }

  function navigate(direction: "down" | "up") {
    const items = getItems();
    if (items.length === 0) return;
    if (direction === "down") {
      activeIndex = activeIndex < items.length - 1 ? activeIndex + 1 : 0;
    } else {
      activeIndex = activeIndex > 0 ? activeIndex - 1 : items.length - 1;
    }
    updateActive();
  }

  function onDialogToggle(e: Event) {
    const evt = e as ToggleEvent;
    if (evt.newState === "open") {
      input.value = "";
      activeIndex = -1;
      showEmpty("Escribe para buscar...");
      searchCounter++;
      input.setAttribute("aria-expanded", "true");
      requestAnimationFrame(() => input.focus());
    } else {
      input.setAttribute("aria-expanded", "false");
      input.removeAttribute("aria-activedescendant");
      if (dialogEl.contains(document.activeElement)) trigger!.focus();
    }
  }

  function onInput() {
    activeIndex = -1;
    debouncedSearch(input.value);
  }

  function onKeydown(e: KeyboardEvent) {
    const items = getItems();

    if (e.key === "Tab") {
      if (e.shiftKey && document.activeElement === input) {
        e.preventDefault();
        closeBtn!.focus();
      } else if (!e.shiftKey && document.activeElement === closeBtn) {
        e.preventDefault();
        input.focus();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      navigate("down");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      navigate("up");
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      const item = items[activeIndex];
      if (item) item.click();
    } else if (e.key === "Escape") {
      dialogEl.hidePopover();
    }
  }

  function onMenuClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.closest('[role="option"]')) {
      dialogEl.hidePopover();
    }
  }

  function onDialogClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.closest("[data-close-on-click]")) {
      dialogEl.hidePopover();
    }
  }

  function onMenuMouseMove(e: MouseEvent) {
    const target = e.target as HTMLElement;
    const item = target.closest<HTMLElement>('[role="option"]');
    if (!item) return;
    const idx = Array.from(getItems()).indexOf(item);
    if (idx !== activeIndex) {
      activeIndex = idx;
      updateActive();
    }
  }

  function onGlobalKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      if (dialogEl.matches(":popover-open")) {
        dialogEl.hidePopover();
      } else {
        dialogEl.showPopover();
      }
    }
  }

  function onTriggerClick() {
    dialogEl.showPopover();
  }

  function onCloseClick() {
    dialogEl.hidePopover();
  }

  trigger.addEventListener("click", onTriggerClick);
  closeBtn.addEventListener("click", onCloseClick);
  dialog.addEventListener("toggle", onDialogToggle);
  dialog.addEventListener("keydown", onKeydown);
  input.addEventListener("input", onInput);
  menu.addEventListener("click", onMenuClick);
  dialog.addEventListener("click", onDialogClick);
  menu.addEventListener("mousemove", onMenuMouseMove);
  document.addEventListener("keydown", onGlobalKeydown);

  return {
    destroy: () => {
      trigger.removeEventListener("click", onTriggerClick);
      closeBtn.removeEventListener("click", onCloseClick);
      dialog.removeEventListener("toggle", onDialogToggle);
      dialog.removeEventListener("keydown", onKeydown);
      input.removeEventListener("input", onInput);
      menu.removeEventListener("click", onMenuClick);
      dialog.removeEventListener("click", onDialogClick);
      menu.removeEventListener("mousemove", onMenuMouseMove);
      document.removeEventListener("keydown", onGlobalKeydown);
      abortController?.abort();
    },
  };
}

export function initSearchModal() {
  return createSearchModal();
}
