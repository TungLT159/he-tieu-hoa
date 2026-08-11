import { useStarterSettings } from '@/app/StarterSettingsContext'
import { createTranslator } from '@/lib/i18n'
import { Sparkle } from '@phosphor-icons/react'

import { AIPanel } from './AIPanel'
import { GenAIContent } from './GenAIContent'

interface GenAIPanelProps {
  onClose: () => void
}

export function GenAIPanel({ onClose }: GenAIPanelProps) {
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)

  return (
    <AIPanel open onClose={onClose} title={t('viewer.genai.title')} icon={Sparkle}>
      <GenAIContent />
    </AIPanel>
  )
}
