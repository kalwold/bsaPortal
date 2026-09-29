export const unidentifiedConfig = {
    id: "unidentified",
    name: "Unidentified",
    periods: [
        {
            id: "quarterly",
            name: "Quarterly",
            reportTypes: [
                { key: "QUARTERLY_AGENT_TRANSACTION", id: "unidentified-digital-quarterly_agent-transactions", name: "Agent Transaction by Type and Amount", detect: ["AGT_TRA&AMT_QA001"] },
                { key: "QUARTERLY_LOANS_TO_INSIDERS", id: "unidentified-credit-quarterly_loans-to-insiders", name: "Loans to Insiders Report", detect: ["INS_LOAN_QR002"] },
                { key: "QUARTERLY_BSD_NEW_AGENTS", id: "unidentified-digital-quarterly_new-agents", name: "BSD New Agents Information Report", detect: ["AG_INFO_NA001"] },
                { key: "QUARTERLY_RELATED_ORG", id: "unidentified-share-quarterly_related-organizations", name: "List of Related Organizations", detect: ["REL_ORG_LO001"] },
            ]
        },
    ],
}