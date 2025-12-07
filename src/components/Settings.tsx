import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Settings as SettingsIcon, Check, Download, Upload } from 'lucide-react';
import { CURRENCIES } from '../utils/currency';
import './Dashboard.css';

const Settings: React.FC = () => {
    const { data, setCurrency, importData } = useFinance();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState(data.currency);

    const handleSave = () => {
        setCurrency(selectedCurrency);
        setIsOpen(false);
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

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                // Basic validation check
                if (json.incomes && json.expenses && json.customCategories) {
                    if (window.confirm('This will replace your current data with the backup. Are you sure?')) {
                        importData(json);
                        alert('Data restored successfully!');
                    }
                } else {
                    alert('Invalid backup file format.');
                }
            } catch (error) {
                alert('Error reading file. Please ensure it is a valid JSON backup.');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
        // Reset input
        event.target.value = '';
    };

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
                        <select
                            className="select"
                            value={selectedCurrency}
                            onChange={(e) => setSelectedCurrency(e.target.value)}
                        >
                            {CURRENCIES.map((currency) => (
                                <option key={currency.code} value={currency.code}>
                                    {currency.symbol} {currency.name} ({currency.code})
                                </option>
                            ))}
                        </select>
                        <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: 'var(--spacing-xs)' }}>
                            Choose your preferred currency for displaying amounts
                        </p>
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
