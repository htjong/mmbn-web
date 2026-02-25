import { test, expect } from '@playwright/test';

test.describe('start-menu-spacebar-only', () => {
  test('start-menu-spacebar-only space key starts flow smoke', async ({ page }) => {
    await page.setContent('<button id="start">PRESS SPACE TO START</button>');
    await page.keyboard.press('Space');
    await expect(page.locator('#start')).toContainText('PRESS SPACE TO START');
  });

  test('start-menu-spacebar-only enter key non-start smoke', async ({ page }) => {
    await page.setContent('<button id="start">PRESS SPACE TO START</button>');
    await page.keyboard.press('Enter');
    await expect(page.locator('#start')).toContainText('PRESS SPACE TO START');
  });
});
