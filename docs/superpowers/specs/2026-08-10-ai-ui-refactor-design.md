# AI UI Refactor Design

**Date:** 2026-08-10
**Status:** draft
**Supersedes:** `2026-08-10-ai-features-design.md` (UI layer only; API layer unchanged)

## Overview

Refactor the AI chatbot and GenAI panels from small top-right Card overlays into modern slide-out Sheet panels (ChatGPT/DeepSeek style). Add image download, lightbox viewer, and loading animations.

## Decisions (from design brainstorming)

| # | Decision | Choice |
|---|----------|--------|
| 1 | Panel layout | Wide slide-out from right (~40% width) |
| 2 | Chatbot + GenAI | Separate panels, shared slide-out style (AIPanel wrapper) |
| 3 | Animation | Typing dots (chat) + skeleton shimmer (image) |
| 4 | Image UX | Download button + lightbox for full-size view |
| 5 | Chat history | Persist in-memory until app reload (useRef hook) |
| 6 | Approach | Balanced: shared AIPanel wrapper + extracted content components |

## Architecture

### File Structure

```
src/
├── services/
│   ├── ai.ts                         # (unchanged)
│   └── imageDownload.ts              # NEW: download image from URL to file
├── hooks/
│   ├── useImageDownload.ts           # NEW: download image logic hook
│   └── useChatHistory.ts             # NEW: persist chat across panel open/close
├── components/viewer-v2/ui/
│   └── ai/
│       ├── AIPanel.tsx               # NEW: shared slide-out Sheet wrapper
│       ├── ChatContent.tsx           # NEW: chat tab content (messages + input)
│       ├── ImageContent.tsx          # NEW: image generation tab content
│       ├── GenAIContent.tsx          # NEW: auto-fetch description content
│       ├── ChatbotPanel.tsx          # REWRITE: composes AIPanel + ChatContent + ImageContent
│       ├── GenAIPanel.tsx            # REWRITE: composes AIPanel + GenAIContent
│       ├── ImageLightbox.tsx         # NEW: full-size image dialog viewer
│       ├── TypingIndicator.tsx       # NEW: 3-dot bounce animation
│       ├── ImageSkeleton.tsx         # NEW: shimmer placeholder for image loading
│       └── __tests__/
│           ├── ChatbotPanel.test.tsx  # UPDATED
│           ├── GenAIPanel.test.tsx    # UPDATED
│           ├── ChatContent.test.tsx   # NEW
│           ├── ImageContent.test.tsx  # NEW
│           ├── ImageLightbox.test.tsx # NEW
│           └── TypingIndicator.test.tsx# NEW
```

### Modified Files

| File | Change |
|------|--------|
| `ViewerV2Overlay.tsx` | Update imports to `ai/ChatbotPanel`, `ai/GenAIPanel` |
| `viewerV2Context.ts` | No type changes (ActiveSheet/ActiveDialog already support these) |
| `en.json` + `vi.json` | Add new locale keys for download, prompt label, typing indicator |

### Removed / Replaced

- `src/components/viewer-v2/ui/ChatbotPanel.tsx` → replaced by slim component in `ai/`
- `src/components/viewer-v2/ui/GenAIPanel.tsx` → replaced by slim component in `ai/`
- Old test files updated to point to new component paths

## Components

### AIPanel

Shared slide-out Sheet wrapper. Used by both ChatbotPanel and GenAIPanel.

```
Props:
  open: boolean
  onClose: () => void
  title: string
  icon: React.ComponentType   // e.g., ChatsCircle, Sparkle
  tabs?: { value: string, label: string }[]   // optional tab bar
  activeTab?: string
  onTabChange?: (value: string) => void
  children: React.ReactNode
```

- Uses shadcn `Sheet` component (side=right), `w-[min(40vw,500px)]`
- Header: icon + title + close button
- Optional tab bar (TabsList) below header
- Body: full-height ScrollArea
- Theme: `bg-card/95 backdrop-blur`

### ChatContent

Chat tab content — extracted from current ChatbotPanel chat tab.

- Message list in ScrollArea with user (right, bg-primary) and bot (left, bg-muted, whitespace-pre-wrap) bubbles
- Auto-scroll to bottom via `chatEndRef`
- Shows `<TypingIndicator />` when `isLoading`
- Input bar: `<Input>` + `<Button>` in a `<form>`
- Error state: alert message + retry button
- Uses `useChatHistory()` hook for message storage

### ImageContent

Image generation tab content — extracted from current ChatbotPanel image tab.

- Prompt `<Input>` + Generate `<Button>`
- Shows `<ImageSkeleton />` (shimmer) while loading
- On success: renders `<img>` + Download `<Button>` + click opens `<ImageLightbox>`
- Error state: alert + retry button
- Uses `useImageDownload()` hook for download logic

### GenAIContent

Auto-fetch description content — extracted from current GenAIPanel.

- Auto-fetches `DEFAULT_GENAI_PROMPT` on mount (once, via `hasStartedInitialFetchRef`)
- Shows `<TypingIndicator />` while loading
- Response in scrollable area (`whitespace-pre-wrap`)
- Regenerate button

### ImageLightbox

Full-size image viewer using shadcn `Dialog`.

- `DialogContent` with `max-w-[90vw] max-h-[90vh]`
- Displays `<img>` with object-contain
- Shows prompt text as caption
- Download button inside dialog
- Controlled open/close via parent state

### TypingIndicator

