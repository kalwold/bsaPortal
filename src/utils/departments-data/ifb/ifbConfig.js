export const ifbConfig = {
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
}