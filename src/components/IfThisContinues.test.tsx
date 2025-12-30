import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import IfThisContinues from './IfThisContinues';
import { useFinance } from '../context/FinanceContext';

// Mock the FinanceContext
vi.mock('../context/FinanceContext');

describe('IfThisContinues', () => {
    const createMockData = (overrides = {}) => ({
        data: {
            currency: 'USD',
            currentMonth: '2024-01',
            expenses: [],
            customCategories: [],
            ...overrides
        },
        monthlyTrends: [
            { month: '2023-10', income: 5000, expenses: 4000, savings: 1000, needs: 2500, wants: 1500 },
            { month: '2023-11', income: 5000, expenses: 4000, savings: 1000, needs: 2500, wants: 1500 },
            { month: '2023-12', income: 5000, expenses: 4000, savings: 1000, needs: 2500, wants: 1500 },
        ],
    });

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useFinance).mockReturnValue(createMockData() as any);
    });

    describe('Rendering', () => {
        it('should render the forecast title', () => {
            render(<IfThisContinues />);
            expect(screen.getByText(/12-Month Forecast/i)).toBeInTheDocument();
        });

        it('should render with projections-unified class', () => {
            const { container } = render(<IfThisContinues />);
            const component = container.querySelector('.projections-unified');
            expect(component).toBeInTheDocument();
        });

        it('should show forecast headline', () => {
            render(<IfThisContinues />);
            // The component displays "Savings Growth" or "Spending Deficit"
            expect(screen.getByText(/Savings Growth/i)).toBeInTheDocument();
        });

        it('should display average monthly stats', () => {
            render(<IfThisContinues />);
            expect(screen.getByText(/Avg. Monthly Income/i)).toBeInTheDocument();
            expect(screen.getByText(/Avg. Monthly Expenses/i)).toBeInTheDocument();
            expect(screen.getByText(/Avg. Monthly Savings/i)).toBeInTheDocument();
        });

        it('should show "What This Covers" section', () => {
            render(<IfThisContinues />);
            expect(screen.getByText(/What This Covers/i)).toBeInTheDocument();
            expect(screen.getByText(/Living Expenses/i)).toBeInTheDocument();
        });
    });

    describe('Projections Calculation', () => {
        it('should project yearly savings based on monthly trends', () => {
            // Monthly savings: 1000 * 12 = 12,000 yearly
            render(<IfThisContinues />);
            // The amount appears multiple times (headline, description)
            expect(screen.getAllByText(/\$12,000/i).length).toBeGreaterThan(0);
        });

        it('should update projections based on different data', () => {
            vi.mocked(useFinance).mockReturnValue({
                ...createMockData(),
                monthlyTrends: [
                    { month: '2023-10', income: 3000, expenses: 2500, savings: 500, needs: 1500, wants: 1000 },
                    { month: '2023-11', income: 3000, expenses: 2500, savings: 500, needs: 1500, wants: 1000 },
                    { month: '2023-12', income: 3000, expenses: 2500, savings: 500, needs: 1500, wants: 1000 },
                ],
            } as any);

            render(<IfThisContinues />);
            // Monthly savings: 500 * 12 = 6,000 yearly
            expect(screen.getAllByText(/\$6,000/i).length).toBeGreaterThan(0);
        });
    });

    describe('Currency Formatting', () => {
        it('should display amounts in GBP when currency is GBP', () => {
            vi.mocked(useFinance).mockReturnValue({
                ...createMockData({ currency: 'GBP' }),
                monthlyTrends: [
                    { month: '2023-10', income: 5000, expenses: 4000, savings: 1000, needs: 2500, wants: 1500 },
                    { month: '2023-11', income: 5000, expenses: 4000, savings: 1000, needs: 2500, wants: 1500 },
                    { month: '2023-12', income: 5000, expenses: 4000, savings: 1000, needs: 2500, wants: 1500 },
                ],
            } as any);

            render(<IfThisContinues />);
            // Should show GBP symbol somewhere
            expect(screen.getAllByText(/£/).length).toBeGreaterThan(0);
        });
    });

    describe('Empty State', () => {
        it('should return null when no projection data', () => {
            vi.mocked(useFinance).mockReturnValue({
                ...createMockData(),
                monthlyTrends: [],
            } as any);

            const { container } = render(<IfThisContinues />);
            expect(container.firstChild).toBeNull();
        });

        it('should return null when projection is zero or negative', () => {
            vi.mocked(useFinance).mockReturnValue({
                ...createMockData(),
                monthlyTrends: [
                    { month: '2023-10', income: 0, expenses: 0, savings: 0, needs: 0, wants: 0 },
                ],
            } as any);

            const { container } = render(<IfThisContinues />);
            // Component returns null if yearlyProjection <= 0
            expect(container.firstChild).toBeNull();
        });
    });
});
