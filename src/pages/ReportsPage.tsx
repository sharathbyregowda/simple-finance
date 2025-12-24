import React, { useState } from 'react';
import BudgetOverview from '../components/BudgetOverview';
import IncomeVsExpenses from '../components/IncomeVsExpenses';
import '../components/Dashboard.css';

type ReportType = 'budget' | 'trends' | 'savings';

const ReportsPage: React.FC = () => {
    const [activeReport, setActiveReport] = useState<ReportType>('budget');

    return (
        <div className="space-y-6">
            <header className="page-header">
                <h2 className="page-title">Reports & Analysis</h2>
                <p className="page-subtitle">Deep dive into your financial data.</p>
            </header>

            {/* Page-level Tabs */}
            <div className="tabs-container">
                <button
                    onClick={() => setActiveReport('budget')}
                    className={`tab-link ${activeReport === 'budget' ? 'active-budget' : ''}`}
                >
                    🎯 Budget Goal
                </button>
                <button
                    onClick={() => setActiveReport('trends')}
                    className={`tab-link ${activeReport === 'trends' ? 'active-trends' : ''}`}
                >
                    📈 Trends
                </button>
            </div>

            {/* Report Content */}
            <div className="animate-fade-in">
                {activeReport === 'budget' && (
                    <div className="card report-tabs-card">
                        {/* Reusing existing component but allowing it to expand */}
                        <BudgetOverview standalone={false} />
                    </div>
                )}

                {activeReport === 'trends' && (
                    <div className="card report-tabs-card">
                        <IncomeVsExpenses standalone={false} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportsPage;
