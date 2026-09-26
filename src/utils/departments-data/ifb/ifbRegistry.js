import { REPORT_TYPES } from "../../departments";

export const ifbRegistry = {
  [REPORT_TYPES.IFB_RANGE_REGION]:
    "ifb/monthly/extractIfbDepositRangeRegionData",
  [REPORT_TYPES.IFB_SECTOR_REGION]:
    "ifb/monthly/extractIfbDepositSectorRegionData",
  [REPORT_TYPES.IFB_BALANCE_SHEET]: "ifb/monthly/extractIfbBalanceSheetData",
  [REPORT_TYPES.IFB_PROFIT_LOSS]: "ifb/monthly/extractIfbProfitLossData",
  [REPORT_TYPES.IFB_LOAN_RANGE_REGION]:
    "ifb/monthly/extractIfbLoanRangeRegionData",
  [REPORT_TYPES.IFB_LOAN_SECTOR_REGION]:
    "ifb/monthly/extractIfbLoanSectorRegionData",
  [REPORT_TYPES.IFB_LOAN_RANGE_REGION_QUARTERLY]:
    "ifb/quarterly/extractIfbLoanRangeRegionQuarterlyData",
  [REPORT_TYPES.IFB_LOAN_SECTOR_REGION_QUARTERLY]:
    "ifb/quarterly/extractIfbLoanSectorRegionQuarterlyData",
  [REPORT_TYPES.IFB_DEPOSIT_RANGE_REGION_QUARTERLY]:
    "ifb/quarterly/extractIfbDepositRangeRegionQuarterlyData",
  [REPORT_TYPES.MONTHLY_IFB_WEIGHTED_AVG_LENDING_RATES]:
    "ifb/monthly/extractIfbWeightedAvgLendingRatesData",
  [REPORT_TYPES.MONTHLY_IFB_WEIGHTED_AVG_DEPOSIT_RATES]:
    "ifb/monthly/extractIfbWeightedAvgDepositRatesData",
  [REPORT_TYPES.IFB_DEPOSIT_SECTOR_REGION_QUARTERLY]:
    "ifb/quarterly/extractIfbDepositSectorRegionQuarterlyData",
};
