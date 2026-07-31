import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import DataTablePagination from '@/components/common/DataTablePagination'

export interface DataTableColumn<T> {
  header: string
  render: (row: T) => ReactNode
  /** Campos del registro que se incluyen en la búsqueda por texto. */
  searchText?: (row: T) => string[]
}

interface Props<T> {
  rows: T[]
  columns: DataTableColumn<T>[]
  getRowId: (row: T) => string
  /** Sustantivo plural para el contador, ej: "carreras", "sedes". */
  noun: string
  searchPlaceholder?: string
  emptyMessage?: string
  itemsPerPage?: number
}

const DEFAULT_ITEMS_PER_PAGE = 15

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

export default function DataTable<T>({
  rows,
  columns,
  getRowId,
  noun,
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'No se encontraron resultados.',
  itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
}: Props<T>) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    if (!q) return rows
    return rows.filter((row) =>
      columns.some((column) =>
        (column.searchText?.(row) ?? []).some((text) =>
          normalize(text).includes(q),
        ),
      ),
    )
  }, [rows, columns, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  useEffect(() => {
    setPage(1)
  }, [query])

  return (
    <section className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground" role="status">
          {rows.length} {noun}
          {query.trim() ? ` · ${filtered.length} resultados` : ''}
        </p>
        <div role="group" className="field w-full sm:max-w-xs">
          <input
            type="search"
            className="input"
            placeholder={searchPlaceholder}
            aria-label={`Buscar ${noun}`}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-border">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead className="bg-muted">
                  <tr>
                    {columns.map((column) => (
                      <th key={column.header}>{column.header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((row) => (
                    <tr key={getRowId(row)} className="hover:bg-muted/50">
                      {columns.map((column) => (
                        <td key={column.header}>{column.render(row)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <DataTablePagination
            page={currentPage}
            totalPages={totalPages}
            total={filtered.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setPage}
          />
        </>
      )}
    </section>
  )
}
