import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import IfThisContinues from './IfThisContinues';
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

// Mocking useFinance since it's required by the component
vi.mock('../context/FinanceContext', async () => {
    const actual = await vi.importActual('../context/FinanceContext');
    return {
        ...actual,
        useFinance: () => ({
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
        }),
    };
});

describe('IfThisContinues', () => {
    it('renders with the correct projection card class for layout consistency', () => {
        render(
            <FinanceProvider>
                <IfThisContinues />
            </FinanceProvider>
        );

        const container = document.querySelector('.projection-card');
        expect(container).toBeInTheDocument();
    });

    it('displays the projection headline and calculated outcomes', () => {
        render(
            <FinanceProvider>
                <IfThisContinues />
            </FinanceProvider>
        );

        // Savings grow by... (200 * 12 = 2400)
        expect(screen.getByText(/Savings grow by/i)).toBeInTheDocument();
        // The amount appears in the headline and the explanation paragraph as "total savings"
        expect(screen.getByText(/your 12-month total savings is projected to be/i)).toBeInTheDocument();
        const amounts = screen.getAllByText(/\$2,400/i);
        expect(amounts.length).toBeGreaterThanOrEqual(1);

        // Verify "What This Buys You" section
        expect(screen.getByText(/What This Buys You/i)).toBeInTheDocument();
        // 2400 / 800 (avg expenses) = 3 months
        expect(screen.getByText(/Living Expenses/i)).toBeInTheDocument();
        expect(screen.getByText(/3 months/i)).toBeInTheDocument();
        // Emergency Buffer
        expect(screen.getByText(/Emergency Buffer/i)).toBeInTheDocument();
        expect(screen.getByText(/Healthy/i)).toBeInTheDocument();
    });
});
