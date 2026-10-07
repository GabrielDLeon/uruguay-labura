import { readJson, subscribeToKeys, writeJson } from "@/lib/storage";

/** Clave histórica: no cambiar sin migrar los guardados existentes. */
const STORAGE_KEY = "savedJobs";

export function getSavedJobIds(): string[] {
  const raw = readJson<unknown>(STORAGE_KEY, []);
  if (!Array.isArray(raw)) return [];
  return raw.filter((id): id is string => typeof id === "string");
}

function setSavedJobIds(ids: string[]): void {
  writeJson(STORAGE_KEY, ids);
}

export function toggleSavedJob(id: string): {
  saved: boolean;
  ids: string[];
} {
  const current = getSavedJobIds();
  const index = current.indexOf(id);

  if (index >= 0) {
    current.splice(index, 1);
    setSavedJobIds(current);
    return { saved: false, ids: current };
  }

  current.push(id);
  setSavedJobIds(current);
  return { saved: true, ids: current };
}

export function subscribeToSavedJobs(listener: () => void): () => void {
  return subscribeToKeys([STORAGE_KEY], listener);
}
