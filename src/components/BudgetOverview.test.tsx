import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import BudgetOverview from './BudgetOverview';
import { useFinance } from '../context/FinanceContext';
import type { BudgetSummary } from '../types';

// Mock dependencies
vi.mock('../context/FinanceContext');

describe('BudgetOverview', () => {
    const createMockData = (budgetOverrides?: Partial<BudgetSummary>) => ({
        budgetSummary: {
            totalIncome: 5000,
            totalExpenses: 3500,
            netSavings: 1500,
            recommendedNeeds: 2500,
            recommendedWants: 1500,
            recommendedSavings: 1000,
            actualNeeds: 2000,
            actualWants: 1000,
            actualSavings: 500,
            needsStatus: 'under' as const,
            wantsStatus: 'under' as const,
            savingsStatus: 'under' as const,
            isOverBudget: false,
            unallocatedCash: 1000,
            ...budgetOverrides,
        },
        data: {
            currency: 'USD',
            currentMonth: '2024-01',
            incomes: [],
            expenses: [],
            customCategories: [],
            version: 4,
            isOnboarded: true
        }
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render 50/30/20 Budget Overview title', () => {
            vi.mocked(useFinance).mockReturnValue(createMockData() as any);
            render(<BudgetOverview />);

            expect(screen.getByText('50/30/20 Budget Overview')).toBeInTheDocument();
        });

        it('should not render title when standalone=false', () => {
            vi.mocked(useFinance).mockReturnValue(createMockData() as any);
            render(<BudgetOverview standalone={false} />);

            expect(screen.queryByText('50/30/20 Budget Overview')).not.toBeInTheDocument();
        });

        it('should render all three budget categories', () => {
            vi.mocked(useFinance).mockReturnValue(createMockData() as any);
            render(<BudgetOverview />);

            expect(screen.getByText('Needs')).toBeInTheDocument();
            expect(screen.getByText('Wants')).toBeInTheDocument();
            expect(screen.getByText('Savings')).toBeInTheDocument();
        });
    });

    describe('50/30/20 Display', () => {
        it('should display actual vs recommended amounts', () => {
            vi.mocked(useFinance).mockReturnValue(createMockData() as any);
            render(<BudgetOverview />);

            // Check that actual and target amounts are shown (3 of each - one per category)
            expect(screen.getAllByText(/Actual:/).length).toBe(3);
            expect(screen.getAllByText(/Target:/).length).toBe(3);
        });

        it('should display amounts in user currency', () => {
            vi.mocked(useFinance).mockReturnValue({
                ...createMockData(),
                data: {
                    currency: 'GBP',
                    currentMonth: '2024-01',
                    incomes: [],
                    expenses: [],
                    customCategories: [],
                    version: 4,
                    isOnboarded: true
                }
            } as any);
            render(<BudgetOverview />);

            // Should show GBP symbol
            expect(screen.getAllByText(/£/).length).toBeGreaterThan(0);
        });
    });

    describe('Status Indicators', () => {
        it('should show under budget status for needs', () => {
            vi.mocked(useFinance).mockReturnValue(createMockData({
                actualNeeds: 2000,
                recommendedNeeds: 2500,
                needsStatus: 'under'
            }) as any);
            render(<BudgetOverview />);

            // Percentage should be 80% (2000/2500)
            expect(screen.getByText('80%')).toBeInTheDocument();
        });

        it('should show over budget status for needs', () => {
            vi.mocked(useFinance).mockReturnValue(createMockData({
                actualNeeds: 3000,
                recommendedNeeds: 2500,
                needsStatus: 'over'
            }) as any);
            render(<BudgetOverview />);

            // Percentage should be 120% (3000/2500)
            expect(screen.getByText('120%')).toBeInTheDocument();
        });

        it('should show on-track status when exactly matching recommended', () => {
            vi.mocked(useFinance).mockReturnValue(createMockData({
                actualWants: 1500,
                recommendedWants: 1500,
                wantsStatus: 'on-track'
            }) as any);
            render(<BudgetOverview />);

            // Percentage should be 100% (1500/1500)
            expect(screen.getByText('100%')).toBeInTheDocument();
        });

        it('should show under status for savings (warning state)', () => {
            vi.mocked(useFinance).mockReturnValue(createMockData({
                actualSavings: 500,
                recommendedSavings: 1000,
                savingsStatus: 'under'
            }) as any);
            render(<BudgetOverview />);

            // Percentage should be 50% (500/1000)
            expect(screen.getByText('50%')).toBeInTheDocument();
        });
    });

    describe('Zero Income Handling', () => {
        it('should handle zero income gracefully', () => {
            vi.mocked(useFinance).mockReturnValue(createMockData({
                totalIncome: 0,
                recommendedNeeds: 0,
                recommendedWants: 0,
                recommendedSavings: 0,
                actualNeeds: 0,
                actualWants: 0,
                actualSavings: 0
            }) as any);

            // Should not throw error
            expect(() => render(<BudgetOverview />)).not.toThrow();
        });

        it('should show empty state when no expenses', () => {
            vi.mocked(useFinance).mockReturnValue(createMockData({
                actualNeeds: 0,
                actualWants: 0,
                actualSavings: 0
            }) as any);
            render(<BudgetOverview />);

            expect(screen.getByText('No expenses yet')).toBeInTheDocument();
        });
    });

    describe('Visual Elements', () => {
        it('should render progress bars for each category', () => {
            vi.mocked(useFinance).mockReturnValue(createMockData() as any);
            const { container } = render(<BudgetOverview />);

            const progressBars = container.querySelectorAll('.budget-progress-bar-compact');
            expect(progressBars.length).toBeGreaterThanOrEqual(3);
        });

        it('should render color dots for each category', () => {
            vi.mocked(useFinance).mockReturnValue(createMockData() as any);
            const { container } = render(<BudgetOverview />);

            const colorDots = container.querySelectorAll('.budget-color-dot');
            expect(colorDots.length).toBe(3);
        });

        it('should render pie chart when expenses exist', () => {
            vi.mocked(useFinance).mockReturnValue(createMockData() as any);
            const { container } = render(<BudgetOverview />);

            // Check for Recharts ResponsiveContainer
            const chartContainer = container.querySelector('.budget-chart-container');
            expect(chartContainer).toBeInTheDocument();
        });
    });

    describe('Percentage Calculations', () => {
        it('should calculate correct percentages for each category', () => {
            vi.mocked(useFinance).mockReturnValue(createMockData({
                actualNeeds: 2000,
                recommendedNeeds: 2500, // 80%
                actualWants: 1500,
                recommendedWants: 1500, // 100%
                actualSavings: 750,
                recommendedSavings: 1000, // 75%
            }) as any);
            render(<BudgetOverview />);

            expect(screen.getByText('80%')).toBeInTheDocument(); // Needs
            expect(screen.getByText('100%')).toBeInTheDocument(); // Wants
            expect(screen.getByText('75%')).toBeInTheDocument(); // Savings
        });

        it('should round percentages to nearest whole number', () => {
            vi.mocked(useFinance).mockReturnValue(createMockData({
                actualNeeds: 2333,
                recommendedNeeds: 2500, // 93.32% → 93%
            }) as any);
            render(<BudgetOverview />);

            expect(screen.getByText('93%')).toBeInTheDocument();
        });

        it('should handle percentages over 100%', () => {
            vi.mocked(useFinance).mockReturnValue(createMockData({
                actualNeeds: 3750,
                recommendedNeeds: 2500, // 150%
            }) as any);
            render(<BudgetOverview />);

            expect(screen.getByText('150%')).toBeInTheDocument();
        });
    });

    describe('Currency Formatting', () => {
        const currencies = [
            { code: 'USD', symbol: '$' },
            { code: 'EUR', symbol: '€' },
            { code: 'GBP', symbol: '£' },
            { code: 'INR', symbol: '₹' }
        ];

        currencies.forEach(({ code, symbol }) => {
            it(`should format amounts correctly for ${code}`, () => {
                vi.mocked(useFinance).mockReturnValue({
                    ...createMockData(),
                    data: {
                        currency: code,
                        currentMonth: '2024-01',
                        incomes: [],
                        expenses: [],
                        customCategories: [],
                        version: 4,
                        isOnboarded: true
                    }
                } as any);
                render(<BudgetOverview />);

                // Should show currency symbol
                expect(screen.getAllByText(new RegExp(symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))).length).toBeGreaterThan(0);
            });
        });
    });

    describe('Edge Cases', () => {
        it('should handle very large amounts', () => {
            vi.mocked(useFinance).mockReturnValue(createMockData({
                actualNeeds: 1_000_000,
                recommendedNeeds: 500_000,
            }) as any);

            expect(() => render(<BudgetOverview />)).not.toThrow();
            expect(screen.getByText('200%')).toBeInTheDocument();
        });

        it('should handle very small amounts', () => {
            vi.mocked(useFinance).mockReturnValue(createMockData({
                actualNeeds: 0.01,
                recommendedNeeds: 0.02,
            }) as any);

            expect(() => render(<BudgetOverview />)).not.toThrow();
        });

        it('should handle zero recommended values gracefully', () => {
            vi.mocked(useFinance).mockReturnValue(createMockData({
                totalIncome: 0,
                recommendedNeeds: 0,
                actualNeeds: 0,
            }) as any);

            expect(() => render(<BudgetOverview />)).not.toThrow();
        });
    });
});
