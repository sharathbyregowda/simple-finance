# Kannadi (pronounced kuh-NAH-dee)

**See your numbers.**

![Kannadi - See your numbers](./public/kannadi-banner.webp)

**Kannadi** (pronounced *kuh-NAH-dee*) means "mirror" in Kannada. Kannadi reflects your money habits back to you, exactly as they are.

Track income, expenses, savings, and cash flow over time in one place.

## ✨ Key Features

### 🎯 Goal Planning
- **Goal Planner Calculator**: Estimate how long it takes to reach your savings goals using your real financial data
  - Focuses on cash balance (unallocated cash after expenses and savings)
  - Requires 3+ months of data for accurate projections
  - Provides estimated completion dates and actionable insights
  - State persists across sessions using localStorage

### 📊 Dashboard & Analytics
- **Premium Onboarding Flow**: Multi-step guided setup with clear progress tracking
- **Redesigned Financial Journey**: Horizontal card-based layout with radial progress indicators
- **Insight-Driven Summaries**: Monthly and Yearly summaries as visual "Insight Cards" with color-coded sentiment
- **Unified Projections View**: Side-by-side dashboard for forecasts and milestones
- **Savings Summary**: Instant view of net savings and savings rates

### 💼 Transaction Management
- **Income Tracking**: Add and manage income sources with monthly/yearly filtering
- **Expense Ledger**: Spreadsheet-like interface for rapid expense entry
- **Recurring Transactions**: Set up monthly recurring income and expenses that auto-apply
  - Configure day of month for each transaction
  - Supports both categories and subcategories
  - Pause/resume individual transactions
  - Review pending transactions before applying
- **Smart Filtering**: Seamlessly switch between monthly and yearly views
- **Category Breakdown**: Visual analysis of spending by category

### ⚙️ Settings & Configuration
- **Multi-Currency Support**: Choose from USD, EUR, GBP, INR, and more
- **Custom Categories**: Create your own spending categories with emoji icons and subcategories
- **Data Privacy**: All data stored locally in your browser - no servers, no accounts
- **Robust Backup/Restore**: Export and import your data with full backward compatibility
- **Data Migration**: Automatic updates to latest data format

### 📈 Reports & Analysis
- **Monthly Trends**: Track income, expenses, and savings over time
- **Category Analysis**: Detailed breakdown with charts and percentages
- **50/30/20 Budget**: Compare actual spending vs recommended allocation
- **Financial Projections**: "If This Continues" calculator for long-term planning

## 📱 Mobile Responsive

- **Bottom Navigation Bar**: Quick access to key screens on mobile
- **Touch-Friendly**: 44px touch targets, larger inputs
- **Horizontal Scroll Tables**: Expense ledger scrolls smoothly on small screens
- **iOS Safe Area Support**: Works great on notched iPhones

## 🔒 Privacy First

- ✅ **No servers** - All data stays on your device
- ✅ **No accounts** - No sign-up required
- ✅ **No tracking** - Your financial data is yours alone
- ✅ **Offline-first** - Works without internet connection
- ✅ **Open source** - Full transparency of how your data is handled

## 🚀 Tech Stack

- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: Vanilla CSS (Modern Variables & Flexbox/Grid)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Testing**: [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/)
- **Router**: [React Router](https://reactrouter.com/)

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/sharathbyregowda/simple-finance.git
   cd simple-finance
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173/simple-finance/`

## 🧪 Testing

Run the test suite:
```bash
# Unit and component tests
npm test

# Run tests with UI
npm run test:ui

# E2E tests (Playwright)
npm run test:e2e
```

## 📦 Build & Deployment

This project is configured for **GitHub Pages**.

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy to GitHub Pages:
   ```bash
   npm run deploy
   ```

The app will be available at `https://sharathbyregowda.github.io/kannadi/`

## 📸 Screenshots

### Dashboard
*Get a quick overview of your financial health*

### Goal Planner
*Calculate how long it takes to reach your savings goals*

### Expense Ledger
*Rapidly add and edit expenses with a spreadsheet-like interface*

### Data Management
*Securely backup and restore your data*

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [x] Recurring transactions ✅
- [ ] Bill reminders
- [ ] Multi-account support
- [ ] Budget templates
- [ ] Advanced reporting (PDF export)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Bug Reports

Found a bug? Please open an issue on GitHub with:
- Description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)

## 📄 License

MIT License - feel free to use this for your own financial journey!

## 👨‍💻 Author

Built with ❤️ by Sharath

---

**Note**: This app is a personal finance tool, not financial advice. It helps you record, review, and understand your own numbers. Any decisions you make using this app are your responsibility.
