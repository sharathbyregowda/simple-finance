import { describe, it, expect, vi } from 'vitest';
import { migrateData } from './migrations';
import { ExpenseCategory, type FinancialData } from '../types';
import * as localStorageUtils from './localStorage';

// Mock saveFinancialData to prevent side effects
vi.mock('./localStorage', () => ({
    saveFinancialData: vi.fn(),
}));

describe('migrations', () => {
    it('should migrate v0 data (no version) to latest version', () => {
        const oldData = {
            incomes: [],
            expenses: [],
            customCategories: [
                { id: 'old-1', name: 'Old Cat' } // Missing type
            ],
            currentMonth: '2023-01',
            currency: 'USD'
        } as unknown as FinancialData;

        const result = migrateData(oldData);

        // Check version update
        expect(result.version).toBe(4);

        // Check v1 migration: Added type
        expect(result.customCategories[0].type).toBe(ExpenseCategory.NEEDS);
    });

    it('should migrate v1 to v2 (UK Renames)', () => {
        const v1Data = {
            incomes: [],
            expenses: [],
            customCategories: [
                { id: 'cat-8', name: 'Dining Out', type: ExpenseCategory.WANTS },
                { id: 'cat-13', name: 'Travel', type: ExpenseCategory.WANTS },
                { id: 'cat-16', name: 'Retirement', type: ExpenseCategory.SAVINGS },
            ],
            currentMonth: '2023-01',
            currency: 'USD',
            version: 1
        } as FinancialData;

        const result = migrateData(v1Data);

        expect(result.version).toBe(4);

        // Check renames
        const dining = result.customCategories.find(c => c.id === 'cat-8');
        expect(dining?.name).toBe('Eating Out / Takeaway');
        expect(dining?.icon).toBe('🥡');

        const travel = result.customCategories.find(c => c.id === 'cat-13');
        expect(travel?.name).toBe('Holiday');
    });

    it('should add missing default categories (v4 OOTB Expansion)', () => {
        // v3 data without the new categories
        const v3Data = {
            incomes: [],
            expenses: [],
            customCategories: [
                { id: 'cat-1', name: 'Housing', type: ExpenseCategory.NEEDS }
            ],
            currentMonth: '2023-01',
            currency: 'USD',
            version: 3
        } as FinancialData;

        const result = migrateData(v3Data);
        expect(result.version).toBe(4);

        // Should have added new defaults like sub-house-1
        const newSub = result.customCategories.find(c => c.id === 'sub-house-1');
        expect(newSub).toBeDefined();
        expect(newSub?.name).toBe('Mortgage');
    });

    it('should call saveFinancialData if changes occurred', () => {
        const oldData = {
            version: 1,
            customCategories: [],
            incomes: [],
            expenses: [],
            currentMonth: '2023-01',
            currency: 'USD'
        } as FinancialData;

        migrateData(oldData);
        expect(localStorageUtils.saveFinancialData).toHaveBeenCalled();
    });

    it('should NOT call saveFinancialData if data is already current', () => {
        // Create fully current data
        // We need all defaults to be present to avoid "missing defaults" logic triggering
        // For simplicity, we can mock the DEFAULT_CATEGORIES in the implementation if strict equality is tough,
        // but here we can just pass specific data that satisfies the check or mocked check.

        // Actually simpler: pass version 4 and ensure no missing defaults found.
        // But since we can't easily import DEFAULT_CATEGORIES here without fully replicating it, 
        // let's rely on the fact that if we pass empty customCategories, it WILL add defaults.
        // So we need to pass data that looks like it has everything.
        // Instead of constructing it all, let's just accept that "save" is called if we pass partial data.
        // Let's test the "no change" case by passing the result of a previous migration.

        const initialResult = migrateData({
            incomes: [],
            expenses: [],
            customCategories: [],
            currentMonth: '2023-01',
            currency: 'USD'
        } as unknown as FinancialData); // Will generate full defaults
        const result2 = migrateData(initialResult);

        // Reset mocks before second call
        vi.clearAllMocks();

        migrateData(result2);
        expect(localStorageUtils.saveFinancialData).not.toHaveBeenCalled();
    });
});
