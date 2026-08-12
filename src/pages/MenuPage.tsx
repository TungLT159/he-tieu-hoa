import { BookOpen, Gear, Play } from '@phosphor-icons/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStarterSettings } from '@/app/StarterSettingsContext'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { createTranslator } from '@/lib/i18n'

export function MenuPage() {
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)
  const navigate = useNavigate()
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div
        data-testid="menu-background"
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/bg_menu_phanmem3d-1.png")' }}
      />
      <div className="absolute inset-0 bg-black/45" />

      <div className="relative z-10 rounded-[20px] border border-white/10 bg-white/[0.06] px-11 py-9 text-center shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-[16px]">
        <h1 className="text-xl leading-relaxed font-bold text-white select-none">
          {t('menu.titleLine1')}
          <br />
          {t('menu.titleLine2')}
        </h1>

        <div className="mt-7 flex flex-col items-center gap-2.5">
          <Button
            className="w-[210px] rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#5b21b6] py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(124,58,237,0.35)] hover:from-[#6d28d9] hover:to-[#4c1d95]"
            onClick={() => navigate('/viewer')}
          >
            <Play className="size-[18px]" weight="fill" />
            {t('menu.start')}
          </Button>

          <Button
            variant="outline"
            className="w-[210px] rounded-xl border-white/10 bg-white/[0.06] py-2.5 text-sm font-medium text-[#d0d0d0] hover:bg-white/10 hover:text-white"
            onClick={() => navigate('/guide')}
          >
            <BookOpen className="size-4" />
            {t('menu.guide')}
          </Button>

          <Button
            variant="outline"
            className="w-[210px] rounded-xl border-white/10 bg-white/[0.06] py-2.5 text-sm font-medium text-[#d0d0d0] hover:bg-white/10 hover:text-white"
            onClick={() => setSettingsOpen(true)}
          >
            <Gear className="size-4" />
            {t('menu.settings')}
          </Button>
        </div>
      </div>

      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent closeLabel={t('common.close')}>
          <SheetHeader>
            <SheetTitle>{t('settings.title')}</SheetTitle>
            <SheetDescription>{t('settings.subtitle')}</SheetDescription>
          </SheetHeader>
          <div className="text-muted-foreground text-sm">
            {t('viewer.placeholder.underDevelopment')}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
