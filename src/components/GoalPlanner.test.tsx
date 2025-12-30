import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GoalPlanner from './GoalPlanner';
import { useFinance } from '../context/FinanceContext';

// Mock dependencies
vi.mock('../context/FinanceContext');

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; }
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('GoalPlanner', () => {
    const createMockFinanceData = (completedMonths: number = 0) => {
        // Generate expense and income data for completed months
        const incomes: any[] = [];
        const expenses: any[] = [];
        const months = [];

        // Current month is 2024-06, so completed months are before that
        for (let i = 1; i <= completedMonths; i++) {
            const month = `2024-0${6 - i}`;
            months.push(month);
            incomes.push({ id: `inc-${i}`, month, amount: 5000, source: 'Salary', date: `${month}-15` });
            expenses.push({ id: `exp-${i}`, month, amount: 3000, categoryId: 'cat-1', categoryType: 'needs', date: `${month}-15` });
        }

        return {
            data: {
                currentMonth: '2024-06',
                currency: 'USD',
                expenses,
                incomes,
                customCategories: []
            },
            monthlyTrends: months.map(month => ({
                month,
                income: 5000,
                expenses: 3000,
                savings: 2000,
                needs: 2500,
                wants: 500
            })),
        };
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useFinance).mockReturnValue(createMockFinanceData(0) as any);
        localStorage.clear();
    });

    describe('Rendering', () => {
        it('should render the Goal Planner title', () => {
            vi.mocked(useFinance).mockReturnValue(createMockFinanceData(3) as any);
            render(<GoalPlanner />);
            expect(screen.getByText('Goal Planner')).toBeInTheDocument();
        });

        it('should show the description text', () => {
            vi.mocked(useFinance).mockReturnValue(createMockFinanceData(3) as any);
            render(<GoalPlanner />);
            expect(screen.getByText(/Estimate how long it takes to reach a goal/i)).toBeInTheDocument();
        });
    });

    describe('Eligibility Check', () => {
        it('should show unlock message with < 3 months data', () => {
            vi.mocked(useFinance).mockReturnValue(createMockFinanceData(2) as any);
            render(<GoalPlanner />);

            expect(screen.getByText(/This calculator unlocks after 3 months of data/i)).toBeInTheDocument();
            expect(screen.getByText(/You currently have 2 completed months/i)).toBeInTheDocument();
        });

        it('should show 0 completed months when no data', () => {
            vi.mocked(useFinance).mockReturnValue(createMockFinanceData(0) as any);
            render(<GoalPlanner />);

            expect(screen.getByText(/You currently have 0 completed months/i)).toBeInTheDocument();
        });

        it('should show form with ≥ 3 months data', () => {
            vi.mocked(useFinance).mockReturnValue(createMockFinanceData(3) as any);
            render(<GoalPlanner />);

            // Form should be visible
            expect(screen.getByText(/Goal Name/)).toBeInTheDocument();
            expect(screen.getByText(/Savings Goal Amount/)).toBeInTheDocument();
            expect(screen.getByText(/Starting Balance/)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Calculate/i })).toBeInTheDocument();
        });
    });

    describe('Form Inputs', () => {
        beforeEach(() => {
            vi.mocked(useFinance).mockReturnValue(createMockFinanceData(3) as any);
        });

        it('should have goal name input with max 60 chars', () => {
            render(<GoalPlanner />);

            const goalNameInput = screen.getByPlaceholderText(/e.g., Summer holiday/i) as HTMLInputElement;
            expect(goalNameInput).toBeInTheDocument();
            expect(goalNameInput).toHaveAttribute('maxLength', '60');
        });

        it('should have savings goal amount input', () => {
            render(<GoalPlanner />);

            const goalAmountInput = screen.getByPlaceholderText(/e.g., 5000/i) as HTMLInputElement;
            expect(goalAmountInput).toBeInTheDocument();
            expect(goalAmountInput).toHaveAttribute('type', 'number');
        });

        it('should have starting balance input with default 0', () => {
            render(<GoalPlanner />);

            const startingBalanceInput = screen.getByDisplayValue('0') as HTMLInputElement;
            expect(startingBalanceInput).toBeInTheDocument();
        });
    });

    describe('Calculation', () => {
        beforeEach(() => {
            vi.mocked(useFinance).mockReturnValue(createMockFinanceData(3) as any);
        });

        it('should show results after calculation', () => {
            render(<GoalPlanner />);

            // Fill in goal amount
            const goalAmountInput = screen.getByPlaceholderText(/e.g., 5000/i);
            fireEvent.change(goalAmountInput, { target: { value: '6000' } });

            // Click calculate
            fireEvent.click(screen.getByRole('button', { name: /Calculate/i }));

            // Should show result - either achievable or not achievable message
            const hasResult = screen.queryByText(/Goal Amount:/i) ||
                screen.queryByText(/cannot be reached/i) ||
                screen.queryByText(/Estimated Completion/i);
            expect(hasResult).toBeTruthy();
        });

        it('should show reset button after calculation', () => {
            render(<GoalPlanner />);

            const goalAmountInput = screen.getByPlaceholderText(/e.g., 5000/i);
            fireEvent.change(goalAmountInput, { target: { value: '6000' } });
            fireEvent.click(screen.getByRole('button', { name: /Calculate/i }));

            expect(screen.getByRole('button', { name: /Reset/i })).toBeInTheDocument();
        });

        it('should validate goal amount > 0', () => {
            const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });
            render(<GoalPlanner />);

            // Try to calculate with 0 amount
            const goalAmountInput = screen.getByPlaceholderText(/e.g., 5000/i);
            fireEvent.change(goalAmountInput, { target: { value: '0' } });
            fireEvent.click(screen.getByRole('button', { name: /Calculate/i }));

            expect(alertSpy).toHaveBeenCalledWith('Please enter a valid goal amount greater than 0');
            alertSpy.mockRestore();
        });

        it('should validate starting balance >= 0', () => {
            const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });
            render(<GoalPlanner />);

            // Set valid goal amount
            fireEvent.change(screen.getByPlaceholderText(/e.g., 5000/i), { target: { value: '5000' } });

            // Set negative starting balance
            const startingBalanceInput = screen.getByDisplayValue('0');
            fireEvent.change(startingBalanceInput, { target: { value: '-100' } });
            fireEvent.click(screen.getByRole('button', { name: /Calculate/i }));

            expect(alertSpy).toHaveBeenCalledWith('Please enter a valid starting balance (0 or greater)');
            alertSpy.mockRestore();
        });
    });

    describe('Result Display', () => {
        it('should show completion date for achievable goal', () => {
            vi.mocked(useFinance).mockReturnValue(createMockFinanceData(3) as any);
            render(<GoalPlanner />);

            fireEvent.change(screen.getByPlaceholderText(/e.g., 5000/i), { target: { value: '6000' } });
            fireEvent.click(screen.getByRole('button', { name: /Calculate/i }));

            expect(screen.getByText(/Estimated Completion/i)).toBeInTheDocument();
        });

        it('should show goal name in results if provided', () => {
            vi.mocked(useFinance).mockReturnValue(createMockFinanceData(3) as any);
            render(<GoalPlanner />);

            fireEvent.change(screen.getByPlaceholderText(/e.g., Summer holiday/i), { target: { value: 'Dream Vacation' } });
            fireEvent.change(screen.getByPlaceholderText(/e.g., 5000/i), { target: { value: '6000' } });
            fireEvent.click(screen.getByRole('button', { name: /Calculate/i }));

            expect(screen.getByText(/"Dream Vacation"/)).toBeInTheDocument();
        });

        it('should show negative cash balance warning when applicable', () => {
            // Create mock with negative cash flow (expenses > income)
            const mockData = {
                data: {
                    currentMonth: '2024-06',
                    currency: 'USD',
                    expenses: [
                        { id: 'exp-1', month: '2024-05', amount: 6000, categoryId: 'cat-1', categoryType: 'needs', date: '2024-05-15' },
                        { id: 'exp-2', month: '2024-04', amount: 6000, categoryId: 'cat-1', categoryType: 'needs', date: '2024-04-15' },
                        { id: 'exp-3', month: '2024-03', amount: 6000, categoryId: 'cat-1', categoryType: 'needs', date: '2024-03-15' },
                    ],
                    incomes: [
                        { id: 'inc-1', month: '2024-05', amount: 3000, source: 'Salary', date: '2024-05-15' },
                        { id: 'inc-2', month: '2024-04', amount: 3000, source: 'Salary', date: '2024-04-15' },
                        { id: 'inc-3', month: '2024-03', amount: 3000, source: 'Salary', date: '2024-03-15' },
                    ],
                    customCategories: []
                },
                monthlyTrends: [
                    { month: '2024-05', income: 3000, expenses: 6000, savings: -3000, needs: 6000, wants: 0 },
                    { month: '2024-04', income: 3000, expenses: 6000, savings: -3000, needs: 6000, wants: 0 },
                    { month: '2024-03', income: 3000, expenses: 6000, savings: -3000, needs: 6000, wants: 0 },
                ],
            };

            vi.mocked(useFinance).mockReturnValue(mockData as any);
            render(<GoalPlanner />);

            fireEvent.change(screen.getByPlaceholderText(/e.g., 5000/i), { target: { value: '5000' } });
            fireEvent.click(screen.getByRole('button', { name: /Calculate/i }));

            // Should show tips for negative cash balance
            expect(screen.getByText(/Tips to improve your cash balance/i)).toBeInTheDocument();
        });
    });

    describe('State Persistence', () => {
        beforeEach(() => {
            vi.mocked(useFinance).mockReturnValue(createMockFinanceData(3) as any);
        });

        it('should persist state to localStorage', () => {
            render(<GoalPlanner />);

            fireEvent.change(screen.getByPlaceholderText(/e.g., Summer holiday/i), { target: { value: 'My Goal' } });
            fireEvent.change(screen.getByPlaceholderText(/e.g., 5000/i), { target: { value: '10000' } });
            fireEvent.click(screen.getByRole('button', { name: /Calculate/i }));

            const stored = localStorage.getItem('goalPlannerState');
            expect(stored).toBeTruthy();
            const parsed = JSON.parse(stored!);
            expect(parsed.goalName).toBe('My Goal');
            expect(parsed.goalAmount).toBe('10000');
        });

        it('should restore state from localStorage', () => {
            localStorage.setItem('goalPlannerState', JSON.stringify({
                goalName: 'Saved Goal',
                goalAmount: '8000',
                startingBalance: '1000',
                hasCalculated: false,
                result: null,
                avgCashBalance: 0
            }));

            render(<GoalPlanner />);

            const goalNameInput = screen.getByPlaceholderText(/e.g., Summer holiday/i) as HTMLInputElement;
            expect(goalNameInput.value).toBe('Saved Goal');
        });

        it('should clear state on reset', () => {
            render(<GoalPlanner />);

            // Calculate first
            fireEvent.change(screen.getByPlaceholderText(/e.g., 5000/i), { target: { value: '5000' } });
            fireEvent.click(screen.getByRole('button', { name: /Calculate/i }));

            // Click reset
            fireEvent.click(screen.getByRole('button', { name: /Reset/i }));

            // Form should be cleared
            const goalNameInput = screen.getByPlaceholderText(/e.g., Summer holiday/i) as HTMLInputElement;
            expect(goalNameInput.value).toBe('');
        });
    });

    describe('Currency Display', () => {
        it('should display amounts in user currency', () => {
            const mockData = createMockFinanceData(3);
            mockData.data.currency = 'GBP';
            vi.mocked(useFinance).mockReturnValue(mockData as any);

            render(<GoalPlanner />);

            fireEvent.change(screen.getByPlaceholderText(/e.g., 5000/i), { target: { value: '5000' } });
            fireEvent.click(screen.getByRole('button', { name: /Calculate/i }));

            // Should show GBP symbol
            expect(screen.getAllByText(/£/).length).toBeGreaterThan(0);
        });
    });
});
