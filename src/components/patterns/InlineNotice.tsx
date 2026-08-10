import type { Icon } from '@phosphor-icons/react'
import { Info } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface InlineNoticeProps {
  icon?: Icon
  title: string
  description: string
  tone?: 'info' | 'success' | 'warning'
}

export function InlineNotice({ icon: Icon = Info, title, description, tone = 'info' }: InlineNoticeProps) {
  return (
    <div className={cn('inline-notice', `inline-notice--${tone}`)}>
      <Icon className="size-5" aria-hidden />
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
    </div>
  )
}
