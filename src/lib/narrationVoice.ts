export type NarrationVoice = 'bac' | 'trung' | 'nam'

export const DEFAULT_NARRATION_VOICE: NarrationVoice = 'bac'

export function normalizeNarrationVoice(value: unknown): NarrationVoice | null {
  return value === 'bac' || value === 'trung' || value === 'nam' ? value : null
}
