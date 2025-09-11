import { test, expect } from '@playwright/test';
test('biomarkers + semantic search flow', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Comp LifeSci SaaS');
  await page.fill('input', 'EGFR turnaround time');
  await page.click('button:has-text("Search")');
  await expect(page.locator('pre')).toBeVisible({ timeout: 15000 });
});
