import type { Icon } from '@phosphor-icons/react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export interface MenuButtonDef {
  id: string
  label: string
  icon: Icon
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title?: string
}

interface ViewerMenuGroupProps {
  title: string
  buttons: MenuButtonDef[]
  collapsed?: boolean
}

export function ViewerMenuGroup({ title, buttons, collapsed }: ViewerMenuGroupProps) {
  return (
    <TooltipProvider>
      <div className="space-y-1 px-2">
        <p
          className={cn(
            'px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground',
            collapsed && 'sr-only',
          )}
        >
          {title}
        </p>
        <div className="space-y-0.5">
          {buttons.map((button) => {
            const disabled = button.disabled === true

            return (
              <Tooltip key={button.id} delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant={button.active ? 'secondary' : 'ghost'}
                    size={collapsed ? 'icon' : 'default'}
                    className={cn(
                      'w-full justify-start gap-2',
                      collapsed && 'h-9 w-9 justify-center',
                      disabled && 'pointer-events-auto opacity-50',
                    )}
                    onClick={disabled ? undefined : button.onClick}
                    aria-disabled={disabled || undefined}
                    aria-pressed={button.active}
                    title={button.title}
                  >
                    {(() => {
                      const Icon = button.icon
                      return <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    })()}
                    <span className={cn('truncate', collapsed && 'sr-only')}>{button.label}</span>
                  </Button>
                </TooltipTrigger>
                {collapsed ? (
                  <TooltipContent side="right" className="z-50">
                    <p>{button.label}</p>
                  </TooltipContent>
                ) : null}
              </Tooltip>
            )
          })}
        </div>
        <Separator className="my-1" />
      </div>
    </TooltipProvider>
  )
}
