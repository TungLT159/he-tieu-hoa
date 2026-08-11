import { useStarterSettings } from '@/app/StarterSettingsContext'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createTranslator } from '@/lib/i18n'
import type { ComponentType, ReactNode } from 'react'

interface AIPanelTab {
  value: string
  label: string
}

interface AIPanelProps {
  open: boolean
  onClose: () => void
  title: string
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
  tabs?: AIPanelTab[]
  activeTab?: string
  onTabChange?: (value: string) => void
  children: ReactNode
}

export function AIPanel({
  open,
  onClose,
  title,
  icon: Icon,
  tabs,
  activeTab,
  onTabChange,
  children,
}: AIPanelProps) {
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)
  const closeLabel = t('common.close')

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose()
        }
      }}
    >
      <SheetContent
        side="right"
        closeLabel={closeLabel}
        aria-describedby={undefined}
        className="flex h-full w-full flex-col gap-0 bg-card/95 p-0 backdrop-blur sm:w-[40vw] sm:max-w-[500px]"
      >
        <SheetHeader className="flex-row items-center justify-between gap-3 space-y-0 border-b border-border/60 px-4 py-4 pr-12">
          <SheetTitle className="flex min-w-0 items-center gap-2 text-sm font-semibold">
            <Icon className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{title}</span>
          </SheetTitle>
        </SheetHeader>

        {tabs && tabs.length > 0 ? (
          <Tabs value={activeTab} onValueChange={onTabChange} className="flex min-h-0 flex-1 flex-col gap-0">
            <div className="border-b border-border/60 px-4 py-3">
              <TabsList
                className="grid w-full"
                style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
              >
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            {activeTab ? (
              <TabsContent value={activeTab} className="min-h-0 flex-1 overflow-hidden px-4 py-3">
                <div className="h-full overflow-y-auto">{children}</div>
              </TabsContent>
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">{children}</div>
            )}
          </Tabs>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
            {children}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
