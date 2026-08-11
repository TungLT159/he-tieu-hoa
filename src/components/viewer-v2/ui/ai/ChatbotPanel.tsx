import { useStarterSettings } from '@/app/StarterSettingsContext'
import { createTranslator } from '@/lib/i18n'
import { ChatsCircle } from '@phosphor-icons/react'
import { useState } from 'react'

import { AIPanel } from './AIPanel'
import { ChatContent } from './ChatContent'
import { ImageContent } from './ImageContent'

interface ChatbotPanelProps {
  onClose: () => void
}

export function ChatbotPanel({ onClose }: ChatbotPanelProps) {
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)
  const [activeTab, setActiveTab] = useState('chat')

  const tabs = [
    { value: 'chat', label: t('viewer.chatbot.tabChat') },
    { value: 'image', label: t('viewer.chatbot.tabImage') },
  ]

  return (
    <AIPanel
      open
      onClose={onClose}
      title={t('viewer.chatbot.title')}
      icon={ChatsCircle}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === 'chat' ? <ChatContent /> : <ImageContent />}
    </AIPanel>
  )
}
