import { ImageIcon } from 'lucide-react'
import { cn } from '@/utilities/ui'

export function PhotoPlaceholder({
  label,
  className,
}: {
  label?: string | null
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex w-full flex-col items-center justify-center gap-4 border border-dashed border-foreground/20 bg-secondary text-center text-muted-foreground',
        className,
      )}
    >
      <ImageIcon className="h-8 w-8 opacity-40" aria-hidden="true" />
      {label && <p className="px-5 text-sm">{label}</p>}
    </div>
  )
}
