import { useCallback, useSyncExternalStore } from 'react'

export type MessageSender = 'user' | 'bot'

export interface Message {
  id: number
  text: string
  sender: MessageSender
}

let messages: Message[] = []
let nextId = 0
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return messages
}

function emitChange() {
  listeners.forEach((listener) => {
    listener()
  })
}

export function useChatHistory() {
  const currentMessages = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  const addMessage = useCallback((text: string, sender: MessageSender) => {
    nextId += 1
    messages = [...messages, { id: nextId, text, sender }]
    emitChange()
  }, [])

  const clearMessages = useCallback(() => {
    messages = []
    nextId = 0
    emitChange()
  }, [])

  return { messages: currentMessages, addMessage, clearMessages }
}
