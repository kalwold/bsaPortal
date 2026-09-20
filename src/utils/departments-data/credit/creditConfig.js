export const creditConfig = {
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
}