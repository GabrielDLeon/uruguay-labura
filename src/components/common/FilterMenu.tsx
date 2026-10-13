import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react/offline";

import { appIcons } from "@/lib/icons";
import { normalizeText } from "@/lib/organizations";

export interface FilterMenuOption {
  value: string;
  label: string;
  description?: string;
  logo?: string;
  searchText?: string;
}

interface Props {
  id: string;
  /** Filter name. Shown on the trigger while there is no selection. */
  label: string;
  options: FilterMenuOption[];
  /** Selected values. Single-select filters pass zero or one value. */
  values: string[];
  onChange: (nextValues: string[]) => void;
  multiple?: boolean;
  allLabel?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
}

function itemClassName(selected: boolean) {
  return [
    "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors",
    selected
      ? "bg-secondary text-secondary-foreground"
      : "text-muted-foreground hover:bg-muted hover:text-foreground",
  ].join(" ");
}

export default function FilterMenu({
  id,
  label,
  options,
  values,
  onChange,
  multiple = false,
  allLabel = "Todos",
  searchable = false,
  searchPlaceholder,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");
    const applyMode = () => setIsMobile(mediaQuery.matches);

    applyMode();
    mediaQuery.addEventListener("change", applyMode);

    return () => {
      mediaQuery.removeEventListener("change", applyMode);
    };
  }, []);

  useEffect(() => {
    if (!isMobile) setOpen(false);
  }, [isMobile]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isMobile && open) {
      if (!dialog.open) dialog.showModal();
      return;
    }

    if (dialog.open) dialog.close();
  }, [isMobile, open]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }

    if (searchable) {
      searchInputRef.current?.focus();
    }

    if (isMobile) {
      return;
    }

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
  }, [open, searchable, isMobile]);

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

  const selectedLabels = options
    .filter((option) => values.includes(option.value))
    .map((option) => option.label);
  const selectedText = (
    selectedLabels.length > 0 ? selectedLabels : values
  ).join(", ");
  const hasSelection = values.length > 0;
  const menuId = `${id}-menu`;

  const selectValue = (value: string) => {
    if (value === "") {
      onChange([]);
      if (!multiple) {
        setOpen(false);
      }
      return;
    }

    if (multiple) {
      onChange(
        values.includes(value)
          ? values.filter((current) => current !== value)
          : [...values, value],
      );
      return;
    }

    onChange([value]);
    setOpen(false);
  };

  const searchField = searchable ? (
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
  ) : null;

  const optionsList = (
    <>
      <button
        type="button"
        role={multiple ? "menuitem" : "menuitemradio"}
        aria-checked={multiple ? undefined : !hasSelection}
        className={itemClassName(!hasSelection)}
        onClick={() => selectValue("")}
      >
        <span className="truncate">{allLabel}</span>
        {!hasSelection ? (
          <Icon
            icon={appIcons.check}
            className="ml-auto size-4 shrink-0"
            aria-hidden="true"
          />
        ) : null}
      </button>

      {filteredOptions.map((option) => {
        const selected = values.includes(option.value);

        return (
          <button
            key={option.value}
            type="button"
            role={multiple ? "menuitemcheckbox" : "menuitemradio"}
            aria-checked={selected}
            className={itemClassName(selected)}
            onClick={() => selectValue(option.value)}
          >
            {option.logo ? (
              <img
                src={option.logo}
                alt=""
                aria-hidden="true"
                className="size-5 shrink-0 rounded object-contain"
              />
            ) : null}
            <span className="flex min-w-0 flex-col items-start">
              <span className="truncate">{option.label}</span>
              {option.description ? (
                <span className="text-muted-foreground truncate text-xs">
                  {option.description}
                </span>
              ) : null}
            </span>
            {selected ? (
              <Icon
                icon={appIcons.check}
                className="ml-auto size-4 shrink-0"
                aria-hidden="true"
              />
            ) : null}
          </button>
        );
      })}

      {filteredOptions.length === 0 ? (
        <p className="text-muted-foreground px-2 py-6 text-center text-sm">
          Sin resultados
        </p>
      ) : null}
    </>
  );

  return (
    <>
      <div className="relative" ref={rootRef}>
        <button
          type="button"
          id={`${id}-trigger`}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={hasSelection ? `${label}: ${selectedText}` : label}
          className={[
            "aria-expanded:bg-muted inline-flex max-w-[16rem] items-center rounded-md border px-3 py-1.5 text-sm transition-colors",
            hasSelection
              ? "border-transparent bg-foreground/10 text-foreground"
              : "border-input text-foreground hover:bg-muted",
          ].join(" ")}
          onClick={() => setOpen((current) => !current)}
        >
          <span
            className={["truncate", hasSelection ? "font-medium" : ""].join(
              " ",
            )}
          >
            {hasSelection ? selectedText : label}
          </span>
        </button>

        {open && !isMobile ? (
          <div
            id={menuId}
            role="menu"
            aria-label={label}
            className="bg-popover text-popover-foreground border-border absolute top-full left-0 z-30 mt-1 flex max-h-64 w-64 flex-col gap-0.5 overflow-y-auto rounded-md border p-1 shadow-md"
          >
            {searchable ? (
              <div className="bg-popover border-border sticky top-0 z-10 border-b p-1">
                {searchField}
              </div>
            ) : null}

            {optionsList}
          </div>
        ) : null}
      </div>

      {isMobile
        ? createPortal(
            <dialog
              ref={dialogRef}
              id={menuId}
              className="drawer lg:hidden"
              data-side="bottom"
              aria-label={label}
              onClose={() => setOpen(false)}
              onClick={(event) => {
                if (event.target === dialogRef.current) setOpen(false);
              }}
            >
              <div className="bg-popover text-popover-foreground">
                <header className="flex flex-row items-center gap-2 border-b border-border px-4 py-3">
                  <h2 className="text-base font-semibold">{label}</h2>
                  <button
                    type="button"
                    className="btn ml-auto"
                    data-variant="ghost"
                    data-size="icon-sm"
                    aria-label="Cerrar"
                    onClick={() => setOpen(false)}
                  >
                    <Icon
                      icon={appIcons.close}
                      className="size-4"
                      aria-hidden="true"
                    />
                  </button>
                </header>

                {searchable ? (
                  <div className="border-b border-border p-2">
                    {searchField}
                  </div>
                ) : null}

                <section
                  role="menu"
                  aria-label={label}
                  className="flex flex-col gap-0.5 p-2"
                >
                  {optionsList}
                </section>
              </div>
            </dialog>,
            document.body,
          )
        : null}
    </>
  );
}
