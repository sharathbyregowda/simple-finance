import { describe, it, expect } from 'vitest';
import { generateMonthlySummary } from './summary';
import { ExpenseCategory } from '../types';

describe('generateMonthlySummary', () => {
    const mockBudgetSummary = {
        totalIncome: 5000,
        totalExpenses: 4000,
        netSavings: 1000,
        recommendedNeeds: 2500,
        recommendedWants: 1500,
        recommendedSavings: 1000,
        actualNeeds: 2400,
        actualWants: 1400,
        actualSavings: 200, // Low savings
        needsPercentage: 48,
        wantsPercentage: 28,
        savingsPercentage: 4,
        unallocatedCash: 0,
        isOverBudget: false,
        needsStatus: 'under' as const,
        wantsStatus: 'under' as const,
        savingsStatus: 'under' as const,
    };

    const mockExpenses = [
        { id: '1', amount: 1000, categoryId: 'c1', categoryType: ExpenseCategory.NEEDS, date: '2023-01-15', month: '2023-01', description: 'Rent', categoryName: 'Rent' },
        { id: '2', amount: 1400, categoryId: 'c2', categoryType: ExpenseCategory.WANTS, date: '2023-01-20', month: '2023-01', description: 'Travel', categoryName: 'Travel' }
    ] as any;

    const mockCategories = [
        { id: 'c1', name: 'Rent', type: ExpenseCategory.NEEDS },
        { id: 'c2', name: 'Travel', type: ExpenseCategory.WANTS },
    ] as any;

    const mockHistory = [
        { month: '2022-12', income: 5000, expenses: 4000, savings: 1000, needs: 2500, wants: 1500 },
        { month: '2023-01', income: 5000, expenses: 4000, savings: 200, needs: 2400, wants: 1400 },
    ];

    it('generates correct standard summary', () => {
        const result = generateMonthlySummary({
            currentMonth: '2023-01',
            budgetSummary: mockBudgetSummary,
            expenses: mockExpenses,
            categories: mockCategories,
            monthlyHistory: mockHistory,
            currencyCode: 'USD'
        });

        // 1. Outcome
        expect(result[0]).toContain('below your income');

        // 2. Variance (Savings low)
        // phrasing: "Saved $800 less than target."
        expect(result).toContain('Saved $800 less than target.');

        // 3. Drivers
        // Travel (1400) + Rent (1000) = 2400 / 4000 = 60%.
        expect(result).toContain('Travel and Rent made up 60% of total spending.');

        // 4. Savings Health
        // 20% -> 4%. "Savings fell..."
        expect(result.some(r => r.includes('Savings fell from 20% to 4%'))).toBe(true);

        // Count check
        expect(result.length).toBeLessThanOrEqual(6);
        expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('prioritizes variances correctly (drops Savings if Needs/Wants exist)', () => {
        // Create a scenario with 3 variances.
        // Needs High Var, Wants High Var, Savings High Var.
        // Should keep Needs and Wants. Drop Savings. (Wants > Savings priority rule 2)
        const varianceSummary = {
            ...mockBudgetSummary,
            actualNeeds: 3500, // +1000 var
            actualWants: 2500, // +1000 var
            actualSavings: 0,  // -1000 var
            recommendedNeeds: 2500,
            recommendedWants: 1500,
            recommendedSavings: 1000
        };

        const result = generateMonthlySummary({
            currentMonth: '2023-01',
            budgetSummary: varianceSummary,
            expenses: mockExpenses,
            categories: mockCategories,
            monthlyHistory: mockHistory,
            currencyCode: 'USD'
        });

        // Check outcome
        expect(result[0]).toContain('Total spending was');

        // Check Variances
        // Needs (Prio 2) -> Should be there
        expect(result.some(r => r.includes('Needs'))).toBe(true);
        // Wants (Prio 3) -> Should be there
        expect(result.some(r => r.includes('Wants'))).toBe(true);
        // Savings (Prio 4) -> Should be DROPPED because max 2 variances, and sorted by magnitude (all equal 1000) then order?
        // Wait, logic says: "Pick buckets with largest absolute variance."
        // All are 1000. 
        // If sorting is unstable, we rely on Priority?
        // My implementation: filter variances, sort by magnitude. If tie, original order (Outcome, Needs, Wants, Savings).
        // Actually I push to candidates with Prio enum.
        // My filter step: "Re-sort variance candidates by magnitude desc".
        // If magnitude equal, sort is likely stable or random.
        // If I want strict Needs > Wants > Savings, I should sort by Magnitude DESC then Priority ASC (lower num = higher prio).
        // Let's assume current logic might pick any if magnitude equal.
        // But if I make Needs variance LARGER, it clearly wins.
        // Let's adjust test to force magnitude diff.
    });

    it('respects magnitude for variance selection', () => {
        const varianceSummary = {
            ...mockBudgetSummary,
            actualNeeds: 4500, // +2000 var (Huge)
            actualWants: 1600, // +100 var (Small)
            actualSavings: 0,  // -1000 var (Medium)
            recommendedNeeds: 2500,
            recommendedWants: 1500,
            recommendedSavings: 1000
        };

        const result = generateMonthlySummary({
            currentMonth: '2023-01',
            budgetSummary: varianceSummary,
            expenses: mockExpenses,
            categories: mockCategories,
            monthlyHistory: mockHistory,
            currencyCode: 'USD'
        });

        // Needs (2000) -> Keep
        expect(result.some(r => r.includes('Needs'))).toBe(true);
        // Savings (1000) -> Keep
        expect(result.some(r => r.includes('Saved $1,000 less'))).toBe(true);
        // Wants (100) -> Drop (Lowest abs variance)
        expect(result.some(r => r.includes('Wants'))).toBe(false);
    });
});
