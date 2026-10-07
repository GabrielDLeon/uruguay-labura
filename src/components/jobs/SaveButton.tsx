import { useCallback, useEffect, useState } from "react"
import { Icon } from "@iconify/react/offline"
import { appIcons } from "@/lib/icons"
import { getSavedJobIds, toggleSavedJob } from "@/lib/saved-jobs"

interface Props {
  jobId: string
}

export default function SaveButton({ jobId }: Props) {
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSaved(getSavedJobIds().includes(jobId))
  }, [jobId])

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      const result = toggleSavedJob(jobId)
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
