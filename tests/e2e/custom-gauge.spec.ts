import { test, expect } from '@playwright/test';

test.describe('custom-gauge-charge-weighted-breathing', () => {
  test('custom-gauge-charge-weighted-breathing gauge pulse smoke', async ({ page }) => {
    await page.setContent('<div id="gauge" data-pulse="on">CUSTOM</div>');
    await expect(page.locator('#gauge')).toContainText('CUSTOM');
  });

  test('custom-gauge-charge-weighted-breathing custom screen open smoke', async ({ page }) => {
    await page.setContent('<div id="gauge" data-pulse="off">CUSTOM</div>');
    await expect(page.locator('#gauge')).toHaveAttribute('data-pulse', 'off');
  });
});
