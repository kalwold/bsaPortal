import { REPORT_TYPES } from "../../departments";

export const financeRegistry = {
  [REPORT_TYPES.MONTHLY_BALANCE]: "finance/monthly/extractBalanceSheetData",
  [REPORT_TYPES.LIQUIDITY_WEEKLY]:
    "finance/weekly/extractLiquidityRequirementData",
  [REPORT_TYPES.RESERVE_BASE]: "finance/monthly/extractReserveBaseData",
  [REPORT_TYPES.STATUTORY_REQ]:
    "finance/monthly/extractLoanStatutoryRequirementData",
  [REPORT_TYPES.KEY_BALANCE_SHEET]:
    "finance/monthly/extractKeyBalanceSheetData",
  [REPORT_TYPES.CAPITAL_ADEQUACY]: "finance/monthly/extractCapitalAdequacyData",
  [REPORT_TYPES.DEPOSIT_RANGE_REGION]:
    "finance/monthly/extractDepositRangeRegionData",
  [REPORT_TYPES.DEPOSIT_SECTOR_REGION]:
    "finance/monthly/extractDepositSectorRegionData",
  [REPORT_TYPES.EXPENSE_BREAKDOWN_QUARTERLY]:
    "finance/quarterly/extractExpenseBreakdownData",
  [REPORT_TYPES.QUARTERLY_TRANSACTION_STATEMENT]:
    "finance/quarterly/extractTransactionStatementData",
  [REPORT_TYPES.DEPOSIT_RANGE_REGION_QUARTERLY]:
    "finance/monthly/extractDepositRangeRegionQuarterlyData", // note: lives in monthly/
  [REPORT_TYPES.FINANCE_PROFIT_LOSS]:
    "finance/monthly/extractFinanceProfitLossData",
  [REPORT_TYPES.CAPITAL_ADEQUACY_ONBALANCESHEET]:
    "finance/quarterly/extractCapitalAdequacyOnBalanceSheetData",
  [REPORT_TYPES.QUARTERLY_BALANCE_SHEET]:
    "finance/quarterly/extractQuarterlyBalanceSheetData",
  [REPORT_TYPES.CAPITAL_ADEQUACY_QUARTERLY]:
    "finance/quarterly/extractCapitalAdequacyQuarterlyData",
  [REPORT_TYPES.QUARTERLY_MEMORANDUM_AND_CONTINGENT_ACCOUNTS]:
    "finance/quarterly/extractQuarterlyMemorandumAndContingentAccountsData",
  [REPORT_TYPES.QUARTERLY_MATURITY_OF_ASSETS_LIABILITIES]:
    "finance/quarterly/extractQuarterlyMaturityOfAssetsLiabilitiesData",
  [REPORT_TYPES.QUARTERLY_TOP_TWENTY_DEPOSITORS]:
    "finance/quarterly/extractQuarterlyTopTwentyDepositorsData",
  [REPORT_TYPES.MONTHLY_WEIGHTED_AVG_DEPOSIT_RATES]:
    "finance/monthly/extractWeightedAvgDepositRatesData",
  [REPORT_TYPES.INCOME_ACCOUNT_BREAKDOWN]:
    "finance/quarterly/extractIncomeAccountBreakdownData",
  [REPORT_TYPES.CAPITAL_ADEQUACY_OFFBALANCESHEET]:
    "finance/quarterly/extractCapitalAdequacyOffBalanceSheetData",
};
