import { expect, test } from '@playwright/test'

test('menu launches the viewer side menu and canvas', async ({ page }) => {
  await page.goto('/')
  await page.waitForFunction(() => window.__starterTauriAppFrontendReady === true)

  await expect(page.getByRole('heading', { name: /3D SOFTWARE DIGESTIVE SYSTEM/i })).toBeVisible()
  await page.getByRole('button', { name: /Start/i }).click()

  await expect(page.getByRole('button', { name: 'Collapse' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Rotate Model' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Settings' })).toBeVisible()
  await expect(page.locator('[data-viewer-canvas="true"]')).toBeVisible()
})
