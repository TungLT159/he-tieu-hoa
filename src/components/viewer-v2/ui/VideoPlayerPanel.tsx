import { Waveform } from '@phosphor-icons/react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useStarterSettings } from '@/app/StarterSettingsContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createTranslator } from '@/lib/i18n'

import { useViewerV2 } from '../viewerV2Context'
import type { VoiceOption } from '../viewerV2Context'

interface VideoPlayerPanelProps {
  onClose: () => void
}

const VOICE_OPTIONS: VoiceOption[] = ['bac', 'trung', 'nam']
const VIDEO_SOURCES: Record<VoiceOption, string> = {
  bac: '/videos/b%E1%BA%AFc.mp4',
  trung: '/videos/trung.mp4',
  nam: '/videos/nam.mp4',
}

export function VideoPlayerPanel({ onClose }: VideoPlayerPanelProps) {
  const { locale } = useStarterSettings()
  const { setVoice, voice } = useViewerV2()
  const t = createTranslator(locale)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const playbackTimeRef = useRef(0)
  const shouldResumeRef = useRef(false)
  const [hasVideoError, setHasVideoError] = useState(false)
  const videoSrc = VIDEO_SOURCES[voice]
  const trackLabel = locale === 'vi' ? 'Tiếng Việt' : 'English'
  const trackLanguage = locale === 'vi' ? 'vi' : 'en'

  const savePlaybackState = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    playbackTimeRef.current = video.currentTime
    shouldResumeRef.current = !video.paused && !video.ended
  }, [])

  const handleVoiceChange = (nextVoice: string) => {
    savePlaybackState()
    setHasVideoError(false)
    setVoice(nextVoice as VoiceOption)
  }

  const restorePlaybackState = () => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = playbackTimeRef.current
    if (shouldResumeRef.current) void video.play().catch(() => undefined)
  }

  useEffect(() => {
    const controller = new AbortController()
    let isActive = true

    fetch(videoSrc, { method: 'HEAD', signal: controller.signal })
      .then((response) => {
        if (isActive && !controller.signal.aborted && !response.ok) setHasVideoError(true)
      })
      .catch((error: unknown) => {
        if (!isActive || controller.signal.aborted) return
        if (error instanceof DOMException && error.name === 'AbortError') return

        setHasVideoError(true)
      })

    return () => {
      isActive = false
      controller.abort()
    }
  }, [videoSrc])

  return (
    <Card
      role="region"
      aria-label={t('viewer.menu.video')}
      className="absolute right-4 top-4 z-20 w-[min(28rem,calc(100vw-2rem))] bg-card/95 shadow-lg backdrop-blur"
    >
      <CardContent className="space-y-4 p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-card-foreground">{t('viewer.menu.video')}</h2>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            {t('common.close')}
          </Button>
        </div>

        <div className="flex items-center justify-between gap-3">
          <Label id="learning-video-voice-label" htmlFor="learning-video-voice" className="text-sm font-medium">
            {t('viewer.settings.voice')}
          </Label>
          <Select value={voice} onValueChange={handleVoiceChange}>
            <SelectTrigger
              id="learning-video-voice"
              aria-labelledby="learning-video-voice-label"
              size="sm"
              className="w-36"
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
        </div>

        <div className="aspect-video overflow-hidden rounded-lg border border-border bg-muted">
          <video
            key={videoSrc}
            ref={videoRef}
            data-testid="learning-video"
            controls
            src={videoSrc}
            title={t('viewer.menu.video')}
            onError={() => setHasVideoError(true)}
            onLoadedMetadata={restorePlaybackState}
            onPause={savePlaybackState}
            onPlay={savePlaybackState}
            onSeeked={savePlaybackState}
            onTimeUpdate={savePlaybackState}
            className="h-full w-full bg-black"
          >
            <track
              kind="captions"
              src="/videos/he-tieu-hoa.vtt"
              srcLang={trackLanguage}
              label={trackLabel}
              default
            />
            {t('viewer.video.fallback')}
          </video>
        </div>

        {hasVideoError ? (
          <p data-testid="learning-video-error" className="text-sm text-muted-foreground">
            {t('viewer.video.fallback')}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
