import { useState } from 'react'

import { useStarterSettings } from '@/app/StarterSettingsContext'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { createTranslator, type UiLanguagePreference } from '@/lib/i18n'
import type { ThemeMode } from '@/lib/themeMode'

import { useViewer } from './viewerContext'

type VoiceMode = 'bac' | 'trung' | 'nam'

export function ViewerSettings() {
  const { locale, settings, updateSettings } = useStarterSettings()
  const { activeSheet, setActiveSheet, setBackgroundColor, setModelColor } = useViewer()
  const t = createTranslator(locale)
  const [shadowsEnabled, setShadowsEnabled] = useState(false)
  const [lighting, setLighting] = useState([70])
  const [volume, setVolume] = useState([80])
  const [voice, setVoice] = useState<VoiceMode>('bac')

  return (
    <Sheet open={activeSheet === 'settings'} onOpenChange={(open) => setActiveSheet(open ? 'settings' : null)}>
      <SheetContent side="right" closeLabel={t('common.close')} className="w-[22rem] gap-0 overflow-y-auto p-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>{t('viewer.settings.title')}</SheetTitle>
          <SheetDescription>{t('settings.subtitle')}</SheetDescription>
        </SheetHeader>
        <div className="space-y-6 p-4">
          <div className="space-y-2">
            <Label id="viewer-settings-theme-label">{t('settings.theme')}</Label>
            <Select value={settings.themeMode} onValueChange={(value) => updateSettings({ themeMode: value as ThemeMode })}>
              <SelectTrigger aria-labelledby="viewer-settings-theme-label" className="w-full">
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
            <Label id="viewer-settings-language-label">{t('settings.language')}</Label>
            <Select
              value={settings.uiLanguage}
              onValueChange={(value) => updateSettings({ uiLanguage: value as UiLanguagePreference })}
            >
              <SelectTrigger aria-labelledby="viewer-settings-language-label" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">{t('settings.language.system')}</SelectItem>
                <SelectItem value="en">{t('settings.language.english')}</SelectItem>
                <SelectItem value="vi">{t('settings.language.vietnamese')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
            <Label htmlFor="viewer-settings-shadows">{t('viewer.settings.shadows')}</Label>
            <Switch id="viewer-settings-shadows" checked={shadowsEnabled} onCheckedChange={setShadowsEnabled} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="viewer-settings-lighting">{t('viewer.settings.lighting')}</Label>
              <span className="text-sm text-muted-foreground">{lighting[0]}%</span>
            </div>
            <Slider
              id="viewer-settings-lighting"
              aria-label={t('viewer.settings.lighting')}
              value={lighting}
              min={0}
              max={100}
              step={1}
              onValueChange={setLighting}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="viewer-settings-volume">{t('viewer.settings.volume')}</Label>
              <span className="text-sm text-muted-foreground">{volume[0]}%</span>
            </div>
            <Slider
              id="viewer-settings-volume"
              aria-label={t('viewer.settings.volume')}
              value={volume}
              min={0}
              max={100}
              step={1}
              onValueChange={setVolume}
            />
          </div>

          <div className="space-y-3">
            <Label>{t('viewer.settings.voice')}</Label>
            <RadioGroup value={voice} onValueChange={(value) => setVoice(value as VoiceMode)}>
              {(['bac', 'trung', 'nam'] as const).map((voiceOption) => {
                const itemId = `viewer-settings-voice-${voiceOption}`

                return (
                  <div key={voiceOption} className="flex items-center gap-2">
                    <RadioGroupItem id={itemId} value={voiceOption} />
                    <Label htmlFor={itemId}>{t(`viewer.settings.voice.${voiceOption}`)}</Label>
                  </div>
                )
              })}
            </RadioGroup>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setBackgroundColor('#1a1a2e')
              setModelColor(null)
            }}
          >
            {t('viewer.settings.resetColors')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
