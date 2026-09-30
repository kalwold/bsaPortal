export const unidentifiedConfig = {
  id: "unidentified",
  name: "Unidentified",
  periods: [
    {
      id: "quarterly",
      name: "Quarterly",
      reportTypes: [
        {
          key: "QUARTERLY_AGENT_INFO_REGION",
          id: "unidentified-branchOps-quarterly_agent-info-region",
          name: "Agent Information by Region",
          detect: ["AGT_INFO_REG_AI001"],
        },
        {
          key: "QUARTERLY_AVG_INTEREST_RATE_DEPOSITS_DEBTS",
          id: "unidentified-branchOps-quarterly_avg-interest-rate-deposits",
          name: "Corporate Profile Report Average Interest Rate on Deposits and Other Debts",
          detect: ["CP4_CD001", "CD001"],
        },
        {
          key: "QUARTERLY_AVG_INTEREST_RATE_LOANS",
          id: "unidentified-quarterly_avg-interest-rate-loans",
          name: "Corporate Profile Report Average Interest Rate on Loan Products or Other Investments",
          detect: ["CP5_CL001", "CL001"],
        },
        {
          key: "QUARTERLY_FRAUD_OUTSTANDING",
          id: "unidentified-quarterly_fraud-outstanding",
          name: "Quarterly Summary Report on Fraud Outstanding",
          detect: ["FRA_OUT_FO002"],
        },
        {
          key: "QUARTERLY_NEW_AGENTS_INFORMATION",
          id: "unidentified-branchOps-quarterly_new-agents-information",
          name: "BSD Quarterly New Agents Information Report",
          detect: ["AG_INFO_NA001"],
        },
        {
          key: "QUARTERLY_NEW_AGENT_TRANSACTION_BY_TYPE_AMOUNT",
          id: "unidentified-quarterly_agent-transaction-by-type-and-amount",
          name: "Quarterly Agent Transaction by Type and Amount",
          detect: ["AGT_TRA&AMT_QA001"],
        },
        {
          key: "QUARTERLY_LOANS_TO_INSIDERS",
          id: "unidentified-quarterly_loans-to-insiders",
          name: "Quarterly Loans to Insiders Report",
          detect: ["INS_LOAN_QR002"],
        },
        {
          key: "QUARTERLY_HIGH_IMPACT_IT_INCIDENT",
          id: "unidentified-quarterly_high-impact-it-incident",
          name: "High Impact IT Incident Report",
          detect: ["ITRHITI001"],
        },
      ],
    },
  ],
};
