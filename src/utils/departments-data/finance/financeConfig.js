export const financeConfig
    = {
    id: "finance",
    name: "Finance",
    periods: [
        {
            id: "weekly",
            name: "Weekly",
            reportTypes: [
                { key: "LIQUIDITY_WEEKLY", id: "finance-weekly_liquidity", name: "Liquidity Requirement Report" },
            ],
        },
        {
            id: "monthly",
            name: "Monthly",
            reportTypes: [
                { key: "MONTHLY_BALANCE", id: "finance-monthly_balance-sheet", name: "Balance Sheet" },
                { key: "RESERVE_BASE", id: "finance-monthly_reserve", name: "Monthly Reserve Base Report" },
                { key: "STATUTORY_REQ", id: "finance-monthly_statutory", name: "Statutory Reserve Requirement Report" },
                { key: "KEY_BALANCE_SHEET", id: "finance-monthly_key-balance-sheet", name: "Key Balance Sheet Report" },
                { key: "CAPITAL_ADEQUACY", id: "finance-monthly_capital-adequacy", name: "CAPITAL ADEQUACY REPORT (Monthly) - Capital Components" },
                { key: "DEPOSIT_SECTOR_REGION", id: "finance-monthly_deposit-sector-region", name: "Report on Deposits by Sector and Region" },
                { key: "DEPOSIT_RANGE_REGION", id: "finance-monthly_deposit-range-region", name: "Report on Deposits by Range and Region" },
            ],
        },
        {
            id: "quarterly",
            name: "Quarterly",
            reportTypes: [
                { key: "EXPENSE_BREAKDOWN_QUARTERLY", id: "finance-quarterly_breakdown-expenses", name: "BREAKDOWN OF EXPENSES" },
                { key: "INCOME_ACCOUNT_BREAKDOWN", id: "finance-quarterly_breakdown-income-account", name: "Breakdown of Income Accounts" },
                { key: "CAPITAL_ADEQUACY_OFFBALANCESHEET", id: "finance-quarterly_off-balancesheet", name: "CAPITAL ADEQUACY REPORT: Off-Balance Sheet" },
                { key: "DEPOSIT_RANGE_REGION_QUARTERLY", id: "finance-quarterly_deposit-range-region", name: "Quarterly Report on Deposits by Range and Region" },
                { key: "FINANCE_PROFIT_LOSS", id: "finance-quarterly_profit-loss", name: "PROFIT AND LOSS STATEMENT" },
                { key: "CAPITAL_ADEQUACY_ONBALANCESHEET", id: "finance-quarterly_on-balancesheet", name: "CAPITAL ADEQUACY REPORT - On Balance Sheet" },
                { key: "CAPITAL_ADEQUACY_QUARTERLY", id: "finance-quarterly_capital-adequacy", name: "CAPITAL ADEQUACY REPORT (QUARTERLY) - Capital Components" },
                { key: "QUARTERLY_BALANCE_SHEET", id: "finance-quarterly_balance-sheet", name: "Quarterly Balance Sheet" },
                { key: "QUARTERLY_TOP_TWENTY_DEPOSITORS", id: "finance-quarterly_top-twenty-depositors", name: "Quarterly Top Twenty Depositors" },
                { key: "QUARTERLY_MATURITY_OF_ASSETS_LIABILITIES", id: "finance-quarterly_maturity-assets-liabilities", name: "Quarterly Maturity of Assets & Liabilities" },
                { key: "QUARTERLY_MEMORANDUM_AND_CONTINGENT_ACCOUNTS", id: "finance-quarterly_memorandum", name: "Quarterly Memorandum and Contingent Accounts" },
                { key: "QUARTERLY_TRANSACTION_STATEMENT", id: "finance-quarterly_transaction-statement", name: "Quarterly Transaction Statement with Financial Institutions" },
            ],
        },
    ],
}