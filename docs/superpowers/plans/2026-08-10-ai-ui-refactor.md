# AI UI Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor ChatbotPanel and GenAIPanel from small Card overlays into modern slide-out Sheet panels with animations, image download, and lightbox.

**Architecture:** Shared AIPanel (Sheet wrapper) used by ChatbotPanel (Chat + Image tabs) and GenAIPanel (description). Utility hooks for chat history persistence and image download. Pure CSS animations via Tailwind.

**Tech Stack:** React, TypeScript, Tailwind CSS, tw-animate-css, shadcn/ui (Sheet, Dialog, Tabs, ScrollArea, Button, Input), Vitest, React Testing Library

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `src/services/imageDownload.ts` | CREATE | Download image from URL to file |
| `src/hooks/useImageDownload.ts` | CREATE | Hook wrapping download with loading/error state |
| `src/hooks/useChatHistory.ts` | CREATE | Hook to persist chat messages across panel open/close |
| `src/components/viewer-v2/ui/ai/TypingIndicator.tsx` | CREATE | 3-dot bounce animation |
| `src/components/viewer-v2/ui/ai/ImageSkeleton.tsx` | CREATE | Shimmer placeholder for image loading |
| `src/components/viewer-v2/ui/ai/ImageLightbox.tsx` | CREATE | Full-size image dialog |
| `src/components/viewer-v2/ui/ai/AIPanel.tsx` | CREATE | Shared Sheet wrapper |
| `src/components/viewer-v2/ui/ai/ChatContent.tsx` | CREATE | Chat tab content |
| `src/components/viewer-v2/ui/ai/ImageContent.tsx` | CREATE | Image generation tab content |
| `src/components/viewer-v2/ui/ai/GenAIContent.tsx` | CREATE | Auto-fetch description content |
| `src/components/viewer-v2/ui/ai/ChatbotPanel.tsx` | CREATE | Composes AIPanel + Chat/Image tabs |
| `src/components/viewer-v2/ui/ai/GenAIPanel.tsx` | CREATE | Composes AIPanel + GenAIContent |
| `src/components/viewer-v2/ui/ViewerV2Overlay.tsx` | MODIFY | Update imports |
| `src/lib/locales/en.json` | MODIFY | Add new keys |
| `src/lib/locales/vi.json` | MODIFY | Add new keys |
| `src/components/viewer-v2/ui/ChatbotPanel.tsx` | DELETE | Replaced by ai/ChatbotPanel.tsx |
| `src/components/viewer-v2/ui/GenAIPanel.tsx` | DELETE | Replaced by ai/GenAIPanel.tsx |

---

### Task 1: Create imageDownload service

**Files:**
- Create: `src/services/imageDownload.ts`

- [ ] **Step 1: Write imageDownload.ts**

```typescript
export async function downloadImage(url: string, filename: string): Promise<void> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Download failed: ${response.status}`)
  }
  const blob = await response.blob()
  const blobUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = blobUrl
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(blobUrl)
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/imageDownload.ts
git commit -m "feat: add image download utility"
```

---

### Task 2: Create useImageDownload hook

**Files:**
- Create: `src/hooks/useImageDownload.ts`

- [ ] **Step 1: Write useImageDownload.ts**

```typescript
import { useState, useCallback } from 'react'
import { downloadImage } from '@/services/imageDownload'

