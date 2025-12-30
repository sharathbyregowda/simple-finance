import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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
    currentMonth: '2024-01',
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
vi.mock('../components/CurrencySelector', () => ({ default: () => <div data-testid="currency-selector">Currency Selector</div> }));
vi.mock('../components/CategoryManager', () => ({ default: () => <div data-testid="category-manager">Category Manager</div> }));
vi.mock('../components/IncomeForm', () => ({ default: () => <div data-testid="income-form">Income Form</div> }));
vi.mock('../components/ExpenseLedger', () => ({ default: () => <div data-testid="expense-ledger">Expense Ledger</div> }));

describe('OnboardingPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Initial Rendering', () => {
        it('renders the first step with app branding', () => {
            render(
                <BrowserRouter>
                    <OnboardingPage />
                </BrowserRouter>
            );
            expect(screen.getByText('Simple Finance')).toBeInTheDocument();
            expect(screen.getByText('Setup Wizard')).toBeInTheDocument();
            expect(screen.getByText('Step 1 of 7')).toBeInTheDocument();
        });

        it('shows the developer note on step 1', () => {
            render(
                <BrowserRouter>
                    <OnboardingPage />
                </BrowserRouter>
            );
            expect(screen.getByText('A Note from the Developer')).toBeInTheDocument();
            expect(screen.getByText(/Let's go/i)).toBeInTheDocument();
        });
    });

    describe('Navigation', () => {
        it('navigates from step 1 to step 2', () => {
            render(
                <BrowserRouter>
                    <OnboardingPage />
                </BrowserRouter>
            );

            // Step 1: Click "Let's go"
            const letsGoButton = screen.getByText(/Let's go/i);
            fireEvent.click(letsGoButton);

            // Step 2: Privacy page
            expect(screen.getByText('Your Data is Private')).toBeInTheDocument();
            expect(screen.getByText('Step 2 of 7')).toBeInTheDocument();
        });

        it('navigates through all 7 steps to completion', () => {
            render(
                <BrowserRouter>
                    <OnboardingPage />
                </BrowserRouter>
            );

            // Step 1 -> 2: Let's go
            fireEvent.click(screen.getByText(/Let's go/i));
            expect(screen.getByText('Your Data is Private')).toBeInTheDocument();

            // Step 2 -> 3: Continue
            fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
            expect(screen.getByText('Set Up Your Account')).toBeInTheDocument();

            // Step 3 -> 4: Continue (Currency step)
            fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
            expect(screen.getByText(/Step 2: Add Your Income/i)).toBeInTheDocument();

            // Step 4 -> 5: Continue (Income step)
            fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
            expect(screen.getByText(/Step 3: Review Categories/i)).toBeInTheDocument();

            // Step 5 -> 6: Continue (Categories step)
            fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
            expect(screen.getByText(/Step 4: Add Your Expenses/i)).toBeInTheDocument();

            // Step 6 -> 7: Continue (Expenses step)
            fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
            expect(screen.getByText(/You're All Set!/i)).toBeInTheDocument();
        });

        it('allows going back to previous steps', () => {
            render(
                <BrowserRouter>
                    <OnboardingPage />
                </BrowserRouter>
            );

            // Navigate to step 2
            fireEvent.click(screen.getByText(/Let's go/i));
            expect(screen.getByText('Your Data is Private')).toBeInTheDocument();

            // Go back to step 1
            fireEvent.click(screen.getByRole('button', { name: /Back/i }));
            expect(screen.getByText('A Note from the Developer')).toBeInTheDocument();
        });
    });

    describe('Completion', () => {
        it('calls completeOnboarding when Go to Dashboard is clicked', () => {
            render(
                <BrowserRouter>
                    <OnboardingPage />
                </BrowserRouter>
            );

            // Navigate through all steps
            fireEvent.click(screen.getByText(/Let's go/i)); // 1 -> 2
            fireEvent.click(screen.getByRole('button', { name: /Continue/i })); // 2 -> 3
            fireEvent.click(screen.getByRole('button', { name: /Continue/i })); // 3 -> 4
            fireEvent.click(screen.getByRole('button', { name: /Continue/i })); // 4 -> 5
            fireEvent.click(screen.getByRole('button', { name: /Continue/i })); // 5 -> 6
            fireEvent.click(screen.getByRole('button', { name: /Continue/i })); // 6 -> 7

            // Click final button
            const dashboardButton = screen.getByRole('button', { name: /Go to Dashboard/i });
            fireEvent.click(dashboardButton);
            expect(mockCompleteOnboarding).toHaveBeenCalled();
        });
    });

    describe('Skip Functionality', () => {
        it('allows skipping steps with Skip button', () => {
            render(
                <BrowserRouter>
                    <OnboardingPage />
                </BrowserRouter>
            );

            // Navigate to step 2 (first step with Skip)
            fireEvent.click(screen.getByText(/Let's go/i));

            // Click Skip
            const skipButton = screen.getByRole('button', { name: /Skip/i });
            fireEvent.click(skipButton);

            // Should advance to next step
            expect(screen.getByText('Set Up Your Account')).toBeInTheDocument();
        });
    });

    describe('Progress Bar', () => {
        it('shows correct progress as steps advance', () => {
            render(
                <BrowserRouter>
                    <OnboardingPage />
                </BrowserRouter>
            );

            expect(screen.getByText('Step 1 of 7')).toBeInTheDocument();

            fireEvent.click(screen.getByText(/Let's go/i));
            expect(screen.getByText('Step 2 of 7')).toBeInTheDocument();

            fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
            expect(screen.getByText('Step 3 of 7')).toBeInTheDocument();
        });
    });
});
