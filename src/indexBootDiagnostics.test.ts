import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

function firstInlineScriptFromIndex(): string {
  const indexHtml = readFileSync(`${process.cwd()}/index.html`, 'utf8')
  const match = indexHtml.match(/<script>\s*([\s\S]*?)\s*<\/script>/)
  if (!match) throw new Error('index.html startup script was not found')
  return match[1]
}

function inlineScriptsFromIndex(): string[] {
  const indexHtml = readFileSync(`${process.cwd()}/index.html`, 'utf8')
  return Array.from(indexHtml.matchAll(/<script>\s*([\s\S]*?)\s*<\/script>/g), (match) => match[1])
}

function token(...parts: string[]): string {
  return parts.join('')
}

describe('index startup script', () => {
  it('uses starter branding and excludes removed workspace bootstrap tokens', () => {
    const indexHtml = readFileSync(`${process.cwd()}/index.html`, 'utf8')

    expect(indexHtml).toContain('<title>Phần mềm 3D Hệ tiêu hóa</title>')
    expect(indexHtml).not.toContain(token('To', 'laria'))
    expect(indexHtml).not.toContain(token('ai', '-workspace'))
    expect(indexHtml).not.toContain(token('ai', '-workspace-native-window'))
    expect(indexHtml).not.toContain(token('to', 'laria-theme'))
    expect(indexHtml).not.toContain(token('la', 'puta-theme'))
  })

  it('applies the pre-React theme from starter settings storage', () => {
    const themeScript = inlineScriptsFromIndex().find((script) => script.includes('starter-tauri-app-settings'))
    if (!themeScript) throw new Error('starter theme bootstrap script was not found')

    localStorage.setItem('starter-tauri-app-settings', JSON.stringify({ themeMode: 'dark' }))

    new Function(themeScript)()

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(document.documentElement).toHaveClass('dark')
  })

  it('does not keep removed workspace global CSS selectors', () => {
    const css = readFileSync(`${process.cwd()}/src/index.css`, 'utf8')

    expect(css).not.toContain(token('ai', '-workspace-native-window'))
    expect(css).not.toContain(token('ai', '-markdown'))
    expect(css).not.toContain(token('ai', '-border-pulse'))
    expect(css).not.toContain('typing-dot')
    expect(css).not.toContain('referenced-by-panel')
  })

  it('does not ship a visible boot diagnostics element by default', () => {
    const indexHtml = readFileSync(`${process.cwd()}/index.html`, 'utf8')

    expect(indexHtml).not.toContain(`${token('To', 'laria')} boot: HTML parsed`)
    expect(indexHtml).not.toContain(`<pre id="${token('to', 'laria')}-boot-diagnostics"`)
  })

  it('does not show the boot overlay for ResizeObserver loop notifications', () => {
    document.body.innerHTML = ''
    new Function(firstInlineScriptFromIndex())()

    const event = new ErrorEvent('error', {
      cancelable: true,
      message: 'ResizeObserver loop completed with undelivered notifications.',
    })
    window.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
    expect(document.body.children).toHaveLength(0)
  })

  it('does not create a visible boot overlay for real startup errors', () => {
    document.body.innerHTML = ''
    new Function(firstInlineScriptFromIndex())()

    window.dispatchEvent(new ErrorEvent('error', {
      message: 'startup failed',
      filename: 'app.js',
      lineno: 1,
      colno: 2,
    }))

    expect(document.body.children).toHaveLength(0)
  })
})
