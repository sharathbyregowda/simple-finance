import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

import { formatCurrency } from '../utils/calculations';
import './Dashboard.css';

interface BudgetOverviewProps {
    standalone?: boolean;
}

const BudgetOverview: React.FC<BudgetOverviewProps> = ({ standalone = true }) => {
    const { budgetSummary, data } = useFinance();

    const chartData = [
        { name: 'Needs', value: budgetSummary.actualNeeds, color: '#F59E0B', recommended: budgetSummary.recommendedNeeds },
        { name: 'Wants', value: budgetSummary.actualWants, color: '#A855F7', recommended: budgetSummary.recommendedWants },
        { name: 'Savings', value: budgetSummary.actualSavings, color: '#10B981', recommended: budgetSummary.recommendedSavings },
    ];

    const content = (
        <>
            {standalone && <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>50/30/20 Budget Overview</h3>}

            <div className="budget-chart-container">
                {budgetSummary.actualNeeds + budgetSummary.actualWants + budgetSummary.actualSavings > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number) => `$${value.toLocaleString()}`}
                                contentStyle={{
                                    background: 'rgba(30, 41, 59, 0.9)',
                                    border: '1px solid #334155',
                                    borderRadius: '8px',
                                    color: '#F1F5F9',
                                }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex flex-col items-center justify-center" style={{ height: '220px', color: 'var(--text-secondary)' }}>
                        <div style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            border: '8px solid var(--bg-secondary)',
                            marginBottom: 'var(--spacing-sm)'
                        }}></div>
                        <p>No expenses yet</p>
                    </div>
                )}
            </div>

            <div className="budget-grid">
                {/* Needs */}
                <div className="budget-item-compact">
                    <div className="budget-item-header-compact">
                        <div className="flex items-center gap-xs">
                            <div className="budget-color-dot" style={{ background: '#F59E0B' }}></div>
                            <span>Needs</span>
                        </div>
                        <span className={`text-xs font-medium ${budgetSummary.needsStatus === 'over' ? 'text-error' : 'text-success'}`}>
                            {Math.round((budgetSummary.actualNeeds / budgetSummary.recommendedNeeds) * 100)}%
                        </span>
                    </div>
                    <div className="budget-progress-compact">
                        <div
                            className="budget-progress-bar-compact"
                            style={{
                                width: `${Math.min((budgetSummary.actualNeeds / budgetSummary.recommendedNeeds) * 100, 100)}%`,
                                backgroundColor: '#F59E0B'
                            }}
                        ></div>
                    </div>
                    <div className="text-xs text-muted flex justify-between">
                        <span>Actual: {formatCurrency(budgetSummary.actualNeeds, data.currency)}</span>
                        <span>Target: {formatCurrency(budgetSummary.recommendedNeeds, data.currency)}</span>
                    </div>
                </div>

                {/* Wants */}
                <div className="budget-item-compact">
                    <div className="budget-item-header-compact">
                        <div className="flex items-center gap-xs">
                            <div className="budget-color-dot" style={{ background: '#A855F7' }}></div>
                            <span>Wants</span>
                        </div>
                        <span className={`text-xs font-medium ${budgetSummary.wantsStatus === 'over' ? 'text-error' : 'text-success'}`}>
                            {Math.round((budgetSummary.actualWants / budgetSummary.recommendedWants) * 100)}%
                        </span>
                    </div>
                    <div className="budget-progress-compact">
                        <div
                            className="budget-progress-bar-compact"
                            style={{
                                width: `${Math.min((budgetSummary.actualWants / budgetSummary.recommendedWants) * 100, 100)}%`,
                                backgroundColor: '#A855F7'
                            }}
                        ></div>
                    </div>
                    <div className="text-xs text-muted flex justify-between">
                        <span>Actual: {formatCurrency(budgetSummary.actualWants, data.currency)}</span>
                        <span>Target: {formatCurrency(budgetSummary.recommendedWants, data.currency)}</span>
                    </div>
                </div>

                {/* Savings */}
                <div className="budget-item-compact">
                    <div className="budget-item-header-compact">
                        <div className="flex items-center gap-xs">
                            <div className="budget-color-dot" style={{ background: '#10B981' }}></div>
                            <span>Savings</span>
                        </div>
                        <span className={`text-xs font-medium ${budgetSummary.savingsStatus === 'under' ? 'text-warning' : 'text-success'}`}>
                            {Math.round((budgetSummary.actualSavings / budgetSummary.recommendedSavings) * 100)}%
                        </span>
                    </div>
                    <div className="budget-progress-compact">
                        <div
                            className="budget-progress-bar-compact"
                            style={{
                                width: `${Math.min((budgetSummary.actualSavings / budgetSummary.recommendedSavings) * 100, 100)}%`,
                                backgroundColor: '#10B981'
                            }}
                        ></div>
                    </div>
                    <div className="text-xs text-muted flex justify-between">
                        <span>Actual: {formatCurrency(budgetSummary.actualSavings, data.currency)}</span>
                        <span>Target: {formatCurrency(budgetSummary.recommendedSavings, data.currency)}</span>
                    </div>
                </div>
            </div>
        </>
    );

    if (!standalone) {
        return content;
    }

    return (
        <div className="card budget-overview-card">
            {content}
        </div>
    );
};

export default BudgetOverview;
