import type { Icon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: Icon
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('empty-state', className)}>
      {Icon ? <Icon className="size-8" aria-hidden /> : null}
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {action ? <div className="button-row">{action}</div> : null}
    </div>
  )
}
