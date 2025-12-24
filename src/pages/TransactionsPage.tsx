import React, { useState } from 'react';
import IncomeForm from '../components/IncomeForm';
import ExpenseLedger from '../components/ExpenseLedger';
import '../components/Dashboard.css';

const TransactionsPage: React.FC = () => {
    const [showIncomeForm, setShowIncomeForm] = useState(false);

    return (
        <div className="space-y-6">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold">Transactions</h2>
                    <p className="text-muted">Manage your income and expenses.</p>
                </div>
                <button
                    onClick={() => setShowIncomeForm(!showIncomeForm)}
                    className="btn btn-secondary md:hidden"
                >
                    {showIncomeForm ? 'Hide Income Form' : 'Add Income'}
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Data Entry (Sticky on Desktop) */}
                <div className={`lg:col-span-4 ${showIncomeForm ? 'block' : 'hidden md:block'}`}>
                    <div className="sticky top-6 space-y-6">
                        <IncomeForm />
                        {/* We could move the Expense Form part of ExpenseLedger here if we refactor,
                            but for now sticking to the existing component structure */}
                        <div className="p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)]">
                            <p className="text-sm text-muted">
                                Tip: Use the ledger on the right (or below) to add expenses quickly.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Ledger and Expense Entry */}
                <div className="lg:col-span-8">
                    <ExpenseLedger />
                </div>
            </div>
        </div>
    );
};

export default TransactionsPage;
