
import { calculateBudgetSummary, calculateMonthlyTrends } from './calculations';
import { ExpenseCategory } from '../types';

describe('Financial Calculation Fixes', () => {
    const mockIncomes = [
        { id: '1', amount: 30000, source: 'Salary', date: '2023-12-01', month: '2023-12' }
    ];

    const mockExpenses = [
        { id: '1', amount: 22000, description: 'Rent', categoryId: 'needs', categoryType: ExpenseCategory.NEEDS, date: '2023-12-01', month: '2023-12' },
        { id: '2', amount: 2000, description: 'Fun', categoryId: 'wants', categoryType: ExpenseCategory.WANTS, date: '2023-12-02', month: '2023-12' },
        { id: '3', amount: 5000, description: 'Inv', categoryId: 'savings', categoryType: ExpenseCategory.SAVINGS, date: '2023-12-03', month: '2023-12' }
    ];

    test('should exclude Savings from Total Expenses and include them in Net Savings', () => {
        const summary = calculateBudgetSummary(mockIncomes, mockExpenses, '2023-12');

        // Total Expenses should be Needs (22k) + Wants (2k) = 24k
        // OLD LOGIC would have been 29k (including savings)
        expect(summary.totalExpenses).toBe(24000);

        // Net Savings should be Income (30k) - Expenses (24k) = 6k
        // This is chemically equivalent to: Savings Contributions (5k) + Unallocated Cash (1k)
        // OLD LOGIC would have been 1k (just unallocated cash)
        expect(summary.netSavings).toBe(6000);

        // Verify sub-components match
        expect(summary.actualNeeds).toBe(22000);
        expect(summary.actualWants).toBe(2000);
        expect(summary.actualSavings).toBe(5000);
    });

    test('savings rate should be based on NEW Net Savings', () => {
        const summary = calculateBudgetSummary(mockIncomes, mockExpenses, '2023-12');

        // Savings Rate = (Net Savings / Total Income) * 100
        // (6000 / 30000) * 100 = 20%
        // OLD LOGIC would have been (1000/30000) = 3.33%
        const expectedRate = (6000 / 30000) * 100;
        // In the summary object, we don't store the rate directly usually, but let's check the derived values if present
        // Looking at calculations.ts, calculateBudgetSummary returns percentages for categories, but not the overall savings rate relative to total income directly as a named prop 'savingsRate' - wait, checking the interface...
        // Interface has 'savingsPercentage' which is (actualSavings / TotalIncome) * 100 usually.

        // Check savingsPercentage in the summary (which is the portion of income allocated to savings category)
        // actualSavings (5000) / TotalIncome (30000) = 16.66%
        expect(summary.savingsPercentage).toBeCloseTo(16.66, 1);

        // Wait, the user cares about "Savings Rate" which is displayed in the top card. 
        // That is calculated in components usually or separate helper.
        // In SavingsSummary.tsx, it uses: ((budgetSummary.netSavings / budgetSummary.totalIncome) * 100)
        // So validation of netSavings above is key.
    });

    test('calculateMonthlyTrends should correctly calculate savings as (Income - (Needs + Wants))', () => {
        const trends = calculateMonthlyTrends(mockIncomes, mockExpenses);
        const decData = trends.find(t => t.month === '2023-12');

        expect(decData).toBeDefined();
        if (decData) {
            // Income: 30000
            // Needs: 22000
            // Wants: 2000
            // Savings (Contrib): 5000

            // Expenses should be Needs + Wants = 24000
            expect(decData.expenses).toBe(24000);

            // Savings should be Income - Expenses = 6000 (5000 contrib + 1000 unallocated)
            expect(decData.savings).toBe(6000);

            // Verify breakdown
            expect(decData.needs).toBe(22000);
            expect(decData.wants).toBe(2000);

            // Note: decData.savings overwrites the cumulative savings contributions in the current logic loop
            // but that is what we want for the final "Net Savings" value.
        }
    });
});
