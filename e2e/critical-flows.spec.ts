import { test, expect } from '@playwright/test';

/**
 * CRITICAL E2E TESTS - Production Ready
 * Simplified approach with proper onboarding bypass
 */

// Test fixture to handle onboarding
test.beforeEach(async ({ page, context }) => {
    // Clear all data to start fresh
    await context.clearCookies();
    await page.goto('/simple-finance/');
    await page.evaluate(() => localStorage.clear());

    // Set localStorage to skip onboarding
    await page.evaluate(() => {
        const data = {
            incomes: [],
            expenses: [],
            customCategories: [],
            currentMonth: new Date().toISOString().substring(0, 7),
            currency: 'USD',
            isOnboarded: true,
            version: 4
        };
        localStorage.setItem('simpleFinanceData', JSON.stringify(data));
    });

    // Reload to apply localStorage changes
    await page.reload();
    await page.waitForLoadState('networkidle');
});

/**
 * Test 1: Navigation - Verify all main pages load correctly
 */
test('should navigate to all main pages', async ({ page }) => {
    const routes = [
        { hash: '#/', title: 'Dashboard' },
        { hash: '#/reports', title: 'Reports' },
        { hash: '#/transactions', title: 'Transactions' },
        { hash: '#/calculators', title: 'Calculators' },
        { hash: '#/settings', title: 'Settings' },
        { hash: '#/about', title: 'About' },
    ];

    for (const route of routes) {
        await page.goto(`/simple-finance/${route.hash}`);
        await page.waitForTimeout(300);

        // Verify page title contains expected text
        const pageTitle = page.locator('.page-title');
        await expect(pageTitle).toContainText(route.title, { timeout: 5000 });
    }
});

/**
 * Test 2: Add Income - Core data entry workflow
 */
test('should add income successfully', async ({ page }) => {
    await page.goto('/simple-finance/#/transactions');
    await page.waitForTimeout(500);

    // Click Add Income button
    const addIncomeBtn = page.locator('button').filter({ hasText: 'Add Income' }).first();
    await addIncomeBtn.click();
    await page.waitForTimeout(300);

    // Fill form
    await page.locator('input[placeholder="Enter amount"]').fill('5000');
    await page.locator('select').first().selectOption({ index: 1 });
    await page.locator('input[type="date"]').first().fill('2024-01-15');

    // Submit
    await page.locator('button').filter({ hasText: 'Add Income' }).nth(1).click();
    await page.waitForTimeout(500);

    // Verify
    await expect(page.locator('body')).toContainText('$5,000', { timeout: 3000 });
});

/**
 * Test 3: Add Expense - Core expense entry workflow  
 */
test('should add expense via ledger', async ({ page }) => {
    await page.goto('/simple-finance/#/transactions');
    await page.waitForTimeout(500);

    // Fill first row of expense ledger
    await page.locator('input[type="date"]').last().fill('2024-01-15');
    await page.locator('select').last().selectOption({ index: 1 });
    await page.locator('input[placeholder="Description..."]').fill('Test Expense');
    await page.locator('input[placeholder="0.00"]').last().fill('150');

    // Click add entry button (enter key icon)
    await page.locator('button[title*="Add Entry"]').click();
    await page.waitForTimeout(500);

    // Verify
    await expect(page.locator('body')).toContainText('Test Expense', { timeout: 3000 });
});

/**
 * Test 4: Data Persistence - Verify localStorage works
 */
test('should persist data across page reload', async ({ page }) => {
    await page.goto('/simple-finance/#/transactions');
    await page.waitForTimeout(500);

    // Add income
    await page.locator('button').filter({ hasText: 'Add Income' }).first().click();
    await page.waitForTimeout(300);

    await page.locator('input[placeholder="Enter amount"]').fill('3500');
    await page.locator('select').first().selectOption({ index: 1 });
    await page.locator('input[type="date"]').first().fill('2024-01-15');
    await page.locator('button').filter({ hasText: 'Add Income' }).nth(1).click();
    await page.waitForTimeout(500);

    // Verify
    await expect(page.locator('body')).toContainText('$3,500');

    // Reload
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Still there
    await expect(page.locator('body')).toContainText('$3,500', { timeout: 3000 });
});

/**
 * Test 5: Dashboard Update - Verify data flows to dashboard
 */
test('should show income on dashboard after adding', async ({ page }) => {
    await page.goto('/simple-finance/#/transactions');
    await page.waitForTimeout(500);

    // Add income
    await page.locator('button').filter({ hasText: 'Add Income' }).first().click();
    await page.waitForTimeout(300);

    await page.locator('input[placeholder="Enter amount"]').fill('4200');
    await page.locator('select').first().selectOption({ index: 1 });
    await page.locator('input[type="date"]').first().fill('2024-01-15');
    await page.locator('button').filter({ hasText: 'Add Income' }).nth(1).click();
    await page.waitForTimeout(500);

    // Go to dashboard
    await page.goto('/simple-finance/#/');
    await page.waitForTimeout(500);

    // Verify
    await expect(page.locator('body')).toContainText('$4,200', { timeout: 3000 });
});

/**
 * Test 6: Brand Elements - Verify core UI elements
 */
test('should display brand elements correctly', async ({ page }) => {
    await page.goto('/simple-finance/#/');
    await page.waitForTimeout(300);

    // Verify brand elements
    await expect(page.locator('.brand-title')).toHaveText('Simple Finance');
    await expect(page.locator('.brand-subtitle')).toHaveText('Clear money reviews over time');

    // Verify navigation exists
    await expect(page.locator('a[href="#/"]')).toBeVisible();
    await expect(page.locator('a[href="#/transactions"]')).toBeVisible();
    await expect(page.locator('a[href="#/settings"]')).toBeVisible();
});
