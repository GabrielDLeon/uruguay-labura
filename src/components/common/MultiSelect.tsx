import { useEffect, useRef, useState } from "react";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface Props {
  id: string;
  values: string[];
  onChange: (nextValues: string[]) => void;
  options: MultiSelectOption[];
  allLabel?: string;
}

export default function MultiSelect({
  id,
  values,
  onChange,
  options,
  allLabel = "Todos",
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
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
  }, [open]);

  const toggleValue = (value: string) => {
    onChange(
      values.includes(value)
        ? values.filter((current) => current !== value)
        : [...values, value],
    );
  };

  const buttonLabel =
    values.length === 0
      ? allLabel
      : values.length === 1
        ? (options.find((option) => option.value === values[0])?.label ??
          allLabel)
        : `${values.length} seleccionados`;

  return (
    <div id={id} className="select relative" ref={rootRef}>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span className="truncate">{buttonLabel}</span>
        </span>
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
          <div
            role="listbox"
            id={`${id}-listbox`}
            aria-multiselectable="true"
            className="max-h-64 overflow-y-auto"
          >
            {options.map((option) => {
              const selected = values.includes(option.value);
              return (
                <div
                  key={option.value}
                  role="option"
                  data-value={option.value}
                  aria-selected={selected}
                  className="flex min-w-0 cursor-pointer flex-row items-center gap-2 text-left"
                  onClick={() => toggleValue(option.value)}
                >
                  <input
                    type="checkbox"
                    className="input"
                    checked={selected}
                    readOnly
                    tabIndex={-1}
                    aria-hidden="true"
                  />
                  <span className="truncate text-sm font-medium">
                    {option.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
