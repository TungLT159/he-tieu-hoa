import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

export interface ImageLightboxProps {
  open: boolean
  imageUrl: string
  prompt: string
  downloadLabel: string
  onClose: () => void
  onDownload: () => void
}

export function ImageLightbox({
  open,
  imageUrl,
  prompt,
  downloadLabel,
  onClose,
  onDownload,
}: ImageLightboxProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose()
        }
      }}
    >
      <DialogContent
        aria-describedby={undefined}
        className="max-h-[90vh] max-w-[90vw] sm:max-w-[90vw] flex flex-col"
      >
        <DialogTitle className="sr-only">{prompt}</DialogTitle>
        <img src={imageUrl} alt={prompt} className="min-h-0 flex-1 rounded-md object-contain" />
        <p className="mt-2 text-center text-sm text-muted-foreground">{prompt}</p>
        <div className="mt-2 flex justify-center">
          <Button type="button" variant="outline" size="sm" onClick={onDownload}>
            {downloadLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
