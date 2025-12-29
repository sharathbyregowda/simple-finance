import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Calculator, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import {
    calculateAverageMonthlyCashBalance,
    calculateGoalTimeline,
    formatCurrency,
    getCurrentMonth
} from '../utils/calculations';
import './Dashboard.css';

const STORAGE_KEY = 'goalPlannerState';

interface SavedState {
    goalName: string;
    goalAmount: string;
    startingBalance: string;
    hasCalculated: boolean;
    result: ReturnType<typeof calculateGoalTimeline> | null;
    avgCashBalance: number;
}

const GoalPlanner: React.FC = () => {
    const { data } = useFinance();

    // Form state
    const [goalName, setGoalName] = useState('');
    const [goalAmount, setGoalAmount] = useState('');
    const [startingBalance, setStartingBalance] = useState('0');
    const [hasCalculated, setHasCalculated] = useState(false);

    // Result state
    const [result, setResult] = useState<ReturnType<typeof calculateGoalTimeline> | null>(null);
    const [avgCashBalance, setAvgCashBalance] = useState<number>(0);

    // Load state from localStorage on mount
    useEffect(() => {
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState) {
            try {
                const parsed: SavedState = JSON.parse(savedState);
                setGoalName(parsed.goalName);
                setGoalAmount(parsed.goalAmount);
                setStartingBalance(parsed.startingBalance);
                setHasCalculated(parsed.hasCalculated);

                // Restore result with Date conversion
                if (parsed.result && parsed.result.completionDate) {
                    setResult({
                        ...parsed.result,
                        completionDate: new Date(parsed.result.completionDate as any)
                    });
                } else {
                    setResult(parsed.result);
                }

                setAvgCashBalance(parsed.avgCashBalance);
            } catch (e) {
                console.error('Error loading saved state:', e);
            }
        }
    }, []);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        const stateToSave: SavedState = {
            goalName,
            goalAmount,
            startingBalance,
            hasCalculated,
            result,
            avgCashBalance
        };
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        } catch (e) {
            console.error('Error saving state:', e);
        }
    }, [goalName, goalAmount, startingBalance, hasCalculated, result, avgCashBalance]);

    // Check eligibility: Need at least 3 completed months
    const currentMonth = getCurrentMonth();
    const completedMonths = Array.from(
        new Set([
            ...data.incomes.map(i => i.month),
            ...data.expenses.map(e => e.month)
        ])
    ).filter(m => m < currentMonth);

    const isEligible = completedMonths.length >= 3;

    const handleCalculate = (e: React.FormEvent) => {
        e.preventDefault();

        const goal = parseFloat(goalAmount);
        const starting = parseFloat(startingBalance);

        if (isNaN(goal) || goal <= 0) {
            alert('Please enter a valid goal amount greater than 0');
            return;
        }

        if (isNaN(starting) || starting < 0) {
            alert('Please enter a valid starting balance (0 or greater)');
            return;
        }

        // Calculate average monthly cash balance
        const avgBalance = calculateAverageMonthlyCashBalance(
            data.incomes,
            data.expenses,
            true // exclude current month
        );

        // Calculate timeline
        const timeline = calculateGoalTimeline(goal, starting, avgBalance);

        setAvgCashBalance(avgBalance);
        setResult(timeline);
        setHasCalculated(true);
    };

    const handleReset = () => {
        setGoalName('');
        setGoalAmount('');
        setStartingBalance('0');
        setHasCalculated(false);
        setResult(null);
        setAvgCashBalance(0);
    };

    return (
        <div className="card">
            <div className="flex items-center gap-3" style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="icon-wrapper" style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Calculator size={24} color="white" />
                </div>
                <div>
                    <h3 style={{ margin: 0 }}>Goal Planner</h3>
                    <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>
                        Estimate how long it takes to reach a goal using your real data
                    </p>
                </div>
            </div>

            {!isEligible ? (
                <div className="card" style={{
                    background: 'var(--bg-card-secondary)',
                    padding: 'var(--spacing-md)',
                    border: '1px solid var(--border-color)'
                }}>
                    <div className="flex items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <AlertCircle size={24} className="text-muted" />
                        <div>
                            <p className="text-muted" style={{ margin: 0 }}>
                                This calculator unlocks after 3 months of data.
                            </p>
                            <p className="text-sm text-muted" style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem' }}>
                                You currently have {completedMonths.length} completed month{completedMonths.length !== 1 ? 's' : ''}.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <form onSubmit={handleCalculate} className="space-y-4" style={{ marginBottom: 'var(--spacing-xl)' }}>
                        {/* Goal Name */}
                        <div className="form-group">
                            <label className="label">
                                Goal Name <span className="text-muted text-sm">(Optional)</span>
                            </label>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g., Summer holiday, Kitchen renovation, New phone"
                                value={goalName}
                                onChange={(e) => setGoalName(e.target.value.slice(0, 60))}
                                maxLength={60}
                            />
                        </div>

                        {/* Goal Amount */}
                        <div className="form-group">
                            <label className="label">Savings Goal Amount *</label>
                            <input
                                type="number"
                                className="input"
                                placeholder={`e.g., 5000`}
                                value={goalAmount}
                                onChange={(e) => setGoalAmount(e.target.value)}
                                step="0.01"
                                required
                            />
                        </div>

                        {/* Starting Balance */}
                        <div className="form-group">
                            <label className="label">
                                Starting Balance <span className="text-muted text-sm">(Optional)</span>
                            </label>
                            <input
                                type="number"
                                className="input"
                                placeholder="0"
                                value={startingBalance}
                                onChange={(e) => setStartingBalance(e.target.value)}
                                step="0.01"
                            />
                            <p className="text-sm text-muted" style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem' }}>
                                Include any existing savings toward this goal
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-sm">
                            <button type="submit" className="btn btn-primary">
                                <Calculator size={18} />
                                Calculate
                            </button>
                            {hasCalculated && (
                                <button type="button" className="btn btn-secondary" onClick={handleReset}>
                                    Reset
                                </button>
                            )}
                        </div>
                    </form>

                    {/* Results */}
                    {hasCalculated && result && (
                        <div className="card" style={{
                            background: result.isAchievable
                                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)'
                                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
                            border: result.isAchievable
                                ? '1px solid rgba(16, 185, 129, 0.3)'
                                : '1px solid rgba(239, 68, 68, 0.3)',
                            padding: 'var(--spacing-lg)'
                        }}>
                            {goalName && (
                                <h4 style={{ marginTop: 0, marginBottom: 'var(--spacing-md)' }}>
                                    "{goalName}"
                                </h4>
                            )}

                            {/* Primary Message */}
                            <p className="text-lg" style={{
                                fontSize: '1.125rem',
                                fontWeight: 500,
                                margin: '0 0 var(--spacing-lg) 0'
                            }}>
                                {result.message}
                            </p>

                            {/* Supporting Details */}
                            {result.isAchievable && result.months > 0 && (
                                <div className="space-y-2" style={{
                                    borderTop: '1px solid var(--border-color)',
                                    paddingTop: 'var(--spacing-md)',
                                    marginTop: 'var(--spacing-md)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.5rem'
                                }}>
                                    <div className="flex items-center gap-2 text-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <TrendingUp size={16} className="text-muted" />
                                        <span className="text-muted">Goal Amount:</span>
                                        <span className="font-medium">{formatCurrency(parseFloat(goalAmount), data.currency)}</span>
                                    </div>

                                    {parseFloat(startingBalance) > 0 && (
                                        <div className="flex items-center gap-2 text-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <TrendingUp size={16} className="text-muted" />
                                            <span className="text-muted">Starting Balance:</span>
                                            <span className="font-medium">{formatCurrency(parseFloat(startingBalance), data.currency)}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 text-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <TrendingUp size={16} className="text-muted" />
                                        <span className="text-muted">Average Monthly Cash Balance:</span>
                                        <span className="font-medium" style={{ color: avgCashBalance > 0 ? '#10b981' : '#ef4444' }}>
                                            {formatCurrency(avgCashBalance, data.currency)}
                                        </span>
                                    </div>

                                    {result.completionDate && (
                                        <div className="flex items-center gap-2 text-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Calendar size={16} className="text-muted" />
                                            <span className="text-muted">Estimated Completion:</span>
                                            <span className="font-medium">
                                                {result.completionDate.toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    )}

                                    {result.months > 120 && (
                                        <div className="flex items-center gap-2 text-sm" style={{
                                            marginTop: 'var(--spacing-md)',
                                            padding: 'var(--spacing-sm)',
                                            background: 'rgba(245, 158, 11, 0.1)',
                                            borderRadius: '6px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            <AlertCircle size={16} style={{ color: '#f59e0b' }} />
                                            <span style={{ color: '#f59e0b', fontSize: '0.8125rem' }}>
                                                This is a very long timeframe. Consider increasing your cash balance or reducing the goal amount.
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {!result.isAchievable && (
                                <div className="text-sm text-muted" style={{ marginTop: 'var(--spacing-md)' }}>
                                    <p style={{ margin: '0 0 0.5rem 0' }}>
                                        <strong>Tips to improve your cash balance:</strong>
                                    </p>
                                    <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                                        <li>Review and reduce unnecessary expenses (Wants category)</li>
                                        <li>Look for ways to increase your income</li>
                                        <li>Consider moving some savings contributions to later once you build cash reserves</li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default GoalPlanner;
