import React, { useState } from 'react';
import { Book, HelpCircle, Info } from 'lucide-react';
import './Onboarding.css';
import '../components/Dashboard.css';

const AboutPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'about' | 'howto' | 'faqs'>('about');

    const renderAbout = () => (
        <div className="founders-letter">
            <div className="founders-letter-header">
                <p className="founders-letter-label">A Note from the Developer</p>
            </div>

            <div className="founders-letter-body">
                <p className="founders-letter-text">
                    Welcome. I built this app for one reason: to help us clearly see and understand our money.
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
                    If you run into issues, spot bugs, or have ideas to improve the app, you can raise them on the{' '}
                    <a
                        href="https://github.com/sharathbyregowda/simple-finance/issues"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="github-link"
                    >
                        GitHub repository
                    </a>.
                </p>

                <div className="disclaimer-box">
                    <p className="disclaimer-title"><strong>A quick note:</strong></p>
                    <p className="disclaimer-text">
                        This app is a personal finance tool, not financial advice. It helps you record, review, and understand your own numbers. Any decisions you make using this app are your responsibility. It does not replace professional financial, tax, or legal advice.
                    </p>
                </div>
            </div>
        </div>
    );

    const renderHowTo = () => (
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>
                How To Guide
            </h2>
            <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                Coming soon. This section will include step-by-step guides on how to use the app effectively.
            </p>
        </div>
    );

    const renderFAQs = () => (
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>
                Frequently Asked Questions
            </h2>
            <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                Coming soon. This section will answer common questions about the app.
            </p>
        </div>
    );

    return (
        <div className="space-y-8" style={{ maxWidth: '100%', margin: '0 auto' }}>
            <header className="page-header">
                <h2 className="page-title">About</h2>
                <p className="page-subtitle">Learn about Simple Finance and how to use it</p>
            </header>

            {/* Tab Navigation */}
            <div className="tabs-container">
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'about' ? 'active' : ''}`}
                        onClick={() => setActiveTab('about')}
                    >
                        <Info size={18} />
                        <span>About</span>
                    </button>
                    <button
                        className={`tab ${activeTab === 'howto' ? 'active' : ''}`}
                        onClick={() => setActiveTab('howto')}
                    >
                        <Book size={18} />
                        <span>How To</span>
                    </button>
                    <button
                        className={`tab ${activeTab === 'faqs' ? 'active' : ''}`}
                        onClick={() => setActiveTab('faqs')}
                    >
                        <HelpCircle size={18} />
                        <span>FAQs</span>
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'about' && renderAbout()}
                {activeTab === 'howto' && renderHowTo()}
                {activeTab === 'faqs' && renderFAQs()}
            </div>
        </div>
    );
};

export default AboutPage;
