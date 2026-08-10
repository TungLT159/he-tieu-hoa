import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const DEFAULT_PRESETS = ['#1a1a2e', '#0f172a', '#ffffff', '#f97316', '#22c55e', '#3b82f6']

interface ColorPickerPopoverProps {
  label: string
  value: string | null
  onChange: (color: string) => void
  presets?: string[]
  collapsed?: boolean
}

export function ColorPickerPopover({
  label,
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  collapsed = false,
}: ColorPickerPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size={collapsed ? 'icon' : 'default'}
          className={cn('justify-start gap-2', collapsed && 'h-9 w-9 justify-center')}
          title={collapsed ? label : undefined}
        >
          <span
            aria-hidden="true"
            className="size-3 rounded-full border border-border"
            style={{ backgroundColor: value ?? 'transparent' }}
          />
          <span className={cn(collapsed && 'sr-only')}>{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-52 space-y-3">
        <PopoverTitle>{label}</PopoverTitle>
        <div className="grid grid-cols-4 gap-2">
          {presets.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={color}
              aria-pressed={value === color}
              className="size-8 rounded-md border border-border ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-pressed:ring-2 aria-pressed:ring-ring"
              style={{ backgroundColor: color }}
              onClick={() => onChange(color)}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
