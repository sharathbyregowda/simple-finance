
import { calculateJourneyStats, getFinancialPersona } from './journey';
import { MonthlyData } from '../types';

describe('Financial Journey Logic', () => {
    const mockData: MonthlyData[] = [
        { month: '2024-01', income: 1000, expenses: 500, needs: 500, wants: 0, savings: 500 }, // 50% needs, 50% savings
        { month: '2024-02', income: 3000, expenses: 1500, needs: 500, wants: 1000, savings: 1500 }, // 16% needs, 33% wants, 50% savings
        { month: '2024-03', income: 2000, expenses: 1000, needs: 1000, wants: 0, savings: 1000 }, // 50% needs, 50% savings
    ];
    // Total Income: 6000
    // Total Needs: 2000 (33.3%)
    // Total Wants: 1000 (16.6%)
    // Total Savings: 3000 (50%)

    test('should calculate cumulative statistics correctly', () => {
        const stats = calculateJourneyStats(mockData);

        expect(stats.needsPercentage).toBeCloseTo(33.3, 1);
        expect(stats.wantsPercentage).toBeCloseTo(16.67, 1);
        expect(stats.savingsPercentage).toBeCloseTo(50.0, 1);
    });

    test('should determine correct persona based on stats', () => {
        // High savings (>20%) -> Saver
        let stats = calculateJourneyStats(mockData);
        expect(getFinancialPersona(stats).title).toBe('Super Saver');

        // High wants
        const wantsData: MonthlyData[] = [
            { month: '1', income: 1000, expenses: 0, needs: 200, wants: 700, savings: 100 }
        ];
        // Wants 70%
        stats = calculateJourneyStats(wantsData);
        expect(getFinancialPersona(stats).title).toBe('Life Enjoyer'); // or similar
    });

    test('should handle empty data', () => {
        const stats = calculateJourneyStats([]);
        expect(stats.totalIncome).toBe(0);
        expect(stats.needsPercentage).toBe(0);
    });
});
