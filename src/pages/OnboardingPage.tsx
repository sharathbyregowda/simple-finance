import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';
import CurrencySelector from '../components/CurrencySelector';
import CategoryManager from '../components/CategoryManager';
import IncomeForm from '../components/IncomeForm';
import ExpenseLedger from '../components/ExpenseLedger';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import '../components/Dashboard.css';

const OnboardingPage: React.FC = () => {
    const { data, setCurrency, completeOnboarding } = useFinance();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    const handleNext = () => {
        setStep(prev => prev + 1);
        window.scrollTo(0, 0);
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
        window.scrollTo(0, 0);
    };

    const handleFinish = () => {
        completeOnboarding();
        navigate('/');
    };

    const renderStep1 = () => (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="text-left space-y-4">
                <h1 className="text-4xl font-bold text-white">
                    Welcome to Simple Finance
                </h1>
                <p className="text-xl text-gray-300">
                    Let's set up your account in a few simple steps.
                </p>
            </div>

            {/* Main Content */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 space-y-6">
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">
                        Review your money. Don't guess.
                    </h2>

                    <p className="text-gray-300 leading-relaxed">
                        Every month, money leaves your account whether you pay attention or not.
                        Bank statements tell the truth, but they are hard to read.
                    </p>

                    <p className="text-gray-300 leading-relaxed">
                        This app helps you review that truth calmly, once a month, so you know:
                    </p>

                    <ul className="space-y-3 pl-6">
                        <li className="text-gray-300 flex items-start gap-3">
                            <span className="text-blue-400 font-bold mt-1">•</span>
                            <span>Where your money actually goes</span>
                        </li>
                        <li className="text-gray-300 flex items-start gap-3">
                            <span className="text-blue-400 font-bold mt-1">•</span>
                            <span>What matters to you</span>
                        </li>
                        <li className="text-gray-300 flex items-start gap-3">
                            <span className="text-blue-400 font-bold mt-1">•</span>
                            <span>What you can cut out</span>
                        </li>
                    </ul>

                    <div className="bg-blue-900/20 border-l-4 border-blue-500 p-4 mt-6">
                        <p className="text-gray-300 italic">
                            You'll enter income and expenses manually. That is intentional.
                            Reviewing each transaction forces clarity. Clarity changes behaviour.
                        </p>
                    </div>
                </div>
            </div>

            {/* Currency Selection */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Step 1: Choose your Currency
                    </h2>
                    <p className="text-gray-400">
                        Select the currency you use for your main accounts. You can change this later if needed.
                    </p>
                </div>

                <CurrencySelector
                    currentCurrency={data.currency}
                    onSelect={setCurrency}
                />
            </div>

            <div className="flex justify-end">
                <button className="btn btn-primary px-6 py-3" onClick={handleNext}>
                    Continue <ArrowRight size={18} className="ml-2" />
                </button>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-8">
            <div className="text-left">
                <h1 className="text-3xl font-bold text-white mb-2">
                    Step 2: Review Categories
                </h1>
                <p className="text-gray-400">
                    Organize your spending into Income, Needs, Wants, and Savings
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <div className="bg-blue-900/20 border border-blue-800/50 rounded-xl p-6 space-y-4">
                        <h3 className="font-bold text-lg text-blue-300">Why this matters</h3>
                        <div className="space-y-3 text-sm text-gray-300">
                            <p>Categories decide how your spending is interpreted.</p>
                            <p>Wrong categories lead to wrong conclusions about your financial health.</p>
                            <p className="text-blue-200 font-medium">We've added sensible defaults. You can customize them now or later.</p>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                        <CategoryManager />
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <button className="btn btn-secondary px-6 py-3" onClick={handleBack}>
                    <ArrowLeft size={18} className="mr-2" /> Back
                </button>
                <button className="btn btn-primary px-6 py-3" onClick={handleNext}>
                    Continue <ArrowRight size={18} className="ml-2" />
                </button>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-8">
            <div className="text-left">
                <h1 className="text-3xl font-bold text-white mb-2">
                    Step 3: Add Your Income
                </h1>
                <p className="text-gray-400">
                    Start by recording your income sources for the month
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4 sticky top-4">
                        <h3 className="font-bold text-lg text-gray-200">Why add income first?</h3>
                        <p className="text-sm text-gray-400">
                            Everything else depends on income. Without it, there's no context for your spending and savings.
                        </p>
                        <p className="text-sm text-gray-400">
                            Use your bank statement or payslip to add accurate amounts.
                        </p>
                    </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                        <IncomeForm />
                    </div>

                    {data.incomes.length > 0 && (
                        <div className="bg-green-900/10 border border-green-800/30 rounded-xl p-5">
                            <h4 className="font-bold text-green-400 mb-3 flex items-center gap-2">
                                <Check size={16} /> Income Added ({data.incomes.length} {data.incomes.length === 1 ? 'source' : 'sources'})
                            </h4>
                            <ul className="space-y-2">
                                {data.incomes.map(inc => (
                                    <li key={inc.id} className="flex justify-between text-sm bg-green-900/20 p-3 rounded text-gray-300">
                                        <span>{inc.source}</span>
                                        <span className="font-mono font-bold text-green-300">
                                            {inc.amount.toLocaleString()}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-between items-center">
                <button className="btn btn-secondary px-6 py-3" onClick={handleBack}>
                    <ArrowLeft size={18} className="mr-2" /> Back
                </button>
                <button className="btn btn-primary px-6 py-3" onClick={handleNext}>
                    Continue <ArrowRight size={18} className="ml-2" />
                </button>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-8">
            <div className="text-left">
                <h1 className="text-3xl font-bold text-white mb-2">
                    Step 4: Add Your Expenses
                </h1>
                <p className="text-gray-400">
                    Review your bank statement and enter your expenses
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4 sticky top-4">
                        <h3 className="font-bold text-lg text-gray-200">Your Running Total</h3>
                        <div className="text-3xl font-mono font-bold text-white">
                            {data.expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                            <span className="text-sm font-normal text-gray-500 ml-2">{data.currency}</span>
                        </div>

                        <div className="pt-4 border-t border-gray-700">
                            <h4 className="font-bold text-sm text-gray-400 mb-3">What to look for:</h4>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li className="flex items-start gap-2">
                                    <span className="text-red-400">•</span>
                                    <span>Repeated spending</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-red-400">•</span>
                                    <span>Forgotten subscriptions</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-red-400">•</span>
                                    <span>Habits you stopped questioning</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                        <ExpenseLedger />
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <button className="btn btn-secondary px-6 py-3" onClick={handleBack}>
                    <ArrowLeft size={18} className="mr-2" /> Back
                </button>
                <button className="btn btn-primary px-6 py-3" onClick={handleNext}>
                    Continue <ArrowRight size={18} className="ml-2" />
                </button>
            </div>
        </div>
    );

    const renderStep5 = () => (
        <div className="space-y-8 max-w-3xl mx-auto">
            <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <Check size={40} strokeWidth={3} className="text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white">You're All Set!</h1>
                <p className="text-xl text-gray-300">
                    Your financial data is ready to review
                </p>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 space-y-6">
                <div className="space-y-4 text-left">
                    <h2 className="text-xl font-bold text-white">What happens next?</h2>

                    <p className="text-gray-300">
                        As you add more data each month, your dashboards and reports will automatically update to show patterns and trends.
                    </p>

                    <div className="bg-blue-900/20 border-l-4 border-blue-500 p-4">
                        <p className="text-gray-300">
                            <strong className="text-blue-300">Tip:</strong> Don't overthink the charts.
                            Just read the summaries, notice what stands out, and adjust your spending next month based on what you learn.
                        </p>
                    </div>
                </div>
            </div>

            <button
                className="btn btn-primary w-full py-4 text-lg font-bold"
                onClick={handleFinish}
            >
                Go to Dashboard <ArrowRight size={20} className="ml-2" />
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f172a] text-white">
            {/* Fixed Header */}
            <div className="bg-gray-900/50 border-b border-gray-800 sticky top-0 z-10 backdrop-blur-sm">
                <div className="max-w-5xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-bold text-white">Simple Finance</h2>
                            <p className="text-sm text-gray-400">Setup Wizard</p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-medium text-gray-400">Progress</div>
                            <div className="text-lg font-bold text-white">Step {step} of 5</div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
                            style={{ width: `${(step / 5) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-6 py-12">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
                {step === 5 && renderStep5()}
            </div>
        </div>
    );
};

export default OnboardingPage;
