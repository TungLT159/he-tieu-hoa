import type { Icon } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

interface StatCardProps {
  icon?: Icon
  label: string
  value: string
  trend?: string
}

export function StatCard({ icon: Icon, label, value, trend }: StatCardProps) {
  return (
    <Card className="stat-card">
      <CardContent>
        <div className="stat-card__meta">
          {Icon ? <Icon className="size-5" aria-hidden /> : null}
          <span>{label}</span>
        </div>
        <strong>{value}</strong>
        {trend ? <Badge variant="secondary">{trend}</Badge> : null}
      </CardContent>
    </Card>
  )
}