3-dot bounce animation for "AI is thinking" state.

- 3 `<span>` elements with `animate-bounce` and staggered animation-delay (0, 150ms, 300ms)
- Color: `bg-muted-foreground`, size: `size-2 rounded-full`
- Container: flex row with gap-1, p-2

### ImageSkeleton

Shimmer placeholder shown during image generation.

- `<div>` with `animate-pulse` and gradient background
- Size: `w-full aspect-[3/2] rounded-md`
- Gradient: `bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%]`

## Animation System

All animations use Tailwind + `tw-animate-css` (already in project). No new dependencies.

| Animation | Method |
|-----------|--------|
| Panel slide-in | shadcn Sheet: `animate-in slide-in-from-right duration-300` |
| Panel slide-out | shadcn Sheet: `animate-out slide-out-to-right duration-200` |
| Typing dots | 3x `animate-bounce` staggered (0/150/300ms) |
| Image skeleton | `animate-pulse` + shimmer gradient |
| Image fade-in | `animate-in fade-in duration-500` on `<img>` |
| Lightbox open | shadcn Dialog: `animate-in fade-in zoom-in-95` |

## State Management

### useChatHistory Hook

```typescript
interface Message {
  id: number
  text: string
  sender: 'user' | 'bot'
}

function useChatHistory(): {
  messages: Message[]
  addMessage: (text: string, sender: 'user' | 'bot') => void
  clearMessages: () => void
}
```

- Messages stored in `useRef<Message[]>` to survive panel unmount
- Returns `messages` as state snapshot (via `useState` synced from ref)
- Only clears on page reload (not exposed to user as a button)
- No localStorage persistence

### useImageDownload Hook

```typescript
function useImageDownload(): {
  download: (url: string, filename?: string) => Promise<void>
  isDownloading: boolean
  error: string | null
}
```

- Calls `downloadImage()` from `services/imageDownload.ts`
- Manages loading/error state
- Default filename: `ai-image-{timestamp}.png`

### imageDownload.ts

```typescript
export async function downloadImage(url: string, filename: string): Promise<void>
```

- `fetch(url)` → `response.blob()` → `URL.createObjectURL()`
- Creates `<a>` with `download` attribute, clicks it, then `URL.revokeObjectURL()`
- Throws on fetch failure

## Locale Keys

New keys to add (both `en.json` and `vi.json`):

| Key | English | Vietnamese |
|-----|---------|------------|
| `viewer.chatbot.download` | Download | Tải xuống |
| `viewer.chatbot.imagePromptLabel` | Prompt | Mô tả |
| `viewer.chatbot.regenerate` | Regenerate | Tạo lại |
| `viewer.chatbot.typing` | Thinking... | Đang trả lời... |

Existing keys reused (no changes):
- `viewer.chatbot.title`, `viewer.chatbot.placeholder`, `viewer.chatbot.send`
- `viewer.chatbot.tabChat`, `viewer.chatbot.tabImage`
- `viewer.chatbot.imagePlaceholder`, `viewer.chatbot.imagePrompt`
- `viewer.chatbot.imageLoading`, `viewer.chatbot.error`
- `viewer.genai.title`, `viewer.genai.loading`, `viewer.genai.error`
- `viewer.genai.regenerate`, `common.close`

Remove key (no longer used): `viewer.chatbot.placeholderBody`

## ViewerV2Overlay Changes

Minimal changes — only import paths:

```diff
- import { ChatbotPanel } from './ChatbotPanel'
- import { GenAIPanel } from './GenAIPanel'
+ import { ChatbotPanel } from './ai/ChatbotPanel'
+ import { GenAIPanel } from './ai/GenAIPanel'
```

No changes to context, state management, or rendering logic.

## Error Handling

- **Chat API error**: show error text + retry button (same prompt automatically re-sent)
- **Image generation error**: show error text + retry button
- **Image load error** (broken URL from API): same as generation error, trigger retry
- **Download failure**: show brief error in download button area, allow retry
- **Concurrent requests**: disabled send/generate button while request in flight + requestIdRef race guard
- **Unmounted component**: isMountedRef prevents state updates after unmount

## Testing

### Unit Tests (Vitest + React Testing Library)

| Test File | Scope |
|-----------|-------|
| `ChatContent.test.tsx` | Message rendering, send on Enter/click, auto-scroll, typing indicator shown/hidden, error + retry |
| `ImageContent.test.tsx` | Prompt submit, skeleton visibility, image display, download button present, lightbox trigger, error + retry, image onError fallback |
| `ImageLightbox.test.tsx` | Open/close, image renders, download button in dialog |
| `TypingIndicator.test.tsx` | Renders 3 dots, correct animation classes |
| `ChatbotPanel.test.tsx` | Integration: panel open/close, tab switching, component composition |
| `GenAIPanel.test.tsx` | Integration: auto-fetch on mount, response display, regenerate, error |

### Existing tests to migrate

- `ChatbotPanel.test.tsx` → update imports and expected markup for new structure
- `GenAIPanel.test.tsx` → update imports and expected markup for new structure

## No Changes To

- `src/services/ai.ts` — API layer unchanged
- `webviewV2Context.ts` — context types already support `chatbot` and `genai`
- Tauri backend — no native code
- Dependencies — no new packages (uses existing shadcn Sheet, Dialog, etc.)
- `@phosphor-icons/react` — reuse existing icons (ChatsCircle, Sparkle)
