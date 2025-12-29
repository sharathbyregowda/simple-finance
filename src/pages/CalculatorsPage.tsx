import React from 'react';
import GoalPlanner from '../components/GoalPlanner';

const CalculatorsPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <header className="page-header">
                <h2 className="page-title">Calculators</h2>
                <p className="page-subtitle">Plan your financial goals using your real data</p>
            </header>

            <GoalPlanner />
        </div>
    );
};

export default CalculatorsPage;
