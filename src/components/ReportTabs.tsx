import React, { useState } from 'react';
import BudgetOverview from './BudgetOverview';
import IncomeVsExpenses from './IncomeVsExpenses';
import './Dashboard.css';

type ReportTab = 'budget' | 'trends';

const ReportTabs: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ReportTab>('budget');

    return (
        <div className="card report-tabs-card">
            <div className="chart-tabs">
                <button
                    className={`tab-btn ${activeTab === 'budget' ? 'active' : ''}`}
                    onClick={() => setActiveTab('budget')}
                >
                    🎯 Budget Goal
                </button>
                <button
                    className={`tab-btn ${activeTab === 'trends' ? 'active' : ''}`}
                    onClick={() => setActiveTab('trends')}
                >
                    📈 Trends
                </button>
            </div>

            <div className="tab-content animate-fade-in">
                {activeTab === 'budget' ? (
                    <BudgetOverview standalone={false} />
                ) : (
                    <IncomeVsExpenses standalone={false} />
                )}
            </div>
        </div>
    );
};

export default ReportTabs;
