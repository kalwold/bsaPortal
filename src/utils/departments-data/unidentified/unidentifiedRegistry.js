import { REPORT_TYPES } from "../../departments";

export const unidentifiedRegistry = {
  [REPORT_TYPES.QUARTERLY_AGENT_INFO_REGION]:
    "unidentified/quarterly/extractAgentInfoRegion",
  [REPORT_TYPES.QUARTERLY_AVG_INTEREST_RATE_DEPOSITS_DEBTS]:
    "unidentified/quarterly/extractAvgInterestRateDeposits",
  [REPORT_TYPES.QUARTERLY_AVG_INTEREST_RATE_LOANS]:
    "unidentified/quarterly/extractAvgInterestRateLoans",
  [REPORT_TYPES.QUARTERLY_NEW_AGENTS_INFORMATION]:
    "unidentified/quarterly/extractNewAgentsInformation",
  [REPORT_TYPES.QUARTERLY_NEW_AGENT_TRANSACTION_BY_TYPE_AMOUNT]:
    "unidentified/quarterly/extractAgentTransactions",
  [REPORT_TYPES.QUARTERLY_LOANS_TO_INSIDERS]:
    "unidentified/quarterly/extractLoansToInsiders",
  [REPORT_TYPES.QUARTERLY_HIGH_IMPACT_IT_INCIDENT]:
    "unidentified/quarterly/extractHighImpactITIncident",
  [REPORT_TYPES.QUARTERLY_CORPORATE_PROFILE_BOARD]:
    "unidentified/quarterly/extractCorporateProfileBoardData",
  [REPORT_TYPES.QUARTERLY_LONG_OUTSTANDING_ITEMS]:
    "unidentified/quarterly/extractLongOutstandingItemsData",
  [REPORT_TYPES.QUARTERLY_CORPORATE_PROFILE]:
    "unidentified/quarterly/extractCorporateProfileData",
  [REPORT_TYPES.QUARTERLY_CORPORATE_PROFILE_OTHER]:
    "unidentified/quarterly/extractCorporateProfileOtherData",
  [REPORT_TYPES.MONTHLY_COMPLAINT_HANDLING]:
    "unidentified/monthly/extractComplaintHandlingReportData",
  [REPORT_TYPES.MONTHLY_CREDIT_ACCOUNT_AMOUNT]:
    "unidentified/monthly/extractCreditAccountAmountData",
  [REPORT_TYPES.MONTHLY_DOMESTIC_CASH_FLOW]:
    "unidentified/monthly/extractDomesticCashFlowData",
  [REPORT_TYPES.MONTHLY_NID_UNIQUE_DEPOSIT_ACCOUNTS]:
    "unidentified/monthly/extractNidUniqueDepositAccountsData",
};
