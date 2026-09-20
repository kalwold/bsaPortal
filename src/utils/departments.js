// departments.js
// SINGLE SOURCE OF TRUTH for departments, periods and reports.
// Each report: { key, id, name }
//   key  -> name used in code as REPORT_TYPES.<key>
//   id   -> string used in URLs, the dropdown, and saved as reportTypeId
//   name -> label shown in the UI
// To add a report: add ONE line here (+ its extractor and its REPORT_FILES / detect rule).

export const DEPARTMENTS = [
    {
        id: "ibd",
        name: "IBD",
        periods: [
            {
                id: "daily",
                name: "Daily",
                reportTypes: [
                    { key: "DAILY_FOREX", id: "ibd-daily_single-currency", name: "Daily Foreign Currency Exposure" },
                ],
            },
        ],
    },
    {
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
    },
    {
        id: "credit",
        name: "Credit",
        periods: [
            {
                id: "monthly",
                name: "Monthly",
                reportTypes: [
                    { key: "LOAN_RELATED_PARTIES", id: "credit-monthly_loan-related", name: "Loans to Related Parties Report" },
                    { key: "LOAN_BREAKDOWN", id: "credit-monthly_loan-breakdown", name: "Breakdown of Loans and Advances" },
                    { key: "LOAN_PORTFOLIO", id: "credit-monthly_loan-portfolio", name: "Loan and Advances Portfolio Report" },
                    { key: "NPL_PROVISIONS", id: "credit-monthly_loan-nonperforming", name: "Non-Performing Loans and Advances & Provisions" },
                    { key: "LOAN_DISBURSEMENT", id: "credit-monthly_loan-disbursement", name: "Loan & Advance Disbursement, Collection and Outstanding Report" },
                    { key: "LOAN_STATUS", id: "credit-monthly_loan-status", name: "Loan and Advance by Status" },
                    { key: "LOAN_CLASSIFICATION", id: "credit-monthly_loan-classification", name: "Loan Classification and Provisioning" },
                    { key: "LARGE_BORROWERS", id: "credit-monthly_large-borrowers", name: "List of Borrowers that Exceed Ten Percent of the Banks Capital" },
                    { key: "LOAN_RANGE_REGION", id: "credit-monthly_loan-range-region", name: "Loans by Range and Region" },
                    { key: "LOAN_SECTOR_REGION", id: "credit-monthly_loan-sector-region", name: "Loans by Sector and Region" },
                ],
            },
            {
                id: "quarterly",
                name: "Quarterly",
                reportTypes: [
                    // Same report as the Monthly entry, listed here too. No key on purpose:
                    // the key already belongs to the Monthly entry. Remove this line if it was a slip.
                    { id: "credit-monthly_loan-nonperforming", name: "Non-Performing Loans and Advances & Provisions" },
                    { key: "COLLATERALIZED_PROPERTY_SOLD_LAST18", id: "credit-quarterly_loan-collateralized-properties", name: "Collateralized Properties Foreclosed and Sold during the last 18 Consecutive Months" },
                    { key: "LOAN_CLASSIFICATION_PROVISIONING", id: "credit-quarterly_loan-classification", name: "Loan Classification and Provisioning" },
                    { key: "NPL_SECTOR_BRANCH", id: "credit-quarterly_loan-npl-ecosec-branch", name: "BSD Quarterly NPLs Report by Economic Sector and Branch" },
                    { key: "COLLATERALIZED_PROPERTY_ACQUIRED_LAST18", id: "credit-quarterly_collateralized-property-acquired-last18", name: "Collateralized Properties Acquired during the last 18 Consecutive Months" },
                    { key: "LOAN_RANGE_REGION_QUARTERLY", id: "credit-quarterly_range-region", name: "Quarterly Conventional Loans by Range and Region" },
                    { key: "CONVENTIONAL_LOAN_SECTOR_REGION", id: "credit-quarterly_loans-sector-region", name: "Conventional Loans by Sector and Region" },
                    { key: "Q_TOP_TWENTY_NPL", id: "credit-quarterly_loan-nonperforming-top20", name: "Quarterly Top Twenty (20) NPLs Report" },
                    { key: "TOP20_BORROWERS", id: "credit-quarterly_top20-borrowers", name: "Quarterly Top Twenty (20) Borrowers Report" },
                    { key: "BUILDING_CONSTRUCTION", id: "credit-quarterly_building-construction", name: "Loans to Building and Construction" },
                    { key: "QUARTERLY_RESTRUCTURED_LOANS", id: "credit-quarterly_aggregate-restructured-loans", name: "Aggregate of All Restructured Loans And Advances" },
                    { key: "QUARTERLY_DIGITAL_LENDING", id: "credit-quarterly_digital-lending", name: "Quarterly Digital Lending Report" },
                    { key: "QUARTERLY_RECATEGORIZED_LOANS", id: "credit-quarterly_recategorized-loans", name: "Loans And Advances Re-Categorized from Non-Accrual To Accrual Status That Are Equal To Or Above Five Percent (5%) of The Bank's Total Capital" },
                    { key: "QUARTERLY_OFF_BALANCE_PROVISIONING", id: "credit-quarterly_off-balance-provisioning", name: "Provisioning For Off-Balance Sheet Exposure" },
                    { key: "QUARTERLY_RESTRUCTURED_ABOVE_5PCT", id: "credit-quarterly_restructured-above-5pct", name: "Restructured Loans And Advances That Are Equal To or Above Five Percent (5%) of Total Capital of The Bank" },
                ],
            },
        ],
    },
    {
        id: "ifb",
        name: "IFB",
        periods: [
            {
                id: "monthly",
                name: "Monthly",
                reportTypes: [
                    { key: "IFB_RANGE_REGION", id: "ifb-monthly_deposit-range-region", name: "Report on IFB Deposits by Range and Region" },
                    { key: "IFB_SECTOR_REGION", id: "ifb-monthly_deposit-sector-region", name: "Report on IFB Deposits by Sector and Region" },
                    { key: "IFB_LOAN_RANGE_REGION", id: "ifb-monthly_loan-range-region", name: "IFB Loans by Range and Region" },
                    { key: "IFB_LOAN_SECTOR_REGION", id: "ifb-monthly_loan-sector-region", name: "IFB Loans by Sector and Region" },
                ],
            },
            {
                id: "quarterly",
                name: "Quarterly",
                reportTypes: [
                    { key: "IFB_BALANCE_SHEET", id: "ifb-monthly_balance-sheet", name: "Interest Free Banking Service Balance sheet" },
                    { key: "IFB_PROFIT_LOSS", id: "ifb-monthly_profit-loss", name: "Interest Free Banking Service Profit and loss statement" },
                    { key: "IFB_LOAN_RANGE_REGION_QUARTERLY", id: "ifb-quarterly_loan-range-region", name: "Quarterly Interest Free Loans by Range and Region" },
                    { key: "IFB_LOAN_SECTOR_REGION_QUARTERLY", id: "ifb-quarterly_loan-sector-region", name: "Quarterly Interest Free Loans by Sector and Region" },
                    { key: "IFB_DEPOSIT_RANGE_REGION_QUARTERLY", id: "ifb-quarterly_deposit-range", name: "Quarterly Interest Free Deposits by Range and Region" },
                    { key: "IFB_DEPOSIT_SECTOR_REGION_QUARTERLY", id: "ifb-quarterly_deposit-sector", name: "Quarterly Interest Free Deposits by Sector and Region" },
                ],
            },
        ],
    },
    {
        id: "share",
        name: "Share",
        periods: [
            {
                id: "quarterly",
                name: "Quarterly",
                reportTypes: [
                    { key: "QUARTERLY_TOP20_SHAREHOLDERS", id: "share-quarterly_top20-shareholders", name: "Top Twenty (20) Shareholding Structure Report" },
                    { key: "QUARTERLY_TWO_PERCENT_SHAREHOLDERS", id: "share-quarterly_two-percent-shareholdings", name: "Two Percent (2%) and above Shareholdings of the Banks Total Share Capital Report" },
                ],
            },
        ],
    },
    {
        id: "digital-banking",
        name: "Digital Banking",
        periods: [
            {
                id: "quarterly",
                name: "Quarterly",
                reportTypes: [
                    { key: "QUARTERLY_ATM_POS", id: "digital-quarterly_atm-pos", name: "BSD Quarterly ATM and POS" },
                    { key: "QUARTERLY_MOBILE_TRANSACTIONS", id: "digital-quarterly_mobile-transaction", name: "Quarterly Mobile Transactions Report" },
                ],
            },
        ],
    },
];

