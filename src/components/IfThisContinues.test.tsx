import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import IfThisContinues from './IfThisContinues';
import { FinanceProvider, useFinance } from '../context/FinanceContext';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key) => store[key] || null),
        setItem: vi.fn((key, value) => {
            store[key] = value.toString();
        }),
        clear: vi.fn(() => {
            store = {};
        }),
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mocking useFinance
vi.mock('../context/FinanceContext', async () => {
    const actual = await vi.importActual('../context/FinanceContext');
    return {
        ...actual,
        useFinance: vi.fn(),
    };
});

describe('IfThisContinues', () => {
    beforeEach(() => {
        vi.mocked(useFinance).mockReturnValue({
            data: {
                currency: 'USD',
                currentMonth: '2023-01',
                expenses: [],
                customCategories: [],
            },
            monthlyTrends: [
                { month: '2022-10', income: 1000, expenses: 800, savings: 200, needs: 500, wants: 300 },
                { month: '2022-11', income: 1000, expenses: 800, savings: 200, needs: 500, wants: 300 },
                { month: '2022-12', income: 1000, expenses: 800, savings: 200, needs: 500, wants: 300 },
            ],
        } as any);
    });

    it('renders with the correct projection card class for layout consistency', () => {
        render(
            <FinanceProvider>
                <IfThisContinues />
            </FinanceProvider>
        );

        const container = document.querySelector('.projection-card');
        expect(container).toBeInTheDocument();
        // Check for UI consistency with MonthlySummary
        expect(container).toHaveClass('border-l-4');
        expect(container).toHaveClass('border-l-primary');

        expect(screen.getByText(/If This Continues/i)).toBeInTheDocument();
    });

    it('updates based on user selected month', () => {
        // First render with Jan context
        const { rerender } = render(
            <FinanceProvider>
                <IfThisContinues />
            </FinanceProvider>
        );

        // Projected savings = 200 * 12 = 2400
        expect(screen.getAllByText(/\$2,400/i).length).toBeGreaterThanOrEqual(1);

        // Change context to a month with more history
        vi.mocked(useFinance).mockReturnValue({
            data: {
                currency: 'USD',
                currentMonth: '2023-03', // Now we should see Jan and Feb in 2023 history too
                expenses: [],
                customCategories: [],
            },
            monthlyTrends: [
                { month: '2022-12', income: 1000, expenses: 800, savings: 200, needs: 500, wants: 300 },
                { month: '2023-01', income: 2000, expenses: 1000, savings: 1000, needs: 500, wants: 500 },
                { month: '2023-02', income: 2000, expenses: 1000, savings: 1000, needs: 500, wants: 500 },
            ],
        } as any);

        rerender(
            <FinanceProvider>
                <IfThisContinues />
            </FinanceProvider>
        );

        // Avg savings = (200 + 1000 + 1000) / 3 = 733.33 -> 8800 yearly
        expect(screen.getAllByText(/\$8,800/i).length).toBeGreaterThanOrEqual(1);
    });

    it('toggles content between projection stats and "what this buys" benchmarks', () => {
        render(
            <FinanceProvider>
                <IfThisContinues />
            </FinanceProvider>
        );

        // Switch to "What This Buys You" tab
        const buysTab = screen.getByRole('button', { name: /What This Buys You/i });
        fireEvent.click(buysTab);

        // Now what this buys content should be visible
        expect(screen.getByText((content) => content.includes('Your projected savings can cover') && content.includes('one') && content.includes('at a time'))).toBeInTheDocument();
        expect(screen.getByText(/Living Expenses/i)).toBeInTheDocument();
        expect(screen.getByText(/3 months/i)).toBeInTheDocument();
    });
});
