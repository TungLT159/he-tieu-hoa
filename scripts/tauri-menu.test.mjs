import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const source = await readFile(new URL('../src-tauri/src/lib.rs', import.meta.url), 'utf8')

test('tauri startup removes the default native app and window menus', () => {
  assert.match(source, /\.setup\(\|app\| \{[\s\S]*remove_native_menus\(app\.handle\(\)\)\?/)
  assert.match(source, /fn remove_app_menu\(&self\)[\s\S]*self\.remove_menu\(\)/)
  assert.match(source, /fn remove_window_menus\(&self\)[\s\S]*window\.remove_menu\(\)\?/)
})
