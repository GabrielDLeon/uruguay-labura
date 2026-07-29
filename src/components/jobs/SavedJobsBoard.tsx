import { useEffect, useMemo, useState } from "react"

import JobsList from "@/components/jobs/JobsList"
import JobsSkeleton from "@/components/jobs/JobsSkeleton"
import JobsTable from "@/components/jobs/JobsTable"
import useJobs from "@/components/jobs/useJobs"
import type { JobRecord } from "@/types/jobs"

const STORAGE_KEY = "savedJobs"

function getSavedIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function SavedJobsBoard() {
  const { jobs, isLoading, loadError, retry } = useJobs()
  const [viewportMode, setViewportMode] = useState<"both" | "desktop" | "mobile">("both")

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)")
    const applyMode = () => {
      setViewportMode(mediaQuery.matches ? "desktop" : "mobile")
    }
    applyMode()
    mediaQuery.addEventListener("change", applyMode)
    return () => mediaQuery.removeEventListener("change", applyMode)
  }, [])

  const savedIds = useMemo(() => new Set(getSavedIds()), [jobs])

  const savedJobs = useMemo(() => {
    return jobs.filter((job: JobRecord) => savedIds.has(job.id))
  }, [jobs, savedIds])

  if (isLoading) {
    return <JobsSkeleton />
  }

  if (loadError) {
    return (
      <section className="grid gap-4">
        <p className="text-sm text-destructive">
          No se pudieron cargar los llamados. {loadError}
        </p>
        <div>
          <button type="button" className="btn" data-size="sm" onClick={retry}>
            Reintentar
          </button>
        </div>
      </section>
    )
  }

  if (savedJobs.length === 0) {
    return (
      <section className="flex flex-col items-center gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--card-bg)] p-12 text-center">
        <p className="text-lg font-semibold text-foreground">
          No tenés empleos guardados
        </p>
        <p className="text-sm text-muted-foreground max-w-md">
          Cuando encuentres un llamado que te interese, tocá el corazón
          <span aria-hidden="true"> ♥</span> para guardarlo y encontrarlo
          rápido acá.
        </p>
        <a href="/empleos" className="btn">
          Explorar llamados
        </a>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        {savedJobs.length} empleo{savedJobs.length !== 1 ? "s" : ""} guardado
       {savedJobs.length !== 1 ? "s" : ""}
      </p>

      {viewportMode !== "mobile" ? <JobsTable jobs={savedJobs} /> : null}
      {viewportMode !== "desktop" ? <JobsList jobs={savedJobs} /> : null}
    </section>
  )
}
