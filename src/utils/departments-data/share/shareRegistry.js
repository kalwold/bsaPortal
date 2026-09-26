import { REPORT_TYPES } from "../../departments";

export const shareRegistry = {
  [REPORT_TYPES.QUARTERLY_TOP20_SHAREHOLDERS]:
    "share/quarterly/extractQuarterlyTopTwentyShareholdersData",
  [REPORT_TYPES.QUARTERLY_TWO_PERCENT_SHAREHOLDERS]:
    "share/quarterly/extractQuarterlyTwoPercentShareholdersData",
};
