import type { Icon } from '@phosphor-icons/react'

export interface FeatureListItem {
  icon?: Icon
  title: string
  description: string
}

interface FeatureListProps {
  items: FeatureListItem[]
}

export function FeatureList({ items }: FeatureListProps) {
  return (
    <div className="feature-list">
      {items.map(({ icon: Icon, title, description }) => (
        <article className="feature-list__item" key={title}>
          {Icon ? <Icon className="size-5" aria-hidden /> : null}
          <div>
            <strong>{title}</strong>
            <p>{description}</p>
          </div>
        </article>
      ))}
    </div>
  )
}
