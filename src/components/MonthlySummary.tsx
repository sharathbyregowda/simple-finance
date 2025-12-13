import React, { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { generateMonthlySummary } from '../utils/summary';
import { calculateMonthlyTrends, formatMonth } from '../utils/calculations';

const MonthlySummary: React.FC = () => {
    const { data, budgetSummary } = useFinance();

    // Only show for specific months, not 'ALL'
    if (!data.currentMonth || data.currentMonth.endsWith('-ALL')) {
        return null;
    }

    const summaryBullets = useMemo(() => {
        // We need monthly history for trends
        // calculateMonthlyTrends gives us the array of MonthlyData
        const monthlyHistory = calculateMonthlyTrends(data.incomes, data.expenses);

        return generateMonthlySummary({
            currentMonth: data.currentMonth,
            budgetSummary,
            expenses: data.expenses,
            categories: data.customCategories,
            monthlyHistory
        });
    }, [data.currentMonth, budgetSummary, data.expenses, data.incomes]);

    if (summaryBullets.length === 0) {
        return null;
    }

    return (
        <div className="card animate-fade-in mb-8 border-l-4 border-l-primary">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>📝</span> Monthly Summary – {formatMonth(data.currentMonth)}
            </h3>
            <ul className="space-y-2 list-disc pl-5">
                {summaryBullets.map((bullet, index) => (
                    <li key={index} className="text-muted leading-relaxed">
                        {bullet}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MonthlySummary;
