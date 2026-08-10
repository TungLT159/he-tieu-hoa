import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

type TauriWindowConfig = {
  decorations?: boolean
  hiddenTitle?: boolean
  titleBarStyle?: string
}

type TauriConfig = {
  app: {
    security: {
      csp: string
      devCsp: string
    }
    windows: TauriWindowConfig[]
  }
}

function readTauriConfig(): TauriConfig {
  return JSON.parse(readFileSync(`${process.cwd()}/src-tauri/tauri.conf.json`, 'utf8')) as TauriConfig
}

describe('Tauri window chrome configuration', () => {
  it('keeps native resize and drag affordances available', () => {
    const [mainWindow] = readTauriConfig().app.windows

    expect(mainWindow.decorations).not.toBe(false)
    expect(mainWindow.hiddenTitle).toBe(true)
  })

  it('allows IIT AI API and generated image origins in CSP', () => {
    const { csp, devCsp } = readTauriConfig().app.security

    expect(csp).toContain('connect-src')
    expect(csp).toContain('https://ai.iit.vn')
    expect(csp).toContain('img-src')
    expect(csp).toContain('https://file.aiquickdraw.com')
    expect(devCsp).toContain('https://ai.iit.vn')
    expect(devCsp).toContain('https://file.aiquickdraw.com')
  })
})
