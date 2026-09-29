import { REPORT_TYPES } from "../../departments";

export const unidentifiedRegistry = {
  [REPORT_TYPES.QUARTERLY_AGENT_INFO_REGION]:
    "unidentified/quarterly/extractAgentInfoRegion",
  [REPORT_TYPES.QUARTERLY_AVG_INTEREST_RATE_DEPOSITS_DEBTS]:
    "unidentified/quarterly/extractAvgInterestRateDeposits",
  [REPORT_TYPES.QUARTERLY_BOARD_INFORMATION]:
    "unidentified/quarterly/extractBoardInformation",
  [REPORT_TYPES.QUARTERLY_AVG_INTEREST_RATE_LOANS]:
    "unidentified/quarterly/extractAvgInterestRateLoans",
  [REPORT_TYPES.QUARTERLY_CORPORATE_PROFILE_OTHER_INFORMATION]:
    "unidentified/quarterly/extractCorporateProfileOtherInfo",
  [REPORT_TYPES.QUARTERLY_CORPORATE_PROFILE_HEAD_OFFICE_ADDRESS]:
    "unidentified/quarterly/extractHeadOfficeProfile",
};
