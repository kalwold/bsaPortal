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
          key: "QUARTERLY_BOARD_INFORMATION",
          id: "unidentified-branchOps-quarterly_board-information",
          name: "Corporate Profile Report Board Information",
          detect: ["CP8_CI001", "CI001"],
        },
        {
          key: "QUARTERLY_AVG_INTEREST_RATE_LOANS",
          id: "unidentified-quarterly_avg-interest-rate-loans",
          name: "Corporate Profile Report  Average Interest Rate on Loan Products or Other Investments",
          detect: ["CP5_CL001", "CL001"],
        },
        {
          key: "QUARTERLY_CORPORATE_PROFILE_OTHER_INFORMATION",
          id: "unidentified-corporate-profile-other-information",
          name: "Corporate Profile Report: Other Information",
          detect: ["CP6_CO001"],
        },
        {
          key: "QUARTERLY_CORPORATE_PROFILE_HEAD_OFFICE_ADDRESS",
          id: "unidentified-corporate-profile-head-office-address",
          name: "Corporate Profile Report",
          detect: ["CP1_CP001"],
        },
      ],
    },
  ],
};
