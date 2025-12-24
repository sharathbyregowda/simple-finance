import { test, expect } from '@playwright/test';

test.describe('Simple Finance E2E', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Clear local storage to start fresh (if needed, but app uses local storage)
        // For accurate testing, we might want to clear it or seed it. 
        // For now, let's assume a clean slate or handle existing data robustly.
    });

    test('Dashboard loads and displays correctly', async ({ page }) => {
        await expect(page).toHaveTitle(/Simple Finance/);
        await expect(page.locator('.brand-title')).toHaveText('Simple Finance');
        await expect(page.locator('.brand-subtitle')).toHaveText('Clear money reviews over time');

        // Month selector should exist in header
        await expect(page.locator('.main-header select')).toBeVisible();
        await expect(page.locator('.page-title')).toHaveText('Dashboard');
    });

    test('Can navigate to Reports and view tabs', async ({ page }) => {
        await page.click('a[href="#/reports"]');
        await expect(page.locator('.page-title')).toContainText('Reports');

        // Check tabs
        await expect(page.getByRole('button', { name: 'Budget Goal' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Trends' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Breakdown' })).toBeVisible();

        // Click breakdown
        await page.getByRole('button', { name: 'Breakdown' }).click();
        await expect(page.locator('.category-breakdown-header')).toBeVisible();
    });

    test('Can navigate to Transactions and toggle Income Form', async ({ page }) => {
        await page.click('a[href="#/transactions"]');
        await expect(page.locator('.page-title')).toContainText('Transactions');

        // Find the Add Income button in the Income Form card and click it
        // The mobile header button is hidden on desktop, so this selector should be safe or specify context
        await page.locator('.income-form-card button', { hasText: 'Add Income' }).click();

        await expect(page.locator('form').first()).toBeVisible();
    });

    test('Settings page loads', async ({ page }) => {
        await page.click('a[href="#/settings"]');
        await expect(page.locator('.page-title')).toContainText('Settings');
    });
});
