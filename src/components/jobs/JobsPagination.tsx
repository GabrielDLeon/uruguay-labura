import { Icon } from '@iconify/react/offline'
import chevronLeft from '@iconify-icons/mdi/chevron-left.js'
import chevronRight from '@iconify-icons/mdi/chevron-right.js'
import dotsHorizontal from '@iconify-icons/mdi/dots-horizontal.js'

import { ITEMS_PER_PAGE } from '@/components/jobs/jobs'

interface Props {
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
}

function getPageNumbers(
  current: number,
  total: number,
): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | 'ellipsis')[] = [1]

  if (current > 3) {
    pages.push('ellipsis')
  }

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < total - 2) {
    pages.push('ellipsis')
  }

  pages.push(total)

  return pages
}

export default function JobsPagination({
  page,
  totalPages,
  total,
  onPageChange,
}: Props) {
  const start = (page - 1) * ITEMS_PER_PAGE + 1
  const end = Math.min(page * ITEMS_PER_PAGE, total)
  const pageNumbers = getPageNumbers(page, totalPages)

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <span className="text-sm text-muted-foreground order-2 sm:order-1">
        Mostrando {start}-{end} de {total}
      </span>
      <nav
        role="navigation"
        aria-label="paginación"
        className="order-1 sm:order-2"
      >
        <ul className="flex flex-row items-center gap-1">
          <li>
            <button
              type="button"
              className="btn-sm-ghost"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <Icon icon={chevronLeft} width="16" height="16" aria-hidden="true" />
              <span>Anterior</span>
            </button>
          </li>
          {pageNumbers.map((p, i) =>
            p === 'ellipsis' ? (
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
                  className={
                    p === page ? 'btn-sm-icon-outline' : 'btn-sm-icon-ghost'
                  }
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
              className="btn-sm-ghost"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <span>Siguiente</span>
              <Icon icon={chevronRight} width="16" height="16" aria-hidden="true" />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  )
}
