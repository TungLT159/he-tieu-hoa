# AI Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Chatbot AI and Gen AI placeholders with real AI-powered features backed by the IIT AI API, including text-to-image generation in the chatbot panel.

**Architecture:** A typed API service (`src/services/ai.ts`) wraps `fetch()` calls to the IIT endpoints. Two new panel components (`ChatbotPanel`, `GenAIPanel`) plug into the existing `ViewerV2Overlay` sheet/dialog system, replacing the current `PlaceholderDialog` instances. No new dependencies are added.

**Tech Stack:** React 19, TypeScript, Vitest + Testing Library, shadcn/ui (Tabs, Card, Button, Input, ScrollArea)

**Spec:** `docs/superpowers/specs/2026-08-10-ai-features-design.md`

---

### Task 1: Create the AI API service

**Files:**
- Create: `src/services/ai.ts`

- [ ] **Step 1: Create `src/services/ai.ts`**

```typescript
const BASE_URL = "https://ai.iit.vn/api";

const HEADERS: HeadersInit = {
  "headerKey": "iit@123",
  "Content-Type": "application/json",
};

export const DEFAULT_GENAI_PROMPT = "Giải thích về hệ tiêu hóa ở người";

export interface ChatResponse {
  data: string;
}

export interface ImageGenResponse {
  taskId: string;
  model: string;
  state: string;
  imageUrl: string;
}

export async function chat(text: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    throw new Error(`Chat request failed: ${res.status}`);
  }
  const json = (await res.json()) as ChatResponse;
  if (!json.data) {
    throw new Error("Invalid chat response: missing data");
  }
  return json.data;
}

export async function generateImage(text: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/text-to-image`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    throw new Error(`Image generation failed: ${res.status}`);
  }
  const json = (await res.json()) as ImageGenResponse;
  if (!json.imageUrl) {
    throw new Error("Invalid image response: missing imageUrl");
  }
  return json.imageUrl;
}
```

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit src/services/ai.ts`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/services/ai.ts
git commit -m "feat: add AI API service for chat and image generation"
```

---

### Task 2: Add locale keys

**Files:**
- Modify: `src/lib/locales/en.json`
- Modify: `src/lib/locales/vi.json`

- [ ] **Step 1: Add keys to `src/lib/locales/en.json`**

In `en.json`, after line 91 (`"viewer.genai.placeholder": ...`), insert:

```json
  "viewer.chatbot.send": "Send",
  "viewer.chatbot.tabChat": "Chat",
  "viewer.chatbot.tabImage": "Image",
  "viewer.chatbot.imagePlaceholder": "Describe the image...",
  "viewer.chatbot.imagePrompt": "Generate",
  "viewer.chatbot.error": "An error occurred. Please try again.",
  "viewer.genai.regenerate": "Regenerate",
  "viewer.genai.loading": "Generating description...",
  "viewer.genai.error": "Failed to generate description.",
```

Make sure to keep the closing `}` and add a trailing comma on the line before (after `"viewer.genai.placeholder"` value) to keep JSON valid.

- [ ] **Step 2: Add keys to `src/lib/locales/vi.json`**

Read `vi.json` to find the matching structure, then add the Vietnamese equivalents after `"viewer.genai.placeholder"`:

```json
  "viewer.chatbot.send": "Gửi",
  "viewer.chatbot.tabChat": "Trò chuyện",
  "viewer.chatbot.tabImage": "Tạo ảnh",
  "viewer.chatbot.imagePlaceholder": "Mô tả hình ảnh...",
  "viewer.chatbot.imagePrompt": "Tạo ảnh",
  "viewer.chatbot.error": "Có lỗi xảy ra, vui lòng thử lại.",
  "viewer.genai.regenerate": "Tạo lại",
  "viewer.genai.loading": "Đang tạo mô tả...",
  "viewer.genai.error": "Không thể tạo mô tả.",
```

- [ ] **Step 3: Validate locale files**

Run: `pnpm l10n:validate`
Expected: Pass.

- [ ] **Step 4: Commit**

```bash
git add src/lib/locales/en.json src/lib/locales/vi.json
git commit -m "feat: add AI feature locale keys"
```

---

### Task 3: Create GenAIPanel component

**Files:**
- Create: `src/components/viewer-v2/ui/GenAIPanel.tsx`
- Create: `src/components/viewer-v2/ui/__tests__/GenAIPanel.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/viewer-v2/ui/__tests__/GenAIPanel.test.tsx`:

```typescript
import { StarterSettingsContext } from '@/app/StarterSettingsContext';
import { DEFAULT_STARTER_SETTINGS } from '@/app/settingsStorage';
import { renderStarter } from '@/test/starterRender';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { GenAIPanel } from '../GenAIPanel';

