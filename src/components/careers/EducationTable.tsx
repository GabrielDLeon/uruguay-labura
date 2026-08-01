import { useEffect, useState } from 'react'

import CareersSkeleton from '@/components/careers/CareersSkeleton'
import DataTable, { type DataTableColumn } from '@/components/common/DataTable'
import { degreeTypeLabels, modalityLabels } from '@/lib/educacion'
import type {
  EducationCareerRecord,
  EducationCareersPayload,
} from '@/types/careers'

const columns: DataTableColumn<EducationCareerRecord>[] = [
  {
    header: 'Institución',
    searchText: (entry) => [
      entry.institution?.short ?? entry.institutionName,
      entry.institution?.name ?? '',
    ],
    render: (entry) =>
      entry.institution ? (
        <a
          href={`/educacion/instituciones/${entry.institution.id}`}
          className="inline-flex items-center gap-1.5 font-medium text-foreground hover:underline"
        >
          {entry.institution.logo ? (
            <img
              src={entry.institution.logo}
              alt={entry.institution.name}
              className="h-7 w-auto object-contain rounded"
            />
          ) : null}
          {entry.institution.short ?? entry.institution.name}
        </a>
      ) : (
        <span title={entry.institutionName} className="text-foreground">
          {entry.institutionName}
        </span>
      ),
  },
  {
    header: 'Título',
    searchText: (entry) => [entry.title, entry.area],
    render: (entry) => (
      <div>
        <a
          href={`/educacion/carreras/${entry.id}`}
          className="font-semibold text-foreground hover:underline"
        >
          {entry.title}
        </a>
        <div className="text-xs text-muted-foreground">{entry.area}</div>
      </div>
    ),
  },
  {
    header: 'Tipo',
    searchText: (entry) => [
      degreeTypeLabels[entry.degreeType] ?? entry.degreeType,
    ],
    render: (entry) => (
      <span className="badge text-xs" data-variant="outline">
        {degreeTypeLabels[entry.degreeType] ?? entry.degreeType}
      </span>
    ),
  },
  {
    header: 'Modalidad',
    render: (entry) => (
      <span className="badge text-xs" data-variant="outline">
        {modalityLabels[entry.modality] ?? entry.modality}
      </span>
    ),
  },
  {
    header: 'Duración',
    render: (entry) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {entry.duration}
      </span>
    ),
  },
  {
    header: 'Matrícula',
    render: (entry) =>
      entry.cost === 'Gratuita' ? (
        <span className="text-muted-foreground">-</span>
      ) : (
        <span>{entry.cost}</span>
      ),
  },
]

export default function EducationTable() {
  const [careers, setCareers] = useState<EducationCareerRecord[]>([])
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
        const response = await fetch('/carreras/index.json', {
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

        const payload = (await response.json()) as EducationCareersPayload
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
  }, [requestAttempt])

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
      getRowId={(entry) => entry.id}
      noun="programas"
      searchPlaceholder="Buscar por título, área o institución"
      emptyMessage="No hay programas registrados por el momento."
      itemsPerPage={10}
    />
  )
}
