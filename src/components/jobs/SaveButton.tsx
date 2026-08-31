import { useCallback, useEffect, useState } from "react"
import { Icon } from "@iconify/react/offline"
import { appIcons } from "@/lib/icons"

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

function toggleSavedId(id: string): { saved: boolean; ids: string[] } {
  const current = getSavedIds()
  const index = current.indexOf(id)
  if (index >= 0) {
    current.splice(index, 1)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
    return { saved: false, ids: current }
  } else {
    current.push(id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
    return { saved: true, ids: current }
  }
}

interface Props {
  jobId: string
}

export default function SaveButton({ jobId }: Props) {
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSaved(getSavedIds().includes(jobId))
  }, [jobId])

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      const result = toggleSavedId(jobId)
      setSaved(result.saved)
    },
    [jobId],
  )

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`inline-flex items-center justify-center rounded p-1 transition-colors ${
        saved
          ? "text-red-500 hover:text-red-600"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
      title={saved ? "Quitar de guardados" : "Guardar empleo"}
    >
      <Icon
        icon={saved ? appIcons.heart : appIcons.heartOutline}
        width="18"
        height="18"
      />
    </button>
  )
}
