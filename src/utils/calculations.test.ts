import { describe, it, expect } from 'vitest';
import {
    calculate50_30_20,
    calculateActualBreakdown,
    calculateBudgetSummary,
    calculateSavingsRate,
    formatCurrency,
    calculateMonthlyTrends,
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
    });

    describe('formatCurrency', () => {
        it('should format USD by default', () => {
            expect(formatCurrency(1000)).toBe('$1,000');
        });

        it('should format GBP', () => {
            expect(formatCurrency(1000, 'GBP')).toBe('£1,000');
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
            expect(summary.totalExpenses).toBe(3500);
            expect(summary.netSavings).toBe(1500);

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
    });
});
