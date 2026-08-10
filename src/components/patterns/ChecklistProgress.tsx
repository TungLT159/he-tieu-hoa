import { CheckCircle, Circle } from '@phosphor-icons/react'
import { Progress } from '@/components/ui/progress'

export interface ChecklistProgressItem {
  label: string
  complete: boolean
}

interface ChecklistProgressProps {
  label: string
  value: number
  items: ChecklistProgressItem[]
}

export function ChecklistProgress({ label, value, items }: ChecklistProgressProps) {
  return (
    <div className="checklist-progress">
      <Progress value={value} aria-label={label} />
      <ul>
        {items.map((item) => {
          const Icon = item.complete ? CheckCircle : Circle

          return (
            <li key={item.label}>
              <Icon className="size-4" aria-hidden />
              <span>{item.label}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
