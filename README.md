# Simple Finance 💰

A modern, privacy-focused personal finance tracker built to help you master the **50/30/20 rule**.

![Simple Finance Dashboard](https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=2000)
*(Replace with actual dashboard screenshot)*

## Features 🌟

- **App Shell Architecture**: A modern, responsive layout with sidebar navigation and dedicated workspaces.
- **Dashboard**: High-level financial health check.
    - **Savings Summary**: Instant view of your net savings and rates.
    - **Monthly Summary**: Clear, English-language breakdown of your spending.
    - **Smart Projections**: "If this continues" forecast alongside a **Savings Goal Calculator**.
- **Reports & Analysis**: Deep dives into your data.
    - **Budget vs Actual**: Visual progress bars for Needs, Wants, and Savings.
    - **Income vs Expenses**: Trend analysis over time.
- **Transactions Workspace**:
    - **Income Management**: Log multiple income sources.
    - **Expense Ledger**: Detailed record of all spending.
    - **Filtering**: Sort and filter by date, category, or amount.
- **Settings & Configuration**:
    - **Currency Support**: Choose your preferred currency symbol (£, $, €, etc.).
    - **Custom Categories**: Manage your own spending categories with emoji support.
    - **Data Management**: Import/Export your data safely.

## 🚀 Tech Stack

- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: Vanilla CSS (Modern Variables & Flexbox/Grid)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/simple-finance.git
    cd simple-finance
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

## 📦 Deployment

This project is configured for **GitHub Pages**.

1.  Update `vite.config.ts` with your repository name:
    ```typescript
    base: '/simple-finance/', // Replace with your repo name
    ```

2.  Deploy with a single command:
    ```bash
    npm run deploy
    ```

## 📸 Screenshots

### Expense Ledger
*Rapidly add and edit expenses with a spreadsheet-like interface.*
![Expense Ledger](./screenshots/ledger.png)

### Data Management
*Securely backup and restore your data.*
![Backup UI](./screenshots/backup.png)

## 📄 License

MIT License - feel free to use this for your own financial journey!
