
import React from 'react';
import { calculateJourneyStats, getFinancialPersona } from '../utils/journey';
import type { MonthlyData } from '../types';

interface FinancialJourneyProps {
    data: MonthlyData[];
}

const FinancialJourney: React.FC<FinancialJourneyProps> = ({ data }) => {
    // Only show if we have more than 3 months of data (user requirement)
    if (!data || data.length < 3) {
        return null;
    }

    const stats = calculateJourneyStats(data);
    const persona = getFinancialPersona(stats);

    const StatBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
        <div className="flex flex-col gap-1 flex-1">
            <div className="flex justify-between text-xs text-muted">
                <span>{label}</span>
                <span>{Math.round(value)}%</span>
            </div>
            <div className="h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                <div
                    className="h-full transition-all duration-500"
                    style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }}
                />
            </div>
        </div>
    );

    return (
        <div className="card financial-journey-card mt-6">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        Details of your Financial Journey
                    </h3>
                    <p className="text-sm text-muted mt-1">Based on your activity over the last {data.length} months</p>
                </div>
                <div className="text-3xl" role="img" aria-label="Persona Icon">{persona.icon}</div>
            </div>

            <div className="p-4 rounded-lg bg-[var(--bg-secondary)] mb-6 border border-[var(--border-color)]" style={{ borderColor: persona.color }}>
                <h4 className="font-bold text-lg mb-1" style={{ color: persona.color }}>{persona.title}</h4>
                <p className="text-sm mb-2">{persona.description}</p>
                <div className="flex items-center gap-2 text-xs opacity-80">
                    <span>💡</span>
                    <span className="italic">{persona.recommendation}</span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <StatBar label="Avg Needs" value={stats.needsPercentage} color="#F59E0B" />
                <StatBar label="Avg Wants" value={stats.wantsPercentage} color="#A855F7" />
                <StatBar label="Avg Savings" value={stats.savingsPercentage} color="#10B981" />
            </div>
        </div>
    );
};

export default FinancialJourney;
