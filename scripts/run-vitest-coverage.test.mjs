import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const source = await readFile(new URL('./run-vitest-coverage.mjs', import.meta.url), 'utf8')

test('coverage runner uses the Windows pnpm shim when npm_execpath is not a JS entrypoint', () => {
  assert.match(source, /process\.platform === 'win32' \? 'pnpm\.cmd' : 'pnpm'/)
  assert.match(source, /const useShell = process\.platform === 'win32' && command === pnpmCommand/)
  assert.match(source, /spawn\(command, commandArgs, \{/)
  assert.match(source, /shell: useShell/)
  assert.doesNotMatch(source, /shell: process\.platform === 'win32'/)
})

test('coverage runner uses starter-oriented temporary coverage paths', () => {
  assert.match(source, /starter-tauri-app-vitest-coverage-runs/)
  assert.doesNotMatch(source, /tolaria-vitest-coverage-runs/)
})
