import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';
import { Settings as SettingsIcon, Check, Download, Upload, RotateCcw, RefreshCw } from 'lucide-react';
import { CURRENCIES } from '../utils/currency';
import CurrencySelector from './CurrencySelector';
import './Dashboard.css';

const Settings: React.FC = () => {
    const { data, setCurrency, importData } = useFinance();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState(data.currency);

    const handleSave = () => {
        setCurrency(selectedCurrency);
        setIsOpen(false);
    };

    const handleRestartOnboarding = () => {
        if (window.confirm('Are you sure you want to restart the onboarding process? Your data will be preserved.')) {
            navigate('/onboarding');
        }
    };

    const handleExport = () => {
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `finance_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        console.log('Starting import. File:', file.name, 'Size:', file.size);

        const reader = new FileReader();
        reader.onerror = (error) => {
            console.error('FileReader error:', error);
            alert('Error reading file. Please try again.');
        };

        reader.onload = (e) => {
            try {
                console.log('File loaded, parsing JSON...');
                const json = JSON.parse(e.target?.result as string);
                console.log('JSON parsed successfully. Data:', json);

                // Basic validation check
                if (json.incomes && json.expenses && json.customCategories) {
                    console.log('Validation passed. Showing confirmation dialog...');
                    if (window.confirm('This will replace your current data with the backup. Are you sure?')) {
                        console.log('User confirmed. Importing data...');
                        try {
                            importData(json);
                            console.log('Data imported successfully');
                            alert('Data restored successfully!');
                            // Close settings panel after successful import
                            setIsOpen(false);
                        } catch (importError) {
                            console.error('Import error:', importError);
                            alert('Error importing data: ' + (importError instanceof Error ? importError.message : 'Unknown error'));
                        }
                    } else {
                        console.log('User cancelled import');
                    }
                } else {
                    console.error('Validation failed. Missing required fields:', {
                        hasIncomes: !!json.incomes,
                        hasExpenses: !!json.expenses,
                        hasCategories: !!json.customCategories
                    });
                    alert('Invalid backup file format. Missing required fields (incomes, expenses, or categories).');
                }
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                alert('Error reading file. Please ensure it is a valid JSON backup.\n\nDetails: ' + (parseError instanceof Error ? parseError.message : 'Parse failed'));
            }
        };

        try {
            reader.readAsText(file);
        } catch (readError) {
            console.error('Error starting file read:', readError);
            alert('Error reading file. Please try again.');
        }

        // Reset input
        event.target.value = '';
    };

    const recurringCount = (data.recurringTransactions || []).filter(rt => rt.isActive).length;

    return (
        <div className="card settings-card">
            <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="flex items-center gap-sm">
                    <SettingsIcon size={20} />
                    <h3>Settings</h3>
                </div>
                <button className="btn btn-secondary" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? 'Close' : 'Configure'}
                </button>
            </div>

            {isOpen && (
                <div className="animate-fade-in">
                    <div className="form-group">
                        <label className="label">Currency</label>
                        <CurrencySelector
                            currentCurrency={selectedCurrency}
                            onSelect={setSelectedCurrency}
                        />
                        <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: 'var(--spacing-xs)' }}>
                            Choose your preferred currency for displaying amounts
                        </p>
                    </div>

                    <div className="form-group" style={{ marginTop: 'var(--spacing-lg)', paddingTop: 'var(--spacing-lg)', borderTop: '1px solid var(--border-color)' }}>
                        <label className="label">Recurring Transactions</label>
                        <div style={{ marginTop: 'var(--spacing-sm)' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => navigate('/recurring')}
                            >
                                <RefreshCw size={16} />
                                Manage Recurring ({recurringCount} active)
                            </button>
                            <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: 'var(--spacing-xs)' }}>
                                Set up transactions that repeat monthly
                            </p>
                        </div>
                    </div>

                    <div className="form-group" style={{ marginTop: 'var(--spacing-lg)', paddingTop: 'var(--spacing-lg)', borderTop: '1px solid var(--border-color)' }}>
                        <label className="label">Onboarding</label>
                        <div style={{ marginTop: 'var(--spacing-sm)' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={handleRestartOnboarding}
                            >
                                <RotateCcw size={16} />
                                Restart Onboarding
                            </button>
                            <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: 'var(--spacing-xs)' }}>
                                Go through the setup process again.
                            </p>
                        </div>
                    </div>

                    <div className="form-group" style={{ marginTop: 'var(--spacing-lg)', paddingTop: 'var(--spacing-lg)', borderTop: '1px solid var(--border-color)' }}>
                        <label className="label">Data Management</label>
                        <div className="flex gap-sm" style={{ marginTop: 'var(--spacing-sm)' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={handleExport}
                                title="Download a backup of your data"
                            >
                                <Download size={16} />
                                Backup Data
                            </button>
                            <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                                <Upload size={16} />
                                Restore Data
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleImport}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>
                        <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: 'var(--spacing-xs)' }}>
                            Download your data as a JSON file or restore from a backup.
                        </p>
                    </div>

                    <button className="btn btn-primary" onClick={handleSave} style={{ marginTop: 'var(--spacing-lg)' }}>
                        <Check size={18} />
                        Save Settings
                    </button>
                </div>
            )}

            {!isOpen && (
                <div className="settings-summary">
                    <div className="setting-item">
                        <span className="setting-label">Currency:</span>
                        <span className="setting-value">
                            {CURRENCIES.find((c) => c.code === data.currency)?.symbol}{' '}
                            {CURRENCIES.find((c) => c.code === data.currency)?.name} ({data.currency})
                        </span>
                    </div>
                    <div className="setting-item">
                        <span className="setting-label">Data:</span>
                        <span className="setting-value text-muted" style={{ fontSize: '0.875rem' }}>
                            {data.expenses.length} Expenses, {data.incomes.length} Incomes
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