// ---------------------------------------------------------------------------
// Derived data (do not edit by hand)
// ---------------------------------------------------------------------------

const allReports = DEPARTMENTS.flatMap((d) =>
    d.periods.flatMap((p) => p.reportTypes),
);

// Flat shape used by reportService: [{ id, name, reportTypes: [...] }]
export const DEPARTMENT_DATA = DEPARTMENTS.map((dept) => ({
    id: dept.id,
    name: dept.name,
    reportTypes: dept.periods.flatMap((p) => p.reportTypes),
}));

// Replaces reportTypes.js: REPORT_TYPES.EXPENSE_BREAKDOWN_QUARTERLY -> "finance-quarterly_breakdown-expenses"
export const REPORT_TYPES = Object.freeze(
    Object.fromEntries(
        allReports.filter((r) => r.key).map((r) => [r.key, r.id]),
    ),
);

export const getDepartment = (departmentId) =>
    DEPARTMENTS.find((d) => d.id === departmentId);

export const findReportType = (reportTypeId) => {
    for (const dept of DEPARTMENTS) {
        for (const period of dept.periods) {
            const report = period.reportTypes.find((r) => r.id === reportTypeId);
            if (report) return { department: dept, period, report };
        }
    }
    return null;
};

// ---------------------------------------------------------------------------
// Dev-only consistency check
// ---------------------------------------------------------------------------
if (process.env.NODE_ENV === "development") {
    const ids = new Set();
    const keys = new Set();

    allReports.forEach((r) => {
        if (ids.has(r.id)) {
            // A repeated id is only OK when it has no key (an intentional menu repeat)
            if (r.key) console.warn(`[departments] duplicate id "${r.id}"`);
            return;
        }
        ids.add(r.id);

        if (!r.key) {
            console.warn(`[departments] report "${r.id}" has no key`);
        } else if (keys.has(r.key)) {
            console.warn(`[departments] duplicate key "${r.key}"`);
        } else {
            keys.add(r.key);
        }
    });
}