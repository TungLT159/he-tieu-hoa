import type { ReactNode } from 'react'

interface PageHeaderPatternProps {
  eyebrow: string
  title: string
  description: string
  action?: ReactNode
}

export function PageHeaderPattern({ eyebrow, title, description, action }: PageHeaderPatternProps) {
  return (
    <div className="pattern-page-header-demo">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  )
}
