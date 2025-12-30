import { describe, it, expect } from 'vitest';
import {
    calculate50_30_20,
    calculateActualBreakdown,
    calculateBudgetSummary,
    calculateSavingsRate,
    formatCurrency,
    calculateMonthlyTrends,
    getCurrentMonth,
} from './calculations';
import { ExpenseCategory, type Expense, type Income } from '../types';

describe('calculations', () => {
    describe('calculate50_30_20', () => {
        it('should correctly split income', () => {
            const income = 1000;
            const result = calculate50_30_20(income);
            expect(result).toEqual({
                needs: 500,
                wants: 300,
                savings: 200,
            });
        });

        // EDGE CASE: Zero income
        it('should handle zero income', () => {
            const result = calculate50_30_20(0);
            expect(result).toEqual({
                needs: 0,
                wants: 0,
                savings: 0,
            });
        });

        // EDGE CASE: Large numbers (millions)
        it('should handle large income amounts', () => {
            const income = 10_000_000; // 10 million
            const result = calculate50_30_20(income);
            expect(result.needs).toBe(5_000_000);
            expect(result.wants).toBe(3_000_000);
            expect(result.savings).toBe(2_000_000);
        });

        // EDGE CASE: Decimal precision
        it('should maintain decimal precision', () => {
            const income = 1234.56;
            const result = calculate50_30_20(income);
            expect(result.needs).toBeCloseTo(617.28, 2);
            expect(result.wants).toBeCloseTo(370.368, 2);
            expect(result.savings).toBeCloseTo(246.912, 2);
        });

        // EDGE CASE: Very small amounts
        it('should handle very small amounts', () => {
            const income = 0.01;
            const result = calculate50_30_20(income);
            expect(result.needs).toBeCloseTo(0.005, 3);
            expect(result.wants).toBeCloseTo(0.003, 3);
            expect(result.savings).toBeCloseTo(0.002, 3);
        });
    });

    describe('calculateActualBreakdown', () => {
        it('should correctly sum expenses by category type', () => {
            const expenses: Expense[] = [
                { id: '1', amount: 100, categoryType: ExpenseCategory.NEEDS, month: '2023-01' } as Expense,
                { id: '2', amount: 50, categoryType: ExpenseCategory.WANTS, month: '2023-01' } as Expense,
                { id: '3', amount: 25, categoryType: ExpenseCategory.SAVINGS, month: '2023-01' } as Expense,
                { id: '4', amount: 100, categoryType: ExpenseCategory.NEEDS, month: '2023-01' } as Expense,
            ];

            const result = calculateActualBreakdown(expenses);
            expect(result).toEqual({
                needs: 200,
                wants: 50,
                savings: 25,
            });
        });

        // EDGE CASE: Empty expenses array
        it('should handle empty expenses', () => {
            const result = calculateActualBreakdown([]);
            expect(result).toEqual({
                needs: 0,
                wants: 0,
                savings: 0,
            });
        });

        // EDGE CASE: Large numbers
        it('should handle very large expense amounts', () => {
            const expenses: Expense[] = [
                { id: '1', amount: 5_000_000, categoryType: ExpenseCategory.NEEDS, month: '2023-01' } as Expense,
                { id: '2', amount: 3_000_000, categoryType: ExpenseCategory.WANTS, month: '2023-01' } as Expense,
            ];

            const result = calculateActualBreakdown(expenses);
            expect(result.needs).toBe(5_000_000);
            expect(result.wants).toBe(3_000_000);
        });

        // EDGE CASE: Decimal precision
        it('should maintain precision with decimal amounts', () => {
            const expenses: Expense[] = [
                { id: '1', amount: 123.45, categoryType: ExpenseCategory.NEEDS, month: '2023-01' } as Expense,
                { id: '2', amount: 67.89, categoryType: ExpenseCategory.NEEDS, month: '2023-01' } as Expense,
            ];

            const result = calculateActualBreakdown(expenses);
            expect(result.needs).toBeCloseTo(191.34, 2);
        });
    });

    describe('calculateSavingsRate', () => {
        it('should calculate correct percentage', () => {
            expect(calculateSavingsRate(1000, 800)).toBe(20); // (200/1000)*100
        });

        it('should handle zero income', () => {
            expect(calculateSavingsRate(0, 100)).toBe(0);
        });

        it('should handle negative savings (overspending)', () => {
            expect(calculateSavingsRate(1000, 1200)).toBe(-20);
        });

        // EDGE CASE: Zero expenses (100% savings)
        it('should handle zero expenses', () => {
            expect(calculateSavingsRate(1000, 0)).toBe(100);
        });

        // EDGE CASE: Large numbers
        it('should handle large amounts', () => {
            expect(calculateSavingsRate(10_000_000, 7_000_000)).toBe(30);
        });

        // EDGE CASE: Decimal precision
        it('should maintain decimal precision', () => {
            const rate = calculateSavingsRate(1234.56, 987.65);
            expect(rate).toBeCloseTo(20.0, 1);
        });
    });

    describe('formatCurrency', () => {
        it('should format USD by default', () => {
            expect(formatCurrency(1000)).toBe('$1,000');
        });

        it('should format GBP', () => {
            expect(formatCurrency(1000, 'GBP')).toBe('£1,000');
        });

        // EDGE CASE: Zero amount
        it('should format zero', () => {
            expect(formatCurrency(0)).toBe('$0');
        });

        // EDGE CASE: Negative amounts
        it('should format negative amounts', () => {
            expect(formatCurrency(-500, 'USD')).toContain('500');
        });

        // EDGE CASE: Large numbers
        it('should format millions with commas', () => {
            const formatted = formatCurrency(1_234_567);
            expect(formatted).toContain('1,234,567');
        });

        // EDGE CASE: Decimal amounts
        it('should handle decimal amounts', () => {
            const formatted = formatCurrency(1234.56);
            expect(formatted).toContain('1,234.56');
        });

        // EDGE CASE: All supported currencies
        it('should support all currency codes', () => {
            expect(formatCurrency(1000, 'EUR')).toBe('€1,000');
            expect(formatCurrency(1000, 'INR')).toBe('₹1,000');
            expect(formatCurrency(1000, 'JPY')).toBe('¥1,000');
            expect(formatCurrency(1000, 'AUD')).toBe('A$1,000');
        });
    });

    describe('calculateBudgetSummary', () => {
        const incomes: Income[] = [
            { id: '1', amount: 5000, month: '2023-01' } as Income
        ];

        const expenses: Expense[] = [
            { id: '1', amount: 2000, categoryType: ExpenseCategory.NEEDS, month: '2023-01' } as Expense, // Needs: 2000
            { id: '2', amount: 1000, categoryType: ExpenseCategory.WANTS, month: '2023-01' } as Expense,  // Wants: 1000
            { id: '3', amount: 500, categoryType: ExpenseCategory.SAVINGS, month: '2023-01' } as Expense,  // Savings: 500
        ];

        // Total Income: 5000
        // Recommended: Needs 2500, Wants 1500, Savings 1000
        // Actual: Needs 2000, Wants 1000, Savings 500
        // Net Savings: 1500

        it('should calculate summary for current month', () => {
            const summary = calculateBudgetSummary(incomes, expenses, '2023-01');

            expect(summary.totalIncome).toBe(5000);
            // Needs (2000) + Wants (1000) = 3000. Savings (500) excluded.
            expect(summary.totalExpenses).toBe(3000);
            // Income (5000) - Expenses (3000) = 2000.
            expect(summary.netSavings).toBe(2000);

            // Check breakdown
            expect(summary.actualNeeds).toBe(2000);
            expect(summary.actualWants).toBe(1000);
            expect(summary.actualSavings).toBe(500);

            // Check statuses (Actual vs Recommended)
            // Needs: 2000 vs 2500 -> 0.8 -> Under
            expect(summary.needsStatus).toBe('under');
        });

        it('should handle yearly summary', () => {
            const incomesYear: Income[] = [
                { id: '1', amount: 5000, month: '2023-01' } as Income,
                { id: '2', amount: 5000, month: '2023-02' } as Income,
            ];

            const expensesYear: Expense[] = [
                { id: '1', amount: 2000, categoryType: ExpenseCategory.NEEDS, month: '2023-01' } as Expense,
                { id: '2', amount: 3000, categoryType: ExpenseCategory.NEEDS, month: '2023-02' } as Expense,
            ];

            const summary = calculateBudgetSummary(incomesYear, expensesYear, '2023-ALL');
            expect(summary.totalIncome).toBe(10000);
            expect(summary.totalExpenses).toBe(5000);
        });

        // EDGE CASE: Zero income
        it('should handle zero income', () => {
            const summary = calculateBudgetSummary([], expenses, '2023-01');
            expect(summary.totalIncome).toBe(0);
            expect(summary.totalExpenses).toBe(3000);
            expect(summary.netSavings).toBe(-3000);
            expect(summary.isOverBudget).toBe(true);
        });

        // EDGE CASE: Zero expenses
        it('should handle zero expenses', () => {
            const summary = calculateBudgetSummary(incomes, [], '2023-01');
            expect(summary.totalIncome).toBe(5000);
            expect(summary.totalExpenses).toBe(0);
            expect(summary.netSavings).toBe(5000);
            expect(summary.isOverBudget).toBe(false);
        });

        // EDGE CASE: Expenses exceed income
        it('should handle expenses exceeding income', () => {
            const highExpenses: Expense[] = [
                { id: '1', amount: 6000, categoryType: ExpenseCategory.NEEDS, month: '2023-01' } as Expense,
            ];
            const summary = calculateBudgetSummary(incomes, highExpenses, '2023-01');
            expect(summary.isOverBudget).toBe(true);
            expect(summary.netSavings).toBe(-1000);
        });

        // EDGE CASE: Different year filtering
        it('should filter by year correctly', () => {
            const multiYearIncomes: Income[] = [
                { id: '1', amount: 5000, month: '2023-01' } as Income,
                { id: '2', amount: 5000, month: '2024-01' } as Income,
            ];
            const summary = calculateBudgetSummary(multiYearIncomes, [], '2023-ALL');
            expect(summary.totalIncome).toBe(5000); // Only 2023
        });

        // EDGE CASE: Unallocated cash calculation
        it('should calculate unallocated cash correctly', () => {
            const summary = calculateBudgetSummary(incomes, expenses, '2023-01');
            // Net Savings (2000) - Actual Savings (500) = 1500
            expect(summary.unallocatedCash).toBe(1500);
        });
    });

    describe('calculateMonthlyTrends', () => {
        it('should aggregate data by month', () => {
            const incomes: Income[] = [
                { id: '1', amount: 3000, month: '2023-01' } as Income,
                { id: '2', amount: 3000, month: '2023-02' } as Income,
            ];
            const expenses: Expense[] = [
                { id: '1', amount: 1000, categoryType: ExpenseCategory.NEEDS, month: '2023-01' } as Expense,
                { id: '2', amount: 500, categoryType: ExpenseCategory.WANTS, month: '2023-01' } as Expense,
                { id: '3', amount: 2000, categoryType: ExpenseCategory.NEEDS, month: '2023-02' } as Expense,
            ];

            const trends = calculateMonthlyTrends(incomes, expenses);

            expect(trends).toHaveLength(2);

            // Jan
            expect(trends[0].month).toBe('2023-01');
            expect(trends[0].income).toBe(3000);
            expect(trends[0].expenses).toBe(1500);
            expect(trends[0].savings).toBe(1500); // 3000 - 1500
            expect(trends[0].needs).toBe(1000);

            // Feb
            expect(trends[1].month).toBe('2023-02');
            expect(trends[1].expenses).toBe(2000);
            expect(trends[1].savings).toBe(1000);
        });

        // EDGE CASE: Empty data
        it('should handle empty incomes and expenses', () => {
            const trends = calculateMonthlyTrends([], []);
            expect(trends).toHaveLength(0);
        });

        // EDGE CASE: Income only
        it('should handle months with income but no expenses', () => {
            const incomes: Income[] = [
                { id: '1', amount: 3000, month: '2023-01' } as Income,
            ];
            const trends = calculateMonthlyTrends(incomes, []);
            expect(trends[0].income).toBe(3000);
            expect(trends[0].expenses).toBe(0);
            expect(trends[0].savings).toBe(3000);
        });

        // EDGE CASE: Expenses only
        it('should handle months with expenses but no income', () => {
            const expenses: Expense[] = [
                { id: '1', amount: 1000, categoryType: ExpenseCategory.NEEDS, month: '2023-01' } as Expense,
            ];
            const trends = calculateMonthlyTrends([], expenses);
            expect(trends[0].income).toBe(0);
            expect(trends[0].expenses).toBe(1000);
            expect(trends[0].savings).toBe(-1000);
        });

        // EDGE CASE: Sorting is correct
        it('should sort months chronologically', () => {
            const incomes: Income[] = [
                { id: '1', amount: 3000, month: '2023-03' } as Income,
                { id: '2', amount: 3000, month: '2023-01' } as Income,
                { id: '3', amount: 3000, month: '2023-02' } as Income,
            ];
            const trends = calculateMonthlyTrends(incomes, []);
            expect(trends[0].month).toBe('2023-01');
            expect(trends[1].month).toBe('2023-02');
            expect(trends[2].month).toBe('2023-03');
        });

        // EDGE CASE: Multiple entries in same month
        it('should aggregate multiple entries in the same month', () => {
            const incomes: Income[] = [
                { id: '1', amount: 2000, month: '2023-01' } as Income,
                { id: '2', amount: 1000, month: '2023-01' } as Income,
            ];
            const expenses: Expense[] = [
                { id: '1', amount: 500, categoryType: ExpenseCategory.NEEDS, month: '2023-01' } as Expense,
                { id: '2', amount: 300, categoryType: ExpenseCategory.WANTS, month: '2023-01' } as Expense,
            ];
            const trends = calculateMonthlyTrends(incomes, expenses);
            expect(trends[0].income).toBe(3000);
            expect(trends[0].expenses).toBe(800);
        });
    });

    describe('getCurrentMonth', () => {
        // EDGE CASE: Date boundaries
        it('should return current month in YYYY-MM format', () => {
            const current = getCurrentMonth();
            expect(current).toMatch(/^\d{4}-\d{2}$/);

            // Verify it's actually current
            const now = new Date();
            const expectedYear = now.getFullYear();
            const expectedMonth = String(now.getMonth() + 1).padStart(2, '0');
            expect(current).toBe(`${expectedYear}-${expectedMonth}`);
        });
    });
});
