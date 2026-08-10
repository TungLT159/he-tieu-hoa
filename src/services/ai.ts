const BASE_URL = 'https://ai.iit.vn/api'
// Public API integration header required by IIT; not treated as an app secret in this client-only integration.
const PUBLIC_IIT_AI_HEADER_KEY = 'iit@123'

const HEADERS: HeadersInit = {
  headerKey: PUBLIC_IIT_AI_HEADER_KEY,
  'Content-Type': 'application/json',
}

export const DEFAULT_GENAI_PROMPT = 'Giải thích về hệ tiêu hóa ở người'

export interface ChatResponse {
  data: string
}

export interface ImageGenResponse {
  taskId: string
  model: string
  state: string
  imageUrl: string
}

export async function chat(text: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ text }),
  })
  if (!res.ok) {
    throw new Error(`Chat request failed: ${res.status}`)
  }
  const json = (await res.json()) as ChatResponse
  if (!json.data) {
    throw new Error('Invalid chat response: missing data')
  }
  return json.data
}

export async function generateImage(text: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/text-to-image`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ text }),
  })
  if (!res.ok) {
    throw new Error(`Image generation failed: ${res.status}`)
  }
  const json = (await res.json()) as ImageGenResponse
  if (!json.imageUrl) {
    throw new Error('Invalid image response: missing imageUrl')
  }
  return json.imageUrl
}
