import { BookOpen, Gear, Play } from '@phosphor-icons/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStarterSettings } from '@/app/StarterSettingsContext'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { createTranslator, type UiLanguagePreference } from '@/lib/i18n'
import type { ThemeMode } from '@/lib/themeMode'

export function MenuPage() {
  const { locale, settings, updateSettings } = useStarterSettings()
  const t = createTranslator(locale)
  const navigate = useNavigate()
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-8">
      <div
        data-testid="menu-background"
        className="absolute inset-0 scale-105 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/bg_menu_phanmem3d-1.png")' }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,12,80,0.2),rgba(0,0,0,0.72))]" />
      <div className="absolute inset-0 bg-black/25" />

      <div className="pointer-events-none absolute h-[34rem] w-[34rem] rounded-full bg-violet-500/20 blur-3xl" />

      <div
        data-testid="menu-hero-card"
        className="relative z-10 w-[min(760px,calc(100vw-48px))] overflow-hidden rounded-[32px] border border-white/20 bg-white/[0.075] px-8 py-10 text-center shadow-[0_28px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl md:px-16 md:py-14"
      >
        <div className="pointer-events-none absolute inset-0 rounded-[32px] bg-[linear-gradient(135deg,rgba(255,255,255,0.18),rgba(124,58,237,0.08),rgba(255,255,255,0.04))]" />
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        <div className="relative">
          <h1 className="select-none text-4xl leading-tight font-black tracking-[0.12em] text-white drop-shadow-[0_0_22px_rgba(255,255,255,0.28)] sm:text-5xl md:text-6xl">
            {t('menu.titleLine1')}
            <br />
            <span className="bg-gradient-to-r from-white via-violet-100 to-cyan-100 bg-clip-text text-transparent">
              {t('menu.titleLine2')}
            </span>
          </h1>

          <div className="mx-auto mt-7 h-px w-40 bg-gradient-to-r from-transparent via-white/70 to-transparent" />

          <div className="mt-10 flex flex-col items-center gap-4">
          <Button
            className="h-14 w-full max-w-[340px] rounded-2xl bg-gradient-to-br from-[#8b5cf6] via-[#7c3aed] to-[#4c1d95] text-base font-bold text-white shadow-[0_12px_32px_rgba(124,58,237,0.45)] hover:from-[#a78bfa] hover:via-[#7c3aed] hover:to-[#5b21b6]"
            onClick={() => navigate('/viewer')}
          >
            <Play className="size-6" weight="fill" />
            {t('menu.start')}
          </Button>

          <Button
            variant="outline"
            className="h-13 w-full max-w-[340px] rounded-2xl border-white/15 bg-white/[0.08] text-base font-semibold text-white/90 hover:bg-white/15 hover:text-white"
            onClick={() => navigate('/guide')}
          >
            <BookOpen className="size-5" />
            {t('menu.guide')}
          </Button>

          <Button
            variant="outline"
            className="h-13 w-full max-w-[340px] rounded-2xl border-white/15 bg-white/[0.08] text-base font-semibold text-white/90 hover:bg-white/15 hover:text-white"
            onClick={() => setSettingsOpen(true)}
          >
            <Gear className="size-5" />
            {t('menu.settings')}
          </Button>
          </div>
        </div>
      </div>

      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent closeLabel={t('common.close')}>
          <SheetHeader>
            <SheetTitle>{t('settings.title')}</SheetTitle>
            <SheetDescription>{t('settings.subtitle')}</SheetDescription>
          </SheetHeader>
          <div className="space-y-5">
            <div className="space-y-2">
              <Label id="menu-settings-theme-label">{t('settings.theme')}</Label>
              <Select value={settings.themeMode} onValueChange={(value) => updateSettings({ themeMode: value as ThemeMode })}>
                <SelectTrigger aria-labelledby="menu-settings-theme-label" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">{t('settings.theme.light')}</SelectItem>
                  <SelectItem value="dark">{t('settings.theme.dark')}</SelectItem>
                  <SelectItem value="system">{t('settings.theme.system')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label id="menu-settings-language-label">{t('settings.language')}</Label>
              <Select
                value={settings.uiLanguage}
                onValueChange={(value) => updateSettings({ uiLanguage: value as UiLanguagePreference })}
              >
                <SelectTrigger aria-labelledby="menu-settings-language-label" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">{t('settings.language.system')}</SelectItem>
                  <SelectItem value="en">{t('settings.language.english')}</SelectItem>
                  <SelectItem value="vi">{t('settings.language.vietnamese')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
