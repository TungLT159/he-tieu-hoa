# AI Features Design

**Date:** 2026-08-10
**Status:** draft

## Overview

Replace the placeholder Chatbot AI (sheet) and Gen AI Description (dialog) with real implementations backed by the IIT AI API. The AI image generation feature is integrated as a tab inside the Chatbot panel.

## API Endpoints

| Feature | Method | URL | Header | Body | Key Response Field |
|---------|--------|-----|--------|------|-------------------|
| Chat / GenAI | POST | `https://ai.iit.vn/api/chat` | `headerKey: iit@123` | `{ "text": "..." }` | `data` (string reply) |
| Text-to-Image | POST | `https://ai.iit.vn/api/text-to-image` | `headerKey: iit@123` | `{ "text": "..." }` | `imageUrl` (URL of generated image) |

## Feature Behavior

### 1. Chatbot AI (sheet, Tools group)

- Multi-turn conversation: user types messages, receives AI replies, history preserved while panel is open
- Panel has two tabs: **Chat** (conversation) and **Image** (AI image generation)
- Chat tab shows message list (scrollable) with user/bot bubbles and an input bar
- Chat history resets when panel is closed

### 2. Gen AI Description (dialog, Learning group)

- One-click: when dialog opens, automatically sends the default prompt `"Giải thích về hệ tiêu hóa ở người"` to the chat endpoint
- Shows loading state, then the AI-generated description
- "Regenerate" button to re-fetch

### 3. AI Image Generation (tab inside Chatbot panel, Tools group)

- User enters a text description and clicks "Generate"
- Calls the text-to-image endpoint
- Shows loading state, then displays the resulting image
- Error handling for failed generation or image load

## Architecture

### New files

```
src/
├── services/
│   └── ai.ts                       # API client with typed functions
├── components/viewer-v2/ui/
│   ├── ChatbotPanel.tsx            # Sheet panel: Chat tab + Image tab
│   ├── GenAIPanel.tsx              # Dialog: auto-generate digestive system description
│   └── __tests__/
│       ├── ChatbotPanel.test.tsx
│       └── GenAIPanel.test.tsx
```

### Modified files

| File | Change |
|------|--------|
| `ViewerV2Overlay.tsx` | Replace `<PlaceholderDialog>` for chatbot and genai with real components |
| `en.json` | Add locale keys for chat/image tabs, loading, error states |
| `vi.json` | Add Vietnamese equivalents |

### No changes to

- `viewerV2Context.ts` — `ActiveSheet` already has `'chatbot'`, `ActiveDialog` already has `'genai'`
- Tauri backend — no native code needed
- Dependencies — no new packages

## API Service (`src/services/ai.ts`)

```typescript
const BASE_URL = "https://ai.iit.vn/api";
const HEADERS = {
  "headerKey": "iit@123",
  "Content-Type": "application/json",
};

// Returns the AI's reply text
async function chat(text: string): Promise<string>
  → POST /api/chat, body { text }

// Returns the URL of the generated image
async function generateImage(text: string): Promise<string>
  → POST /api/text-to-image, body { text }
```

- Uses native `fetch()`, no new dependencies
- Throws on non-ok responses or missing expected fields
- The GenAI default prompt constants live here

## Components

### ChatbotPanel

```
┌─────────────────────────────────────┐
│  [Tab: Chat]  [Tab: Image]          │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐  │
│  │ User: hello                   │  │  ← Scrollable message list
│  │ Bot: Xin chào bạn...          │  │
│  │ User: what is digestion?      │  │
│  │ Bot: Hệ tiêu hóa là...        │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Type your question...  [Send] │  │  ← Input bar
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

- **Chat tab**: message list (user right-aligned, bot left-aligned), input with send button, auto-scroll to bottom
- **Image tab**: text input for image description, generate button, result display area (loading spinner → image or error)
- **State**: `messages[]`, `inputText`, `isSending`, `imagePrompt`, `imageUrl`, `isGenerating`, `error`
- Uses existing `Card`, `Button`, `Input`, `Tabs` shadcn/ui components
- Uses `ChatsCircle` icon (already imported)
- Rendered when `activeSheet === 'chatbot'`, receives `onClose` prop

### GenAIPanel

```
┌─────────────────────────────────────┐
│  Digestive System Description  [X]  │
├─────────────────────────────────────┤
│                                     │
│  [Generating description...]        │  ← Loading state
│  or                                 │
│  Scrollable AI description text     │  ← Result
│                                     │
│  [Regenerate]                       │
└─────────────────────────────────────┘
```

- Auto-fetches on mount with default prompt
- Shows loading spinner while fetching
- Displays the description as plain text (no markdown rendering needed)
- "Regenerate" button calls the API again
- Uses existing `Card`, `Button` components
- Rendered when `activeDialog === 'genai'`, receives `onClose` prop

## Locale keys

Added to both `en.json` and `vi.json`:

| Key | English | Vietnamese |
|-----|---------|------------|
| `viewer.chatbot.send` | Send | Gửi |
| `viewer.chatbot.tabChat` | Chat | Trò chuyện |
| `viewer.chatbot.tabImage` | Image | Tạo ảnh |
| `viewer.chatbot.imagePlaceholder` | Describe the image... | Mô tả hình ảnh... |
| `viewer.chatbot.imagePrompt` | Generate | Tạo ảnh |
| `viewer.chatbot.error` | An error occurred. Please try again. | Có lỗi xảy ra, vui lòng thử lại. |
| `viewer.genai.regenerate` | Regenerate | Tạo lại |
| `viewer.genai.loading` | Generating description... | Đang tạo mô tả... |
| `viewer.genai.error` | Failed to generate description. | Không thể tạo mô tả. |

## Error Handling

- **Network failure / timeout**: show error message with retry button
- **Invalid API response**: show generic error, log the actual error to console
- **Image load failure**: show error message, allow re-generation
- **Concurrent requests**: disable send/generate button while request is in flight

## Testing

- **ChatbotPanel.test.tsx**: render panel, switch tabs, type and send message, mock fetch success/error, verify message list updates
- **GenAIPanel.test.tsx**: auto-fetch on mount, show loading then result, regenerate button, error state
