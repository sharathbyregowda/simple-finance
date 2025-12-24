import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { calculateMonthlyTrends } from '../utils/calculations';
import MonthlySummary from '../components/MonthlySummary';
import YearlySummary from '../components/YearlySummary';
import SavingsSummary from '../components/SavingsSummary';
import IfThisContinues from '../components/IfThisContinues';
import FinancialJourney from '../components/FinancialJourney';
import SavingsGoalCalculator from '../components/SavingsGoalCalculator';
import '../components/Dashboard.css';

const DashboardPage: React.FC = () => {
    const { data, budgetSummary } = useFinance();
    const isYearly = data.currentMonth.endsWith('-ALL');
    const [projectionTab, setProjectionTab] = useState<'forecast' | 'goal'>('forecast');

    return (
        <div className="space-y-6">
            <header className="page-header">
                <h2 className="page-title">Dashboard</h2>
                <p className="page-subtitle">Your financial health at a glance.</p>
            </header>

            <div className="dashboard-grid">
                {/* 1. Savings Summary Cards (Top Priority as requested) */}
                <SavingsSummary />

                {/* 2. Monthly/Yearly Summary Text */}
                <div className="monthly-summary-container">
                    <MonthlySummary />
                    <YearlySummary />
                </div>

                {/* 3. Projections & Goals (Tabbed Container) */}
                {!isYearly && (
                    <div className="projections-container card" style={{ padding: '0' }}>
                        <div className="tabs-container" style={{ margin: 0, padding: '0 var(--spacing-lg)', borderBottom: '1px solid var(--border-color)' }}>
                            <button
                                onClick={() => setProjectionTab('forecast')}
                                className={`tab-link ${projectionTab === 'forecast' ? 'active-trends' : ''}`} // Reusing active-trends color for forecast
                                style={{ paddingTop: '1rem', paddingBottom: '1rem' }}
                            >
                                🔮 Forecast
                            </button>
                            <button
                                onClick={() => setProjectionTab('goal')}
                                className={`tab-link ${projectionTab === 'goal' ? 'active-savings' : ''}`} // Reusing active-savings color
                                style={{ paddingTop: '1rem', paddingBottom: '1rem' }}
                            >
                                🎯 Goal Calculator
                            </button>
                        </div>

                        <div style={{ padding: 'var(--spacing-lg)' }}>
                            {projectionTab === 'forecast' ? (
                                <IfThisContinues />
                            ) : (
                                <SavingsGoalCalculator />
                            )}
                        </div>
                    </div>
                )}

                {/* Financial Journey (Yearly Only) */}
                {isYearly && (
                    <>
                        <div className="financial-journey-container">
                            <FinancialJourney
                                data={calculateMonthlyTrends(data.incomes, data.expenses)}
                                expenses={data.expenses}
                                categories={data.customCategories}
                                currentMonth={data.currentMonth}
                                budgetSummary={budgetSummary}
                                cashBalance={budgetSummary.unallocatedCash}
                            />
                        </div>
                        {/* We can show the projection tabs for Yearly too, but IfThisContinues might handle it differently. 
                             Assuming standard behavior is desired. Keeping consistent with previous logic where it was !isYearly only for projections?
                             Actually, Calculator works for any context if logic supports it. 
                             IfThisContinues component may expect monthly data. 
                             Based on original code: !isYearly && (projections). 
                             So keeping that condition for the container. 
                          */}
                        <div className="projections-container card">
                            <IfThisContinues />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;
