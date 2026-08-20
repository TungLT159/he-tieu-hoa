import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { createTranslator } from '@/lib/i18n'
import { useStarterSettings } from '@/app/StarterSettingsContext'
import { AppSettingsControls } from '@/components/settings/AppSettingsControls'

import { useViewerV2 } from '../viewerV2Context'
import type { QualityPreset, VoiceOption } from '../viewerV2Context'
import { ColorPickerPopover } from './ColorPickerPopover'

const QUALITY_OPTIONS: QualityPreset[] = ['low', 'medium', 'high']
const VOICE_OPTIONS: VoiceOption[] = ['bac', 'trung', 'nam']
const DEFAULT_VOLUME = 80

export function ViewerV2SettingsPanel() {
  const {
    backgroundColor,
    modelColor,
    qualityPreset,
    setActiveSheet,
    setBackgroundColor,
    setModelColor,
    setQualityPreset,
    setVolume,
    setVoice,
    voice,
    volume,
  } = useViewerV2()
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)
  const muteLabel = volume === 0 ? t('viewer.settings.unmute') : t('viewer.settings.mute')

  return (
    <Card
      role="dialog"
      aria-modal="false"
      aria-labelledby="viewer-v2-settings-title"
      data-tutorial-target="settings-panel"
      className="absolute right-4 top-4 z-20 w-80 bg-card/95 shadow-lg backdrop-blur"
    >
      <CardContent className="space-y-5 p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 id="viewer-v2-settings-title" className="text-sm font-semibold text-card-foreground">
            {t('viewer.settings.title')}
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={`${t('common.close')} ${t('viewer.menu.settings').toLowerCase()}`}
            onClick={() => setActiveSheet(null)}
          >
            {t('common.close')}
          </Button>
        </div>

        <AppSettingsControls />

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-card-foreground">{t('viewer.settings.quality')}</legend>
          <RadioGroup
            value={qualityPreset}
            onValueChange={(value) => setQualityPreset(value as QualityPreset)}
            aria-label={t('viewer.settings.quality')}
            className="grid grid-cols-3 gap-2"
          >
            {QUALITY_OPTIONS.map((option) => (
              <div key={option} className="flex items-center gap-2 rounded-md border border-border px-3 py-2">
                <RadioGroupItem id={`viewer-v2-quality-${option}`} value={option} />
                <Label htmlFor={`viewer-v2-quality-${option}`} className="cursor-pointer">
                  {t(`viewer.settings.quality.${option}`)}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </fieldset>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="viewer-v2-volume-slider">{t('viewer.settings.volume')}</Label>
            <span className="text-sm tabular-nums text-muted-foreground">{volume}</span>
          </div>
          <div className="flex items-center gap-3">
            <Slider
              id="viewer-v2-volume-slider"
              aria-label={t('viewer.settings.volume')}
              min={0}
              max={100}
              step={1}
              value={[volume]}
              onValueChange={([nextVolume]) => setVolume(nextVolume ?? 0)}
            />
            <Button type="button" variant="outline" size="sm" onClick={() => setVolume(volume === 0 ? DEFAULT_VOLUME : 0)}>
              {muteLabel}
            </Button>
          </div>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-card-foreground">{t('viewer.settings.voice')}</legend>
          <RadioGroup
            value={voice}
            onValueChange={(value) => setVoice(value as VoiceOption)}
            aria-label={t('viewer.settings.voice')}
            className="grid grid-cols-3 gap-2"
          >
            {VOICE_OPTIONS.map((option) => (
              <div key={option} className="flex items-center gap-2 rounded-md border border-border px-3 py-2">
                <RadioGroupItem id={`viewer-v2-voice-${option}`} value={option} />
                <Label htmlFor={`viewer-v2-voice-${option}`} className="cursor-pointer">
                  {t(`viewer.settings.voice.${option}`)}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </fieldset>

        <div className="space-y-2">
          <ColorPickerPopover
            label={t('viewer.menu.modelColor')}
            value={modelColor}
            onChange={setModelColor}
            onReset={() => setModelColor(null)}
          />
          <ColorPickerPopover label={t('viewer.menu.backgroundColor')} value={backgroundColor} onChange={setBackgroundColor} />
        </div>
      </CardContent>
    </Card>
  )
}
