import { useEffect, useRef, useState } from 'react'
import { useStarterSettings } from '@/app/StarterSettingsContext'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useChatHistory } from '@/hooks/useChatHistory'
import { useTypewriter } from '@/hooks/useTypewriter'
import { createTranslator } from '@/lib/i18n'
import { chat } from '@/services/ai'

import { TypingIndicator } from './TypingIndicator'

export function ChatContent() {
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)
  const { messages, addMessage } = useChatHistory()
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [hasChatError, setHasChatError] = useState(false)
  const [failedChatPrompt, setFailedChatPrompt] = useState<string | null>(null)
  const [temporaryResponse, setTemporaryResponse] = useState<string | null>(null)
  const committedTemporaryResponseRef = useRef<string | null>(null)
  const isMountedRef = useRef(false)
  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const { displayedText: displayedResponse, isTyping: isResponseTyping } = useTypewriter(temporaryResponse)

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (messages.length > 0 || displayedResponse) {
      chatEndRef.current?.scrollIntoView({ block: 'end' })
    }
  }, [displayedResponse, messages])

  useEffect(() => {
    if (!temporaryResponse || isResponseTyping || displayedResponse !== temporaryResponse) return
    if (committedTemporaryResponseRef.current === temporaryResponse) return

    committedTemporaryResponseRef.current = temporaryResponse
    addMessage(temporaryResponse, 'bot')
    setTemporaryResponse(null)
  }, [addMessage, displayedResponse, isResponseTyping, temporaryResponse])

  const sendChat = async (retryText?: string) => {
    const text = retryText ?? chatInput.trim()
    if (!text || isChatLoading) return

    if (!retryText) {
      addMessage(text, 'user')
      setChatInput('')
    }

    setIsChatLoading(true)
    setHasChatError(false)
    setFailedChatPrompt(null)
    setTemporaryResponse(null)
    committedTemporaryResponseRef.current = null

    try {
      const reply = await chat(text)
      if (!isMountedRef.current) return
      setTemporaryResponse(reply)
    } catch (error) {
      if (!isMountedRef.current) return
      console.error(error)
      setFailedChatPrompt(text)
      setHasChatError(true)
    } finally {
      if (isMountedRef.current) {
        setIsChatLoading(false)
      }
    }
  }

  const chatCanSend = chatInput.trim().length > 0 && !isChatLoading && !isResponseTyping
  const botSenderLabel = t('viewer.chatbot.senderBot')

  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden text-sm text-muted-foreground">
      <div className="min-h-0 flex-1 overflow-y-auto rounded-md border border-border p-3">
        <div
          role="log"
          aria-label={t('viewer.chatbot.tabChat')}
          aria-live="polite"
          aria-relevant="additions"
          className="space-y-2"
        >
          {messages.map((message) => {
            const isUser = message.sender === 'user'
            const senderLabel = isUser ? t('viewer.chatbot.senderUser') : t('viewer.chatbot.senderBot')

            return (
              <div
                key={message.id}
                role="article"
                aria-label={`${senderLabel}: ${message.text}`}
                data-testid={`chatbot-message-${message.sender}-${message.id}`}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <p
                  className={`max-w-[85%] rounded-lg px-3 py-2 ${
                    isUser
                      ? 'bg-primary text-primary-foreground'
                      : 'whitespace-pre-wrap bg-muted text-muted-foreground'
                  }`}
                >
                  {message.text}
                </p>
              </div>
            )
          })}
          {isChatLoading ? <TypingIndicator /> : null}
          {temporaryResponse ? (
            <div
              role="article"
              aria-label={`${botSenderLabel}: ${displayedResponse}`}
              data-testid="chatbot-message-bot-temporary"
              className="flex justify-start"
            >
              <p className="max-w-[85%] whitespace-pre-wrap rounded-lg bg-muted px-3 py-2 text-muted-foreground">
                {displayedResponse}
              </p>
            </div>
          ) : null}
          <div ref={chatEndRef} />
        </div>
      </div>

      {hasChatError ? (
        <Alert variant="destructive">
          <AlertDescription>
            <span>{t('viewer.chatbot.error')}</span>
            {failedChatPrompt ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => void sendChat(failedChatPrompt)}
              >
                {t('viewer.chatbot.regenerate')}
              </Button>
            ) : null}
          </AlertDescription>
        </Alert>
      ) : null}

      <form
        className="flex shrink-0 gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          void sendChat()
        }}
      >
        <Input
          value={chatInput}
          aria-label={t('viewer.chatbot.placeholder')}
          placeholder={t('viewer.chatbot.placeholder')}
          onChange={(event) => setChatInput(event.target.value)}
        />
        <Button type="submit" disabled={!chatCanSend}>
          {t('viewer.chatbot.send')}
        </Button>
      </form>
    </div>
  )
}
