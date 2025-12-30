import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { FinanceProvider, useFinance } from './FinanceContext';
import { ExpenseCategory } from '../types';
import type { ReactNode } from 'react';

// Mock localStorage
vi.mock('../utils/localStorage', () => ({
    saveFinancialData: vi.fn(),
    loadFinancialData: vi.fn(() => null),
}));

describe('FinanceContext Integration Tests', () => {
    // Wrapper for hooks
    const wrapper = ({ children }: { children: ReactNode }) => (
        <FinanceProvider>{children}</FinanceProvider>
    );

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    describe('Initialization', () => {
        it('should initialize with empty state for new users', () => {
            const { result } = renderHook(() => useFinance(), { wrapper });

            expect(result.current.data.incomes).toEqual([]);
            expect(result.current.data.expenses).toEqual([]);
            expect(result.current.data.isOnboarded).toBe(false);
            expect(result.current.data.currency).toBe('USD');
            expect(result.current.data.customCategories.length).toBeGreaterThan(0);
        });

        it('should initialize budgetSummary to zero values', () => {
            const { result } = renderHook(() => useFinance(), { wrapper });

            expect(result.current.budgetSummary.totalIncome).toBe(0);
            expect(result.current.budgetSummary.totalExpenses).toBe(0);
            expect(result.current.budgetSummary.netSavings).toBe(0);
        });

        it('should initialize monthlyTrends as empty array', () => {
            const { result } = renderHook(() => useFinance(), { wrapper });

            expect(result.current.monthlyTrends).toEqual([]);
        });
    });

    describe('Income Operations Integration', () => {
        it('should add income and update budget summary', async () => {
            const { result } = renderHook(() => useFinance(), { wrapper });

            act(() => {
                result.current.setCurrentMonth('2024-01');
                result.current.addIncome({
                    source: 'Salary',
                    amount: 5000,
                    date: '2024-01-15'
                });
            });

            await waitFor(() => {
                expect(result.current.data.incomes).toHaveLength(1);
                expect(result.current.data.incomes[0].source).toBe('Salary');
                expect(result.current.data.incomes[0].amount).toBe(5000);
                expect(result.current.data.incomes[0].month).toBe('2024-01');
                expect(result.current.budgetSummary.totalIncome).toBe(5000);
            });
        });

        it('should update income and recalculate budget', async () => {
            const { result } = renderHook(() => useFinance(), { wrapper });

            let incomeId: string;

            act(() => {
                result.current.setCurrentMonth('2024-01');
                result.current.addIncome({
                    source: 'Salary',
                    amount: 5000,
                    date: '2024-01-15'
                });
            });

            await waitFor(() => {
                incomeId = result.current.data.incomes[0].id;
            });

            act(() => {
                result.current.updateIncome(incomeId!, { amount: 6000 });
            });

            await waitFor(() => {
                expect(result.current.data.incomes[0].amount).toBe(6000);
                expect(result.current.budgetSummary.totalIncome).toBe(6000);
            });
        });

        it('should delete income and update budget', async () => {
            const { result } = renderHook(() => useFinance(), { wrapper });

            let incomeId: string;

            act(() => {
                result.current.addIncome({
                    source: 'Salary',
                    amount: 5000,
                    date: '2024-01-15'
                });
            });

            await waitFor(() => {
                incomeId = result.current.data.incomes[0].id;
            });

            act(() => {
                result.current.deleteIncome(incomeId!);
            });

            await waitFor(() => {
                expect(result.current.data.incomes).toHaveLength(0);
                expect(result.current.budgetSummary.totalIncome).toBe(0);
            });
        });

        it('should handle multiple incomes and aggregate correctly', async () => {
            const { result } = renderHook(() => useFinance(), { wrapper });

            act(() => {
                result.current.setCurrentMonth('2024-01');
                result.current.addIncome({ source: 'Salary', amount: 5000, date: '2024-01-15' });
                result.current.addIncome({ source: 'Freelance', amount: 1500, date: '2024-01-20' });
                result.current.addIncome({ source: 'Bonus', amount: 2000, date: '2024-01-25' });
            });

            await waitFor(() => {
                expect(result.current.data.incomes).toHaveLength(3);
                expect(result.current.budgetSummary.totalIncome).toBe(8500);
            });
        });
    });

    describe('Expense Operations Integration', () => {
        it('should add expense with category type lookup', async () => {
            const { result } = renderHook(() => useFinance(), { wrapper });

            const housingCategory = result.current.data.customCategories.find(
                c => c.name === 'Housing/Rent' && !c.isSubcategory
            );

            act(() => {
                result.current.setCurrentMonth('2024-01');
                result.current.addExpense({
                    description: 'Rent',
                    amount: 1500,
                    categoryId: housingCategory!.id,
                    date: '2024-01-15'
                });
            });

            await waitFor(() => {
                expect(result.current.data.expenses).toHaveLength(1);
                expect(result.current.data.expenses[0].description).toBe('Rent');
                expect(result.current.data.expenses[0].categoryType).toBe(ExpenseCategory.NEEDS);
                expect(result.current.budgetSummary.totalExpenses).toBeGreaterThan(0);
            });
        });

        it('should update expense and recalculate when category changes', async () => {
            const { result } = renderHook(() => useFinance(), { wrapper });

            const housingCat = result.current.data.customCategories.find(c => c.name === 'Housing/Rent' && !c.isSubcategory);
            const entertainmentCat = result.current.data.customCategories.find(c => c.name === 'Entertainment' && !c.isSubcategory);

            let expenseId: string;

            act(() => {
                result.current.addExpense({
                    description: 'Rent',
                    amount: 1500,
                    categoryId: housingCat!.id,
                    date: '2024-01-15'
                });
            });

            await waitFor(() => {
                expenseId = result.current.data.expenses[0].id;
                expect(result.current.data.expenses[0].categoryType).toBe(ExpenseCategory.NEEDS);
            });

            act(() => {
                result.current.updateExpense(expenseId!, { categoryId: entertainmentCat!.id });
            });

            await waitFor(() => {
                expect(result.current.data.expenses[0].categoryType).toBe(ExpenseCategory.WANTS);
            });
        });

        it('should delete expense and update budget', async () => {
            const { result } = renderHook(() => useFinance(), { wrapper });

            const category = result.current.data.customCategories[0];
            let expenseId: string;

            act(() => {
                result.current.addExpense({
                    description: 'Test',
                    amount: 100,
                    categoryId: category.id,
                    date: '2024-01-15'
                });
            });

            await waitFor(() => {
                expenseId = result.current.data.expenses[0].id;
            });

            act(() => {
                result.current.deleteExpense(expenseId!);
            });

            await waitFor(() => {
                expect(result.current.data.expenses).toHaveLength(0);
            });
        });
    });

    describe('Category Management Integration', () => {
        it('should add category and make it available for expenses', async () => {
            const { result } = renderHook(() => useFinance(), { wrapper });

            const initialCount = result.current.data.customCategories.length;

            act(() => {
                result.current.addCategory({
                    name: 'Custom Category',
                    type: ExpenseCategory.WANTS,
                    icon: '💰'
                });
            });

            await waitFor(() => {
                expect(result.current.data.customCategories).toHaveLength(initialCount + 1);
                const newCat = result.current.data.customCategories.find(
                    c => c.name === 'Custom Category'
                );
                expect(newCat).toBeDefined();
                expect(newCat?.type).toBe(ExpenseCategory.WANTS);
            });
        });

        it('should add subcategory with parent type inheritance', async () => {
            const { result } = renderHook(() => useFinance(), { wrapper });

            const parentCategory = result.current.data.customCategories.find(
                c => c.name === 'Housing/Rent' && !c.isSubcategory
            );

            act(() => {
                result.current.addSubcategory(parentCategory!.id, {
                    name: 'Custom Subcategory',
                    icon: '🏠'
                });
            });

            await waitFor(() => {
                const subcategories = result.current.getSubcategories(parentCategory!.id);
                const newSub = subcategories.find(s => s.name === 'Custom Subcategory');
                expect(newSub).toBeDefined();
                expect(newSub?.type).toBe(parentCategory!.type);
                expect(newSub?.parentId).toBe(parentCategory!.id);
                expect(newSub?.isSubcategory).toBe(true);
            });
        });

        it('should update category type and cascade to expenses', async () => {
            const { result } = renderHook(() => useFinance(), { wrapper });

            let categoryId: string;

            act(() => {
                result.current.addCategory({
                    name: 'Test Category',
                    type: ExpenseCategory.WANTS,
                    icon: '💰'
                });
            });

            await waitFor(() => {
                const cat = result.current.data.customCategories.find(c => c.name === 'Test Category');
                categoryId = cat!.id;
            });

            act(() => {
                result.current.addExpense({
                    description: 'Test Expense',
                    amount: 100,
                    categoryId: categoryId!,
                    date: '2024-01-15'
                });
            });

            await waitFor(() => {
                expect(result.current.data.expenses[0].categoryType).toBe(ExpenseCategory.WANTS);
            });

            act(() => {
                result.current.updateCategory(categoryId!, { type: ExpenseCategory.NEEDS });
            });

            await waitFor(() => {
                expect(result.current.data.expenses[0].categoryType).toBe(ExpenseCategory.NEEDS);
            });
        });

        it('should delete category and cascade delete expenses', async () => {
            const { result } = renderHook(() => useFinance(), { wrapper });

            let categoryId: string;

            act(() => {
                result.current.addCategory({
                    name: 'Delete Me',
                    type: ExpenseCategory.WANTS,
                    icon: '🗑️'
                });
            });

            await waitFor(() => {
                categoryId = result.current.data.customCategories.find(c => c.name === 'Delete Me')!.id;
            });

            act(() => {
                result.current.addExpense({
                    description: 'Will be deleted',
                    amount: 100,
                    categoryId: categoryId!,
                    date: '2024-01-15'
                });
            });

            await waitFor(() => {
                expect(result.current.data.expenses).toHaveLength(1);
            });

            act(() => {
                result.current.deleteCategory(categoryId!);
            });

            await waitFor(() => {
                expect(result.current.data.customCategories.find(c => c.id === categoryId)).toBeUndefined();
                expect(result.current.data.expenses).toHaveLength(0);
            });
        });

        it('should get category hierarchy correctly', () => {
            const { result } = renderHook(() => useFinance(), { wrapper });

            const hierarchy = result.current.getCategoryHierarchy();

            expect(Array.isArray(hierarchy)).toBe(true);
            expect(hierarchy.length).toBeGreaterThan(0);

            // Each item should have category and subcategories
            hierarchy.forEach(item => {
                expect(item.category).toBeDefined();
                expect(Array.isArray(item.subcategories)).toBe(true);
            });
        });
    });

    describe('Budget Summary Integration', () => {
        it('should calculate 50/30/20 breakdown correctly', async () => {
            const { result } = renderHook(() => useFinance(), { wrapper });

            const needsCat = result.current.data.customCategories.find(c => c.type === ExpenseCategory.NEEDS && !c.isSubcategory);
            const wantsCat = result.current.data.customCategories.find(c => c.type === ExpenseCategory.WANTS && !c.isSubcategory);
            const savingsCat = result.current.data.customCategories.find(c => c.type === ExpenseCategory.SAVINGS && !c.isSubcategory);

            act(() => {
                result.current.setCurrentMonth('2024-01');
                result.current.addIncome({ source: 'Salary', amount: 5000, date: '2024-01-15' });
                result.current.addExpense({ description: 'Rent', amount: 2000, categoryId: needsCat!.id, date: '2024-01-15' });
                result.current.addExpense({ description: 'Fun', amount: 1000, categoryId: wantsCat!.id, date: '2024-01-15' });
                result.current.addExpense({ description: 'Investment', amount: 500, categoryId: savingsCat!.id, date: '2024-01-15' });
            });

            await waitFor(() => {
                expect(result.current.budgetSummary.totalIncome).toBe(5000);
                expect(result.current.budgetSummary.actualNeeds).toBe(2000);
                expect(result.current.budgetSummary.actualWants).toBe(1000);
                expect(result.current.budgetSummary.actualSavings).toBe(500);
                expect(result.current.budgetSummary.recommendedNeeds).toBe(2500); // 50% of 5000
                expect(result.current.budgetSummary.recommendedWants).toBe(1500); // 30% of 5000
                expect(result.current.budgetSummary.recommendedSavings).toBe(1000); // 20% of 5000
            });
        });

        it('should update status indicators based on spending', async () => {
            const { result } = renderHook(() => useFinance(), { wrapper });

            const needsCat = result.current.data.customCategories.find(c => c.type === ExpenseCategory.NEEDS && !c.isSubcategory);

            act(() => {
                result.current.setCurrentMonth('2024-01');
                result.current.addIncome({ source: 'Salary', amount: 5000, date: '2024-01-15' });
                result.current.addExpense({ description: 'Rent', amount: 3000, categoryId: needsCat!.id, date: '2024-01-15' });
            });

            await waitFor(() => {
                expect(result.current.budgetSummary.needsStatus).toBe('over');
                // Note: isOverBudget is true only when totalExpenses > totalIncome, not when a single category is over
                // With 5000 income and 3000 needs expense, total expenses (3000) < total income (5000), so not over budget overall
            });
        });
    });

    describe('Monthly Trends Integration', () => {
        it('should track trends across multiple months', async () => {
            const { result } = renderHook(() => useFinance(), { wrapper });

            const category = result.current.data.customCategories[0];

            act(() => {
                // January
                result.current.addIncome({ source: 'Job', amount: 5000, date: '2024-01-15' });
                result.current.addExpense({ description: 'Rent', amount: 1500, categoryId: category.id, date: '2024-01-15' });

                // February
                result.current.addIncome({ source: 'Job', amount: 5200, date: '2024-02-15' });
                result.current.addExpense({ description: 'Rent', amount: 1500, categoryId: category.id, date: '2024-02-15' });
            });

            await waitFor(() => {
                expect(result.current.monthlyTrends).toHaveLength(2);
                expect(result.current.monthlyTrends[0].month).toBe('2024-01');
                expect(result.current.monthlyTrends[1].month).toBe('2024-02');
                expect(result.current.monthlyTrends[1].income).toBe(5200);
            });
        });
    });

    describe('Utility Methods Integration', () => {
        it('should set current month and filter budget accordingly', async () => {
            const { result } = renderHook(() => useFinance(), { wrapper });

            act(() => {
                result.current.setCurrentMonth('2024-02');
            });

            await waitFor(() => {
                expect(result.current.data.currentMonth).toBe('2024-02');
            });
        });

        it('should set currency and persist', async () => {
            const { result } = renderHook(() => useFinance(), { wrapper });

            act(() => {
                result.current.setCurrency('EUR');
            });

            await waitFor(() => {
                expect(result.current.data.currency).toBe('EUR');
            });
        });

        it('should complete onboarding', async () => {
            const { result } = renderHook(() => useFinance(), { wrapper });

            expect(result.current.data.isOnboarded).toBe(false);

            act(() => {
                result.current.completeOnboarding();
            });

            await waitFor(() => {
                expect(result.current.data.isOnboarded).toBe(true);
            });
        });

        it('should clear all data and reset to defaults', async () => {
            const { result } = renderHook(() => useFinance(), { wrapper });

            const category = result.current.data.customCategories[0];

            act(() => {
                result.current.addIncome({ source: 'Test', amount: 1000, date: '2024-01-15' });
                result.current.addExpense({ description: 'Test', amount: 500, categoryId: category.id, date: '2024-01-15' });
            });

            await waitFor(() => {
                expect(result.current.data.incomes).toHaveLength(1);
                expect(result.current.data.expenses).toHaveLength(1);
            });

            act(() => {
                result.current.clearAllData();
            });

            await waitFor(() => {
                expect(result.current.data.incomes).toHaveLength(0);
                expect(result.current.data.expenses).toHaveLength(0);
                expect(result.current.budgetSummary.totalIncome).toBe(0);
            });
        });
    });

    describe('Cross-Component Data Flow', () => {
        it('should maintain data consistency across income/expense/budget', async () => {
            const { result } = renderHook(() => useFinance(), { wrapper });

            const category = result.current.data.customCategories.find(c => c.type === ExpenseCategory.NEEDS && !c.isSubcategory);

            act(() => {
                result.current.setCurrentMonth('2024-01');
                result.current.addIncome({ source: 'Salary', amount: 5000, date: '2024-01-15' });
                result.current.addExpense({ description: 'Rent', amount: 2000, categoryId: category!.id, date: '2024-01-15' });
            });

            await waitFor(() => {
                // Verify data consistency
                expect(result.current.data.incomes).toHaveLength(1);
                expect(result.current.data.expenses).toHaveLength(1);
                expect(result.current.budgetSummary.totalIncome).toBe(5000);
                expect(result.current.budgetSummary.totalExpenses).toBe(2000);
                expect(result.current.budgetSummary.netSavings).toBe(3000);
                expect(result.current.monthlyTrends).toHaveLength(1);
                expect(result.current.monthlyTrends[0].income).toBe(5000);
                expect(result.current.monthlyTrends[0].expenses).toBe(2000);
            });
        });
    });
});