const wrap = (ui: React.ReactElement) =>
  renderStarter(
    <StarterSettingsContext.Provider
      value={{
        appVersion: '0.1.0',
        locale: 'en',
        resolvedThemeMode: 'light',
        settings: DEFAULT_STARTER_SETTINGS,
        updateSettings: vi.fn(),
      }}
    >
      {ui}
    </StarterSettingsContext.Provider>,
  );

describe('GenAIPanel', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the panel with title and close button', () => {
    wrap(<GenAIPanel onClose={vi.fn()} />);

    expect(screen.getByRole('dialog', { name: 'Digestive System Description' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('shows loading text on mount', () => {
    // mock fetch to never resolve so loading stays visible
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise(() => {}));
    wrap(<GenAIPanel onClose={vi.fn()} />);

    expect(screen.getByText('Generating description...')).toBeInTheDocument();
  });

  it('displays the AI response after fetch succeeds', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: 'The digestive system is...' }),
    } as Response);

    wrap(<GenAIPanel onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('The digestive system is...')).toBeInTheDocument();
    });
  });

  it('shows error when fetch fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    wrap(<GenAIPanel onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Failed to generate description.')).toBeInTheDocument();
    });
  });

  it('calls onClose when close button is clicked', () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise(() => {}));
    const onClose = vi.fn();
    wrap(<GenAIPanel onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalled();
  });

  it('regenerates when Regenerate button is clicked', async () => {
    const mockFetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'First response.' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'Second response.' }),
      } as Response);

    wrap(<GenAIPanel onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('First response.')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Regenerate' }));

    await waitFor(() => {
      expect(screen.getByText('Second response.')).toBeInTheDocument();
    });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/viewer-v2/ui/__tests__/GenAIPanel.test.tsx`
Expected: FAIL — "GenAIPanel is not exported" or similar.

- [ ] **Step 3: Write the component**

Create `src/components/viewer-v2/ui/GenAIPanel.tsx`:

```typescript
import { useStarterSettings } from '@/app/StarterSettingsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createTranslator } from '@/lib/i18n';
import { useEffect, useState } from 'react';

import { chat, DEFAULT_GENAI_PROMPT } from '@/services/ai';

interface GenAIPanelProps {
  onClose: () => void;
}

export function GenAIPanel({ onClose }: GenAIPanelProps) {
  const { locale } = useStarterSettings();
  const t = createTranslator(locale);

  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  function fetchDescription() {
    setLoading(true);
    setError(false);
    chat(DEFAULT_GENAI_PROMPT)
      .then((data) => {
        setContent(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('GenAI fetch failed:', err);
        setError(true);
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchDescription();
  }, []);

  return (
    <Card
      role="dialog"
      aria-modal="false"
      aria-labelledby="genai-panel-title"
      className="absolute right-4 top-4 z-20 w-[min(30rem,calc(100vw-2rem))] max-h-[80vh] bg-card/95 shadow-lg backdrop-blur flex flex-col"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 shrink-0">
        <CardTitle id="genai-panel-title" className="text-sm font-semibold">
          {t('viewer.genai.title')}
        </CardTitle>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          {t('common.close')}
        </Button>
      </CardHeader>
      <CardContent className="overflow-y-auto text-sm text-muted-foreground flex-1 min-h-0">
        {loading && <p>{t('viewer.genai.loading')}</p>}
        {error && (
          <div className="space-y-3">
            <p>{t('viewer.genai.error')}</p>
            <Button type="button" variant="outline" size="sm" onClick={fetchDescription}>
              {t('viewer.genai.regenerate')}
            </Button>
          </div>
        )}
        {!loading && !error && content && (
          <div className="space-y-3">
            <p className="whitespace-pre-wrap">{content}</p>
            <Button type="button" variant="outline" size="sm" onClick={fetchDescription}>
              {t('viewer.genai.regenerate')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/viewer-v2/ui/__tests__/GenAIPanel.test.tsx`
Expected: All 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/viewer-v2/ui/GenAIPanel.tsx src/components/viewer-v2/ui/__tests__/GenAIPanel.test.tsx
git commit -m "feat: add GenAI description panel with auto-fetch"
```

---

### Task 4: Create ChatbotPanel component

**Files:**
- Create: `src/components/viewer-v2/ui/ChatbotPanel.tsx`
- Create: `src/components/viewer-v2/ui/__tests__/ChatbotPanel.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/viewer-v2/ui/__tests__/ChatbotPanel.test.tsx`:

```typescript
import { StarterSettingsContext } from '@/app/StarterSettingsContext';
import { DEFAULT_STARTER_SETTINGS } from '@/app/settingsStorage';
import { renderStarter } from '@/test/starterRender';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { ChatbotPanel } from '../ChatbotPanel';

const wrap = (ui: React.ReactElement) =>
  renderStarter(
    <StarterSettingsContext.Provider
      value={{
        appVersion: '0.1.0',
        locale: 'en',
        resolvedThemeMode: 'light',
        settings: DEFAULT_STARTER_SETTINGS,
        updateSettings: vi.fn(),
      }}
    >
      {ui}
    </StarterSettingsContext.Provider>,
  );

describe('ChatbotPanel', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the panel with title and close button', () => {
    wrap(<ChatbotPanel onClose={vi.fn()} />);

    expect(screen.getByRole('dialog', { name: 'AI Chatbot' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('renders Chat and Image tabs', () => {
    wrap(<ChatbotPanel onClose={vi.fn()} />);

    expect(screen.getByRole('tab', { name: 'Chat' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Image' })).toBeInTheDocument();
  });

  it('starts on the Chat tab with input and send button', () => {
    wrap(<ChatbotPanel onClose={vi.fn()} />);

    expect(screen.getByPlaceholderText('Type your question...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
  });

  it('sends a message and displays the reply', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: 'Hello from AI!' }),
    } as Response);

    wrap(<ChatbotPanel onClose={vi.fn()} />);

    const input = screen.getByPlaceholderText('Type your question...');
    fireEvent.change(input, { target: { value: 'Hi' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(screen.getByText('Hello from AI!')).toBeInTheDocument();
    });
  });

  it('shows error when chat fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    wrap(<ChatbotPanel onClose={vi.fn()} />);

    const input = screen.getByPlaceholderText('Type your question...');
    fireEvent.change(input, { target: { value: 'Hi' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(screen.getByText('An error occurred. Please try again.')).toBeInTheDocument();
    });
  });

  it('switches to Image tab and shows image generation UI', () => {
    wrap(<ChatbotPanel onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('tab', { name: 'Image' }));

    expect(screen.getByPlaceholderText('Describe the image...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Generate' })).toBeInTheDocument();
  });

  it('generates an image and displays it', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ imageUrl: 'https://example.com/image.png' }),
    } as Response);

    wrap(<ChatbotPanel onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('tab', { name: 'Image' }));

    const input = screen.getByPlaceholderText('Describe the image...');
    fireEvent.change(input, { target: { value: 'A horse' } });
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));

    await waitFor(() => {
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://example.com/image.png');
    });
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    wrap(<ChatbotPanel onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/viewer-v2/ui/__tests__/ChatbotPanel.test.tsx`
Expected: FAIL — "ChatbotPanel is not exported".

- [ ] **Step 3: Write the ChatbotPanel component**

Create `src/components/viewer-v2/ui/ChatbotPanel.tsx`:

```typescript
import { useStarterSettings } from '@/app/StarterSettingsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createTranslator } from '@/lib/i18n';
import { useRef, useState } from 'react';

import { chat, generateImage } from '@/services/ai';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

interface ChatbotPanelProps {
  onClose: () => void;
}

export function ChatbotPanel({ onClose }: ChatbotPanelProps) {
  const { locale } = useStarterSettings();
  const t = createTranslator(locale);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [imagePrompt, setImagePrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageError, setImageError] = useState(false);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  async function handleSend() {
    const text = inputText.trim();
    if (!text || isSending) return;

    setError(false);
    setInputText('');
    const userMessage: Message = { role: 'user', text };
    setMessages((prev) => [...prev, userMessage]);
    setIsSending(true);

    try {
      const reply = await chat(text);
      setMessages((prev) => [...prev, { role: 'bot', text: reply }]);
      setTimeout(scrollToBottom, 0);
    } catch (err) {
      console.error('Chat error:', err);
      setError(true);
    } finally {
      setIsSending(false);
    }
  }

  async function handleGenerateImage() {
    const prompt = imagePrompt.trim();
    if (!prompt || isGenerating) return;

    setImageError(false);
    setImageUrl(null);
    setIsGenerating(true);

    try {
      const url = await generateImage(prompt);
      setImageUrl(url);
    } catch (err) {
      console.error('Image generation error:', err);
      setImageError(true);
    } finally {
      setIsGenerating(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleImageKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleGenerateImage();
    }
  }

  return (
    <Card
      role="dialog"
      aria-modal="false"
      aria-labelledby="chatbot-panel-title"
      className="absolute right-4 top-4 z-20 w-[min(30rem,calc(100vw-2rem))] max-h-[80vh] bg-card/95 shadow-lg backdrop-blur flex flex-col"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 shrink-0">
        <CardTitle id="chatbot-panel-title" className="text-sm font-semibold">
          {t('viewer.chatbot.title')}
        </CardTitle>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          {t('common.close')}
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 min-h-0 p-0">
        <Tabs defaultValue="chat" className="flex flex-col flex-1 min-h-0">
          <div className="px-4 pt-0 shrink-0">
            <TabsList className="w-full">
              <TabsTrigger value="chat">{t('viewer.chatbot.tabChat')}</TabsTrigger>
              <TabsTrigger value="image">{t('viewer.chatbot.tabImage')}</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="chat" className="flex flex-col flex-1 min-h-0 px-4 pb-4 data-[state=inactive]:hidden">
            <ScrollArea className="flex-1 min-h-0">
              <div className="space-y-3 py-2">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {error && (
                  <p className="text-sm text-destructive text-center">{t('viewer.chatbot.error')}</p>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="flex gap-2 pt-3 shrink-0">
              <Input
                placeholder={t('viewer.chatbot.placeholder')}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSending}
              />
              <Button type="button" size="sm" onClick={handleSend} disabled={isSending || !inputText.trim()}>
                {t('viewer.chatbot.send')}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="image" className="flex flex-col flex-1 min-h-0 px-4 pb-4 data-[state=inactive]:hidden">
            <div className="flex gap-2 pt-2 shrink-0">
              <Input
                placeholder={t('viewer.chatbot.imagePlaceholder')}
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                onKeyDown={handleImageKeyDown}
                disabled={isGenerating}
              />
              <Button type="button" size="sm" onClick={handleGenerateImage} disabled={isGenerating || !imagePrompt.trim()}>
                {t('viewer.chatbot.imagePrompt')}
              </Button>
            </div>

            <div className="flex-1 min-h-0 mt-3 flex items-center justify-center">
              {isGenerating && (
                <p className="text-sm text-muted-foreground">{t('viewer.genai.loading')}</p>
              )}
              {imageError && (
                <p className="text-sm text-destructive">{t('viewer.chatbot.error')}</p>
              )}
              {!isGenerating && !imageError && imageUrl && (
                <img
                  src={imageUrl}
                  alt={imagePrompt}
                  className="max-w-full max-h-full object-contain rounded-md"
                />
              )}
              {!isGenerating && !imageError && !imageUrl && (
                <p className="text-sm text-muted-foreground">
                  {t('viewer.chatbot.imagePlaceholder')}
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/viewer-v2/ui/__tests__/ChatbotPanel.test.tsx`
Expected: All 8 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/viewer-v2/ui/ChatbotPanel.tsx src/components/viewer-v2/ui/__tests__/ChatbotPanel.test.tsx
git commit -m "feat: add ChatbotPanel with chat and image generation tabs"
```

---

### Task 5: Integrate into ViewerV2Overlay

**Files:**
- Modify: `src/components/viewer-v2/ui/ViewerV2Overlay.tsx`

- [ ] **Step 1: Update imports and replace placeholders**

In `ViewerV2Overlay.tsx`, replace the `PlaceholderDialog` import line (line 31) with:

```typescript
import { ChatbotPanel } from './ChatbotPanel'
import { GenAIPanel } from './GenAIPanel'
```

Remove the `PlaceholderDialog` import entirely (it's no longer needed for chatbot/genai, but check if it's still used for quiz — if PlaceholderDialog is still used for quiz, keep that import).

Then replace the chatbot placeholder block (lines 278-284):

```typescript
      {activeSheet === 'chatbot' ? <ChatbotPanel onClose={() => setActiveSheet(null)} /> : null}
```

And replace the genai placeholder block (lines 293-299):

```typescript
      {activeDialog === 'genai' ? <GenAIPanel onClose={() => setActiveDialog(null)} /> : null}
```

Check: `PlaceholderDialog` is still imported for `quiz` — verify the import is only removed if no longer needed. Since `quiz` still uses `PlaceholderDialog` on line 286-292, keep the `PlaceholderDialog` import.

Updated imports should look like:

```typescript
import { ChatbotPanel } from './ChatbotPanel'
import { GenAIPanel } from './GenAIPanel'
import { InfoPanel } from './InfoPanel'
import { OrganInfoCard } from './OrganInfoCard'
import { PlaceholderDialog } from './PlaceholderDialog'
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Run existing overlay tests**

Run: `npx vitest run src/components/viewer-v2/`
Expected: All existing tests PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/viewer-v2/ui/ViewerV2Overlay.tsx
git commit -m "feat: wire ChatbotPanel and GenAIPanel into viewer overlay"
```

---

### Task 6: Final verification

**Files:** None new — all files already exist.

- [ ] **Step 1: Run lint**

Run: `pnpm lint`
Expected: Pass.

- [ ] **Step 2: Run typecheck**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Run all tests**

Run: `pnpm test`
Expected: All tests pass.

- [ ] **Step 4: Run build**

Run: `pnpm build`
Expected: Build succeeds.
