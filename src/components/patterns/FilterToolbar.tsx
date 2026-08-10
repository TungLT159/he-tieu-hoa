import type { ReactNode } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { Input } from '@/components/ui/input'

interface FilterToolbarProps {
  searchLabel: string
  searchPlaceholder: string
  filter?: ReactNode
  action?: ReactNode
}

export function FilterToolbar({ searchLabel, searchPlaceholder, filter, action }: FilterToolbarProps) {
  return (
    <div className="filter-toolbar">
      <div className="filter-toolbar__search">
        <MagnifyingGlass className="size-4" aria-hidden />
        <Input aria-label={searchLabel} placeholder={searchPlaceholder} />
      </div>
      {filter ? <div className="filter-toolbar__filter">{filter}</div> : null}
      {action ? <div className="filter-toolbar__action">{action}</div> : null}
    </div>
  )
}
