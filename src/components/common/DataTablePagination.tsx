import { Icon } from "@iconify/react/offline";
import chevronLeft from "@iconify-icons/keyline-icons/chevron-left-fill";
import chevronRight from "@iconify-icons/keyline-icons/chevron-right-fill";
import dotsHorizontal from "@iconify-icons/keyline-icons/more-horizontal-fill";

interface Props {
  page: number;
  totalPages: number;
  total: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  showRange?: boolean;
}

function getPageNumbers(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [1];

  if (current > 3) {
    pages.push("ellipsis");
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push("ellipsis");
  }

  pages.push(total);

  return pages;
}

export default function DataTablePagination({
  page,
  totalPages,
  total,
  itemsPerPage,
  onPageChange,
  showRange = true,
}: Props) {
  const start = (page - 1) * itemsPerPage + 1;
  const end = Math.min(page * itemsPerPage, total);
  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      {showRange ? (
        <span className="text-sm text-muted-foreground order-2 sm:order-1">
          Mostrando {start}-{end} de {total}
        </span>
      ) : null}
      <nav
        role="navigation"
        aria-label="paginación"
        className="order-1 sm:order-2 sm:ml-auto sm:mr-auto"
      >
        <ul className="flex flex-row items-center gap-1">
          <li>
            <button
              type="button"
              className="btn"
              data-variant="ghost"
              data-size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <Icon
                icon={chevronLeft}
                width="16"
                height="16"
                aria-hidden="true"
              />
              <span className="hidden sm:inline">Anterior</span>
            </button>
          </li>
          {pageNumbers.map((p, i) =>
            p === "ellipsis" ? (
              <li key={`ellipsis-${i}`}>
                <div className="flex size-9 items-center justify-center">
                  <Icon
                    icon={dotsHorizontal}
                    width="16"
                    height="16"
                    className="shrink-0"
                    aria-hidden="true"
                  />
                </div>
              </li>
            ) : (
              <li key={p}>
                <button
                  type="button"
                  className="btn"
                  data-variant={p === page ? "outline" : "ghost"}
                  data-size="icon-sm"
                  onClick={() => onPageChange(p)}
                >
                  {p}
                </button>
              </li>
            ),
          )}
          <li>
            <button
              type="button"
              className="btn"
              data-variant="ghost"
              data-size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <span className="hidden sm:inline">Siguiente</span>
              <Icon
                icon={chevronRight}
                width="16"
                height="16"
                aria-hidden="true"
              />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
