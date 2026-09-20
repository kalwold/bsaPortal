export const digitalConfig = {
    id: "digital-banking",
    name: "Digital Banking",
    periods: [
        {
            id: "quarterly",
            name: "Quarterly",
            reportTypes: [
                { key: "QUARTERLY_ATM_POS", id: "digital-quarterly_atm-pos", name: "BSD Quarterly ATM and POS", detect:  ["MOB_TRA_QM001", "QM001"] },
                { key: "QUARTERLY_MOBILE_TRANSACTIONS", id: "digital-quarterly_mobile-transaction", name: "Quarterly Mobile Transactions Report", detect: ["QUA_ATM_POS_QP001", "QP001"] },
            ],
        },
    ],
}