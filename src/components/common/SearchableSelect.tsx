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
        className="flex w-full items-center justify-between"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="truncate">{selected?.label ?? allLabel}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-chevron-down shrink-0"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open ? (
        <div data-popover className="absolute top-full left-0 z-30 mt-1 w-full">
          <header className="border-b px-1 pb-1">
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
            className="max-h-64 overflow-y-auto"
          >
            <div
              role="option"
              data-value=""
              aria-selected={value === ""}
              className="flex min-w-0 cursor-pointer flex-col items-start gap-0 text-left"
              onClick={() => selectValue("")}
            >
              <span className="truncate text-sm font-medium">{allLabel}</span>
            </div>

            {filteredOptions.map((option) => (
              <div
                key={option.value}
                role="option"
                data-value={option.value}
                aria-selected={value === option.value}
                className="flex min-w-0 cursor-pointer flex-col items-start gap-0 text-left"
                onClick={() => selectValue(option.value)}
              >
                <span className="truncate text-sm font-medium">
                  {option.label}
                </span>
                {option.description ? (
                  <span className="text-muted-foreground truncate text-xs">
                    {option.description}
                  </span>
                ) : null}
              </div>
            ))}

            {filteredOptions.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                Sin resultados
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
