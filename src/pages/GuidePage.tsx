import { useCallback } from 'react'

import { useStarterSettings } from '@/app/StarterSettingsContext'
import { ViewerTutorialOverlay } from '@/components/viewer-v2/tutorial/ViewerTutorialOverlay'
import { ViewerV2Canvas } from '@/components/viewer-v2/ViewerV2Canvas'
import { ViewerV2Overlay } from '@/components/viewer-v2/ui/ViewerV2Overlay'
import { ViewerV2Provider } from '@/components/viewer-v2/ViewerV2Provider'
import type { VoiceOption } from '@/components/viewer-v2/viewerV2Context'

export function GuidePage() {
  const { settings, updateSettings } = useStarterSettings()
  const syncNarrationVoice = useCallback((narrationVoice: VoiceOption) => {
    updateSettings({ narrationVoice })
  }, [updateSettings])

  return (
    <ViewerV2Provider initialVoice={settings.narrationVoice} onVoiceChange={syncNarrationVoice}>
      <section className="flex h-screen w-screen overflow-hidden">
        <div className="relative h-full min-h-[24rem] flex-1 overflow-hidden">
          <ViewerV2Canvas />
          <ViewerV2Overlay />
          <ViewerTutorialOverlay />
        </div>
      </section>
    </ViewerV2Provider>
  )
}
