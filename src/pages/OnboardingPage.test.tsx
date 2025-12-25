import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import OnboardingPage from './OnboardingPage';

// Mock the context
const mockCompleteOnboarding = vi.fn();
const mockSetCurrency = vi.fn();
const mockData = {
    currency: 'USD',
    expenses: [],
    incomes: [],
    customCategories: [],
    currentMonth: '2023-01',
    isOnboarded: false
};

vi.mock('../context/FinanceContext', async () => {
    const actual = await vi.importActual('../context/FinanceContext');
    return {
        ...actual,
        useFinance: () => ({
            data: mockData,
            setCurrency: mockSetCurrency,
            completeOnboarding: mockCompleteOnboarding,
            addCategory: vi.fn(),
            addSubcategory: vi.fn(),
            updateCategory: vi.fn(),
            deleteCategory: vi.fn(),
            getCategoryHierarchy: () => [],
            addIncome: vi.fn(),
            addExpense: vi.fn(),
            getSubcategories: () => [],
        }),
    };
});

// Mock child components
vi.mock('../components/CategoryManager', () => ({ default: () => <div data-testid="category-manager">Category Manager</div> }));
vi.mock('../components/IncomeForm', () => ({ default: () => <div data-testid="income-form">Income Form</div> }));
vi.mock('../components/ExpenseLedger', () => ({ default: () => <div data-testid="expense-ledger">Expense Ledger</div> }));

describe('OnboardingPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the first step with app branding', () => {
        render(
            <BrowserRouter>
                <OnboardingPage />
            </BrowserRouter>
        );
        expect(screen.getByText('Simple Finance')).toBeDefined();
        expect(screen.getByText('Setup Wizard')).toBeDefined();
        expect(screen.getByText(/Welcome to Simple Finance/i)).toBeDefined();
        expect(screen.getByText(/Step 1: Choose your Currency/i)).toBeDefined();
    });

    it('navigates through the steps', () => {
        const { container } = render(
            <BrowserRouter>
                <OnboardingPage />
            </BrowserRouter>
        );

        // Step 1 -> 2 (only one Continue button on first step)
        const continueButtons1 = screen.getAllByRole('button', { name: /Continue/i });
        fireEvent.click(continueButtons1[continueButtons1.length - 1]);
        expect(screen.getByText(/Step 2: Review Categories/i)).toBeDefined();

        // Step 2 -> 3 (now we have Back and Continue)
        const continueButtons2 = screen.getAllByRole('button', { name: /Continue/i });
        fireEvent.click(continueButtons2[continueButtons2.length - 1]);
        expect(screen.getByText(/Step 3: Add Your Income/i)).toBeDefined();

        // Step 3 -> 4
        const continueButtons3 = screen.getAllByRole('button', { name: /Continue/i });
        fireEvent.click(continueButtons3[continueButtons3.length - 1]);
        expect(screen.getByText(/Step 4: Add Your Expenses/i)).toBeDefined();

        // Step 4 -> 5
        const continueButtons4 = screen.getAllByRole('button', { name: /Continue/i });
        fireEvent.click(continueButtons4[continueButtons4.length - 1]);
        expect(screen.getByText(/You're All Set!/i)).toBeDefined();
    });

    it('calls completeOnboarding when finished', () => {
        render(
            <BrowserRouter>
                <OnboardingPage />
            </BrowserRouter>
        );

        // Navigate through all steps
        for (let i = 0; i < 4; i++) {
            const continueButtons = screen.getAllByRole('button', { name: /Continue/i });
            fireEvent.click(continueButtons[continueButtons.length - 1]);
        }

        // Click final button
        const dashboardButton = screen.getByRole('button', { name: /Go to Dashboard/i });
        fireEvent.click(dashboardButton);
        expect(mockCompleteOnboarding).toHaveBeenCalled();
    });
});
