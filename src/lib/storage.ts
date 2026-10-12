/**
 * Helpers de localStorage a prueba de SSR y de cuota/privacidad.
 *
 * Todo el estado anónimo del usuario (empleos guardados, búsquedas guardadas)
 * vive acá: no hay backend ni cuentas.
 */

const LOCAL_EVENT = "ul:storage";

export function readJson<T>(key: string, fallback: T): T {
  if (typeof localStorage === "undefined") {
    return fallback;
  }

  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw);
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): void {
  if (typeof localStorage === "undefined") {
    return;
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyStorage(key);
  } catch {
    // Modo privado o cuota llena: se degrada en silencio.
  }
}

/**
 * Avisa a los suscriptores de la misma pestaña. El evento `storage` nativo
 * solo se dispara en otras pestañas, así que replicamos el aviso localmente.
 */
function notifyStorage(key: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(LOCAL_EVENT, { detail: { key } }));
}

/**
 * Escucha cambios de las claves indicadas, tanto en esta pestaña como en otras.
 * Devuelve una función para desuscribirse.
 */
export function subscribeToKeys(
  keys: string[],
  listener: () => void,
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const matches = (key: string | null) => key === null || keys.includes(key);

  const onStorage = (event: StorageEvent) => {
    if (matches(event.key)) {
      listener();
    }
  };

  const onLocal = (event: Event) => {
    const key = (event as CustomEvent<{ key?: string }>).detail?.key ?? null;
    if (matches(key)) {
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(LOCAL_EVENT, onLocal);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(LOCAL_EVENT, onLocal);
  };
}
