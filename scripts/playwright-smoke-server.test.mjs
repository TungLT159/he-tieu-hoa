import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const source = await readFile(new URL('./playwright-smoke-server.mjs', import.meta.url), 'utf8')

test('smoke server uses the Windows pnpm shim when running on Windows', () => {
  assert.match(source, /process\.platform === 'win32' \? 'pnpm\.cmd' : 'pnpm'/)
  assert.match(source, /spawn\(\s*pnpmCommand,/)
  assert.match(source, /shell: process\.platform === 'win32'/)
})

test('smoke server uses starter-oriented Vite cache environment names', () => {
  assert.match(source, /process\.env\.STARTER_VITE_CACHE_DIR/)
  assert.match(source, /starter-vite-smoke-/)
  assert.doesNotMatch(source, /TOLARIA_VITE_CACHE_DIR/)
  assert.doesNotMatch(source, /tolaria-vite-smoke-/)
})
