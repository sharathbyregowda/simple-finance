import React, { useState } from 'react';
import { CURRENCIES } from '../utils/currency';
import './Dashboard.css';

interface CurrencySelectorProps {
    currentCurrency: string;
    onSelect: (currency: string) => void;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({ currentCurrency, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCurrencies = CURRENCIES.filter(
        (c) =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            {/* Search Input with Clear Label */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Search for your currency
                </label>
                <input
                    type="text"
                    className="w-full bg-gray-900/50 border border-gray-600 text-white placeholder-gray-500 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. USD, Dollar, $"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Currency Selection Buttons */}
            <div>
                <div className="text-sm font-medium text-gray-300 mb-3">
                    {filteredCurrencies.length > 0 ? 'Select your currency:' : 'No results'}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
                    {filteredCurrencies.map((currency) => {
                        const isSelected = currentCurrency === currency.code;
                        return (
                            <button
                                key={currency.code}
                                onClick={() => onSelect(currency.code)}
                                type="button"
                                className={`
                                    flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left
                                    ${isSelected
                                        ? 'bg-blue-500/20 border-blue-500 shadow-lg shadow-blue-500/20'
                                        : 'bg-gray-800/30 border-gray-700 hover:border-gray-600 hover:bg-gray-800/50'
                                    }
                                `}
                            >
                                <span className="text-3xl w-12 text-center">
                                    {currency.symbol}
                                </span>
                                <div className="flex-1">
                                    <div className={`font-bold text-lg ${isSelected ? 'text-blue-300' : 'text-white'}`}>
                                        {currency.code}
                                    </div>
                                    <div className="text-sm text-gray-400">
                                        {currency.name}
                                    </div>
                                </div>
                                {isSelected && (
                                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {filteredCurrencies.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                    No currencies found matching "{searchTerm}"
                </div>
            )}
        </div>
    );
};

export default CurrencySelector;
