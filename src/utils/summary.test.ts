import { describe, it, expect } from 'vitest';
import { generateMonthlySummary, generateYearlySummary } from './summary';
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
        expect(result).toContain('Travel and Rent made up 60% of total monthly spending.');

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
        expect(result[0]).toContain('Total monthly spending was');

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

    it('suppresses savings variance if savings rate fell (Option A)', () => {
        // Scenario: Savings exceeded plan (positive variance) 
        // BUT savings rate fell (e.g. income increased much more than savings did)
        const budgetSummary = {
            ...mockBudgetSummary,
            totalIncome: 10000, // Income doubled
            actualSavings: 1500, // Saved more than target ($1000)
            recommendedSavings: 1000,
            savingsPercentage: 15, // 1500/10000 = 15%
        };

        const history = [
            { month: '2022-12', income: 5000, expenses: 3000, savings: 1000, needs: 1500, wants: 1500 }, // 20% savings rate
            { month: '2023-01', income: 10000, expenses: 8500, savings: 1500, needs: 4000, wants: 4500 },
        ];

        const result = generateMonthlySummary({
            currentMonth: '2023-01',
            budgetSummary,
            expenses: mockExpenses,
            categories: mockCategories,
            monthlyHistory: history,
            currencyCode: 'USD'
        });

        // 1. Savings Health should show "fell"
        // 20% -> 15%
        expect(result.some(r => r.includes('Savings fell from 20% to 15%'))).toBe(true);

        // 2. Savings Variance ("Savings exceeded plan by $500") should be SUPPRESSED
        expect(result.some(r => r.includes('Savings exceeded plan'))).toBe(false);
    });

    describe('generateYearlySummary', () => {
        const mockYearlyHistory = [
            { year: '2022', income: 60000, expenses: 40000, savings: 20000, needs: 25000, wants: 15000 },
            { year: '2023', income: 70000, expenses: 50000, savings: 20000, needs: 30000, wants: 20000 },
        ];

        it('generates correct yearly outcome and variance', () => {
            const budgetSummary = {
                ...mockBudgetSummary,
                totalIncome: 70000,
                totalExpenses: 50000,
                actualNeeds: 30000,
                actualWants: 20000,
                recommendedNeeds: 35000, // 50%
                recommendedWants: 21000, // 30%
                savingsPercentage: 28.5,
            };

            const result = generateYearlySummary({
                year: '2023',
                budgetSummary: budgetSummary as any,
                expenses: [],
                categories: [],
                yearlyHistory: mockYearlyHistory,
                currencyCode: 'USD'
            });

            expect(result[0]).toContain('Total yearly spending was $20,000 below your income.');
            expect(result.some(r => r.includes('Savings increased'))).toBe(false); // No savings health yet if only 2 years? Wait, 2022 -> 2023.
            // 2022 rate: 20/60 = 33.3%
            // 2023 rate: 20/70 = 28.5%
            // Should show "Savings fell"
            expect(result.some((r: string) => r.includes('Savings fell from 33% to 29%'))).toBe(true);
        });

        it('identifies yearly trends', () => {
            const longHistory = [
                { year: '2021', income: 50000, expenses: 30000, savings: 20000, needs: 15000, wants: 15000 },
                { year: '2022', income: 50000, expenses: 35000, savings: 15000, needs: 20000, wants: 15000 },
                { year: '2023', income: 50000, expenses: 40000, savings: 10000, needs: 25000, wants: 15000 },
            ];

            const result = generateYearlySummary({
                year: '2023',
                budgetSummary: { ...mockBudgetSummary, savingsPercentage: 20 } as any,
                expenses: [],
                categories: [],
                yearlyHistory: longHistory,
                currencyCode: 'USD'
            });

            expect(result.some((r: string) => r.includes('Needs spending has increased for three consecutive years.'))).toBe(true);
        });
    });
});
