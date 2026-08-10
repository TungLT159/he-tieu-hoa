import { useEffect, useRef, useState } from 'react'
import { useStarterSettings } from '@/app/StarterSettingsContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createTranslator } from '@/lib/i18n'
import { chat, generateImage } from '@/services/ai'
import { ChatsCircle } from '@phosphor-icons/react'

interface ChatbotPanelProps {
  onClose: () => void
}

interface Message {
  id: number
  text: string
  sender: 'user' | 'bot'
}

interface GeneratedImage {
  requestId: number
  url: string
  prompt: string
}

export function ChatbotPanel({ onClose }: ChatbotPanelProps) {
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)
  const title = t('viewer.chatbot.title')
  const [messages, setMessages] = useState<Message[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [hasChatError, setHasChatError] = useState(false)
  const [failedChatPrompt, setFailedChatPrompt] = useState<string | null>(null)
  const [imageInput, setImageInput] = useState('')
  const [isImageLoading, setIsImageLoading] = useState(false)
  const [hasImageError, setHasImageError] = useState(false)
  const [failedImagePrompt, setFailedImagePrompt] = useState<string | null>(null)
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null)
  const [activeTab, setActiveTab] = useState('chat')
  const isMountedRef = useRef(false)
  const messageIdRef = useRef(0)
  const imageRequestIdRef = useRef(0)
  const chatEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (messages.length > 0) {
      chatEndRef.current?.scrollIntoView({ block: 'end' })
    }
  }, [messages])

  const sendChat = async (retryText?: string) => {
    const text = retryText ?? chatInput.trim()
    if (!text || isChatLoading) return

    if (!retryText) {
      messageIdRef.current += 1
      const userMessage: Message = { id: messageIdRef.current, text, sender: 'user' }
      setMessages((currentMessages) => [...currentMessages, userMessage])
      setChatInput('')
    }
    setIsChatLoading(true)
    setHasChatError(false)
    setFailedChatPrompt(null)

    try {
      const reply = await chat(text)
      if (!isMountedRef.current) return
      messageIdRef.current += 1
      setMessages((currentMessages) => [...currentMessages, { id: messageIdRef.current, text: reply, sender: 'bot' }])
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

  const generate = async (retryPrompt?: string) => {
    const prompt = retryPrompt ?? imageInput.trim()
    if (!prompt || isImageLoading) return

    const requestId = imageRequestIdRef.current + 1
    imageRequestIdRef.current = requestId
    setIsImageLoading(true)
    setHasImageError(false)
    setFailedImagePrompt(null)
    setGeneratedImage(null)

    try {
      const url = await generateImage(prompt)
      if (!isMountedRef.current || requestId !== imageRequestIdRef.current) return
      setGeneratedImage({ requestId, url, prompt })
    } catch (error) {
      if (!isMountedRef.current || requestId !== imageRequestIdRef.current) return
      console.error(error)
      setGeneratedImage(null)
      setFailedImagePrompt(prompt)
      setHasImageError(true)
    } finally {
      if (isMountedRef.current && requestId === imageRequestIdRef.current) {
        setIsImageLoading(false)
      }
    }
  }

  const chatCanSend = chatInput.trim().length > 0 && !isChatLoading
  const imageCanGenerate = imageInput.trim().length > 0 && !isImageLoading

  return (
    <Card
      role="dialog"
      aria-modal="false"
      aria-labelledby="viewer-chatbot-panel-title"
      className="absolute right-4 top-4 z-20 w-[min(30rem,calc(100vw-2rem))] bg-card/95 shadow-lg backdrop-blur"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle id="viewer-chatbot-panel-title" className="flex items-center gap-2 text-sm font-semibold">
          <ChatsCircle data-testid="chatbot-panel-icon" aria-hidden="true" className="size-4" />
          {title}
        </CardTitle>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          {t('common.close')}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat">
              {t('viewer.chatbot.tabChat')}
            </TabsTrigger>
            <TabsTrigger value="image">
              {t('viewer.chatbot.tabImage')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-3">
            <ScrollArea className="h-56 rounded-md border border-border p-3">
              <div
                role="log"
                aria-label={t('viewer.chatbot.tabChat')}
                aria-live="polite"
                aria-relevant="additions"
                data-testid="chatbot-chat-status"
                className="space-y-2"
              >
                {messages.map((message) => {
                  const isUser = message.sender === 'user'
                  return (
                    <div
                      key={message.id}
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
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>
            {hasChatError ? (
              <div className="space-y-2">
                <p role="alert">{t('viewer.chatbot.error')}</p>
                {failedChatPrompt ? (
                  <Button type="button" variant="outline" size="sm" onClick={() => void sendChat(failedChatPrompt)}>
                    {t('viewer.genai.regenerate')}
                  </Button>
                ) : null}
              </div>
            ) : null}
            <form
              className="flex gap-2"
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
          </TabsContent>

          <TabsContent value="image" className="space-y-3">
            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault()
                void generate()
              }}
            >
              <Input
                value={imageInput}
                aria-label={t('viewer.chatbot.imagePlaceholder')}
                placeholder={t('viewer.chatbot.imagePlaceholder')}
                onChange={(event) => setImageInput(event.target.value)}
              />
              <Button type="submit" disabled={!imageCanGenerate}>
                {t('viewer.chatbot.imagePrompt')}
              </Button>
            </form>
            <div role="status" aria-live="polite" data-testid="chatbot-image-status">
              {isImageLoading ? (
                <p className="flex items-center gap-2">
                  <span className="size-3 animate-spin rounded-full border border-muted-foreground border-t-transparent" aria-hidden="true" />
                  {t('viewer.chatbot.imageLoading')}
                </p>
              ) : null}
              {generatedImage ? (
                <img
                  key={generatedImage.requestId}
                  className="max-h-56 rounded-md border border-border object-contain"
                  src={generatedImage.url}
                  alt={generatedImage.prompt}
                  onError={() => {
                    if (generatedImage.requestId === imageRequestIdRef.current) {
                      setFailedImagePrompt(generatedImage.prompt)
                      setHasImageError(true)
                    }
                  }}
                />
              ) : null}
            </div>
            {hasImageError ? (
              <div className="space-y-2">
                <p role="alert">{t('viewer.chatbot.error')}</p>
                {failedImagePrompt ? (
                  <Button type="button" variant="outline" size="sm" onClick={() => void generate(failedImagePrompt)}>
                    {t('viewer.genai.regenerate')}
                  </Button>
                ) : null}
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
