import { useEffect, useState } from 'react'

const DEFAULT_TYPEWRITER_SPEED = 30

export function useTypewriter(text: string | null, speed = DEFAULT_TYPEWRITER_SPEED) {
  const [typedState, setTypedState] = useState({ sourceText: null as string | null, characterCount: 0 })
  const isCurrentText = typedState.sourceText === text
  const displayedText = text && isCurrentText ? text.slice(0, typedState.characterCount) : ''
  const isTyping = text !== null && text.length > 0 && (!isCurrentText || typedState.characterCount < text.length)

  useEffect(() => {
    if (!text) {
      const timeoutId = window.setTimeout(() => {
        setTypedState({ sourceText: null, characterCount: 0 })
      }, 0)

      return () => {
        window.clearTimeout(timeoutId)
      }
    }

    let characterCount = 0

    const intervalId = window.setInterval(() => {
      characterCount += 1
      setTypedState({ sourceText: text, characterCount })

      if (characterCount >= text.length) {
        window.clearInterval(intervalId)
      }
    }, speed)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [speed, text])

  return { displayedText, isTyping }
}
