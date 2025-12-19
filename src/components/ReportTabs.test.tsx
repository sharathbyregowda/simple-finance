import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ReportTabs from './ReportTabs';
import { FinanceProvider } from '../context/FinanceContext';

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

// Mock ResponsiveContainer for Recharts
vi.mock('recharts', async () => {
    const actual = await vi.importActual('recharts');
    return {
        ...actual,
        ResponsiveContainer: ({ children }: any) => <div className="recharts-responsive-container">{children}</div>,
    };
});

// Mocking useFinance since it's required by the children components
vi.mock('../context/FinanceContext', async () => {
    const actual = await vi.importActual('../context/FinanceContext');
    return {
        ...actual,
        useFinance: () => ({
            budgetSummary: {
                totalIncome: 1000,
                actualNeeds: 500,
                actualWants: 300,
                actualSavings: 200,
                recommendedNeeds: 500,
                recommendedWants: 300,
                recommendedSavings: 200,
                needsStatus: 'on-track',
                wantsStatus: 'on-track',
                savingsStatus: 'on-track',
            },
            data: {
                currency: 'USD',
                expenses: [],
                incomes: [],
                customCategories: [],
                currentMonth: '2023-01',
            },
            monthlyTrends: [
                { month: '2023-01', income: 1000, expenses: 800, savings: 200, needs: 500, wants: 300 }
            ],
            setCurrentMonth: vi.fn(),
            getCategoryHierarchy: () => [],
        }),
    };
});

describe('ReportTabs', () => {
    it('renders with the correct CSS class for layout consistency', () => {
        render(
            <FinanceProvider>
                <ReportTabs />
            </FinanceProvider>
        );

        const container = document.querySelector('.report-tabs-card');
        expect(container).toBeInTheDocument();
        // The width fix relies on this class being in Dashboard.css with grid-column: span 12
    });

    it('switches between Budget Goal and Trends tabs', () => {
        render(
            <FinanceProvider>
                <ReportTabs />
            </FinanceProvider>
        );

        // Initially shows Budget Goal
        // Check for budget-grid which is unique to BudgetOverview
        expect(document.querySelector('.budget-grid')).toBeInTheDocument();

        // Click on Trends tab
        const trendsTab = screen.getByText(/Trends/i);
        fireEvent.click(trendsTab);

        // Should now show Trends (Income vs Expenses)
        // Budget grid should be gone
        expect(document.querySelector('.budget-grid')).not.toBeInTheDocument();

        // Trends contains a chart container
        expect(document.querySelector('.recharts-responsive-container')).toBeInTheDocument();

        // Switch back
        const budgetTab = screen.getByText(/Budget Goal/i);
        fireEvent.click(budgetTab);
        expect(document.querySelector('.budget-grid')).toBeInTheDocument();
    });
});
