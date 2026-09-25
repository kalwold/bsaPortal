export const branchOpsConfig = {
  id: "branchOps",
  name: "Branch Operation",
  periods: [
    {
      id: "quarterly",
      name: "Quarterly",
      reportTypes: [
        {
          key: "SUMMARY_FRAUD_OUTSTANDING",
          id: "branchOps-quarterly_summary-fraud-outstanding",
          name: "Quarterly Summary Report on Fraud Outstanding",
          detect: ["FRA_OUT_FO002"],
        }
      ],
    },
  ],
};
