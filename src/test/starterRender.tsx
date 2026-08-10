import { TooltipProvider } from '@/components/ui/tooltip'
import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement } from 'react'

export function renderStarter(ui: ReactElement, options?: RenderOptions) {
  return render(
    <TooltipProvider delayDuration={0}>
      {ui}
    </TooltipProvider>,
    options,
  )
}
