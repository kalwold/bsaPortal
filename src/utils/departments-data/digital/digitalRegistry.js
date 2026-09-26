import { REPORT_TYPES } from "../../departments";

export const digitalRegistry = {
  [REPORT_TYPES.QUARTERLY_MOBILE_TRANSACTIONS]:
    "digital/quarterly/extractQuarterlyMobileTransactionsData",
  [REPORT_TYPES.QUARTERLY_ATM_POS]:
    "digital/quarterly/extractQuarterlyAtmPosData",
};
