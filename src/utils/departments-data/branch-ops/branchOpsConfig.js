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
                {
          key: "INSTITUTIONAL_INSURED_DEPOSITORS",
          id: "branchOps-institutional-insured-depositors",
          name: "branchOps institutional insured depositors ",
          detect: ["0013lN02001"],
        },
         {
          key: "INSURED_DEPOSITOR_CON",
          id: "branchOps-quarterly_insured-depositor-conv",
          name: "branchOps quarterly insured depositor conv",
          detect: ["0014lN03001"],
        },
      ],
    },
  ],
};
