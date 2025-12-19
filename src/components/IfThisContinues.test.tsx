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
        // The amount appears in the headline and the explanation paragraph
        const amounts = screen.getAllByText(/\$2,400/i);
        expect(amounts.length).toBeGreaterThanOrEqual(1);
    });
});
