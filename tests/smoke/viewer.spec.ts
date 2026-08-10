import { expect, test } from '@playwright/test'

test('viewer-only app renders the side menu and canvas', async ({ page }) => {
  await page.goto('/')
  await page.waitForFunction(() => window.__starterTauriAppFrontendReady === true)

  await expect(page.getByRole('button', { name: 'Collapse' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Rotate Model' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Settings' })).toBeVisible()
  await expect(page.locator('[data-viewer-canvas="true"]')).toBeVisible()
})
