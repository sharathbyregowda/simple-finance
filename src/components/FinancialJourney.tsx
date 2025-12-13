
import React, { useMemo } from 'react';
import { getFinancialPersona } from '../utils/journey';
import { calculateCategoryBreakdown } from '../utils/calculations';
import type { MonthlyData, Expense, CustomCategory, BudgetSummary } from '../types';

interface FinancialJourneyProps {
    data: MonthlyData[];
    expenses: Expense[];
    categories: CustomCategory[];
    currentMonth: string;
    budgetSummary: BudgetSummary;
    cashBalance: number;
}

const FinancialJourney: React.FC<FinancialJourneyProps> = ({ data, expenses, categories, currentMonth, budgetSummary, cashBalance }) => {
    // Only show if we have more than 3 months of data (user requirement)
    if (!data || data.length < 3) {
        return null;
    }

    // Use pre-calculated stats from BudgetSummary (Source of Truth for the selected period)
    const stats = {
        totalIncome: budgetSummary.totalIncome,
        totalNeeds: budgetSummary.actualNeeds,
        totalWants: budgetSummary.actualWants,
        totalSavings: budgetSummary.actualSavings,
        needsPercentage: budgetSummary.needsPercentage || 0,
        wantsPercentage: budgetSummary.wantsPercentage || 0,
        savingsPercentage: budgetSummary.savingsPercentage || 0
    };

    const persona = useMemo(() => getFinancialPersona(stats), [stats]);

    const topCategories = useMemo(() => {
        const breakdown = calculateCategoryBreakdown(expenses, categories, currentMonth);
        const getTop3 = (type: string) => {
            return breakdown
                .filter(item => item.categoryType === type)
                .sort((a, b) => b.total - a.total)
                .slice(0, 3);
        };
        return {
            needs: getTop3('needs'),
            wants: getTop3('wants'),
            savings: getTop3('savings'),
        };
    }, [expenses, categories, currentMonth]);

    const safeRound = (val: number) => isNaN(val) ? 0 : Math.round(val);
    const ratioString = `${safeRound(stats.needsPercentage)}/${safeRound(stats.wantsPercentage)}/${safeRound(stats.savingsPercentage)}`;

    // Column Card Component based on Wireframe
    const CategoryColumn = ({ title, target, current, items, color, bgClass }: { title: string, target: number, current: number, items: typeof topCategories.needs, color: string, bgClass: string }) => (
        <div className={`flex flex-col h-full rounded-xl overflow-hidden border border-[var(--border-color)] ${bgClass} transition-colors duration-300`}>
            {/* Header */}
            <div className="p-4 border-b border-black/5 dark:border-white/5 text-center">
                <h4 className="font-bold text-lg tracking-wide">{title}</h4>
            </div>

            {/* Stats: Target vs Current */}
            <div className="p-6 flex flex-col items-center gap-4">
                <div className="flex w-full justify-between items-center px-2">
                    <div className="flex flex-col items-center">
                        <span className="text-xs uppercase tracking-wider opacity-60 font-semibold mb-1">Target</span>
                        <span className="text-xl font-medium opacity-80">{target}%</span>
                    </div>
                    <div className="w-px h-10 bg-[var(--border-color)] opacity-50"></div>
                    <div className="flex flex-col items-center">
                        <span className="text-xs uppercase tracking-wider opacity-60 font-semibold mb-1">Current</span>
                        <span className="text-3xl font-bold" style={{ color }}>{safeRound(current)}%</span>
                    </div>
                </div>

                {/* Progress Bar visual context */}
                <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden mt-2">
                    <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(current, 100)}%`, backgroundColor: color }}
                    />
                </div>
            </div>

            {/* Top Contributors List */}
            <div className="p-5 pt-0 flex-grow">
                <p className="text-xs text-center uppercase tracking-wider opacity-50 font-semibold mb-4">Top Contributors</p>
                <div className="space-y-3">
                    {items.length > 0 ? (
                        items.map(item => (
                            <div key={item.categoryId} className="flex justify-between items-center text-sm">
                                <span className="flex items-center gap-2 truncate opacity-90 min-w-0">
                                    <span className="opacity-70 shrink-0">{item.categoryIcon}</span>
                                    <span className="truncate">{item.categoryName}</span>
                                </span>
                                <span className="font-mono font-medium opacity-75 shrink-0">{safeRound(item.percentage)}%</span>
                            </div>
                        ))
                    ) : (
                        <div className="text-sm opacity-40 text-center italic py-4">No data</div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="card financial-journey-card mt-8 p-0 border-none shadow-none bg-transparent">
            {/* Header Section */}
            <div className="mb-8 pl-1">
                <h3 className="text-2xl font-bold flex items-center gap-2 mb-1">
                    <span>🏔️</span> Your Financial Journey
                </h3>
                <p className="text-muted text-sm">
                    Based on {data.length} months data your budget ratio is <span className="font-mono font-semibold text-[var(--text-primary)]">{ratioString}</span> (needs/wants/savings).
                </p>

                {/* Persona & Recommendation */}
                <div className="mt-4 flex flex-col gap-2">
                    {/* Inline Icon & Title */}
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{persona.icon}</span>
                        <h4 className="font-bold text-lg" style={{ color: persona.color }}>{persona.title}</h4>
                    </div>

                    <p className="text-sm opacity-90 max-w-2xl leading-relaxed">
                        {persona.description}
                    </p>

                    {/* Conditional Recommendation */}
                    {cashBalance > 100 && (
                        <div className="flex items-start gap-2 mt-1 text-xs opacity-80 max-w-xl">
                            <span className="shrink-0 mt-0.5">💡</span>
                            <span className="italic">{persona.recommendation} Consider investing your surplus cash for long-term growth.</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 3-Column Grid - FORCED 3 COLUMNS */}
            <div className="grid grid-cols-3 gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <CategoryColumn
                    title="Needs"
                    target={50}
                    current={stats.needsPercentage}
                    items={topCategories.needs}
                    color="#0ea5e9" // Sky blue 
                    bgClass="bg-[var(--color-bg-secondary)]"
                />
                <CategoryColumn
                    title="Wants"
                    target={30}
                    current={stats.wantsPercentage}
                    items={topCategories.wants}
                    color="#8b5cf6" // Violet
                    bgClass="bg-[var(--color-bg-secondary)]"
                />
                <CategoryColumn
                    title="Savings"
                    target={20}
                    current={stats.savingsPercentage}
                    items={topCategories.savings}
                    color="#10b981" // Emerald
                    bgClass="bg-[var(--color-bg-secondary)]"
                />
            </div>
        </div>
    );
};

export default FinancialJourney;
