
import type { MonthlyData } from '../types';

export interface JourneyStats {
    totalIncome: number;
    totalNeeds: number;
    totalWants: number;
    totalSavings: number;
    needsPercentage: number;
    wantsPercentage: number;
    savingsPercentage: number;
}

export interface Persona {
    title: string;
    description: string;
    icon: string;
    color: string;
    recommendation: string;
}

export const calculateJourneyStats = (data: MonthlyData[], monthsCount: number = 6): JourneyStats => {
    // Get last N months
    const recentData = data.slice(-monthsCount);

    // Calculate CUMULATIVE sums
    const totals = recentData.reduce((acc, month) => ({
        income: acc.income + month.income,
        needs: acc.needs + month.needs,
        wants: acc.wants + month.wants,
        savings: acc.savings + month.savings
    }), { income: 0, needs: 0, wants: 0, savings: 0 });

    // Calculate percentages based on TOTAL income
    const safeIncome = totals.income || 1; // Avoid division by zero

    return {
        totalIncome: totals.income,
        totalNeeds: totals.needs,
        totalWants: totals.wants,
        totalSavings: totals.savings,
        needsPercentage: (totals.needs / safeIncome) * 100,
        wantsPercentage: (totals.wants / safeIncome) * 100,
        savingsPercentage: (totals.savings / safeIncome) * 100,
    };
};

export const getFinancialPersona = (stats: JourneyStats): Persona => {
    const { needsPercentage, wantsPercentage, savingsPercentage } = stats;

    // 1. Super Saver: Savings > 25%
    if (savingsPercentage >= 25) {
        return {
            title: 'Super Saver',
            description: 'You are crushing your savings goals! Your savings rate is well above the recommended 20%.',
            icon: '🚀',
            color: '#10B981', // Emerald
            recommendation: 'Consider investing your surplus savings for long-term growth.'
        };
    }

    // 2. Needs Heavy: Needs > 60%
    if (needsPercentage > 60) {
        return {
            title: 'Essentials Focused',
            description: 'A large portion of your income goes to necessities. This is common in high cost-of-living areas.',
            icon: '🏠',
            color: '#F59E0B', // Amber
            recommendation: 'Review your fixed costs. Can any bills be negotiated? Ensure you have an emergency fund.'
        };
    }

    // 3. Wants Heavy: Wants > 40%
    if (wantsPercentage > 40) {
        return {
            title: 'Life Enjoyer',
            description: 'You are spending more on lifestyle choices than recommended. While fun, it may impact future goals.',
            icon: '🎉',
            color: '#A855F7', // Purple
            recommendation: 'Try the "24-hour rule" for non-essential purchases to reduce impulse buying.'
        };
    }

    // 4. Balanced (Default fallback)
    return {
        title: 'Balanced Builder',
        description: 'You are keeping a steady balance close to the 50/30/20 rule. Great stability!',
        icon: '⚖️',
        color: '#3B82F6', // Blue
        recommendation: 'You are on a good path. Look for small optimizations to boost saving slightly.'
    };
};