export function useImageDownload() {
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const download = useCallback(async (url: string, filename?: string) => {
    setIsDownloading(true)
    setError(null)
    try {
      const name = filename ?? `ai-image-${Date.now()}.png`
      await downloadImage(url, name)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed')
    } finally {
      setIsDownloading(false)
    }
  }, [])

  return { download, isDownloading, error }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useImageDownload.ts
git commit -m "feat: add useImageDownload hook"
```

---

### Task 3: Create useChatHistory hook

**Files:**
- Create: `src/hooks/useChatHistory.ts`

- [ ] **Step 1: Write useChatHistory.ts**

```typescript
import { useRef, useCallback, useState } from 'react'

export interface Message {
  id: number
  text: string
  sender: 'user' | 'bot'
}

export function useChatHistory() {
  const messagesRef = useRef<Message[]>([])
  const idRef = useRef(0)
  const [, forceUpdate] = useState(0)

  const addMessage = useCallback((text: string, sender: 'user' | 'bot') => {
    idRef.current += 1
    messagesRef.current = [...messagesRef.current, { id: idRef.current, text, sender }]
    forceUpdate((n) => n + 1)
  }, [])

  const clearMessages = useCallback(() => {
    messagesRef.current = []
    idRef.current = 0
    forceUpdate((n) => n + 1)
  }, [])

  return { messages: messagesRef.current, addMessage, clearMessages }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useChatHistory.ts
git commit -m "feat: add useChatHistory hook for persistent chat state"
```

---

### Task 4: Create TypingIndicator

**Files:**
- Create: `src/components/viewer-v2/ui/ai/TypingIndicator.tsx`
- Create: `src/components/viewer-v2/ui/ai/__tests__/TypingIndicator.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TypingIndicator } from '../TypingIndicator'

describe('TypingIndicator', () => {
  it('renders three dots with animation classes', () => {
    const { container } = render(<TypingIndicator />)
    const dots = container.querySelectorAll('span')
    expect(dots).toHaveLength(3)
    dots.forEach((dot) => {
      expect(dot.className).toContain('animate-bounce')
      expect(dot.className).toContain('rounded-full')
    })
    expect(dots[0].style.animationDelay).toBe('0ms')
    expect(dots[1].style.animationDelay).toBe('150ms')
    expect(dots[2].style.animationDelay).toBe('300ms')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/components/viewer-v2/ui/ai/__tests__/TypingIndicator.test.tsx
```
Expected: FAIL (module not found)

- [ ] **Step 3: Write TypingIndicator.tsx**

```typescript
export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2" aria-label="AI is thinking" role="status">
      <span className="size-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '0ms' }} />
      <span className="size-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '150ms' }} />
      <span className="size-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '300ms' }} />
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/components/viewer-v2/ui/ai/__tests__/TypingIndicator.test.tsx
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/viewer-v2/ui/ai/TypingIndicator.tsx src/components/viewer-v2/ui/ai/__tests__/TypingIndicator.test.tsx
git commit -m "feat: add TypingIndicator component"
```

---

### Task 5: Create ImageSkeleton

**Files:**
- Create: `src/components/viewer-v2/ui/ai/ImageSkeleton.tsx`

- [ ] **Step 1: Write ImageSkeleton.tsx**

```typescript
export function ImageSkeleton() {
  return (
    <div
      className="w-full aspect-[3/2] rounded-md bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-pulse"
      aria-label="Generating image"
      role="status"
    />
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/viewer-v2/ui/ai/ImageSkeleton.tsx
git commit -m "feat: add ImageSkeleton component"
```

---

### Task 6: Create ImageLightbox

**Files:**
- Create: `src/components/viewer-v2/ui/ai/ImageLightbox.tsx`
- Create: `src/components/viewer-v2/ui/ai/__tests__/ImageLightbox.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ImageLightbox } from '../ImageLightbox'

function setup(props?: Partial<{ open: boolean; imageUrl: string; prompt: string; onClose: () => void; onDownload: () => void }>) {
  const onClose = vi.fn()
  const onDownload = vi.fn()
  const result = render(
    <ImageLightbox
      open={props?.open ?? true}
      imageUrl={props?.imageUrl ?? 'https://example.com/image.png'}
      prompt={props?.prompt ?? 'A test prompt'}
      onClose={props?.onClose ?? onClose}
      onDownload={props?.onDownload ?? onDownload}
    />
  )
  return { onClose: props?.onClose ?? onClose, onDownload: props?.onDownload ?? onDownload, ...result }
}

describe('ImageLightbox', () => {
  it('renders image with prompt when open', () => {
    setup()
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/image.png')
    expect(screen.getByText('A test prompt')).toBeDefined()
  })

  it('calls onDownload when download button clicked', async () => {
    const user = userEvent.setup()
    const { onDownload } = setup()
    await user.click(screen.getByText('Download'))
    expect(onDownload).toHaveBeenCalledTimes(1)
  })

  it('does not render when open is false', () => {
    setup({ open: false })
    expect(screen.queryByRole('img')).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/components/viewer-v2/ui/ai/__tests__/ImageLightbox.test.tsx
```
Expected: FAIL (module not found)

- [ ] **Step 3: Write ImageLightbox.tsx**

```typescript
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ImageLightboxProps {
  open: boolean
  imageUrl: string
  prompt: string
  onClose: () => void
  onDownload: () => void
}

export function ImageLightbox({ open, imageUrl, prompt, onClose, onDownload }: ImageLightboxProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] flex flex-col">
        <img
          src={imageUrl}
          alt={prompt}
          className="flex-1 object-contain rounded-md min-h-0"
        />
        <p className="text-sm text-muted-foreground text-center mt-2">{prompt}</p>
        <div className="flex justify-center mt-2">
          <Button type="button" variant="outline" size="sm" onClick={onDownload}>
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/components/viewer-v2/ui/ai/__tests__/ImageLightbox.test.tsx
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/viewer-v2/ui/ai/ImageLightbox.tsx src/components/viewer-v2/ui/ai/__tests__/ImageLightbox.test.tsx
git commit -m "feat: add ImageLightbox component"
```

---

### Task 7: Create AIPanel wrapper

**Files:**
- Create: `src/components/viewer-v2/ui/ai/AIPanel.tsx`

- [ ] **Step 1: Write AIPanel.tsx**

```typescript
import type { ReactNode, ComponentType } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createTranslator } from '@/lib/i18n'
import { useStarterSettings } from '@/app/StarterSettingsContext'

interface TabConfig {
  value: string
  label: string
}

interface AIPanelProps {
  open: boolean
  onClose: () => void
  title: string
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
  tabs?: TabConfig[]
  activeTab?: string
  onTabChange?: (value: string) => void
  children: ReactNode
}

export function AIPanel({ open, onClose, title, icon: Icon, tabs, activeTab, onTabChange, children }: AIPanelProps) {
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <SheetContent side="right" className="w-[min(40vw,500px)] p-0 flex flex-col" closeLabel={t('common.close')}>
        <SheetHeader className="flex flex-row items-center justify-between space-y-0 px-4 pt-4 pb-0">
          <SheetTitle className="flex items-center gap-2 text-sm font-semibold">
            <Icon className="size-4" aria-hidden />
            {title}
          </SheetTitle>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            {t('common.close')}
          </Button>
        </SheetHeader>
        {tabs ? (
          <Tabs value={activeTab} onValueChange={onTabChange} className="flex flex-col flex-1 min-h-0">
            <TabsList className="grid w-full mx-4 mt-2" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
              {tabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="flex-1 min-h-0 px-4 py-3">
              {children}
            </div>
          </Tabs>
        ) : (
          <ScrollArea className="flex-1 px-4 py-3">
            {children}
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/viewer-v2/ui/ai/AIPanel.tsx
git commit -m "feat: add AIPanel shared Sheet wrapper"
```

---

### Task 8: Create ChatContent

**Files:**
- Create: `src/components/viewer-v2/ui/ai/ChatContent.tsx`
- Create: `src/components/viewer-v2/ui/ai/__tests__/ChatContent.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatContent } from '../ChatContent'
import { StarterSettingsContext } from '@/app/StarterSettingsContext'

const mockChat = vi.fn()
vi.mock('@/services/ai', () => ({ chat: (...args: unknown[]) => mockChat(...args) }))

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <StarterSettingsContext.Provider value={{
      themeMode: 'light', setThemeMode: vi.fn(),
      uiLanguage: 'vi', setUiLanguage: vi.fn(),
      notificationsEnabled: true, setNotificationsEnabled: vi.fn(),
      profileDisplayName: '', setProfileDisplayName: vi.fn(),
      locale: 'vi',
    } as any}>
      {children}
    </StarterSettingsContext.Provider>
  )
}

describe('ChatContent', () => {
  beforeEach(() => {
    mockChat.mockReset()
  })

  it('renders input and send button', () => {
    render(<TestWrapper><ChatContent /></TestWrapper>)
    expect(screen.getByLabelText('Nhập câu hỏi của bạn...')).toBeDefined()
    expect(screen.getByText('Gửi')).toBeDefined()
  })

  it('sends message and shows reply', async () => {
    const user = userEvent.setup()
    mockChat.mockResolvedValue('Xin chào bạn')
    render(<TestWrapper><ChatContent /></TestWrapper>)

    await user.type(screen.getByLabelText('Nhập câu hỏi của bạn...'), 'hello')
    await user.click(screen.getByText('Gửi'))

    await waitFor(() => {
      expect(screen.getByText('hello')).toBeDefined()
      expect(screen.getByText('Xin chào bạn')).toBeDefined()
    })
  })

  it('shows typing indicator while loading', async () => {
    const user = userEvent.setup()
    let resolveChat: (value: string) => void
    mockChat.mockReturnValue(new Promise<string>((resolve) => { resolveChat = resolve }))
    render(<TestWrapper><ChatContent /></TestWrapper>)

    await user.type(screen.getByLabelText('Nhập câu hỏi của bạn...'), 'hello')
    await user.click(screen.getByText('Gửi'))

    expect(screen.getByRole('status', { name: 'AI is thinking' })).toBeDefined()

    resolveChat!('reply')
    await waitFor(() => {
      expect(screen.queryByRole('status', { name: 'AI is thinking' })).toBeNull()
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/components/viewer-v2/ui/ai/__tests__/ChatContent.test.tsx
```
Expected: FAIL (module not found)

- [ ] **Step 3: Write ChatContent.tsx**

```typescript
import { useEffect, useRef, useState } from 'react'
import { useStarterSettings } from '@/app/StarterSettingsContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { createTranslator } from '@/lib/i18n'
import { chat } from '@/services/ai'
import { useChatHistory } from '@/hooks/useChatHistory'
import { TypingIndicator } from './TypingIndicator'

export function ChatContent() {
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)
  const { messages, addMessage } = useChatHistory()
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [hasChatError, setHasChatError] = useState(false)
  const [failedChatPrompt, setFailedChatPrompt] = useState<string | null>(null)
  const isMountedRef = useRef(false)
  const chatEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    isMountedRef.current = true
    return () => { isMountedRef.current = false }
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
      addMessage(text, 'user')
      setChatInput('')
    }
    setIsChatLoading(true)
    setHasChatError(false)
    setFailedChatPrompt(null)

    try {
      const reply = await chat(text)
      if (!isMountedRef.current) return
      addMessage(reply, 'bot')
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

  const chatCanSend = chatInput.trim().length > 0 && !isChatLoading

  return (
    <div className="flex flex-col h-full gap-3">
      <ScrollArea className="flex-1 rounded-md border border-border p-3">
        <div
          role="log"
          aria-label={t('viewer.chatbot.tabChat')}
          aria-live="polite"
          aria-relevant="additions"
          className="space-y-2"
        >
          {messages.map((message) => {
            const isUser = message.sender === 'user'
            return (
              <div
                key={message.id}
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
          <div ref={chatEndRef} />
        </div>
      </ScrollArea>
      {hasChatError ? (
        <div className="space-y-2">
          <p role="alert">{t('viewer.chatbot.error')}</p>
          {failedChatPrompt ? (
            <Button type="button" variant="outline" size="sm" onClick={() => void sendChat(failedChatPrompt)}>
              {t('viewer.chatbot.regenerate')}
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
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/components/viewer-v2/ui/ai/__tests__/ChatContent.test.tsx
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/viewer-v2/ui/ai/ChatContent.tsx src/components/viewer-v2/ui/ai/__tests__/ChatContent.test.tsx
git commit -m "feat: add ChatContent component with chat history persistence"
```

---

### Task 9: Create ImageContent

**Files:**
- Create: `src/components/viewer-v2/ui/ai/ImageContent.tsx`
- Create: `src/components/viewer-v2/ui/ai/__tests__/ImageContent.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ImageContent } from '../ImageContent'
import { StarterSettingsContext } from '@/app/StarterSettingsContext'

const mockGenerateImage = vi.fn()
vi.mock('@/services/ai', () => ({ generateImage: (...args: unknown[]) => mockGenerateImage(...args) }))

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <StarterSettingsContext.Provider value={{
      themeMode: 'light', setThemeMode: vi.fn(),
      uiLanguage: 'vi', setUiLanguage: vi.fn(),
      notificationsEnabled: true, setNotificationsEnabled: vi.fn(),
      profileDisplayName: '', setProfileDisplayName: vi.fn(),
      locale: 'vi',
    } as any}>
      {children}
    </StarterSettingsContext.Provider>
  )
}

describe('ImageContent', () => {
  beforeEach(() => {
    mockGenerateImage.mockReset()
  })

  it('renders prompt input and generate button', () => {
    render(<TestWrapper><ImageContent /></TestWrapper>)
    expect(screen.getByLabelText('Mô tả hình ảnh...')).toBeDefined()
    expect(screen.getByText('Tạo ảnh')).toBeDefined()
  })

  it('shows skeleton while generating', async () => {
    const user = userEvent.setup()
    let resolveGen: (value: string) => void
    mockGenerateImage.mockReturnValue(new Promise<string>((resolve) => { resolveGen = resolve }))
    render(<TestWrapper><ImageContent /></TestWrapper>)

    await user.type(screen.getByLabelText('Mô tả hình ảnh...'), 'a digestive system')
    await user.click(screen.getByText('Tạo ảnh'))

    expect(screen.getByRole('status', { name: 'Generating image' })).toBeDefined()

    resolveGen!('https://example.com/img.png')
    await waitFor(() => {
      expect(screen.queryByRole('status', { name: 'Generating image' })).toBeNull()
    })
  })

  it('shows image and download button on success', async () => {
    const user = userEvent.setup()
    mockGenerateImage.mockResolvedValue('https://example.com/img.png')
    render(<TestWrapper><ImageContent /></TestWrapper>)

    await user.type(screen.getByLabelText('Mô tả hình ảnh...'), 'a digestive system')
    await user.click(screen.getByText('Tạo ảnh'))

    await waitFor(() => {
      expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/img.png')
      expect(screen.getByText('Tải xuống')).toBeDefined()
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/components/viewer-v2/ui/ai/__tests__/ImageContent.test.tsx
```
Expected: FAIL (module not found)

- [ ] **Step 3: Write ImageContent.tsx**

```typescript
import { useEffect, useRef, useState } from 'react'
import { useStarterSettings } from '@/app/StarterSettingsContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createTranslator } from '@/lib/i18n'
import { generateImage } from '@/services/ai'
import { useImageDownload } from '@/hooks/useImageDownload'
import { ImageSkeleton } from './ImageSkeleton'
import { ImageLightbox } from './ImageLightbox'

export function ImageContent() {
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)
  const [imageInput, setImageInput] = useState('')
  const [isImageLoading, setIsImageLoading] = useState(false)
  const [hasImageError, setHasImageError] = useState(false)
  const [failedImagePrompt, setFailedImagePrompt] = useState<string | null>(null)
  const [generatedImage, setGeneratedImage] = useState<{ requestId: number; url: string; prompt: string } | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const isMountedRef = useRef(false)
  const imageRequestIdRef = useRef(0)
  const { download } = useImageDownload()

  useEffect(() => {
    isMountedRef.current = true
    return () => { isMountedRef.current = false }
  }, [])

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
      setFailedImagePrompt(prompt)
      setHasImageError(true)
    } finally {
      if (isMountedRef.current && requestId === imageRequestIdRef.current) {
        setIsImageLoading(false)
      }
    }
  }

  const imageCanGenerate = imageInput.trim().length > 0 && !isImageLoading

  return (
    <div className="flex flex-col gap-3">
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
      <div role="status" aria-live="polite">
        {isImageLoading ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{t('viewer.chatbot.imageLoading')}</p>
            <ImageSkeleton />
          </div>
        ) : null}
        {generatedImage ? (
          <div className="space-y-2">
            <img
              key={generatedImage.requestId}
              className="w-full rounded-md border border-border object-contain cursor-pointer animate-in fade-in duration-500"
              src={generatedImage.url}
              alt={generatedImage.prompt}
              onClick={() => setLightboxOpen(true)}
              onError={() => {
                if (generatedImage.requestId === imageRequestIdRef.current) {
                  setFailedImagePrompt(generatedImage.prompt)
                  setHasImageError(true)
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void download(generatedImage.url, `ai-image-${Date.now()}.png`)}
            >
              {t('viewer.chatbot.download')}
            </Button>
          </div>
        ) : null}
      </div>
      {hasImageError ? (
        <div className="space-y-2">
          <p role="alert">{t('viewer.chatbot.error')}</p>
          {failedImagePrompt ? (
            <Button type="button" variant="outline" size="sm" onClick={() => void generate(failedImagePrompt)}>
              {t('viewer.chatbot.regenerate')}
            </Button>
          ) : null}
        </div>
      ) : null}
      {generatedImage ? (
        <ImageLightbox
          open={lightboxOpen}
          imageUrl={generatedImage.url}
          prompt={generatedImage.prompt}
          onClose={() => setLightboxOpen(false)}
          onDownload={() => void download(generatedImage.url, `ai-image-${Date.now()}.png`)}
        />
      ) : null}
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/components/viewer-v2/ui/ai/__tests__/ImageContent.test.tsx
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/viewer-v2/ui/ai/ImageContent.tsx src/components/viewer-v2/ui/ai/__tests__/ImageContent.test.tsx
git commit -m "feat: add ImageContent component with download and lightbox"
```

---

### Task 10: Create GenAIContent

**Files:**
- Create: `src/components/viewer-v2/ui/ai/GenAIContent.tsx`

- [ ] **Step 1: Write GenAIContent.tsx**

```typescript
import { useCallback, useEffect, useRef, useState } from 'react'
import { useStarterSettings } from '@/app/StarterSettingsContext'
import { Button } from '@/components/ui/button'
import { createTranslator } from '@/lib/i18n'
import { DEFAULT_GENAI_PROMPT, chat } from '@/services/ai'
import { TypingIndicator } from './TypingIndicator'

export function GenAIContent() {
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)
  const [response, setResponse] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const isMountedRef = useRef(false)
  const requestIdRef = useRef(0)
  const hasStartedInitialFetchRef = useRef(false)

  const generate = useCallback(async () => {
    if (isLoading) return

    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId

    if (!isMountedRef.current) return

    setIsLoading(true)
    setHasError(false)

    try {
      const nextResponse = await chat(DEFAULT_GENAI_PROMPT)
      if (!isMountedRef.current || requestId !== requestIdRef.current) return
      setResponse(nextResponse)
    } catch (error) {
      if (!isMountedRef.current || requestId !== requestIdRef.current) return
      console.error(error)
      setResponse(null)
      setHasError(true)
    } finally {
      if (isMountedRef.current && requestId === requestIdRef.current) {
        setIsLoading(false)
      }
    }
  }, [isLoading])

  useEffect(() => {
    isMountedRef.current = true
    if (!hasStartedInitialFetchRef.current) {
      hasStartedInitialFetchRef.current = true
      void generate()
    }
    return () => {
      isMountedRef.current = false
    }
  }, [generate])

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex-1 min-h-0 overflow-auto">
        <div role="status" aria-live="polite">
          {isLoading ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t('viewer.genai.loading')}</p>
              <TypingIndicator />
            </div>
          ) : null}
          {response ? <p className="whitespace-pre-wrap text-sm">{response}</p> : null}
        </div>
        {hasError ? <p role="alert" className="text-sm">{t('viewer.genai.error')}</p> : null}
      </div>
      <Button type="button" variant="outline" size="sm" onClick={generate} disabled={isLoading}>
        {t('viewer.genai.regenerate')}
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/viewer-v2/ui/ai/GenAIContent.tsx
git commit -m "feat: add GenAIContent component"
```

---

### Task 11: Rewrite ChatbotPanel

**Files:**
- Create: `src/components/viewer-v2/ui/ai/ChatbotPanel.tsx`
- Move test: `src/components/viewer-v2/ui/__tests__/ChatbotPanel.test.tsx` → `src/components/viewer-v2/ui/ai/__tests__/ChatbotPanel.test.tsx`

- [ ] **Step 1: Write ChatbotPanel.tsx**

```typescript
import { useState } from 'react'
import { useStarterSettings } from '@/app/StarterSettingsContext'
import { createTranslator } from '@/lib/i18n'
import { ChatsCircle } from '@phosphor-icons/react'
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
```

- [ ] **Step 2: Move and update test file**

Move `src/components/viewer-v2/ui/__tests__/ChatbotPanel.test.tsx` to `src/components/viewer-v2/ui/ai/__tests__/ChatbotPanel.test.tsx` and update imports:

```typescript
import { ChatbotPanel } from '../ChatbotPanel'
```

- [ ] **Step 3: Run tests**

```bash
npx vitest run src/components/viewer-v2/ui/ai/__tests__/ChatbotPanel.test.tsx
```

- [ ] **Step 4: Commit**

```bash
git add src/components/viewer-v2/ui/ai/ChatbotPanel.tsx
git add src/components/viewer-v2/ui/ai/__tests__/ChatbotPanel.test.tsx
git rm src/components/viewer-v2/ui/__tests__/ChatbotPanel.test.tsx
git commit -m "feat: rewrite ChatbotPanel using AIPanel wrapper"
```

---

### Task 12: Rewrite GenAIPanel

**Files:**
- Create: `src/components/viewer-v2/ui/ai/GenAIPanel.tsx`
- Move and update test: `src/components/viewer-v2/ui/__tests__/GenAIPanel.test.tsx` → `src/components/viewer-v2/ui/ai/__tests__/GenAIPanel.test.tsx`

- [ ] **Step 1: Write GenAIPanel.tsx**

```typescript
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
    <AIPanel
      open
      onClose={onClose}
      title={t('viewer.genai.title')}
      icon={Sparkle}
    >
      <GenAIContent />
    </AIPanel>
  )
}
```

- [ ] **Step 2: Move and update test file**

Move `src/components/viewer-v2/ui/__tests__/GenAIPanel.test.tsx` to `src/components/viewer-v2/ui/ai/__tests__/GenAIPanel.test.tsx` and update imports:

```typescript
import { GenAIPanel } from '../GenAIPanel'
```

- [ ] **Step 3: Run tests**

```bash
npx vitest run src/components/viewer-v2/ui/ai/__tests__/GenAIPanel.test.tsx
```

- [ ] **Step 4: Commit**

```bash
git add src/components/viewer-v2/ui/ai/GenAIPanel.tsx
git add src/components/viewer-v2/ui/ai/__tests__/GenAIPanel.test.tsx
git rm src/components/viewer-v2/ui/__tests__/GenAIPanel.test.tsx
git commit -m "feat: rewrite GenAIPanel using AIPanel wrapper"
```

---

### Task 13: Update locale files

**Files:**
- Modify: `src/lib/locales/en.json`
- Modify: `src/lib/locales/vi.json`

- [ ] **Step 1: Add keys to en.json**

Add after `"viewer.chatbot.imageLoading": "Generating image...",`:

```json
"viewer.chatbot.download": "Download",
"viewer.chatbot.imagePromptLabel": "Prompt",
"viewer.chatbot.regenerate": "Regenerate",
"viewer.chatbot.typing": "Thinking..."
```

- [ ] **Step 2: Add keys to vi.json**

Add after `"viewer.chatbot.imageLoading": "Đang tạo ảnh...",`:

```json
"viewer.chatbot.download": "Tải xuống",
"viewer.chatbot.imagePromptLabel": "Mô tả",
"viewer.chatbot.regenerate": "Tạo lại",
"viewer.chatbot.typing": "Đang trả lời..."
```

- [ ] **Step 3: Run locale validation**

```bash
pnpm l10n:validate
```
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/lib/locales/en.json src/lib/locales/vi.json
git commit -m "feat: add AI UI refactor locale keys"
```

---

### Task 14: Wire up new components in ViewerV2Overlay

**Files:**
- Modify: `src/components/viewer-v2/ui/ViewerV2Overlay.tsx`
- Delete: `src/components/viewer-v2/ui/ChatbotPanel.tsx`
- Delete: `src/components/viewer-v2/ui/GenAIPanel.tsx`

- [ ] **Step 1: Update imports in ViewerV2Overlay.tsx**

Change line 28-30:

```typescript
import { ChatbotPanel } from './ai/ChatbotPanel'
import { GenAIPanel } from './ai/GenAIPanel'
```

- [ ] **Step 2: Delete old component files**

```bash
git rm src/components/viewer-v2/ui/ChatbotPanel.tsx
git rm src/components/viewer-v2/ui/GenAIPanel.tsx
```

- [ ] **Step 3: Commit**

```bash
git add src/components/viewer-v2/ui/ViewerV2Overlay.tsx
git rm src/components/viewer-v2/ui/ChatbotPanel.tsx
git rm src/components/viewer-v2/ui/GenAIPanel.tsx
git commit -m "feat: wire new AI panels into overlay, remove old components"
```

---

### Task 15: Full verification

- [ ] **Step 1: TypeScript check**

```bash
npx tsc --noEmit
```
Expected: PASS (no errors)

- [ ] **Step 2: Lint**

```bash
pnpm lint
```
Expected: PASS

- [ ] **Step 3: Run all tests**

```bash
pnpm test
```
Expected: PASS (all tests pass, no regressions)

- [ ] **Step 4: Build**

```bash
pnpm build
```
Expected: PASS (build succeeds)

- [ ] **Step 5: Locale validation**

```bash
pnpm l10n:validate
```
Expected: PASS
