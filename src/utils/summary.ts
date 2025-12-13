import type { BudgetSummary, Expense, MonthlyData } from '../types';
import { calculateCategoryBreakdown, formatCurrency } from './calculations';

interface SummaryInput {
    currentMonth: string;
    budgetSummary: BudgetSummary;
    expenses: Expense[];
    categories: import('../types').CustomCategory[];
    monthlyHistory: MonthlyData[]; // Sorted chronological
    currencyCode: string;
}

export const generateMonthlySummary = (input: SummaryInput): string[] => {
    const { currentMonth, budgetSummary, expenses, categories, monthlyHistory, currencyCode } = input;
    const bullets: string[] = [];

    const format = (amount: number) => formatCurrency(amount, currencyCode, { maximumFractionDigits: 0 });

    // 1. Overall Outcome
    // Plan = Income. (Or 50/30/20 sum which is income).
    const difference = budgetSummary.totalExpenses - budgetSummary.totalIncome;
    const isOver = difference > 0;

    if (isOver) {
        bullets.push(`Total spending was ${format(difference)} above your income.`);
    } else {
        bullets.push(`Total spending was ${format(Math.abs(difference))} below your income.`);
    }

    // 2. Needs / Wants / Savings comparison
    const checkVariance = (actual: number, recommended: number, name: string) => {
        const diff = actual - recommended;
        // Threshold: only mention if variance is > 5% of recommended or > 100 currency units
        if (Math.abs(diff) > (recommended * 0.05) || Math.abs(diff) > 100) {
            if (diff > 0) {
                if (name === 'Savings') {
                    // "Spent more on Savings" is confusing. It means you saved more.
                    bullets.push(`Savings exceeded plan by ${format(diff)}.`);
                } else {
                    bullets.push(`You spent ${format(diff)} more than planned on ${name}.`);
                }
            } else if (name === 'Savings') {
                bullets.push(`You saved ${format(Math.abs(diff))} less than the 20% target.`);
            } else {
                bullets.push(`You spent ${format(Math.abs(diff))} less than planned on ${name}.`);
            }
        }
    };

    checkVariance(budgetSummary.actualNeeds, budgetSummary.recommendedNeeds, 'Needs');
    checkVariance(budgetSummary.actualWants, budgetSummary.recommendedWants, 'Wants');
    checkVariance(budgetSummary.actualSavings, budgetSummary.recommendedSavings, 'Savings');

    // 3. Top Drivers
    const breakdown = calculateCategoryBreakdown(expenses, categories, currentMonth);
    const topCategories = breakdown.sort((a, b) => b.amount - a.amount).slice(0, 2);

    if (topCategories.length > 0 && budgetSummary.totalExpenses > 0) {
        const names = topCategories.map(c => c.categoryName).join(' and ');
        const totalTop = topCategories.reduce((sum, c) => sum + c.amount, 0);
        const pct = Math.round((totalTop / budgetSummary.totalExpenses) * 100);
        if (!isNaN(pct)) {
            bullets.push(`${names} made up ${pct}% of total spending.`);
        }
    }

    // 4. Savings Health & 5. Trends
    // Collect trend bullets first to determine redundancy
    const trendBullets: string[] = [];
    const currentIndex = monthlyHistory.findIndex(m => m.month === currentMonth);

    if (currentIndex >= 2) {
        const m1 = monthlyHistory[currentIndex];
        const m2 = monthlyHistory[currentIndex - 1];
        const m3 = monthlyHistory[currentIndex - 2];
        const getVal = (m: MonthlyData, type: 'needs' | 'wants' | 'savings') => m[type];

        // Check increasing expenses
        ['needs', 'wants'].forEach(type => {
            const v1 = getVal(m1, type as any);
            const v2 = getVal(m2, type as any);
            const v3 = getVal(m3, type as any);
            if (v1 > v2 && v2 > v3) {
                const name = type.charAt(0).toUpperCase() + type.slice(1);
                trendBullets.push(`${name} spending has increased for three consecutive months.`);
            }
        });

        // Check decreasing savings
        if (m1.savings < m2.savings && m2.savings < m3.savings) {
            trendBullets.push(`Savings have decreased for three consecutive months.`);
        }
    }

    // Savings Health
    const currentSavingsRate = Math.round(budgetSummary.savingsPercentage);
    let prevSavingsRate = 0;
    if (currentIndex > 0) {
        const prev = monthlyHistory[currentIndex - 1];
        if (prev.income > 0) {
            prevSavingsRate = Math.round((prev.savings / prev.income) * 100);
        }
    }

    // Only show current rate if no trend about savings decrease/increase (or always show but handle redundancy)
    let savingsChangeMsg = '';
    if (currentIndex > 0) {
        const diff = currentSavingsRate - prevSavingsRate;
        if (Math.abs(diff) >= 1) {
            savingsChangeMsg = `Savings ${diff > 0 ? 'rose' : 'fell'} from ${prevSavingsRate}% to ${currentSavingsRate}%.`;
        }
    }

    if (savingsChangeMsg) {
        bullets.push(savingsChangeMsg);
    } else {
        bullets.push(`Current savings rate is ${currentSavingsRate}%.`);
    }

    // Add trends
    bullets.push(...trendBullets);

    // Cap at 6-7 bullets (User said 6-7 max)
    return bullets.slice(0, 7);
};
