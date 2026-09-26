import { REPORT_TYPES } from "../../departments";

export const creditRegistry = {
  [REPORT_TYPES.LOAN_BREAKDOWN]: "credit/monthly/extractLoanBreakdownData",
  [REPORT_TYPES.LOAN_PORTFOLIO]: "credit/monthly/extractLoanPortfolioData",
  [REPORT_TYPES.NPL_PROVISIONS]: "credit/monthly/extractNplProvisionsData",
  [REPORT_TYPES.LOAN_RELATED_PARTIES]:
    "credit/monthly/extractLoanRelatedPartiesData",
  [REPORT_TYPES.LOAN_DISBURSEMENT]:
    "credit/monthly/extractLoanDisbursementData",
  [REPORT_TYPES.LOAN_STATUS]: "credit/monthly/extractLoanStatusData",
  [REPORT_TYPES.LOAN_CLASSIFICATION]:
    "credit/monthly/extractLoanClassificationData",
  [REPORT_TYPES.LARGE_BORROWERS]: "credit/monthly/extractLargeBorrowersData",
  [REPORT_TYPES.LOAN_RANGE_REGION]: "credit/monthly/extractLoanRangeRegionData",
  [REPORT_TYPES.COLLATERALIZED_PROPERTY_SOLD_LAST18]:
    "credit/quarterly/extractCollateralizedPropertySoldLast18Data",
  [REPORT_TYPES.LOAN_CLASSIFICATION_PROVISIONING]:
    "credit/quarterly/extractLoanClassificationProvisioningData",
  [REPORT_TYPES.NPL_SECTOR_BRANCH]:
    "credit/quarterly/extractNplSectorBranchData",
  [REPORT_TYPES.COLLATERALIZED_PROPERTY_ACQUIRED_LAST18]:
    "credit/quarterly/extractCollateralizedPropertyAcquiredLast18Data",
  [REPORT_TYPES.QUARTERLY_AGGREGATE_RECATEGORIZED_LOANS]:
    "credit/quarterly/extractAggregateRecategorizedLoansData",
  [REPORT_TYPES.LOAN_RANGE_REGION_QUARTERLY]:
    "credit/quarterly/extractLoanRangeRegionQuarterlyData",
  [REPORT_TYPES.QUARTERLY_RESTRUCTURED_ABOVE_5PCT]:
    "credit/quarterly/extractRestructuredAbove5PctData",
  [REPORT_TYPES.BUILDING_CONSTRUCTION]:
    "credit/quarterly/extractBuildingConstructionLoansData",
  [REPORT_TYPES.CONVENTIONAL_LOAN_SECTOR_REGION]:
    "credit/quarterly/extractConventionalLoanSectorRegionData",
  [REPORT_TYPES.QUARTERLY_RESTRUCTURED_LOANS]:
    "credit/quarterly/extractRestructuredLoansData",
  [REPORT_TYPES.MONTHLY_WEIGHTED_AVG_LENDING_RATES]:
    "credit/monthly/extractWeightedAvgLendingRatesData",
  [REPORT_TYPES.QUARTERLY_DIGITAL_LENDING]:
    "credit/quarterly/extractDigitalLendingData",
  [REPORT_TYPES.QUARTERLY_RECATEGORIZED_LOANS]:
    "credit/quarterly/extractRecategorizedLoansData",
  [REPORT_TYPES.QUARTERLY_OFF_BALANCE_PROVISIONING]:
    "credit/quarterly/extractOffBalanceProvisioningData",
  [REPORT_TYPES.TOP20_BORROWERS]: "credit/quarterly/extractTop20BorrowersData",
  [REPORT_TYPES.Q_TOP_TWENTY_NPL]: "credit/quarterly/extractQTopTwentyNplData",
  [REPORT_TYPES.LOAN_SECTOR_REGION]:
    "credit/monthly/extractLoanSectorRegionData",
};
