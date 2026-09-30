import { REPORT_TYPES } from "../../departments";

export const unidentifiedRegistry = {
  [REPORT_TYPES.QUARTERLY_AGENT_INFO_REGION]:
    "unidentified/quarterly/extractAgentInfoRegion",
  [REPORT_TYPES.QUARTERLY_AVG_INTEREST_RATE_DEPOSITS_DEBTS]:
    "unidentified/quarterly/extractAvgInterestRateDeposits",
  [REPORT_TYPES.QUARTERLY_AVG_INTEREST_RATE_LOANS]:
    "unidentified/quarterly/extractAvgInterestRateLoans",
  [REPORT_TYPES.QUARTERLY_FRAUD_OUTSTANDING]:
    "unidentified/quarterly/extractFraudOutstanding",
  [REPORT_TYPES.QUARTERLY_NEW_AGENTS_INFORMATION]:
    "unidentified/quarterly/extractNewAgentsInformation",
  [REPORT_TYPES.QUARTERLY_NEW_AGENT_TRANSACTION_BY_TYPE_AMOUNT]:
    "unidentified/quarterly/extractAgentTransactions",
  [REPORT_TYPES.QUARTERLY_LOANS_TO_INSIDERS]:
    "unidentified/quarterly/extractLoansToInsiders",
  [REPORT_TYPES.QUARTERLY_HIGH_IMPACT_IT_INCIDENT]:
    "unidentified/quarterly/extractHighImpactITIncident",
};
