import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAnalysisMonths, calculateProjections } from './projections';
import { MonthlyData } from '../types';

describe('Projection Logic', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2023-07-15')); // Current month is July
    });

    const mockHistory: MonthlyData[] = [
        { month: '2023-01', income: 1000, expenses: 800, savings: 200, needs: 500, wants: 300 },
        { month: '2023-02', income: 1000, expenses: 900, savings: 100, needs: 600, wants: 300 },
        { month: '2023-03', income: 1000, expenses: 700, savings: 300, needs: 400, wants: 300 },
        { month: '2023-04', income: 1000, expenses: 800, savings: 200, needs: 500, wants: 300 },
        { month: '2023-05', income: 1000, expenses: 1100, savings: -100, needs: 800, wants: 300 },
        { month: '2023-06', income: 1000, expenses: 900, savings: 100, needs: 600, wants: 300 },
        { month: '2023-07', income: 1000, expenses: 500, savings: 500, needs: 200, wants: 300 }, // Current month (partial)
    ];

    it('getAnalysisMonths excludes selected month and limits to 6', () => {
        const analysis = getAnalysisMonths(mockHistory, '2023-07');
        expect(analysis).toHaveLength(6);
        expect(analysis[0].month).toBe('2023-06');
        expect(analysis[5].month).toBe('2023-01');
        expect(analysis.some(m => m.month === '2023-07')).toBe(false);
    });

    it('getAnalysisMonths shifts analysis window based on selected month', () => {
        const analysis = getAnalysisMonths(mockHistory, '2023-04');
        // Should only see months before April: Mar, Feb, Jan
        expect(analysis).toHaveLength(3);
        expect(analysis[0].month).toBe('2023-03');
        expect(analysis[2].month).toBe('2023-01');
    });

    it('getAnalysisMonths excludes months with zero income', () => {
        const historyWithZero = [
            ...mockHistory,
            { month: '2022-12', income: 0, expenses: 200, savings: -200, needs: 100, wants: 100 },
        ];
        const analysis = getAnalysisMonths(historyWithZero, '2023-07');
        expect(analysis.some(m => m.month === '2022-12')).toBe(false);
    });

    it('calculateProjections returns null if fewer than 3 months exist', () => {
        const sparseHistory = mockHistory.slice(0, 2);
        const result = calculateProjections(sparseHistory, [], []);
        expect(result).toBeNull();
    });

    it('calculateProjections computes correct averages and 12-month projection', () => {
        // Use first 3 months: Jan (200), Feb (100), Mar (300)
        // Avg savings = (200 + 100 + 300) / 3 = 200
        // Yearly = 200 * 12 = 2400
        const analysis = mockHistory.slice(0, 3);
        const result = calculateProjections(analysis, [], []);

        expect(result?.averageSavings).toBe(200);
        expect(result?.yearlyProjection).toBe(2400);
        expect(result?.headline).toBe('Savings grow by ~##AMOUNT##.');
    });

    it('calculateProjections handles top categories and time metrics', () => {
        const history: MonthlyData[] = [
            { month: '2023-01', income: 4000, expenses: 3000, savings: 1000, needs: 2000, wants: 1000 },
            { month: '2023-02', income: 4000, expenses: 3000, savings: 1000, needs: 2000, wants: 1000 },
            { month: '2023-03', income: 4000, expenses: 3000, savings: 1000, needs: 2000, wants: 1000 },
        ];
        const categories = [{ id: 'c1', name: 'Rent', icon: '🏠', type: 'needs' }];
        const expenses: any[] = [
            { id: '1', amount: 500, description: 'Rent payment', month: '2023-01', categoryId: 'c1', categoryType: 'needs' },
        ];

        // Projected savings = 1000 * 12 = 12000
        // Avg expenses = 3000
        // Months covered = 12000 / 3000 = 4 months
        // Rent = (500 + 0 + 0) / 3 = 166.66
        const result = calculateProjections(history, expenses, categories as any);

        expect(result?.timeMetrics.monthsOfLivingExpenses).toBe(4);
        expect(result?.timeMetrics.topCategoriesCovered[0].name).toBe('Rent');
        expect(result?.timeMetrics.topCategoriesCovered[0].monthsCovered).toBeGreaterThan(70); // 12000 / 166.66
    });

    it('calculateProjections handles deficit (spending > income)', () => {
        const deficitHistory: MonthlyData[] = [
            { month: '2023-01', income: 1000, expenses: 1200, savings: -200, needs: 800, wants: 400 },
            { month: '2023-02', income: 1000, expenses: 1100, savings: -100, needs: 700, wants: 400 },
            { month: '2023-03', income: 1000, expenses: 1300, savings: -300, needs: 900, wants: 400 },
        ];
        const result = calculateProjections(deficitHistory, [], []);

        expect(result?.averageSavings).toBe(-200);
        expect(result?.yearlyProjection).toBe(-2400);
        expect(result?.headline).toBe('Spending exceeds income by ~##AMOUNT##.');
        expect(result?.timeMetrics.monthsOfLivingExpenses).toBe(0); // No buffer if deficit
        expect(result?.timeMetrics.topCategoriesCovered).toHaveLength(0);
    });
});
