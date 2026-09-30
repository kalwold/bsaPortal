export const unidentifiedConfig = {
  id: "unidentified",
  name: "Unidentified",
  periods: [
    {
      id: "quarterly",
      name: "Quarterly",
      reportTypes: [
        {
          key: "QUARTERLY_CORPORATE_PROFILE",
          id: "unidentified-quarterly_corporate-profile",
          name: "Corporate Profile Report",
          detect: ["CP1_CP001"],
        },
        {
          key: "QUARTERLY_CORPORATE_PROFILE_OTHER",
          id: "unidentified-quarterly_corporate-profile-other",
          name: "Corporate Profile Report: Other Information",
          detect: ["CP6_CO001"],
        },
        {
          key: "QUARTERLY_CORPORATE_PROFILE_BOARD",
          id: "unidentified-quarterly_corporate-profile-board",
          name: "Corporate Profile Report  Board Information",
          detect: ["CP8_CI001"],
        },
        {
          key: "QUARTERLY_LONG_OUTSTANDING_ITEMS",
          id: "unidentified-quarterly_long-outstanding-items",
          name: "Long Outstanding Items",
          detect: ["LON_OUT_ITELI001"],
        },
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
          name: "Corporate Profile Report  Average Interest Rate on Loan Products or Other Investments",
          detect: ["CP5_CL001", "CL001"],
        },
      ],
    },
  ],
};
