import { afterEach, describe, expect, it } from 'vitest'
import { isLinux, isMac, isWindows, shouldUseCustomWindowChrome } from './platform'

const originalUserAgent = navigator.userAgent

function setUserAgent(userAgent: string) {
  Object.defineProperty(window.navigator, 'userAgent', {
    configurable: true,
    value: userAgent,
  })
}

describe('platform helpers', () => {
  afterEach(() => {
    setUserAgent(originalUserAgent)
    Reflect.deleteProperty(window, '__TAURI__')
    Reflect.deleteProperty(window, '__TAURI_INTERNALS__')
  })

  it('detects Linux user agents but ignores Android', () => {
    setUserAgent('Mozilla/5.0 (X11; Linux x86_64)')
    expect(isLinux()).toBe(true)

    setUserAgent('Mozilla/5.0 (Linux; Android 14)')
    expect(isLinux()).toBe(false)
  })

  it('detects macOS user agents', () => {
    setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')
    expect(isMac()).toBe(true)
  })

  it('detects Windows user agents', () => {
    setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')
    expect(isWindows()).toBe(true)

    setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')
    expect(isWindows()).toBe(false)
  })

  it('keeps custom desktop chrome disabled so native drag and resize stay available', () => {
    setUserAgent('Mozilla/5.0 (X11; Linux x86_64)')
    expect(shouldUseCustomWindowChrome()).toBe(false)

    Object.defineProperty(window, '__TAURI__', { configurable: true, value: {} })
    expect(shouldUseCustomWindowChrome()).toBe(false)

    setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')
    expect(shouldUseCustomWindowChrome()).toBe(false)

    setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')
    expect(shouldUseCustomWindowChrome()).toBe(false)
  })
})
