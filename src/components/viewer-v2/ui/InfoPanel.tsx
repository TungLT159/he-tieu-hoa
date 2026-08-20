import { SpeakerHigh, SpeakerSlash, Waveform } from '@phosphor-icons/react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useStarterSettings } from '@/app/StarterSettingsContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createTranslator } from '@/lib/i18n'

import { useViewerV2 } from '../viewerV2Context'
import type { VoiceOption } from '../viewerV2Context'

interface InfoPanelProps {
  onClose: () => void
}

const DETAIL_KEYS = [
  'viewer.info.details.overview',
  'viewer.info.details.digestionAbsorption',
  'viewer.info.details.tract',
  'viewer.info.details.parts',
  'viewer.info.details.layers',
] as const

const VOICE_OPTIONS: VoiceOption[] = ['bac', 'trung', 'nam']
const INFORMATION_AUDIO_FILES: Record<VoiceOption, string> = {
  bac: 'Bắc.mp3',
  trung: 'Trung.mp3',
  nam: 'Nam.mp3',
}

function getInformationAudioSrc(voice: VoiceOption) {
  return `/audios/Information/${INFORMATION_AUDIO_FILES[voice]}`
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function InfoPanel({ onClose }: InfoPanelProps) {
  const { locale } = useStarterSettings()
  const { setVoice, voice, volume } = useViewerV2()
  const t = createTranslator(locale)
  const title = t('viewer.info.title')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const playbackTimeRef = useRef(0)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const stopAudio = useCallback((resetPlaybackTime = true) => {
    const audio = audioRef.current
    if (audio) {
      if (!resetPlaybackTime) playbackTimeRef.current = audio.currentTime
      audio.pause()
      audio.currentTime = 0
      audioRef.current = null
    }
    if (resetPlaybackTime) playbackTimeRef.current = 0
  }, [])

  useEffect(() => {
    if (!isSpeaking) return

    stopAudio(false)
    const audio = new Audio(getInformationAudioSrc(voice))
    audio.volume = clamp(volume / 100, 0, 1)
    audio.currentTime = playbackTimeRef.current
    audio.onended = () => {
      playbackTimeRef.current = 0
      setIsSpeaking(false)
    }
    audioRef.current = audio
    void audio.play().catch(() => setIsSpeaking(false))

    return () => stopAudio(false)
  }, [isSpeaking, stopAudio, voice, volume])

  useEffect(() => stopAudio, [stopAudio])

  const handleNarrationToggle = () => {
    if (isSpeaking) {
      setIsSpeaking(false)
      stopAudio()
      return
    }

    setIsSpeaking(true)
  }

  return (
    <Card
      role="dialog"
      aria-modal="false"
      aria-labelledby="viewer-info-panel-title"
      data-tutorial-target="info-panel"
      className="absolute right-4 top-4 z-20 max-h-[min(38rem,calc(100vh-2rem))] w-[min(26rem,calc(100vw-2rem))] bg-card/95 shadow-lg backdrop-blur"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle id="viewer-info-panel-title" className="text-sm font-semibold">
          {title}
        </CardTitle>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          {t('common.close')}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <div className="max-h-[28rem] space-y-3 overflow-y-auto pr-1 leading-relaxed">
          {DETAIL_KEYS.map((key) => (
            <p key={key}>{t(key)}</p>
          ))}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
          <Label id="viewer-info-voice-label" htmlFor="viewer-info-voice" className="sr-only">
            {t('viewer.settings.voice')}
          </Label>
          <Select value={voice} onValueChange={(value) => setVoice(value as VoiceOption)}>
            <SelectTrigger
              id="viewer-info-voice"
              aria-labelledby="viewer-info-voice-label"
              size="sm"
              className="w-28"
            >
              <Waveform className="size-4 text-muted-foreground" aria-hidden="true" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {VOICE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {t(`viewer.settings.voice.${option}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant={isSpeaking ? 'secondary' : 'outline'}
            size="icon-sm"
            aria-label={isSpeaking ? t('viewer.info.narration.off') : t('viewer.info.narration.on')}
            onClick={handleNarrationToggle}
          >
            {isSpeaking ? (
              <SpeakerSlash className="size-4" aria-hidden="true" />
            ) : (
              <SpeakerHigh className="size-4" aria-hidden="true" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
