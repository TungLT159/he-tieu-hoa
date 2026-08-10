import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

type TauriWindowConfig = {
  decorations?: boolean
  hiddenTitle?: boolean
  titleBarStyle?: string
}

type TauriConfig = {
  app: {
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
})
