import { useEffect, useState } from "react";

/**
 * Escucha una media query. Devuelve `null` hasta que se mide en el cliente.
 *
 * El HTML se prerenderiza en build (sin `window`), así que no hay viewport que
 * consultar todavía: `null` representa "sin medir". Así el HTML estático y el
 * primer render de hidratación comparten ese estado neutro, y el valor real
 * llega en un efecto posterior.
 */
export function useMediaQuery(query: string): boolean | null {
  const [matches, setMatches] = useState<boolean | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const apply = () => setMatches(mediaQuery.matches);

    apply();
    mediaQuery.addEventListener("change", apply);

    return () => {
      mediaQuery.removeEventListener("change", apply);
    };
  }, [query]);

  return matches;
}
