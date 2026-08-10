export interface ActivityTimelineItem {
  title: string
  meta: string
  description: string
}

interface ActivityTimelineProps {
  items: ActivityTimelineItem[]
}

export function ActivityTimeline({ items }: ActivityTimelineProps) {
  return (
    <ol className="activity-timeline">
      {items.map((item) => (
        <li className="activity-timeline__item" key={`${item.title}-${item.meta}`}>
          <span className="activity-timeline__dot" aria-hidden />
          <div>
            <div className="activity-timeline__heading">
              <strong>{item.title}</strong>
              <small>{item.meta}</small>
            </div>
            <p>{item.description}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
