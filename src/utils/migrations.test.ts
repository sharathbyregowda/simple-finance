import { describe, it, expect, vi, beforeEach } from 'vitest';
import { migrateData, CURRENT_DATA_VERSION } from './migrations';
import { ExpenseCategory, type FinancialData, type Income, type Expense } from '../types';
import * as localStorageUtils from './localStorage';

// Mock saveFinancialData to prevent side effects
vi.mock('./localStorage', () => ({
    saveFinancialData: vi.fn(),
}));

describe('migrations', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Version 0 → Latest (No version field)', () => {
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
            expect(result.version).toBe(CURRENT_DATA_VERSION);

            // Check v1 migration: Added type
            expect(result.customCategories[0].type).toBe(ExpenseCategory.NEEDS);
        });

        it('should preserve user data during v0 → latest migration', () => {
            const income: Income = {
                id: 'inc-1',
                source: 'Salary',
                amount: 5000,
                month: '2023-01',
                date: '2023-01-15'
            };

            const expense: Expense = {
                id: 'exp-1',
                description: 'Rent',
                amount: 1500,
                categoryId: 'cat-1',
                categoryType: ExpenseCategory.NEEDS,
                month: '2023-01',
                date: '2023-01-15'
            };

            const oldData = {
                incomes: [income],
                expenses: [expense],
                customCategories: [],
                currentMonth: '2023-01',
                currency: 'USD'
            } as unknown as FinancialData;

            const result = migrateData(oldData);

            // Data integrity check
            expect(result.incomes).toHaveLength(1);
            expect(result.incomes[0]).toEqual(income);
            expect(result.expenses).toHaveLength(1);
            expect(result.expenses[0]).toEqual(expense);
            expect(result.currency).toBe('USD');
            expect(result.currentMonth).toBe('2023-01');
        });
    });

    describe('Version 1 → 2 (UK Renames)', () => {
        it('should migrate v1 to v2 with UK category renames', () => {
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

            expect(result.version).toBe(CURRENT_DATA_VERSION);

            // Check renames
            const dining = result.customCategories.find(c => c.id === 'cat-8');
            expect(dining?.name).toBe('Eating Out / Takeaway');
            expect(dining?.icon).toBe('🥡');

            const travel = result.customCategories.find(c => c.id === 'cat-13');
            expect(travel?.name).toBe('Holiday');
        });

        it('should not rename categories that don\'t match', () => {
            const v1Data = {
                incomes: [],
                expenses: [],
                customCategories: [
                    { id: 'cat-999', name: 'Custom Category', type: ExpenseCategory.WANTS },
                ],
                currentMonth: '2023-01',
                currency: 'USD',
                version: 1
            } as FinancialData;

            const result = migrateData(v1Data);

            const custom = result.customCategories.find(c => c.id === 'cat-999');
            expect(custom?.name).toBe('Custom Category'); // Unchanged
        });
    });

    describe('Version 2 → 3 Path', () => {
        it('should migrate v2 to latest version', () => {
            const v2Data = {
                incomes: [],
                expenses: [],
                customCategories: [],
                currentMonth: '2023-01',
                currency: 'USD',
                version: 2
            } as FinancialData;

            const result = migrateData(v2Data);

            expect(result.version).toBe(CURRENT_DATA_VERSION);
            expect(result.customCategories.length).toBeGreaterThan(0); // Should have defaults added
        });
    });

    describe('Version 3 → 4 (OOTB Expansion)', () => {
        it('should add missing default categories', () => {
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

        it('should not duplicate existing categories', () => {
            const v3Data = {
                incomes: [],
                expenses: [],
                customCategories: [
                    { id: 'cat-1', name: 'Housing', type: ExpenseCategory.NEEDS },
                    { id: 'sub-house-1', name: 'Mortgage', type: ExpenseCategory.NEEDS, parentId: 'cat-1', isSubcategory: true }
                ],
                currentMonth: '2023-01',
                currency: 'USD',
                version: 3
            } as FinancialData;

            const result = migrateData(v3Data);

            const mortgageCats = result.customCategories.filter(c => c.id === 'sub-house-1');
            expect(mortgageCats).toHaveLength(1); // No duplicates
        });
    });

    describe('All Version Paths', () => {
        it('should successfully migrate from v1 directly to current', () => {
            const v1Data = {
                incomes: [],
                expenses: [],
                customCategories: [],
                currentMonth: '2023-01',
                currency: 'USD',
                version: 1
            } as FinancialData;

            const result = migrateData(v1Data);
            expect(result.version).toBe(CURRENT_DATA_VERSION);
        });

        it('should successfully migrate from v2 directly to current', () => {
            const v2Data = {
                incomes: [],
                expenses: [],
                customCategories: [],
                currentMonth: '2023-01',
                currency: 'USD',
                version: 2
            } as FinancialData;

            const result = migrateData(v2Data);
            expect(result.version).toBe(CURRENT_DATA_VERSION);
        });

        it('should successfully migrate from v3 directly to current', () => {
            const v3Data = {
                incomes: [],
                expenses: [],
                customCategories: [],
                currentMonth: '2023-01',
                currency: 'USD',
                version: 3
            } as FinancialData;

            const result = migrateData(v3Data);
            expect(result.version).toBe(CURRENT_DATA_VERSION);
        });
    });

    describe('Backwards Compatibility', () => {
        it('should handle data with missing optional fields', () => {
            const minimalData = {
                incomes: [],
                expenses: [],
                customCategories: [],
                currentMonth: '2023-01',
                currency: 'USD'
                // Missing: version, isOnboarded
            } as unknown as FinancialData;

            expect(() => migrateData(minimalData)).not.toThrow();
            const result = migrateData(minimalData);
            expect(result.version).toBe(CURRENT_DATA_VERSION);
        });

        it('should preserve all standard fields', () => {
            const fullData = {
                incomes: [{
                    id: 'inc-1',
                    source: 'Job',
                    amount: 5000,
                    month: '2023-01'
                }],
                expenses: [{
                    id: 'exp-1',
                    description: 'Rent',
                    amount: 1500,
                    categoryId: 'cat-1',
                    categoryType: ExpenseCategory.NEEDS,
                    month: '2023-01',
                    date: '2023-01-15'
                }],
                customCategories: [{
                    id: 'cat-1',
                    name: 'Housing',
                    type: ExpenseCategory.NEEDS,
                    icon: '🏠'
                }],
                currentMonth: '2023-06',
                currency: 'GBP',
                version: 1,
                isOnboarded: true
            } as FinancialData;

            const result = migrateData(fullData);

            expect(result.currentMonth).toBe('2023-06');
            expect(result.currency).toBe('GBP');
            expect(result.isOnboarded).toBe(true);
            expect(result.incomes).toHaveLength(1);
            expect(result.expenses).toHaveLength(1);
        });

        it('should handle very old data format gracefully', () => {
            const ancientData = {
                incomes: [],
                expenses: [],
                customCategories: [],
                currentMonth: '2020-01', // Old date
                currency: 'USD'
                // No version
            } as unknown as FinancialData;

            const result = migrateData(ancientData);
            expect(result.version).toBe(CURRENT_DATA_VERSION);
            expect(result.currentMonth).toBe('2020-01'); // Preserved
        });
    });

    describe('Data Integrity', () => {
        it('should not lose any income entries during migration', () => {
            const incomes: Income[] = Array.from({ length: 50 }, (_, i) => ({
                id: `inc-${i}`,
                source: `Source ${i}`,
                amount: 1000 + i,
                month: `2023-${String(Math.floor(i / 4) + 1).padStart(2, '0')}`,
                date: `2023-${String(Math.floor(i / 4) + 1).padStart(2, '0')}-01`
            }));

            const oldData = {
                incomes,
                expenses: [],
                customCategories: [],
                currentMonth: '2023-01',
                currency: 'USD',
                version: 1
            } as FinancialData;

            const result = migrateData(oldData);
            expect(result.incomes).toHaveLength(50);
            expect(result.incomes).toEqual(incomes);
        });

        it('should not lose any expense entries during migration', () => {
            const expenses: Expense[] = Array.from({ length: 100 }, (_, i) => ({
                id: `exp-${i}`,
                description: `Expense ${i}`,
                amount: 10 + i,
                categoryId: 'cat-1',
                categoryType: ExpenseCategory.NEEDS,
                month: '2023-01',
                date: '2023-01-15'
            }));

            const oldData = {
                incomes: [],
                expenses,
                customCategories: [],
                currentMonth: '2023-01',
                currency: 'USD',
                version: 1
            } as FinancialData;

            const result = migrateData(oldData);
            expect(result.expenses).toHaveLength(100);
            expect(result.expenses).toEqual(expenses);
        });

        it('should preserve category relationships (parent-child)', () => {
            const v3Data = {
                incomes: [],
                expenses: [],
                customCategories: [
                    {
                        id: 'parent-1',
                        name: 'Parent Category',
                        type: ExpenseCategory.NEEDS
                    },
                    {
                        id: 'child-1',
                        name: 'Child Category',
                        type: ExpenseCategory.NEEDS,
                        parentId: 'parent-1',
                        isSubcategory: true
                    }
                ],
                currentMonth: '2023-01',
                currency: 'USD',
                version: 3
            } as FinancialData;

            const result = migrateData(v3Data);

            const parent = result.customCategories.find(c => c.id === 'parent-1');
            const child = result.customCategories.find(c => c.id === 'child-1');

            expect(parent).toBeDefined();
            expect(child).toBeDefined();
            expect(child?.parentId).toBe('parent-1');
            expect(child?.isSubcategory).toBe(true);
        });

        it('should not modify amounts or dates', () => {
            const income: Income = {
                id: 'inc-1',
                source: 'Salary',
                amount: 1234.56,
                month: '2023-01',
                date: '2023-01-15'
            };

            const expense: Expense = {
                id: 'exp-1',
                description: 'Rent',
                amount: 987.65,
                categoryId: 'cat-1',
                categoryType: ExpenseCategory.NEEDS,
                month: '2023-01',
                date: '2023-01-15'
            };

            const oldData = {
                incomes: [income],
                expenses: [expense],
                customCategories: [],
                currentMonth: '2023-01',
                currency: 'USD',
                version: 1
            } as FinancialData;

            const result = migrateData(oldData);

            expect(result.incomes[0].amount).toBe(1234.56);
            expect(result.expenses[0].amount).toBe(987.65);
            expect(result.expenses[0].date).toBe('2023-01-15');
        });
    });

    describe('Save Behavior', () => {
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
            const initialResult = migrateData({
                incomes: [],
                expenses: [],
                customCategories: [],
                currentMonth: '2023-01',
                currency: 'USD'
            } as unknown as FinancialData); // Will generate full defaults

            // Clear mocks after first migration
            vi.clearAllMocks();

            // Migrate again - should detect no changes needed
            migrateData(initialResult);
            expect(localStorageUtils.saveFinancialData).not.toHaveBeenCalled();
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty arrays', () => {
            const emptyData = {
                incomes: [],
                expenses: [],
                customCategories: [],
                currentMonth: '2023-01',
                currency: 'USD',
                version: 1
            } as FinancialData;

            expect(() => migrateData(emptyData)).not.toThrow();
            const result = migrateData(emptyData);
            expect(result.version).toBe(CURRENT_DATA_VERSION);
        });

        it('should handle data with future version gracefully', () => {
            const futureData = {
                incomes: [],
                expenses: [],
                customCategories: [],
                currentMonth: '2023-01',
                currency: 'USD',
                version: 999 // Future version
            } as FinancialData;

            // Should not throw, should return as-is or handle gracefully
            expect(() => migrateData(futureData)).not.toThrow();
        });

        it('should handle missing currency field', () => {
            const noCurrencyData = {
                incomes: [],
                expenses: [],
                customCategories: [],
                currentMonth: '2023-01',
                // currency: missing
                version: 1
            } as unknown as FinancialData;

            expect(() => migrateData(noCurrencyData)).not.toThrow();
        });
    });
});
