import { REPORT_TYPES } from "../../departments";

export const digitalRegistry = {
  [REPORT_TYPES.QUARTERLY_MOBILE_TRANSACTIONS]:
    "digital/quarterly/extractQuarterlyMobileTransactionsData",
  [REPORT_TYPES.QUARTERLY_ATM_POS]:
    "digital/quarterly/extractQuarterlyAtmPosData",
  [REPORT_TYPES.QUARTERLY_DFS_ACCOUNTS_SUBSCRIPTIONS]:
    "digital/quarterly/extractDFSAccountsSubscriptions",
    [REPORT_TYPES.ACCESS_POINT_USER]: "digital/quarterly/extractAccessPointUserData",
    [REPORT_TYPES.QUARTERLY_DFS_ACCOUNTS_SUBSCRIPTIONS]:"digital/quarterly/extractDFSAccountsSubscriptions",

};
