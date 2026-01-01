
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';
import CurrencySelector from '../components/CurrencySelector';
import CategoryManager from '../components/CategoryManager';
import IncomeForm from '../components/IncomeForm';
import ExpenseLedger from '../components/ExpenseLedger';
import { ArrowLeft, ArrowRight, Check, Download, Upload, Shield } from 'lucide-react';
import './Onboarding.css';
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

    const handleSkip = () => {
        handleNext();
    };

    const handleFinish = () => {
        completeOnboarding();
        navigate('/');
    };

    const renderStep1 = () => (
        <div className="onboarding-content founders-letter">
            {/* Welcome Banner */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <img
                    src="/kannadi/kannadi-banner.webp"
                    alt="Kannadi - See your numbers"
                    style={{ maxWidth: '280px', height: 'auto', borderRadius: '12px' }}
                />
            </div>

            <div className="founders-letter-header">
                <p className="founders-letter-label">A Note from the Developer</p>
            </div>

            <div className="founders-letter-body">
                <p className="founders-letter-text">
                    Welcome. I built this app for one reason: to help you clearly see and understand your money. It's called Kannadi (pronounced kuh-NAH-dee). In Kannada, it means mirror. Kannadi reflects your money habits back to you, exactly as they are.
                </p>

                <div className="founders-letter-pullquote">
                    Money is one of the most important skills in life, yet almost none of us are taught how to manage it.
                </div>

                <p className="founders-letter-text">
                    Not in school. Not at university. Not at work. And often not at home either. That was definitely true for me.
                </p>

                <p className="founders-letter-text">
                    It took me years to understand how critical household finance is. Even the basics like incomings and outgoings. Until you get reasonably good at this, moving toward financial independence is hard. Progress feels slow. Decisions feel unclear.
                </p>

                <p className="founders-letter-text">
                    Once I got a better grip on our household finances, I started using spreadsheets to track our family spending. They worked, but they were tedious to maintain. One wrong key press could break something. Over time, the friction added up. I wanted something simpler. Something deliberate. That's why I built this app.
                </p>

                <p className="founders-letter-text">
                    I have tested it using my own data and routines, and I genuinely find it useful. I know I am biased. Still, my hope is that it helps us build clarity and confidence with our money.
                </p>

                <h2 className="founders-letter-section-title">Two Principles</h2>

                <h3 className="founders-letter-principle-title">1. Speed and simplicity</h3>
                <p className="founders-letter-text">
                    Adding income and expenses should be easier than using a spreadsheet. Nothing will ever beat a spreadsheet's flexibility, but this comes close while removing a lot of friction.
                </p>

                <p className="founders-letter-text">
                    This is not automation. You still need to review your bank statements and enter everything manually. That is intentional. Reviewing each transaction forces you to stop and ask yourself: <span className="highlight-text">why did I spend money on this?</span>
                </p>

                <p className="founders-letter-text">
                    The first time, this might take 30 minutes or more. That's fine. Like any skill, you get better with practice. You refine your categories. You build a rhythm. The time comes down. You can do this daily, weekly, or monthly. Do it when it suits you. We do it monthly.
                </p>

                <p className="founders-letter-text">
                    It's your money. You worked hard for it. A few minutes a week, or at worst 30 minutes a month, to clearly see where it goes is not a big ask.
                </p>

                <h3 className="founders-letter-principle-title">2. Privacy and ownership</h3>
                <p className="founders-letter-text">
                    Your data stays on your device.
                </p>

                <p className="founders-letter-text">
                    There are no accounts, no logins, and no servers storing your financial information. All incomes, expenses, and categories are saved locally in your browser. The data never leaves your device.
                </p>

                <p className="founders-letter-text">
                    Because the data lives in your browser, it is tied to that browser and device. To keep you in control, the app includes simple backup and restore options.
                </p>

                <p className="founders-letter-text">
                    You can export all your data as a single file from Settings. This lets you:
                </p>
                <ul className="founders-letter-list">
                    <li>Keep a personal backup</li>
                    <li>Move your data to another browser</li>
                    <li>Move your data to another device</li>
                </ul>

                <p className="founders-letter-text">
                    You can also restore from a previous backup at any time. Older backups continue to work, even as the app evolves. When you import data, the app automatically updates it to the latest format so nothing breaks.
                </p>

                <div className="founders-letter-separator"></div>

                <p className="founders-letter-text">
                    If this app helps you better understand your money, then it's done its job.
                </p>

                <p className="founders-letter-text">
                    The application code is available on GitHub, so it remains free to use for its entirety.
                </p>

                <div className="founders-letter-signoff">
                    Thanks for using it — Sharath
                </div>

                <p className="founders-letter-footnote">
                    If you run into issues, spot bugs, or have ideas to improve the app, you can raise them on the GitHub repository.
                </p>
            </div>

            <div className="onboarding-actions">
                <button className="btn btn-primary btn-lets-go" onClick={handleNext}>
                    Let's go <ArrowRight size={18} style={{ marginLeft: '0.5rem', display: 'inline-block' }} />
                </button>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="onboarding-content">
            <div className="onboarding-step-title">
                <h1>Your Data is Private</h1>
                <p>Understanding how your data is stored and protected</p>
            </div>

            <div className="onboarding-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Shield size={32} style={{ color: '#10b981' }} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0 }}>No Servers. No Accounts.</h2>
                        <p style={{ margin: '0.25rem 0 0 0', color: '#9ca3af' }}>Your data never leaves your device</p>
                    </div>
                </div>

                <p>
                    All your financial data is stored locally in your browser. There are no accounts to create, no passwords to remember, and no servers collecting your information.
                </p>

                <div className="onboarding-callout">
                    <p>
                        <strong style={{ color: '#93c5fd' }}>Data Privacy:</strong> Because your data lives only in your browser, it is completely private. No one else can access it—not even us.
                    </p>
                </div>
            </div>

            <div className="onboarding-card">
                <h2>Backup & Restore</h2>

                <p>
                    Since your data is tied to your browser and device, we provide simple backup and restore features to keep you in control:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '1.5rem 0' }}>
                    <div style={{
                        padding: '1.5rem',
                        borderRadius: '0.5rem',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.2)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <Download size={20} style={{ color: '#60a5fa' }} />
                            <h3 style={{ margin: 0, fontSize: '1rem' }}>Backup</h3>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#d1d5db', margin: 0 }}>
                            Export all your data as a JSON file. Keep it safe as a backup.
                        </p>
                    </div>

                    <div style={{
                        padding: '1.5rem',
                        borderRadius: '0.5rem',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <Upload size={20} style={{ color: '#34d399' }} />
                            <h3 style={{ margin: 0, fontSize: '1rem' }}>Restore</h3>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#d1d5db', margin: 0 }}>
                            Import your backup to restore data or move it to a new browser/device.
                        </p>
                    </div>
                </div>

                <div className="onboarding-callout">
                    <p>
                        <strong style={{ color: '#93c5fd' }}>Important:</strong> Regularly backup your data from Settings. This ensures you can restore it if you switch browsers, upgrade devices, or accidentally clear your browser data.
                    </p>
                </div>
            </div>

            <div className="onboarding-actions-between">
                <button className="btn btn-secondary" onClick={handleBack}>
                    <ArrowLeft size={18} style={{ marginRight: '0.5rem', display: 'inline-block' }} /> Back
                </button>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-ghost" onClick={handleSkip}>
                        Skip
                    </button>
                    <button className="btn btn-primary" onClick={handleNext}>
                        Continue <ArrowRight size={18} style={{ marginLeft: '0.5rem', display: 'inline-block' }} />
                    </button>
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="onboarding-content">
            <div className="onboarding-welcome">
                <h1>Set Up Your Account</h1>
                <p>Let's configure your financial tracking</p>
            </div>

            <div className="onboarding-card">
                <h2>Review your money. Don't guess.</h2>

                <p>
                    Every month, money leaves your account whether you pay attention or not.
                </p>

                <p>Your bank statement already tells the truth. This app exists to help you review that truth calmly, at a pace that works for you. You can do it daily, weekly, or monthly. We default to monthly so it stays simple.</p>

                <ul className="onboarding-list">
                    <li>
                        <span className="onboarding-list-bullet">•</span>
                        <span>Where your money actually goes</span>
                    </li>
                    <li>
                        <span className="onboarding-list-bullet">•</span>
                        <span>What matters to you</span>
                    </li>
                    <li>
                        <span className="onboarding-list-bullet">•</span>
                        <span>What you can cut out</span>
                    </li>
                </ul>

                <div className="onboarding-callout">
                    <p>
                        You will enter income and expenses manually. That is intentional.
                        Reviewing each transaction forces clarity. Clarity changes behaviour.
                    </p>
                    <p>
                        The first time might take 20–30 minutes. That's normal.
                        You'll get faster as your categories settle and the habit forms.
                    </p>
                    <p>
                        This is not about perfection.
                        It's about understanding your own numbers.
                    </p>
                </div>
            </div>

            <div className="onboarding-card">
                <h2>Step 1: Choose your Currency</h2>
                <p>Select the currency you use for your main accounts. You can change this later if needed.</p>

                <CurrencySelector
                    currentCurrency={data.currency}
                    onSelect={setCurrency}
                />
            </div>

            <div className="onboarding-actions-between">
                <button className="btn btn-secondary" onClick={handleBack}>
                    <ArrowLeft size={18} style={{ marginRight: '0.5rem', display: 'inline-block' }} /> Back
                </button>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-ghost" onClick={handleSkip}>
                        Skip
                    </button>
                    <button className="btn btn-primary" onClick={handleNext}>
                        Continue <ArrowRight size={18} style={{ marginLeft: '0.5rem', display: 'inline-block' }} />
                    </button>
                </div>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="onboarding-content">
            <div className="onboarding-step-title">
                <h1>Step 2: Add Your Income</h1>
                <p>Start by recording your income sources for the month</p>
            </div>

            <div className="onboarding-columns">
                <div className="onboarding-card">
                    <h3>Why add income first?</h3>
                    <p>Everything else depends on income. Without it, there's no context for your spending and savings.</p>
                    <p>Use your bank statement or payslip to add accurate amounts.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="onboarding-card">
                        <IncomeForm />
                    </div>

                    {data.incomes.length > 0 && (
                        <div className="onboarding-card" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                            <h4 style={{ color: '#34d399', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Check size={16} /> Income Added ({data.incomes.length} {data.incomes.length === 1 ? 'source' : 'sources'})
                            </h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {data.incomes.map(inc => (
                                    <li key={inc.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', backgroundColor: 'rgba(16, 185, 129, 0.2)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '0.5rem', color: '#d1d5db' }}>
                                        <span>{inc.source}</span>
                                        <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#6ee7b7' }}>
                                            {inc.amount.toLocaleString()}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            <div className="onboarding-actions-between">
                <button className="btn btn-secondary" onClick={handleBack}>
                    <ArrowLeft size={18} style={{ marginRight: '0.5rem', display: 'inline-block' }} /> Back
                </button>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-ghost" onClick={handleSkip}>
                        Skip
                    </button>
                    <button className="btn btn-primary" onClick={handleNext}>
                        Continue <ArrowRight size={18} style={{ marginLeft: '0.5rem', display: 'inline-block' }} />
                    </button>
                </div>
            </div>
        </div>
    );

    const renderStep5 = () => (
        <div className="onboarding-content">
            <div className="onboarding-step-title">
                <h1>Step 3: Review Categories</h1>
                <p>Organize your spending into Income, Needs, Wants, and Savings</p>
            </div>

            <div className="onboarding-columns">
                <div className="onboarding-sidebar">
                    <h3>Why this matters</h3>
                    <p style={{ marginBottom: '0.75rem' }}>Categories decide how your spending is interpreted.</p>
                    <p style={{ marginBottom: '0.75rem' }}>Wrong categories lead to wrong conclusions about your financial health.</p>
                    <p style={{ color: '#93c5fd', fontWeight: 500 }}>We've added sensible defaults. You can customize them now or later.</p>
                </div>

                <div className="onboarding-card">
                    <CategoryManager />
                </div>
            </div>

            <div className="onboarding-actions-between">
                <button className="btn btn-secondary" onClick={handleBack}>
                    <ArrowLeft size={18} style={{ marginRight: '0.5rem', display: 'inline-block' }} /> Back
                </button>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-ghost" onClick={handleSkip}>
                        Skip
                    </button>
                    <button className="btn btn-primary" onClick={handleNext}>
                        Continue <ArrowRight size={18} style={{ marginLeft: '0.5rem', display: 'inline-block' }} />
                    </button>
                </div>
            </div>
        </div>
    );

    const renderStep6 = () => (
        <div className="onboarding-content">
            <div className="onboarding-step-title">
                <h1>Step 4: Add Your Expenses</h1>
                <p>Review your bank statement and enter your expenses. You don't need to enter everything right now - just add a few to get started.</p>
            </div>

            <div className="onboarding-columns">
                <div className="onboarding-card">
                    <h3>Your Running Total</h3>
                    <div style={{ fontSize: '1.875rem', fontFamily: 'monospace', fontWeight: 'bold', color: 'white', marginBottom: '1.5rem' }}>
                        {data.expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                        <span style={{ fontSize: '0.875rem', fontWeight: 'normal', color: '#6b7280', marginLeft: '0.5rem' }}>{data.currency}</span>
                    </div>

                    <div style={{ paddingTop: '1rem', borderTop: '1px solid #374151' }}>
                        <h4 style={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.75rem' }}>What to look for:</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.875rem', color: '#d1d5db' }}>
                            <li style={{ display: 'flex', alignItems: 'start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <span style={{ color: '#f87171' }}>•</span>
                                <span>Repeated spending</span>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <span style={{ color: '#f87171' }}>•</span>
                                <span>Forgotten subscriptions</span>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                                <span style={{ color: '#f87171' }}>•</span>
                                <span>Habits you stopped questioning</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="onboarding-card">
                    <ExpenseLedger />
                </div>
            </div>

            <div className="onboarding-actions-between">
                <button className="btn btn-secondary" onClick={handleBack}>
                    <ArrowLeft size={18} style={{ marginRight: '0.5rem', display: 'inline-block' }} /> Back
                </button>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-ghost" onClick={handleSkip}>
                        Skip
                    </button>
                    <button className="btn btn-primary" onClick={handleNext}>
                        Continue <ArrowRight size={18} style={{ marginLeft: '0.5rem', display: 'inline-block' }} />
                    </button>
                </div>
            </div>
        </div>
    );

    const renderStep7 = () => (
        <div className="onboarding-completion">
            <div className="onboarding-success-icon">
                <Check size={40} strokeWidth={3} style={{ color: 'white' }} />
            </div>
            <h1>You're All Set!</h1>
            <p>Your financial data is ready to review</p>

            <div className="onboarding-card">
                <h2>What happens next?</h2>

                <p>
                    As you add more data each month, your dashboards and reports will automatically update to show patterns and trends.
                </p>

                <div className="onboarding-callout">
                    <p>
                        <strong style={{ color: '#93c5fd' }}>Tip:</strong> Don't overthink the charts.
                        Just read the summaries, notice what stands out, and adjust your spending next month based on what you learn.
                    </p>
                </div>
            </div>

            <button
                className="btn btn-primary"
                onClick={handleFinish}
                style={{ width: '100%', padding: '1rem', fontSize: '1.125rem', fontWeight: 'bold' }}
            >
                Go to Dashboard <ArrowRight size={20} style={{ marginLeft: '0.5rem', display: 'inline-block' }} />
            </button>
        </div>
    );

    return (
        <div className="onboarding-container">
            <div className="onboarding-header">
                <div className="onboarding-header-content">
                    <div className="onboarding-header-top">
                        <div className="onboarding-branding">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <img src="/kannadi/kannadilogo.webp" alt="Kannadi" style={{ width: '32px', height: '32px' }} />
                                <div>
                                    <h2>Kannadi</h2>
                                    <p>Setup Wizard</p>
                                </div>
                            </div>
                        </div>
                        <div className="onboarding-progress-text">
                            <div className="onboarding-progress-label">Progress</div>
                            <div className="onboarding-progress-step">Step {step} of 7</div>
                        </div>
                    </div>

                    <div className="onboarding-progress-bar">
                        <div
                            className="onboarding-progress-fill"
                            style={{ width: `${(step / 7) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="onboarding-main">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
                {step === 5 && renderStep5()}
                {step === 6 && renderStep6()}
                {step === 7 && renderStep7()}
            </div>
        </div>
    );
};

export default OnboardingPage;

