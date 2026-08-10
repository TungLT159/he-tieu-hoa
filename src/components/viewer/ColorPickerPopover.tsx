import type { Icon } from '@phosphor-icons/react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const COLOR_PRESETS = ['#1a1a2e', '#0f172a', '#111827', '#ffffff', '#f97316', '#22c55e', '#3b82f6']

interface ColorPickerPopoverProps {
  title: string
  label: string
  icon: Icon
  value: string | null
  onChange: (color: string) => void
  collapsed?: boolean
  resetLabel?: string
  onReset?: () => void
}

export function ColorPickerPopover({
  title,
  label,
  icon: Icon,
  value,
  onChange,
  collapsed,
  resetLabel,
  onReset,
}: ColorPickerPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size={collapsed ? 'icon' : 'default'}
          className={cn('w-full justify-start gap-2', collapsed && 'h-9 w-9 justify-center')}
          aria-label={collapsed ? label : undefined}
        >
          <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className={cn('truncate', collapsed && 'sr-only')}>{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent side="right" align="start" className="w-56 space-y-3">
        <PopoverTitle>{title}</PopoverTitle>
        <div className="grid grid-cols-5 gap-2">
          {COLOR_PRESETS.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={color}
              aria-pressed={value === color}
              className="size-8 rounded-md border border-border ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-pressed:ring-2 aria-pressed:ring-ring"
              style={{ backgroundColor: color }}
              onClick={() => onChange(color)}
            />
          ))}
        </div>
        {onReset && resetLabel ? (
          <Button type="button" variant="outline" size="sm" className="w-full" onClick={onReset}>
            {resetLabel}
          </Button>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}
