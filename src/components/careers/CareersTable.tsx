import { useEffect, useState } from 'react'

import CareersSkeleton from '@/components/careers/CareersSkeleton'
import DataTable, {
  type DataTableColumn,
} from '@/components/common/DataTable'
import { degreeTypeLabels } from '@/lib/educacion'
import type { CareerIndexRecord, CareersIndexPayload } from '@/types/careers'

interface Props {
  institution: string
}

const columns: DataTableColumn<CareerIndexRecord>[] = [
  {
    header: 'Título',
    searchText: (career) => [career.title],
    render: (career) => (
      <a
        href={`/educacion/${career.id}`}
        className="font-medium text-foreground hover:underline"
      >
        {career.title}
      </a>
    ),
  },
  {
    header: 'Área',
    searchText: (career) => [career.area],
    render: (career) => (
      <span className="text-muted-foreground">{career.area}</span>
    ),
  },
  {
    header: 'Tipo',
    render: (career) => (
      <span className="badge text-xs" data-variant="outline">
        {degreeTypeLabels[career.degreeType] ?? career.degreeType}
      </span>
    ),
  },
]

export default function CareersTable({ institution }: Props) {
  const [careers, setCareers] = useState<CareerIndexRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [requestAttempt, setRequestAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    let isCancelled = false

    async function loadCareers() {
      setIsLoading(true)
      setLoadError(null)

      try {
        const response = await fetch(`/carreras/${institution}.json`, {
          headers: {
            Accept: 'application/json',
          },
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(
            `No se pudo cargar el índice de carreras (${response.status})`,
          )
        }

        const payload = (await response.json()) as CareersIndexPayload
        if (!payload || !Array.isArray(payload.careers)) {
          throw new Error('Índice de carreras con formato inválido')
        }

        if (!isCancelled) {
          setCareers(payload.careers)
        }
      } catch (error) {
        if (!isCancelled && !controller.signal.aborted) {
          setLoadError(
            error instanceof Error ? error.message : 'Error desconocido',
          )
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    loadCareers()

    return () => {
      isCancelled = true
      controller.abort()
    }
  }, [institution, requestAttempt])

  if (isLoading) {
    return <CareersSkeleton />
  }

  if (loadError) {
    return (
      <div className="card grid gap-3 p-6 text-center">
        <p className="text-sm text-muted-foreground">{loadError}</p>
        <button
          type="button"
          className="btn mx-auto"
          data-variant="outline"
          data-size="sm"
          onClick={() => setRequestAttempt((attempt) => attempt + 1)}
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <DataTable
      rows={careers}
      columns={columns}
      getRowId={(career) => career.id}
      noun="carreras"
      searchPlaceholder="Buscar por título o área"
    />
  )
}
