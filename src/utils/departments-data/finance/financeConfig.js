export const financeConfig
    = {
    id: "finance",
    name: "Finance",
    periods: [
        {
            id: "weekly",
            name: "Weekly",
            reportTypes: [
                { key: "LIQUIDITY_WEEKLY", id: "finance-weekly_liquidity", name: "Liquidity Requirement Report", detect: ["ZS001"] },
            ],
        },
        {
            id: "monthly",
            name: "Monthly",
            reportTypes: [
                { key: "MONTHLY_BALANCE", id: "finance-monthly_balance-sheet", name: "Balance Sheet", detect:  ["FASDBSFABS001"]},
                { key: "RESERVE_BASE", id: "finance-monthly_reserve", name: "Monthly Reserve Base Report", detect: ["Reserve Base", "RB001"]},
                { key: "STATUTORY_REQ", id: "finance-monthly_statutory", name: "Statutory Reserve Requirement Report", detect:  ["SRRYY001"]},
                { key: "KEY_BALANCE_SHEET", id: "finance-monthly_key-balance-sheet", name: "Key Balance Sheet Report", detect:  ["Key Balance Sheet", "MK001"]},
                { key: "CAPITAL_ADEQUACY", id: "finance-monthly_capital-adequacy", name: "CAPITAL ADEQUACY REPORT (Monthly) - Capital Components", detect: ["M_CC-On & Off", "KK001"] },
                { key: "DEPOSIT_SECTOR_REGION", id: "finance-monthly_deposit-sector-region", name: "Report on Deposits by Sector and Region", detect:  ["CDby Sector and RegMD002", "MD002"]},
                { key: "DEPOSIT_RANGE_REGION", id: "finance-monthly_deposit-range-region", name: "Report on Deposits by Range and Region", detect: ["CDby Range and Reg", "CM002"] },
            ],
        },
        {
            id: "quarterly",
            name: "Quarterly",
            reportTypes: [
                { key: "EXPENSE_BREAKDOWN_QUARTERLY", id: "finance-quarterly_breakdown-expenses", name: "BREAKDOWN OF EXPENSES", detect:  ["BRE_EXPE_BE001"]},
                { key: "INCOME_ACCOUNT_BREAKDOWN", id: "finance-quarterly_breakdown-income-account", name: "Breakdown of Income Accounts", detect:  ["BRE_INCO_BA001"]},
                { key: "CAPITAL_ADEQUACY_OFFBALANCESHEET", id: "finance-quarterly_off-balancesheet", name: "CAPITAL ADEQUACY REPORT: Off-Balance Sheet", detect:  ["CAP_ADQ_OFB_QO001"]},
                { key: "DEPOSIT_RANGE_REGION_QUARTERLY", id: "finance-quarterly_deposit-range-region", name: "Quarterly Report on Deposits by Range and Region", detect:  ["DEP_RAN&REG_DR002"]},
                { key: "FINANCE_PROFIT_LOSS", id: "finance-quarterly_profit-loss", name: "PROFIT AND LOSS STATEMENT", detect:  ["PRO&LOS_PL001"]},
                { key: "CAPITAL_ADEQUACY_ONBALANCESHEET", id: "finance-quarterly_on-balancesheet", name: "CAPITAL ADEQUACY REPORT - On Balance Sheet", detect:  ["CAP_ADQ_ITEM_QI001"]},
                { key: "CAPITAL_ADEQUACY_QUARTERLY", id: "finance-quarterly_capital-adequacy", name: "CAPITAL ADEQUACY REPORT (QUARTERLY) - Capital Components", detect:  ["CAP_ADQ_CAP_QC001"]},
                { key: "QUARTERLY_BALANCE_SHEET", id: "finance-quarterly_balance-sheet", name: "Quarterly Balance Sheet", detect:  ["BAL_SHEET_BS001", "BS001"]},
                { key: "QUARTERLY_TOP_TWENTY_DEPOSITORS", id: "finance-quarterly_top-twenty-depositors", name: "Quarterly Top Twenty Depositors", detect:  ["NBE_20_DEP_MR001"]},
                { key: "QUARTERLY_MATURITY_OF_ASSETS_LIABILITIES", id: "finance-quarterly_maturity-assets-liabilities", name: "Quarterly Maturity of Assets & Liabilities", detect:  ["NBE_MAT_ANL_MA001"]},
                { key: "QUARTERLY_MEMORANDUM_AND_CONTINGENT_ACCOUNTS", id: "finance-quarterly_memorandum", name: "Quarterly Memorandum and Contingent Accounts", detect:  ["MEM&CONT_MM001"]},
                { key: "QUARTERLY_TRANSACTION_STATEMENT", id: "finance-quarterly_transaction-statement", name: "Quarterly Transaction Statement with Financial Institutions", detect:  ["TRAN_STAT", "QQ001"]},
            ],
        },
    ],
}