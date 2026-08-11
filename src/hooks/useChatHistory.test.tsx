import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { useChatHistory } from './useChatHistory'

describe('useChatHistory', () => {
  beforeEach(() => {
    const { result, unmount } = renderHook(() => useChatHistory())
    act(() => {
      result.current.clearMessages()
    })
    unmount()
  })

  it('adds messages with increasing IDs in insertion order', () => {
    const { result } = renderHook(() => useChatHistory())

    act(() => {
      result.current.addMessage('Hello', 'user')
      result.current.addMessage('Hi there', 'bot')
    })

    expect(result.current.messages).toEqual([
      { id: 1, text: 'Hello', sender: 'user' },
      { id: 2, text: 'Hi there', sender: 'bot' },
    ])
  })

  it('keeps messages after the hook unmounts and remounts', () => {
    const firstRender = renderHook(() => useChatHistory())

    act(() => {
      firstRender.result.current.addMessage('Persist me', 'user')
    })

    firstRender.unmount()

    const secondRender = renderHook(() => useChatHistory())

    expect(secondRender.result.current.messages).toEqual([
      { id: 1, text: 'Persist me', sender: 'user' },
    ])
  })

  it('keeps simultaneous hook consumers in sync', () => {
    const firstRender = renderHook(() => useChatHistory())
    const secondRender = renderHook(() => useChatHistory())

    act(() => {
      firstRender.result.current.addMessage('Shared message', 'user')
    })

    expect(firstRender.result.current.messages).toEqual([
      { id: 1, text: 'Shared message', sender: 'user' },
    ])
    expect(secondRender.result.current.messages).toEqual([
      { id: 1, text: 'Shared message', sender: 'user' },
    ])

    act(() => {
      secondRender.result.current.clearMessages()
    })

    expect(firstRender.result.current.messages).toEqual([])
    expect(secondRender.result.current.messages).toEqual([])
  })

  it('clears messages and resets the next message ID', () => {
    const { result } = renderHook(() => useChatHistory())

    act(() => {
      result.current.addMessage('Old message', 'user')
      result.current.clearMessages()
    })

    expect(result.current.messages).toEqual([])

    act(() => {
      result.current.addMessage('New message', 'bot')
    })

    expect(result.current.messages).toEqual([
      { id: 1, text: 'New message', sender: 'bot' },
    ])
  })
})
