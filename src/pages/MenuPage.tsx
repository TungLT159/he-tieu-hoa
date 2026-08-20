import { BookOpen, Gear, Play, X } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStarterSettings } from '@/app/StarterSettingsContext'
import { Button } from '@/components/ui/button'
import { ViewerV2SettingsPanel } from '@/components/viewer-v2/ui/ViewerV2SettingsPanel'
import { useViewerV2 } from '@/components/viewer-v2/viewerV2Context'
import type { VoiceOption } from '@/components/viewer-v2/viewerV2Context'
import { ViewerV2Provider } from '@/components/viewer-v2/ViewerV2Provider'
import { createTranslator } from '@/lib/i18n'

export function MenuPage() {
  const { settings, updateSettings } = useStarterSettings()
  const syncNarrationVoice = useCallback((narrationVoice: VoiceOption) => {
    updateSettings({ narrationVoice })
  }, [updateSettings])

  return (
    <ViewerV2Provider initialVoice={settings.narrationVoice} onVoiceChange={syncNarrationVoice}>
      <MenuPageContent />
    </ViewerV2Provider>
  )
}

function MenuPageContent() {
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)
  const navigate = useNavigate()
  const { activeSheet, setActiveSheet } = useViewerV2()
  const closeApp = async () => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window')
      await getCurrentWindow().close()
    } catch {
      window.close()
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#9ed0e8] px-4 py-7 text-center sm:px-6">
      <div
        data-testid="menu-background"
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/bg_menu_phanmem3d-1.png")' }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.82)_0%,rgba(218,244,255,0.58)_44%,rgba(178,224,246,0.2)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(0deg,rgba(88,165,211,0.22),rgba(88,165,211,0))]" />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={t('menu.settings')}
        title={t('menu.settings')}
        className="absolute right-4 bottom-4 z-20 size-8 rounded-full border-2 border-white/90 bg-[#49a7c9]/95 text-white shadow-[0_3px_0_rgba(16,83,112,0.55),0_10px_18px_rgba(43,121,158,0.24)] hover:bg-[#3b98bb] hover:text-white"
        onClick={() => setActiveSheet('settings')}
      >
        <Gear className="size-5" weight="fill" />
      </Button>

      <div
        data-testid="menu-hero-card"
        className="relative z-10 grid w-full max-w-[1040px] -translate-y-2 grid-cols-1 items-center gap-8 text-left sm:-translate-y-4 lg:grid-cols-[minmax(0,1fr)_17rem]"
      >
        <section className="flex min-w-0 flex-col items-center text-center lg:items-start lg:text-left">
          <div
            data-testid="menu-logo"
            className="relative mb-6 grid size-[clamp(7.5rem,17vw,12rem)] place-items-center overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_24px_55px_rgba(47,126,177,0.28),inset_0_1px_0_rgba(255,255,255,0.9)]"
          >
            <img
              src="/BG logo IIT.png"
              alt={t('menu.logoAlt')}
              className="h-full w-full scale-[3.45] object-contain"
              draggable={false}
            />
          </div>

          <p className="mb-3 rounded-full border border-white/80 bg-white/55 px-4 py-1.5 text-sm font-bold text-[#266a9b] shadow-[0_8px_22px_rgba(48,127,177,0.14)] backdrop-blur">
            {t('menu.introEyebrow')}
          </p>

          <h1 className="select-none pt-1 font-sans leading-[1.03] font-black text-[#f0ad1f] drop-shadow-[0_2px_0_#516979,0_5px_9px_rgba(18,54,76,0.28)]">
            <span className="block text-[clamp(2.65rem,7vw,5.35rem)]">{t('menu.titleLine1')}</span>
            <span className="mt-3 block text-[clamp(2.1rem,5.4vw,3.8rem)] text-[#2e7eb6] drop-shadow-[0_2px_0_rgba(255,255,255,0.95),0_5px_10px_rgba(28,92,137,0.2)]">
              {t('menu.titleLine2')}
            </span>
          </h1>

          <p className="mt-5 max-w-[31rem] text-balance text-base font-semibold leading-7 text-[#315f7b] sm:text-lg">
            {t('menu.introSubtitle')}
          </p>
        </section>

        <div className="mx-auto flex w-full max-w-[250px] flex-col items-stretch gap-5 lg:mx-0 lg:justify-self-end">
          <MenuActionButton
            icon={<Play className="size-5" weight="fill" />}
            label={t('menu.start')}
            onClick={() => navigate('/viewer')}
          />

          <MenuActionButton
            icon={<BookOpen className="size-5" weight="fill" />}
            label={t('menu.guide')}
            onClick={() => navigate('/guide')}
          />

          <MenuActionButton
            icon={<X className="size-5" weight="bold" />}
            label={t('menu.exit')}
            onClick={() => void closeApp()}
          />
        </div>
      </div>

      {activeSheet === 'settings' ? <ViewerV2SettingsPanel /> : null}
    </div>
  )
}

function MenuActionButton({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <Button
      className="h-16 w-full rounded-md border-2 border-[#2d84ec] bg-[#536e99] px-6 text-[1.75rem] font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_5px_0_#1e6bcb,0_11px_20px_rgba(34,88,140,0.3)] transition-transform hover:-translate-y-0.5 hover:bg-[#607ba6] hover:text-white active:translate-y-0 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_2px_0_#1e6bcb,0_6px_14px_rgba(34,88,140,0.24)]"
      onClick={onClick}
    >
      <span className="sr-only">{label}</span>
      <span aria-hidden className="flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </span>
    </Button>
  )
}
