import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';
import './Dashboard.css';

const BudgetOverview: React.FC = () => {
    const { budgetSummary, data } = useFinance();

    const chartData = [
        { name: 'Needs', value: budgetSummary.actualNeeds, color: '#F59E0B', recommended: budgetSummary.recommendedNeeds },
        { name: 'Wants', value: budgetSummary.actualWants, color: '#A855F7', recommended: budgetSummary.recommendedWants },
        { name: 'Savings', value: budgetSummary.actualSavings, color: '#10B981', recommended: budgetSummary.recommendedSavings },
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'over':
                return <AlertCircle size={18} className="text-error" />;
            case 'under':
                return <TrendingDown size={18} className="text-warning" />;
            default:
                return <TrendingUp size={18} className="text-success" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'over':
                return 'Over Budget';
            case 'under':
                return 'Under Budget';
            default:
                return 'On Track';
        }
    };

    return (
        <div className="card budget-overview-card">
            <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>50/30/20 Budget Overview</h3>

            <div className="budget-chart-container">
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
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
            </div>

            <div className="budget-breakdown">
                <div className="budget-category">
                    <div className="budget-category-header">
                        <div className="budget-category-title">
                            <div className="budget-color-dot" style={{ background: '#F59E0B' }}></div>
                            <span>Needs (50%)</span>
                        </div>
                        <div className="budget-status">
                            {getStatusIcon(budgetSummary.needsStatus)}
                            <span className={`status-text ${budgetSummary.needsStatus}`}>
                                {getStatusText(budgetSummary.needsStatus)}
                            </span>
                        </div>
                    </div>
                    <div className="budget-progress-bar">
                        <div
                            className="budget-progress-fill needs"
                            style={{
                                width: `${Math.min((budgetSummary.actualNeeds / budgetSummary.recommendedNeeds) * 100, 100)}%`,
                            }}
                        ></div>
                    </div>
                    <div className="budget-amounts">
                        <span>{formatCurrency(budgetSummary.actualNeeds, data.currency)} spent</span>
                        <span className="text-muted">of {formatCurrency(budgetSummary.recommendedNeeds, data.currency)}</span>
                    </div>
                </div>

                <div className="budget-category">
                    <div className="budget-category-header">
                        <div className="budget-category-title">
                            <div className="budget-color-dot" style={{ background: '#A855F7' }}></div>
                            <span>Wants (30%)</span>
                        </div>
                        <div className="budget-status">
                            {getStatusIcon(budgetSummary.wantsStatus)}
                            <span className={`status-text ${budgetSummary.wantsStatus}`}>
                                {getStatusText(budgetSummary.wantsStatus)}
                            </span>
                        </div>
                    </div>
                    <div className="budget-progress-bar">
                        <div
                            className="budget-progress-fill wants"
                            style={{
                                width: `${Math.min((budgetSummary.actualWants / budgetSummary.recommendedWants) * 100, 100)}%`,
                            }}
                        ></div>
                    </div>
                    <div className="budget-amounts">
                        <span>{formatCurrency(budgetSummary.actualWants, data.currency)} spent</span>
                        <span className="text-muted">of {formatCurrency(budgetSummary.recommendedWants, data.currency)}</span>
                    </div>
                </div>

                <div className="budget-category">
                    <div className="budget-category-header">
                        <div className="budget-category-title">
                            <div className="budget-color-dot" style={{ background: '#10B981' }}></div>
                            <span>Savings (20%)</span>
                        </div>
                        <div className="budget-status">
                            {getStatusIcon(budgetSummary.savingsStatus)}
                            <span className={`status-text ${budgetSummary.savingsStatus}`}>
                                {getStatusText(budgetSummary.savingsStatus)}
                            </span>
                        </div>
                    </div>
                    <div className="budget-progress-bar">
                        <div
                            className="budget-progress-fill savings"
                            style={{
                                width: `${Math.min((budgetSummary.actualSavings / budgetSummary.recommendedSavings) * 100, 100)}%`,
                            }}
                        ></div>
                    </div>
                    <div className="budget-amounts">
                        <span>{formatCurrency(budgetSummary.actualSavings, data.currency)} saved</span>
                        <span className="text-muted">of {formatCurrency(budgetSummary.recommendedSavings, data.currency)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BudgetOverview;
