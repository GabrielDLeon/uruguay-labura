import { useEffect, useMemo, useRef, useState } from "react";

import { normalizeText } from "@/lib/organizations";

export interface SearchableSelectOption {
  value: string;
  label: string;
  description?: string;
  searchText?: string;
}

interface Props {
  id: string;
  value: string;
  onChange: (nextValue: string) => void;
  options: SearchableSelectOption[];
  allLabel?: string;
  searchPlaceholder?: string;
}

export default function SearchableSelect({
  id,
  value,
  onChange,
  options,
  allLabel = "Todos",
  searchPlaceholder = "Buscar...",
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    searchInputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current) {
        return;
      }

      if (
        event.target instanceof Node &&
        !rootRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalizeText(query);
    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) => {
      const source =
        option.searchText ?? `${option.label} ${option.description ?? ""}`;
      return normalizeText(source).includes(normalizedQuery);
    });
  }, [options, query]);

  const selected = options.find((option) => option.value === value);

  const selectValue = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
    setQuery("");
  };

  return (
    <div id={id} className="select relative" ref={rootRef}>
      <button
        type="button"
        className="btn-outline flex w-full items-center justify-between"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="truncate">{selected?.label ?? allLabel}</span>
        <span className="text-muted-foreground text-xs">v</span>
      </button>

      {open ? (
        <div
          className="bg-background absolute top-full left-0 z-30 mt-1 max-h-80 w-full overflow-hidden rounded-md border"
          role="dialog"
          aria-label="Selector"
        >
          <header className="border-b p-2">
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              placeholder={searchPlaceholder}
              autoComplete="off"
              spellCheck={false}
              className="input w-full"
              onChange={(event) => setQuery(event.target.value)}
            />
          </header>

          <div
            role="listbox"
            id={`${id}-listbox`}
            className="max-h-64 overflow-auto p-1"
          >
            <button
              type="button"
              role="option"
              aria-selected={value === ""}
              className="hover:bg-muted w-full rounded-md px-3 py-2 text-left text-sm"
              onClick={() => selectValue("")}
            >
              {allLabel}
            </button>

            {filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={value === option.value}
                className="hover:bg-muted w-full rounded-md px-3 py-2 text-left"
                onClick={() => selectValue(option.value)}
              >
                <span className="block truncate text-sm font-medium">
                  {option.label}
                </span>
                {option.description ? (
                  <span className="text-muted-foreground block truncate text-xs">
                    {option.description}
                  </span>
                ) : null}
              </button>
            ))}

            {filteredOptions.length === 0 ? (
              <p className="text-muted-foreground px-3 py-2 text-sm">
                Sin resultados
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
