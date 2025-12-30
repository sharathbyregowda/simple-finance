import { test, expect } from '@playwright/test';

// Debug test to see what's actually happening
test('DEBUG: check if page loads', async ({ page }) => {
    await page.goto('/');

    // Take screenshot to see what we got
    await page.screenshot({ path: 'test-results/debug-page-load.png', fullPage: true });

    // Log the URL
    console.log('Current URL:', page.url());

    // Log the page title
    const title = await page.title();
    console.log('Page title:', title);

    // Check if body has any content
    const bodyText = await page.locator('body').textContent();
    console.log('Body content length:', bodyText?.length);
    console.log('First 200 chars:', bodyText?.substring(0, 200));

    // Just verify page loaded
    await expect(page.locator('body')).toBeVisible();
});

// Simplest possible navigation test
test('SIMPLE: homepage loads', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Very basic check
    await expect(page.locator('body')).toBeVisible();

    // Check if we can find ANY text
    await expect(page.locator('body')).toContainText(/.+/);
});
