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
                { key: "QUARTERLY_CORPORATE_PROFILE", id: "unidentified-quarterly_corporate-profile", name: "Corporate Profile Report", detect: ["CP1_CP001"] },
                { key: "QUARTERLY_CORPORATE_PROFILE_OTHER", id: "unidentified-quarterly_corporate-profile-other", name: "Corporate Profile Report: Other Information", detect: ["CP6_CO001"] },
                { key: "QUARTERLY_CORPORATE_PROFILE_BOARD", id: "unidentified-quarterly_corporate-profile-board", name: "Corporate Profile Report  Board Information", detect: ["CP8_CI001"] },
                { key: "QUARTERLY_LONG_OUTSTANDING_ITEMS", id: "unidentified-quarterly_long-outstanding-items", name: "Long Outstanding Items", detect: ["LON_OUT_ITELI001"] },
            ]
        },
    ],
}