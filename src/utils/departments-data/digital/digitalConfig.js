export const digitalConfig = {
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
}