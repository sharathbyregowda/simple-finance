import React, { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { generateYearlySummary } from '../utils/summary';
import { calculateYearlyTrends } from '../utils/calculations';

const YearlySummary: React.FC = () => {
    const { data, budgetSummary, monthlyTrends } = useFinance();

    // Only show for 'ALL' (yearly view)
    if (!data.currentMonth || !data.currentMonth.endsWith('-ALL')) {
        return null;
    }

    const year = data.currentMonth.split('-')[0];

    const summaryBullets = useMemo(() => {
        const yearlyHistory = calculateYearlyTrends(monthlyTrends);

        return generateYearlySummary({
            year,
            budgetSummary,
            expenses: data.expenses,
            categories: data.customCategories,
            yearlyHistory,
            currencyCode: data.currency
        });
    }, [year, budgetSummary, data.expenses, data.customCategories, data.currency, monthlyTrends]);

    if (summaryBullets.length === 0) {
        return null;
    }

    return (
        <div className="card animate-fade-in mb-8 border-l-4 border-l-purple-500">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>📅</span> Yearly Summary – {year}
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

export default YearlySummary;
