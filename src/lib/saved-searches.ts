import type { JobFilters, SavedSearch } from "@/types/jobs";
import { readJson, subscribeToKeys, writeJson } from "@/lib/storage";

const STORAGE_KEY = "ul:savedSearches:v1";

const QUOTA_LABELS: [keyof JobFilters, string][] = [
  ["afro", "Afrodescendientes"],
  ["discapacidad", "Discapacidad"],
  ["trans", "Personas trans"],
  ["victimas", "Víctimas delitos violentos"],
];

function isSavedSearch(value: unknown): value is SavedSearch {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<SavedSearch>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.criteria === "object" &&
    candidate.criteria !== null &&
    Array.isArray(candidate.seenJobIds)
  );
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `search-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getSavedSearches(): SavedSearch[] {
  const raw = readJson<unknown>(STORAGE_KEY, []);
  if (!Array.isArray(raw)) return [];
  return raw.filter(isSavedSearch);
}

function persist(searches: SavedSearch[]): void {
  writeJson(STORAGE_KEY, searches);
}

export function createSavedSearch(
  name: string,
  criteria: JobFilters,
  seenJobIds: string[],
): SavedSearch {
  const search: SavedSearch = {
    id: newId(),
    name: name.trim() || defaultSearchName(criteria),
    criteria,
    createdAt: new Date().toISOString(),
    lastSeenAt: null,
    seenJobIds,
  };

  persist([...getSavedSearches(), search]);
  return search;
}

export function removeSavedSearch(id: string): void {
  persist(getSavedSearches().filter((search) => search.id !== id));
}

export function renameSavedSearch(id: string, name: string): void {
  const trimmed = name.trim();
  if (!trimmed) return;

  persist(
    getSavedSearches().map((search) =>
      search.id === id ? { ...search, name: trimmed } : search,
    ),
  );
}

/** Marca como vistas todas las coincidencias actuales de una búsqueda. */
export function markSavedSearchSeen(id: string, seenJobIds: string[]): void {
  const now = new Date().toISOString();
  persist(
    getSavedSearches().map((search) =>
      search.id === id ? { ...search, seenJobIds, lastSeenAt: now } : search,
    ),
  );
}

export function subscribeToSavedSearches(listener: () => void): () => void {
  return subscribeToKeys([STORAGE_KEY], listener);
}

export function criteriaFromSearchParams(params: URLSearchParams): JobFilters {
  return {
    query: params.get("q") ?? "",
    organization: params.get("org") ?? "",
    taskType: params.get("type") ?? "",
    afro: params.get("afro") === "1",
    discapacidad: params.get("disc") === "1",
    trans: params.get("trans") === "1",
    victimas: params.get("vict") === "1",
  };
}

export function criteriaToSearchParams(criteria: JobFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (criteria.query) params.set("q", criteria.query);
  if (criteria.organization) params.set("org", criteria.organization);
  if (criteria.taskType) params.set("type", criteria.taskType);
  if (criteria.afro) params.set("afro", "1");
  if (criteria.discapacidad) params.set("disc", "1");
  if (criteria.trans) params.set("trans", "1");
  if (criteria.victimas) params.set("vict", "1");

  return params;
}

/** Etiquetas legibles de los criterios activos, para chips y nombres. */
export function describeCriteria(criteria: JobFilters): string[] {
  const labels: string[] = [];

  if (criteria.query) labels.push(criteria.query);
  if (criteria.organization) labels.push(criteria.organization);
  if (criteria.taskType) labels.push(criteria.taskType);

  for (const [key, label] of QUOTA_LABELS) {
    if (criteria[key] === true) labels.push(label);
  }

  return labels;
}

export type CriteriaChipKind =
  | "query"
  | "organization"
  | "taskType"
  | "quota";

export interface CriteriaChip {
  key: string;
  label: string;
  kind: CriteriaChipKind;
}

/** Criterios activos con su tipo, para renderizar chips con icono. */
export function criteriaChips(criteria: JobFilters): CriteriaChip[] {
  const chips: CriteriaChip[] = [];

  if (criteria.query) {
    chips.push({ key: "query", label: criteria.query, kind: "query" });
  }
  if (criteria.organization) {
    chips.push({
      key: "organization",
      label: criteria.organization,
      kind: "organization",
    });
  }
  if (criteria.taskType) {
    chips.push({ key: "taskType", label: criteria.taskType, kind: "taskType" });
  }

  for (const [key, label] of QUOTA_LABELS) {
    if (criteria[key] === true) {
      chips.push({ key, label, kind: "quota" });
    }
  }

  return chips;
}

/** Nombre por defecto cuando el usuario no escribe uno. */
export function defaultSearchName(criteria: JobFilters): string {
  const labels = describeCriteria(criteria);
  return labels.length > 0 ? labels.join(" · ") : "Todos los llamados";
}
