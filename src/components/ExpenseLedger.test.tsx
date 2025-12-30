import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ExpenseLedger from './ExpenseLedger';
import { useFinance } from '../context/FinanceContext';
import { ExpenseCategory } from '../types';

// Mock dependencies
vi.mock('../context/FinanceContext');

describe('ExpenseLedger', () => {
    // Mock functions
    const mockAddExpense = vi.fn();
    const mockUpdateExpense = vi.fn();
    const mockDeleteExpense = vi.fn();
    const mockSetCurrentMonth = vi.fn();
    const mockGetCategoryHierarchy = vi.fn();

    // Sample categories for testing
    const mockCategories = [
        { id: 'cat-1', name: 'Housing', icon: '🏠', type: ExpenseCategory.NEEDS },
        { id: 'cat-2', name: 'Entertainment', icon: '🎬', type: ExpenseCategory.WANTS },
        { id: 'cat-3', name: 'Savings Account', icon: '🏦', type: ExpenseCategory.SAVINGS },
        { id: 'sub-1', name: 'Mortgage', icon: '🏡', type: ExpenseCategory.NEEDS, parentId: 'cat-1', isSubcategory: true },
    ];

    // Sample expenses for testing
    const mockExpenses = [
        {
            id: 'exp-1',
            amount: 1500,
            description: 'Monthly rent',
            categoryId: 'cat-1',
            categoryType: ExpenseCategory.NEEDS,
            date: '2024-01-15',
            month: '2024-01'
        },
        {
            id: 'exp-2',
            amount: 50,
            description: 'Netflix',
            categoryId: 'cat-2',
            categoryType: ExpenseCategory.WANTS,
            date: '2024-01-10',
            month: '2024-01'
        }
    ];

    const createMockFinanceData = (overrides = {}) => ({
        addExpense: mockAddExpense,
        updateExpense: mockUpdateExpense,
        deleteExpense: mockDeleteExpense,
        setCurrentMonth: mockSetCurrentMonth,
        getCategoryHierarchy: mockGetCategoryHierarchy,
        data: {
            expenses: mockExpenses,
            customCategories: mockCategories,
            currentMonth: '2024-01',
            currency: 'USD',
            incomes: [],
            version: 4,
            isOnboarded: true,
            ...overrides
        }
    });

    beforeEach(() => {
        vi.clearAllMocks();

        // Default category hierarchy return value
        mockGetCategoryHierarchy.mockReturnValue([
            {
                category: mockCategories[0],
                subcategories: [mockCategories[3]]
            },
            {
                category: mockCategories[1],
                subcategories: []
            },
            {
                category: mockCategories[2],
                subcategories: []
            }
        ]);

        vi.mocked(useFinance).mockReturnValue(createMockFinanceData() as any);
    });

    // ==========================================
    // RENDERING TESTS
    // ==========================================
    describe('Rendering', () => {
        it('should render Expense Ledger title', () => {
            render(<ExpenseLedger />);
            expect(screen.getByText('Expense Ledger')).toBeInTheDocument();
        });

        it('should render entry count', () => {
            render(<ExpenseLedger />);
            expect(screen.getByText('2 entries')).toBeInTheDocument();
        });

        it('should render table headers', () => {
            render(<ExpenseLedger />);
            expect(screen.getByText('Date')).toBeInTheDocument();
            expect(screen.getByText('Category')).toBeInTheDocument();
            expect(screen.getByText('Description')).toBeInTheDocument();
            expect(screen.getByText('Amount')).toBeInTheDocument();
            expect(screen.getByText('Actions')).toBeInTheDocument();
        });

        it('should render input row with all fields', () => {
            render(<ExpenseLedger />);

            // Date input
            expect(screen.getByDisplayValue(new Date().toISOString().split('T')[0])).toBeInTheDocument();

            // Category select with default option
            expect(screen.getByText('Select Category...')).toBeInTheDocument();

            // Description input placeholder
            expect(screen.getByPlaceholderText('Description...')).toBeInTheDocument();

            // Amount input placeholder
            expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
        });

        it('should render existing expenses', () => {
            render(<ExpenseLedger />);
            expect(screen.getByText('Monthly rent')).toBeInTheDocument();
            expect(screen.getByText('Netflix')).toBeInTheDocument();
        });

        it('should render add button with plus icon', () => {
            render(<ExpenseLedger />);
            const addButton = screen.getByTitle('Add Entry (Enter)');
            expect(addButton).toBeInTheDocument();
        });

        it('should handle empty expense list', () => {
            vi.mocked(useFinance).mockReturnValue(createMockFinanceData({
                expenses: []
            }) as any);
            render(<ExpenseLedger />);

            expect(screen.getByText('0 entries')).toBeInTheDocument();
        });

        it('should display currency-formatted amounts', () => {
            render(<ExpenseLedger />);
            expect(screen.getByText('$1,500')).toBeInTheDocument();
            expect(screen.getByText('$50')).toBeInTheDocument();
        });
    });

    // ==========================================
    // VALIDATION TESTS (CRITICAL - covers recent fix)
    // ==========================================
    describe('Validation', () => {
        it('should show alert when amount is empty and + button clicked', () => {
            const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });
            render(<ExpenseLedger />);

            // Select a category but leave amount empty
            const categorySelect = screen.getAllByRole('combobox')[0];
            fireEvent.change(categorySelect, { target: { value: 'cat-1' } });

            // Click add button
            const addButton = screen.getByTitle('Add Entry (Enter)');
            fireEvent.click(addButton);

            // Should show validation alert for amount
            expect(alertSpy).toHaveBeenCalledWith('Please enter an amount for the expense.');
            expect(mockAddExpense).not.toHaveBeenCalled();

            alertSpy.mockRestore();
        });

        it('should show alert when category is not selected and + button clicked', () => {
            const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });
            render(<ExpenseLedger />);

            // Enter amount but leave category empty
            const amountInput = screen.getByPlaceholderText('0.00');
            fireEvent.change(amountInput, { target: { value: '100' } });

            // Click add button
            const addButton = screen.getByTitle('Add Entry (Enter)');
            fireEvent.click(addButton);

            // Should show validation alert for category
            expect(alertSpy).toHaveBeenCalledWith('Please select a category for the expense.');
            expect(mockAddExpense).not.toHaveBeenCalled();

            alertSpy.mockRestore();
        });

        it('should validate amount first before category', () => {
            const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });
            render(<ExpenseLedger />);

            // Both fields empty, click add
            const addButton = screen.getByTitle('Add Entry (Enter)');
            fireEvent.click(addButton);

            // Amount validation should come first
            expect(alertSpy).toHaveBeenCalledWith('Please enter an amount for the expense.');
            expect(alertSpy).toHaveBeenCalledTimes(1);

            alertSpy.mockRestore();
        });

        it('should show validation alert when submitting with Enter key on amount field', () => {
            const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });
            render(<ExpenseLedger />);

            // Press Enter on empty amount field
            const amountInput = screen.getByPlaceholderText('0.00');
            fireEvent.keyDown(amountInput, { key: 'Enter' });

            expect(alertSpy).toHaveBeenCalledWith('Please enter an amount for the expense.');

            alertSpy.mockRestore();
        });

        it('should show validation alert when submitting with Enter key on description field', () => {
            const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });
            render(<ExpenseLedger />);

            // Press Enter on description with no amount
            const descInput = screen.getByPlaceholderText('Description...');
            fireEvent.keyDown(descInput, { key: 'Enter' });

            expect(alertSpy).toHaveBeenCalledWith('Please enter an amount for the expense.');

            alertSpy.mockRestore();
        });

        it('should not show validation alert when all fields are valid', () => {
            const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });
            render(<ExpenseLedger />);

            // Fill all required fields
            const categorySelect = screen.getAllByRole('combobox')[0];
            fireEvent.change(categorySelect, { target: { value: 'cat-1' } });

            const amountInput = screen.getByPlaceholderText('0.00');
            fireEvent.change(amountInput, { target: { value: '100' } });

            // Click add button
            const addButton = screen.getByTitle('Add Entry (Enter)');
            fireEvent.click(addButton);

            expect(alertSpy).not.toHaveBeenCalled();
            expect(mockAddExpense).toHaveBeenCalled();

            alertSpy.mockRestore();
        });
    });

    // ==========================================
    // ADD EXPENSE TESTS
    // ==========================================
    describe('Add Expense', () => {
        it('should add expense with valid data', () => {
            render(<ExpenseLedger />);

            // Fill all fields
            const categorySelect = screen.getAllByRole('combobox')[0];
            fireEvent.change(categorySelect, { target: { value: 'cat-1' } });

            const descInput = screen.getByPlaceholderText('Description...');
            fireEvent.change(descInput, { target: { value: 'Test expense' } });

            const amountInput = screen.getByPlaceholderText('0.00');
            fireEvent.change(amountInput, { target: { value: '250.50' } });

            // Click add
            const addButton = screen.getByTitle('Add Entry (Enter)');
            fireEvent.click(addButton);

            expect(mockAddExpense).toHaveBeenCalledWith({
                amount: 250.50,
                description: 'Test expense',
                categoryId: 'cat-1',
                subcategoryId: undefined,
                date: expect.any(String)
            });
        });

        it('should handle subcategory selection', () => {
            render(<ExpenseLedger />);

            // Select subcategory (format: parentId:subId)
            const categorySelect = screen.getAllByRole('combobox')[0];
            fireEvent.change(categorySelect, { target: { value: 'cat-1:sub-1' } });

            const amountInput = screen.getByPlaceholderText('0.00');
            fireEvent.change(amountInput, { target: { value: '1200' } });

            const addButton = screen.getByTitle('Add Entry (Enter)');
            fireEvent.click(addButton);

            expect(mockAddExpense).toHaveBeenCalledWith(expect.objectContaining({
                categoryId: 'cat-1',
                subcategoryId: 'sub-1'
            }));
        });

        it('should reset form fields after successful add', () => {
            render(<ExpenseLedger />);

            // Fill fields
            const categorySelect = screen.getAllByRole('combobox')[0];
            fireEvent.change(categorySelect, { target: { value: 'cat-1' } });

            const descInput = screen.getByPlaceholderText('Description...');
            fireEvent.change(descInput, { target: { value: 'Test expense' } });

            const amountInput = screen.getByPlaceholderText('0.00');
            fireEvent.change(amountInput, { target: { value: '100' } });

            // Submit
            const addButton = screen.getByTitle('Add Entry (Enter)');
            fireEvent.click(addButton);

            // Check fields are reset (except date)
            expect(amountInput).toHaveValue(null); // number input resets to null
            expect(descInput).toHaveValue('');
            expect(categorySelect).toHaveValue('');
        });

        it('should maintain date for rapid entry', () => {
            render(<ExpenseLedger />);

            // Change the date
            const dateInputs = screen.getAllByDisplayValue(new Date().toISOString().split('T')[0]);
            const inputRowDateInput = dateInputs[0];
            fireEvent.change(inputRowDateInput, { target: { value: '2024-01-20' } });

            // Fill required fields and submit
            const categorySelect = screen.getAllByRole('combobox')[0];
            fireEvent.change(categorySelect, { target: { value: 'cat-1' } });

            const amountInput = screen.getByPlaceholderText('0.00');
            fireEvent.change(amountInput, { target: { value: '50' } });

            const addButton = screen.getByTitle('Add Entry (Enter)');
            fireEvent.click(addButton);

            // Date should remain the same
            expect(screen.getByDisplayValue('2024-01-20')).toBeInTheDocument();
        });

        it('should allow empty description', () => {
            render(<ExpenseLedger />);

            const categorySelect = screen.getAllByRole('combobox')[0];
            fireEvent.change(categorySelect, { target: { value: 'cat-1' } });

            const amountInput = screen.getByPlaceholderText('0.00');
            fireEvent.change(amountInput, { target: { value: '100' } });

            const addButton = screen.getByTitle('Add Entry (Enter)');
            fireEvent.click(addButton);

            expect(mockAddExpense).toHaveBeenCalledWith(expect.objectContaining({
                description: ''
            }));
        });
    });

    // ==========================================
    // EDIT EXPENSE TESTS
    // ==========================================
    describe('Edit Expense', () => {
        it('should enter edit mode when edit button clicked', () => {
            const { container } = render(<ExpenseLedger />);

            // Find edit buttons (should be in row-actions)
            const editButtons = screen.getAllByTitle('Edit');
            fireEvent.click(editButtons[0]);

            // Should now show check (save) and X (cancel) buttons
            const saveButton = container.querySelector('.btn-icon-success');
            expect(saveButton).toBeInTheDocument();
        });

        it('should pre-populate edit fields with expense data', () => {
            render(<ExpenseLedger />);

            const editButtons = screen.getAllByTitle('Edit');
            fireEvent.click(editButtons[0]);

            // Check if amount field has expense value
            const editAmountInputs = screen.getAllByDisplayValue('1500');
            expect(editAmountInputs.length).toBeGreaterThan(0);

            // Check if description field has expense value
            expect(screen.getByDisplayValue('Monthly rent')).toBeInTheDocument();
        });

        it('should call updateExpense when save button clicked', () => {
            render(<ExpenseLedger />);

            const editButtons = screen.getAllByTitle('Edit');
            fireEvent.click(editButtons[0]);

            // Modify the amount
            const editAmountInput = screen.getByDisplayValue('1500');
            fireEvent.change(editAmountInput, { target: { value: '1600' } });

            // Find and click the check (save) button
            const { container } = render(<ExpenseLedger />);
            // Re-render and find new save buttons
            const allButtons = screen.getAllByRole('button');
            const saveButton = allButtons.find(btn =>
                btn.classList.contains('btn-icon-success')
            );

            if (saveButton) {
                fireEvent.click(saveButton);
            }
        });

        it('should exit edit mode when cancel button clicked', () => {
            render(<ExpenseLedger />);

            const editButtons = screen.getAllByTitle('Edit');
            fireEvent.click(editButtons[0]);

            // Find all buttons and look for cancel (X) button
            const allButtons = screen.getAllByRole('button');
            const cancelButton = allButtons.find(btn =>
                btn.classList.contains('btn-icon') && !btn.classList.contains('btn-icon-success') && !btn.classList.contains('btn-icon-primary')
            );

            if (cancelButton) {
                fireEvent.click(cancelButton);
            }

            // Should be back to normal view - edit buttons visible again
            expect(screen.getAllByTitle('Edit').length).toBeGreaterThan(0);
        });

        it('should exit edit mode on Escape key', () => {
            render(<ExpenseLedger />);

            const editButtons = screen.getAllByTitle('Edit');
            fireEvent.click(editButtons[0]);

            // Press Escape on description field
            const editDescInput = screen.getByDisplayValue('Monthly rent');
            fireEvent.keyDown(editDescInput, { key: 'Escape' });

            // Should exit edit mode
            expect(screen.getAllByTitle('Edit').length).toBeGreaterThan(0);
        });

        it('should save edit on Enter key', () => {
            render(<ExpenseLedger />);

            const editButtons = screen.getAllByTitle('Edit');
            fireEvent.click(editButtons[0]);

            // Change amount and press Enter
            const editAmountInput = screen.getByDisplayValue('1500');
            fireEvent.change(editAmountInput, { target: { value: '1700' } });
            fireEvent.keyDown(editAmountInput, { key: 'Enter' });

            expect(mockUpdateExpense).toHaveBeenCalled();
        });
    });

    // ==========================================
    // DELETE EXPENSE TESTS
    // ==========================================
    describe('Delete Expense', () => {
        it('should show confirmation when delete clicked', () => {
            const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
            render(<ExpenseLedger />);

            const deleteButtons = screen.getAllByTitle('Delete');
            fireEvent.click(deleteButtons[0]);

            expect(confirmSpy).toHaveBeenCalledWith('Delete this expense?');
            confirmSpy.mockRestore();
        });

        it('should call deleteExpense when confirm is accepted', () => {
            vi.spyOn(window, 'confirm').mockReturnValue(true);
            render(<ExpenseLedger />);

            const deleteButtons = screen.getAllByTitle('Delete');
            fireEvent.click(deleteButtons[0]);

            expect(mockDeleteExpense).toHaveBeenCalledWith('exp-1');
        });

        it('should not call deleteExpense when confirm is cancelled', () => {
            vi.spyOn(window, 'confirm').mockReturnValue(false);
            render(<ExpenseLedger />);

            const deleteButtons = screen.getAllByTitle('Delete');
            fireEvent.click(deleteButtons[0]);

            expect(mockDeleteExpense).not.toHaveBeenCalled();
        });
    });

    // ==========================================
    // CATEGORY SELECTION TESTS
    // ==========================================
    describe('Category Selection', () => {
        it('should render category options grouped by type', () => {
            const { container } = render(<ExpenseLedger />);

            // Check for category optgroup labels (getByText doesn't work for optgroup)
            const optgroups = container.querySelectorAll('optgroup');
            const labels = Array.from(optgroups).map(og => og.getAttribute('label'));

            expect(labels).toContain('Needs (50%)');
            expect(labels).toContain('Wants (30%)');
            expect(labels).toContain('Savings (20%)');
        });

        it('should include subcategories under parent categories', () => {
            render(<ExpenseLedger />);

            // The subcategory should be present in the select
            const categorySelect = screen.getAllByRole('combobox')[0];
            const options = categorySelect.querySelectorAll('option');

            // Should have: default + Housing + Mortgage (sub) + Entertainment + Savings Account
            expect(options.length).toBeGreaterThanOrEqual(5);
        });

        it('should update category value when selected', () => {
            render(<ExpenseLedger />);

            const categorySelect = screen.getAllByRole('combobox')[0] as HTMLSelectElement;
            fireEvent.change(categorySelect, { target: { value: 'cat-2' } });

            expect(categorySelect.value).toBe('cat-2');
        });
    });

    // ==========================================
    // MONTH FILTERING TESTS
    // ==========================================
    describe('Month Filtering', () => {
        it('should only show expenses for current month', () => {
            const expensesWithDifferentMonths = [
                { ...mockExpenses[0], month: '2024-01' },
                { id: 'exp-3', amount: 200, description: 'Different month', categoryId: 'cat-1', categoryType: ExpenseCategory.NEEDS, date: '2024-02-15', month: '2024-02' }
            ];

            vi.mocked(useFinance).mockReturnValue(createMockFinanceData({
                expenses: expensesWithDifferentMonths,
                currentMonth: '2024-01'
            }) as any);

            render(<ExpenseLedger />);

            // Should show January expense
            expect(screen.getByText('Monthly rent')).toBeInTheDocument();

            // Should NOT show February expense
            expect(screen.queryByText('Different month')).not.toBeInTheDocument();
        });

        it('should show all expenses for year when viewing yearly', () => {
            const expensesMultipleMonths = [
                { ...mockExpenses[0], month: '2024-01' },
                { id: 'exp-3', amount: 200, description: 'February expense', categoryId: 'cat-1', categoryType: ExpenseCategory.NEEDS, date: '2024-02-15', month: '2024-02' }
            ];

            vi.mocked(useFinance).mockReturnValue(createMockFinanceData({
                expenses: expensesMultipleMonths,
                currentMonth: '2024-ALL'
            }) as any);

            render(<ExpenseLedger />);

            expect(screen.getByText('Monthly rent')).toBeInTheDocument();
            expect(screen.getByText('February expense')).toBeInTheDocument();
        });
    });

    // ==========================================
    // EDGE CASES
    // ==========================================
    describe('Edge Cases', () => {
        it('should handle very large amounts', () => {
            vi.mocked(useFinance).mockReturnValue(createMockFinanceData({
                expenses: [{
                    id: 'exp-large',
                    amount: 1000000,
                    description: 'Large expense',
                    categoryId: 'cat-1',
                    categoryType: ExpenseCategory.NEEDS,
                    date: '2024-01-15',
                    month: '2024-01'
                }]
            }) as any);

            render(<ExpenseLedger />);
            expect(screen.getByText('$1,000,000')).toBeInTheDocument();
        });

        it('should handle special characters in description', () => {
            vi.mocked(useFinance).mockReturnValue(createMockFinanceData({
                expenses: [{
                    id: 'exp-special',
                    amount: 100,
                    description: 'Test <script> & "quotes" \'single\'',
                    categoryId: 'cat-1',
                    categoryType: ExpenseCategory.NEEDS,
                    date: '2024-01-15',
                    month: '2024-01'
                }]
            }) as any);

            render(<ExpenseLedger />);
            expect(screen.getByText('Test <script> & "quotes" \'single\'')).toBeInTheDocument();
        });

        it('should handle decimal amounts correctly', () => {
            render(<ExpenseLedger />);

            const categorySelect = screen.getAllByRole('combobox')[0];
            fireEvent.change(categorySelect, { target: { value: 'cat-1' } });

            const amountInput = screen.getByPlaceholderText('0.00');
            fireEvent.change(amountInput, { target: { value: '99.99' } });

            const addButton = screen.getByTitle('Add Entry (Enter)');
            fireEvent.click(addButton);

            expect(mockAddExpense).toHaveBeenCalledWith(expect.objectContaining({
                amount: 99.99
            }));
        });

        it('should display different currencies correctly', () => {
            vi.mocked(useFinance).mockReturnValue(createMockFinanceData({
                currency: 'GBP'
            }) as any);

            render(<ExpenseLedger />);
            expect(screen.getByText('£1,500')).toBeInTheDocument();
        });

        it('should sort expenses by date descending', () => {
            const expensesSorted = [
                { ...mockExpenses[0], date: '2024-01-15' }, // Second
                { ...mockExpenses[1], date: '2024-01-10' }, // First (earlier)
            ];

            vi.mocked(useFinance).mockReturnValue(createMockFinanceData({
                expenses: expensesSorted
            }) as any);

            render(<ExpenseLedger />);

            // Get all description cells and verify order
            const descriptions = screen.getAllByText(/Monthly rent|Netflix/);
            expect(descriptions[0]).toHaveTextContent('Monthly rent'); // Jan 15 first (more recent)
            expect(descriptions[1]).toHaveTextContent('Netflix'); // Jan 10 second
        });
    });
});
