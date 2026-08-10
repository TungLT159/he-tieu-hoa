import { Badge } from '@/components/ui/badge'

export interface StatusMatrixItem {
  label: string
  status: string
}

interface StatusMatrixProps {
  items: StatusMatrixItem[]
}

export function StatusMatrix({ items }: StatusMatrixProps) {
  return (
    <div className="status-matrix">
      {items.map((item) => (
        <div className="status-matrix__item" key={item.label}>
          <span>{item.label}</span>
          <Badge variant="outline">{item.status}</Badge>
        </div>
      ))}
    </div>
  )
}
