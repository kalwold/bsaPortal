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
        },
        {
          key: "ACCESS_POINT_USER",
          id: "branchOps-quarterly_access-point-user",
          name: "Access Point",
          detect: ["POIACC001"],
        },
        {
          key: "DEPOSIT_BENEFICIARIES",
          id: "branchOps-quarterly_deposit-beneficiaries",
          name: "Deposit Account Beneficiaries’ Information for Joint and Trust Account Ownership ",
          detect: ["0016IN05001"],
        },
        {
          key: "INSURED_DEPOSITOR_IFB",
          id: "branchOps-quarterly_insured-depositor-ifb",
          name: "Insured Depositor’s Deposit Balance for Interest-free Depositors",
          detect: ["0015IN04001"],
        },
      ],
    },
  ],
};
