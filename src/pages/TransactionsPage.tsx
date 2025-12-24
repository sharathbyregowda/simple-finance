import React, { useState } from 'react';
import IncomeForm from '../components/IncomeForm';
import ExpenseLedger from '../components/ExpenseLedger';
import '../components/Dashboard.css';

const TransactionsPage: React.FC = () => {
    const [showIncomeForm, setShowIncomeForm] = useState(false);

    return (
        <div className="space-y-6">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h2 className="page-title">Transactions</h2>
                    <p className="page-subtitle">Manage your income and expenses.</p>
                </div>
                <button
                    onClick={() => setShowIncomeForm(!showIncomeForm)}
                    className="btn btn-secondary"
                    style={{ display: window.innerWidth >= 768 ? 'none' : 'block' }} // Simple inline toggle for now
                >
                    {showIncomeForm ? 'Hide Income Form' : 'Add Income'}
                </button>
            </header>

            <div className="transactions-grid">
                {/* Left Column: Data Entry (Sticky on Desktop) */}
                <div className={`income-form-section sticky-column ${showIncomeForm ? 'block' : 'hidden-mobile'}`} style={{ display: showIncomeForm ? 'block' : undefined }}>
                    <div className="space-y-6">
                        <IncomeForm />
                        {/* We could move the Expense Form part of ExpenseLedger here if we refactor,
                            but for now sticking to the existing component structure */}
                        <div className="card" style={{ padding: '1rem' }}>
                            <p className="text-sm text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>
                                Tip: Use the ledger on the right (or below) to add expenses quickly.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Ledger and Expense Entry */}
                <div className="ledger-section">
                    <ExpenseLedger />
                </div>
            </div>
        </div>
    );
};

export default TransactionsPage;
