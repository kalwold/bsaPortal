import { REPORT_TYPES } from "../../departments";

export const unidentifiedRegistry = {
  [REPORT_TYPES.QUARTERLY_AGENT_INFO_REGION]:
    "unidentified/quarterly/extractAgentInfoRegion",
  [REPORT_TYPES.QUARTERLY_AVG_INTEREST_RATE_DEPOSITS_DEBTS]:
    "unidentified/quarterly/extractAvgInterestRateDeposits",
  [REPORT_TYPES.QUARTERLY_AVG_INTEREST_RATE_LOANS]:
    "unidentified/quarterly/extractAvgInterestRateLoans",
[REPORT_TYPES.QUARTERLY_CORPORATE_PROFILE_BOARD]: "unidentified/quarterly/extractCorporateProfileBoardData",
    [REPORT_TYPES.QUARTERLY_LONG_OUTSTANDING_ITEMS]: "unidentified/quarterly/extractLongOutstandingItemsData",
     [REPORT_TYPES.QUARTERLY_CORPORATE_PROFILE]: "unidentified/quarterly/extractCorporateProfileData",
    [REPORT_TYPES.QUARTERLY_CORPORATE_PROFILE_OTHER]: "unidentified/quarterly/extractCorporateProfileOtherData",

};
