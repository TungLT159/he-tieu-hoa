import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useTypewriter } from './useTypewriter'

describe('useTypewriter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns empty text and not typing for null or empty input', () => {
    const { result, rerender } = renderHook(({ text }) => useTypewriter(text), {
      initialProps: { text: null as string | null },
    })

    expect(result.current).toEqual({ displayedText: '', isTyping: false })

    rerender({ text: '' })

    expect(result.current).toEqual({ displayedText: '', isTyping: false })
  })

  it('reveals text one character per timer step and stops when complete', () => {
    const { result } = renderHook(() => useTypewriter('Hey', 10))

    expect(result.current).toEqual({ displayedText: '', isTyping: true })

    act(() => {
      vi.advanceTimersByTime(10)
    })
    expect(result.current).toEqual({ displayedText: 'H', isTyping: true })

    act(() => {
      vi.advanceTimersByTime(20)
    })
    expect(result.current).toEqual({ displayedText: 'Hey', isTyping: false })
  })

  it('restarts typing when text changes and clears the previous timer', () => {
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval')
    const { result, rerender } = renderHook(({ text }) => useTypewriter(text, 10), {
      initialProps: { text: 'First' },
    })

    act(() => {
      vi.advanceTimersByTime(20)
    })
    expect(result.current.displayedText).toBe('Fi')

    rerender({ text: 'New' })

    expect(clearIntervalSpy).toHaveBeenCalled()
    expect(result.current).toEqual({ displayedText: '', isTyping: true })

    act(() => {
      vi.advanceTimersByTime(30)
    })
    expect(result.current).toEqual({ displayedText: 'New', isTyping: false })
  })

  it('restarts typing when the same text becomes non-empty again', () => {
    const { result, rerender } = renderHook(({ text }) => useTypewriter(text, 10), {
      initialProps: { text: 'Same' as string | null },
    })

    act(() => {
      vi.advanceTimersByTime(40)
    })
    expect(result.current).toEqual({ displayedText: 'Same', isTyping: false })

    rerender({ text: null })
    act(() => {
      vi.advanceTimersByTime(0)
    })
    rerender({ text: 'Same' })

    expect(result.current).toEqual({ displayedText: '', isTyping: true })

    act(() => {
      vi.advanceTimersByTime(10)
    })
    expect(result.current).toEqual({ displayedText: 'S', isTyping: true })
  })

  it('clears the timer on unmount', () => {
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval')
    const { unmount } = renderHook(() => useTypewriter('Unmount me', 10))

    unmount()

    expect(clearIntervalSpy).toHaveBeenCalled()
  })
})
