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

    it('generates correct under budget summary', () => {
        const result = generateMonthlySummary({
            currentMonth: '2023-01',
            budgetSummary: mockBudgetSummary,
            expenses: mockExpenses,
            categories: mockCategories,
            monthlyHistory: mockHistory
        });

        expect(result[0]).toContain('below your income');
        expect(result).toContain('You saved $800 less than the 20% target.');
        expect(result.some(r => r.includes('Travel'))).toBe(true);
        expect(result).toContain('Current savings rate is 4%.');
    });

    it('generates correct over budget summary', () => {
        const overBudget = { ...mockBudgetSummary, totalExpenses: 5500, actualWants: 3000 };
        const result = generateMonthlySummary({
            currentMonth: '2023-01',
            budgetSummary: overBudget,
            expenses: mockExpenses,
            categories: [],
            monthlyHistory: mockHistory
        });

        expect(result[0]).toContain('above your income');
        expect(result.some(r => r.includes('spent $1,500 more than planned on Wants'))).toBe(true);
    });

    it('detects falling savings trend', () => {
        const result = generateMonthlySummary({
            currentMonth: '2023-01',
            budgetSummary: mockBudgetSummary,
            expenses: mockExpenses,
            categories: [],
            monthlyHistory: mockHistory
        });
        // Prev savings rate: 1000/5000 = 20%. Current 4%.
        expect(result).toContain('Savings fell from 20% to 4%.');
    });
});
