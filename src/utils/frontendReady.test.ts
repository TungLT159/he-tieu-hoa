import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  FRONTEND_READY_EVENT_NAME,
  STARTUP_RELOAD_ATTEMPT_STORAGE_NAME,
  markFrontendReady,
  reloadFrontendOnceIfStartupFailed,
} from './frontendReady'

describe('frontend readiness recovery', () => {
  beforeEach(() => {
    window.__starterTauriAppFrontendReady = false
    sessionStorage.clear()
  })

  it('uses starter readiness identifiers', () => {
    expect(FRONTEND_READY_EVENT_NAME).toBe('starter-tauri-app:frontend-ready')
    expect(STARTUP_RELOAD_ATTEMPT_STORAGE_NAME).toBe('starter-tauri-app:startup-reload-attempted')
  })

  it('marks the frontend ready and clears a pending startup reload', () => {
    const onReady = vi.fn()
    window.addEventListener(FRONTEND_READY_EVENT_NAME, onReady, { once: true })
    sessionStorage.setItem(STARTUP_RELOAD_ATTEMPT_STORAGE_NAME, '1')

    markFrontendReady()

    expect(window.__starterTauriAppFrontendReady).toBe(true)
    expect(sessionStorage.getItem(STARTUP_RELOAD_ATTEMPT_STORAGE_NAME)).toBeNull()
    expect(onReady).toHaveBeenCalledOnce()
  })

  it('reloads once when React reports a startup error before readiness', () => {
    const reload = vi.fn()

    const firstAttempt = reloadFrontendOnceIfStartupFailed({ reload })
    const secondAttempt = reloadFrontendOnceIfStartupFailed({ reload })

    expect(firstAttempt).toBe(true)
    expect(secondAttempt).toBe(false)
    expect(reload).toHaveBeenCalledOnce()
    expect(sessionStorage.getItem(STARTUP_RELOAD_ATTEMPT_STORAGE_NAME)).toBe('1')
  })

  it('does not reload after the frontend has reported readiness', () => {
    const reload = vi.fn()
    markFrontendReady()

    const didReload = reloadFrontendOnceIfStartupFailed({ reload })

    expect(didReload).toBe(false)
    expect(reload).not.toHaveBeenCalled()
  })
})
