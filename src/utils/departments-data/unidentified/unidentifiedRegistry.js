import { REPORT_TYPES } from "../../departments";

export const unidentifiedRegistry = {
  [REPORT_TYPES.QUARTERLY_AGENT_TRANSACTION]:
    "unidentified/quarterly/extractAgentTransactions",
  [REPORT_TYPES.QUARTERLY_LOANS_TO_INSIDERS]:
    "unidentified/quarterly/extractLoansToInsiders",
  [REPORT_TYPES.QUARTERLY_BSD_NEW_AGENTS]:
    "unidentified/quarterly/extractNewAgentsInformation",
  [REPORT_TYPES.QUARTERLY_RELATED_ORG]:
    "unidentified/quarterly/extractRelatedOrganizations",
};
