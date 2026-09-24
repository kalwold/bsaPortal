export const ifbConfig = {
    id: "ifb",
    name: "IFB",
    periods: [
        {
            id: "monthly",
            name: "Monthly",
            reportTypes: [
                { key: "IFB_RANGE_REGION", id: "ifb-monthly_deposit-range-region", name: "Report on IFB Deposits by Range and Region", detect:  ["DIR RANGE", "RD001"]},
                { key: "IFB_SECTOR_REGION", id: "ifb-monthly_deposit-sector-region", name: "Report on IFB Deposits by Sector and Region", detect: ["DIF", "IF002"] },
                { key: "IFB_LOAN_RANGE_REGION", id: "ifb-monthly_loan-range-region", name: "IFB Loans by Range and Region", detect: ["IFB_LON_R & R", "WW002"] },
                { key: "IFB_LOAN_SECTOR_REGION", id: "ifb-monthly_loan-sector-region", name: "IFB Loans by Sector and Region", detect:  ["IFB_LON_S & R", "ZZ002"]},
                { key: "MONTHLY_IFB_WEIGHTED_AVG_LENDING_RATES", id: "ifb-monthly_weighted-avg-lending-rates", name: "Monthly Weighted Average Lending Profit Rates (Interest-Free Banks)", detect:  ["IFBLCMWAL001"]},
                { key: "MONTHLY_IFB_WEIGHTED_AVG_DEPOSIT_RATES", id: "ifb-monthly_weighted-avg-deposit-rates", name: "Monthly Weighted Average Deposit Profit Rates (Interest-Free Banks)", detect:  ["DPWADP001"]},
            ],
        },
        {
            id: "quarterly",
            name: "Quarterly",
            reportTypes: [
                { key: "IFB_BALANCE_SHEET", id: "ifb-quarterly_balance-sheet", name: "Interest Free Banking Service Balance sheet", detect:  ["INT_FRE_BS", "FB001"]},
                { key: "IFB_PROFIT_LOSS", id: "ifb-quarterly_profit-loss", name: "Interest Free Banking Service Profit and loss statement", detect: ["INT_FRE_SP", "BP001"] },
                { key: "IFB_LOAN_RANGE_REGION_QUARTERLY", id: "ifb-quarterly_loan-range-region", name: "Quarterly Interest Free Loans by Range and Region", detect:  ["INT_LON_R&R_EE002"]},
                { key: "IFB_LOAN_SECTOR_REGION_QUARTERLY", id: "ifb-quarterly_loan-sector-region", name: "Quarterly Interest Free Loans by Sector and Region", detect: ["INT_LON_S&R_SR002"] },
                { key: "IFB_DEPOSIT_RANGE_REGION_QUARTERLY", id: "ifb-quarterly_deposit-range", name: "Quarterly Interest Free Deposits by Range and Region", detect:  ["INT_FRE_RANID002"]},
                { key: "IFB_DEPOSIT_SECTOR_REGION_QUARTERLY", id: "ifb-quarterly_deposit-sector", name: "Quarterly Interest Free Deposits by Sector and Region", detect: ["INT_FRE_SECRI003"]},
            ],
        },
    ],
}