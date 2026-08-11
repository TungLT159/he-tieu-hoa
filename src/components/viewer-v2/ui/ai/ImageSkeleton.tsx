interface ImageSkeletonProps {
  label: string
}

export function ImageSkeleton({ label }: ImageSkeletonProps) {
  return (
    <div
      className="w-full aspect-[3/2] rounded-md bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-pulse"
      aria-label={label}
      role="status"
    />
  )
}
