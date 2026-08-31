import { useCallback, useState } from "react"
import { Icon } from "@iconify/react/offline"
import { appIcons } from "@/lib/icons"

interface Props {
  url: string
  title: string
}

export default function ShareButton({ url, title }: Props) {
  const [copied, setCopied] = useState(false)

  const handleShare = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()

      if (navigator.share) {
        try {
          await navigator.share({ title, url })
        } catch {
          // user cancelled
        }
      } else {
        try {
          await navigator.clipboard.writeText(url)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch {
          // clipboard not available
        }
      }
    },
    [url, title],
  )

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center justify-center rounded p-1 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
      title={copied ? "¡Enlace copiado!" : "Compartir llamado"}
    >
      <Icon
        icon={copied ? appIcons.check : appIcons.share}
        width="18"
        height="18"
      />
    </button>
  )
}
