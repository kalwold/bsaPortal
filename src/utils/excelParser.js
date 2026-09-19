import * as XLSX from "xlsx";
import extractLiquidityRequirementData, {
  extractLiquidityMetadata,
} from "./extractLiquidityRequirementData";
import extractLoanRelatedPartiesData, {
  extractRelatedPartiesMetadata,
} from "./extractLoanRelatedPartiesData";
import extractBalanceSheetData, {
  extractBalanceSheetMetadata,
} from "./extractBalanceSheetData";
import extractForexData, { extractForexMetadata } from "./extractForexData";
import extractReserveBaseData, {
  extractReserveBaseMetadata,
} from "./extractReserveBaseData";
import extractLoanBreakdownData, {
  extractLoanBreakdownMetadata,
} from "./extractLoanBreakdownData";
import extractLoanPortfolioData, {
  extractPortfolioMetadata,
} from "./extractLoanPortfolioData";
import extractNplProvisionsData, {
  extractNplProvisionMetadata,
} from "./extractNplProvisionsData";
import extractLoanDisbursementData, {
  extractDisbursementMetadata,
} from "./extractLoanDisbursementData";
import extractLoanStatusData, {
  extractLoanStatusMetadata,
} from "./extractLoanStatusData";
import extractLoanClassificationData, {
  extractLoanClassificationMetaData,
} from "./extractLoanClassificationData";
import extractLargeBorrowersData, {
  extractLargeBorrowersMetadata,
} from "./extractLargeBorrowersData";
import extractLoanRangeRegionData, {
  extractLoanRangeRegionMetadata,
} from "./extractLoanRangeRegionData";
import extractLoanSectorRegionData, {
  extractLoanSectorRegionMetadata,
} from "./extractLoanSectorRegionData";
import extractConventionalLoanSectorRegionData, {
  extractConventionalLoanSectorRegionMetadata,
} from "./extractConventionalLoanSectorRegionData";
import extractLoanStatutoryRequirementData, {
  extractStatutoryMetadata,
} from "./extractLoanStatutoryRequirementData";
import extractKeyBalanceSheetData, {
  extractKeyBalanceSheetMetadata,
} from "./extractKeyBalanceSheetData";
import extractCapitalAdequacyData, {
  extractCapitalMetadata,
} from "./extractCapitalAdequacyData";
import extractDepositRangeRegionData, {
  extractDepositRangeRegionMetadata,
} from "./extractDepositRangeRegionData";
import extractDepositSectorRegionData, {
  extractDepositSectorRegionMetadata,
} from "./extractDepositSectorRegionData";
import extractIfbDepositRangeRegionData, {
  extractIfbDepositRangeRegionMetadata,
} from "./extractIfbDepositRangeRegionData";
import extractIfbDepositSectorRegionData, {
  extractIfbDepositSectorMetadata,
} from "./extractIfbDepositSectorRegionData";
import extractIfbBalanceSheetData, {
  extractIfbBalanceSheetMetadata,
} from "./extractIfbBalanceSheetData";
import extractIfbProfitLossData, {
  extractIfbProfitLossMetadata,
} from "./extractIfbProfitLossData";
import extractIfbLoanRangeRegionData, {
  extractIfbLoanRangeRegionMetadata,
} from "./extractIfbLoanRangeRegionData";
import extractIfbLoanSectorRegionData, {
  extractIfbLoanSectorRegionMetadata,
} from "./extractIfbLoanSectorRegionData";
import extractCollateralizedPropertySoldLast18Data, {
  extractCollateralizedPropertySoldLast18Metadata,
} from "./extractCollateralizedPropertySoldLast18Data";
import extractLoanClassificationProvisioningData, {
  extractLoanClassificationProvisioningMetadata,
} from "./extractLoanClassificationProvisioningData";
import extractNplSectorBranchData, {
  extractNplSectorBranchMetadata,
} from "./extractNplSectorBranchData";
import extractCollateralizedPropertyAcquiredLast18Data, {
  extractCollateralizedPropertyAcquiredLast18Metadata,
} from "./extractCollateralizedPropertyAcquiredLast18Data";
import extractLoanRangeRegionQuarterlyData, {
  extractLoanRangeRegionQuarterlyMetadata,
} from "./extractLoanRangeRegionQuarterlyData";
import extractQTopTwentyNplData, {
  extractQTopTwentyNplMetadata,
} from "./extractQTopTwentyNplData";

import extractExpenseBreakdownData, {
  extractExpenseBreakdownMetadata,
} from "./extractExpenseBreakdownData";
import extractIncomeAccountBreakdownData, {
  extractIncomeAccountBreakdownMetadata,
} from "./extractIncomeAccountBreakdownData";
import extractCapitalAdequacyOffBalanceSheetData, {
  extractCapitalAdequacyOffBalanceSheetMetadata,
} from "./extractCapitalAdequacyOffBalanceSheetData";
import extractTop20BorrowersData, {
  extractTop20BorrowersMetadata,
} from "./extractTop20BorrowersData";
import extractBuildingConstructionLoansData, {
  extractBuildingConstructionMetadata,
} from "./extractBuildingConstructionLoansData";
import extractDepositRangeRegionQuarterlyData, {extractDepositRangeRegionQuarterlyMetadata} from "./extractDepositRangeRegionQuarterlyData";
import extractFinanceProfitLossData,{extractFinanceProfitLossMetadata} from "./extractFinanceProfitLossData";
import extractCapitalAdequacyOnBalanceSheetData,{extractCapitalAdequacyOnBalanceSheetMetadata} from "./extractCapitalAdequacyOnBalanceSheetData";
import extractCapitalAdequacyQuarterlyData,{extractCapitalAdequacyQuarterlyMetadata} from "./extractCapitalAdequacyQuarterlyData";
import extractIfbLoanRangeRegionQuarterlyData,{extractIfbLoanRangeRegionQuarterlyMetadata} from "./extractIfbLoanRangeRegionQuarterlyData";
import extractIfbLoanSectorRegionQuarterlyData,{extractIfbLoanSectorRegionQuarterlyMetadata} from "./extractIfbLoanSectorRegionQuarterlyData";
import extractQuarterlyBalanceSheetData, {
  extractQuarterlyBalanceSheetMetadata,
} from "./extractQuarterlyBalanceSheetData";
import extractQuarterlyTopTwentyDepositorsData, {
  extractQuarterlyTopTwentyDepositorsMetadata,
} from "./extractQuarterlyTopTwentyDepositorsData";
import extractQuarterlyMaturityOfAssetsLiabilitiesData, {
  extractQuarterlyMaturityOfAssetsLiabilitiesMetadata,
} from "./extractQuarterlyMaturityOfAssetsLiabilitiesData";
import extractQuarterlyMemorandumAndContingentAccountsData, {
  extractQuarterlyMemorandumAndContingentAccountsMetadata,
} from "./extractQuarterlyMemorandumAndContingentAccountsData";
import extractIfbDepositRangeRegionQuarterlyData,{extractIfbDepositRangeRegionQuarterlyMetadata} from "./extractIfbDepositRangeRegionQuarterlyData";
import extractIfbDepositSectorRegionQuarterlyData,{extractIfbDepositSectorQuarterlyMetadata} from "./extractIfbDepositSectorRegionQuarterlyData";
import extractQuarterlyTopTwentyShareholdersData, {
  extractQuarterlyTopTwentyShareholdersMetadata,
} from "./extractQuarterlyTopTwentyShareholdersData";
import extractQuarterlyTwoPercentShareholdersData, {
  extractQuarterlyTwoPercentShareholdersMetadata,
} from "./extractQuarterlyTwoPercentShareholdersData";
import extractQuarterlyMobileTransactionsData, {
  extractQuarterlyMobileTransactionsMetadata,
} from "./extractQuarterlyMobileTransactionsData";
import extractQuarterlyAtmPosData, {
  extractQuarterlyAtmPosMetadata,
} from "./extractQuarterlyAtmPosData";
import extractTransactionStatementData,{extractTransactionStatementMetadata} from "./extractTransactionStatementData";
import extractRestructuredLoansData,{extractRestructuredLoansMetadata} from "./extractRestructuredLoansData";
import extractDigitalLendingData, {extractDigitalLendingMetadata} from "./extractDigitalLendingData";
import extractRecategorizedLoansData, {extractRecategorizedLoansMetadata} from "./extractRecategorizedLoansData";
import extractOffBalanceProvisioningData ,{extractOffBalanceProvisioningMetadata} from "./extractOffBalanceProvisioningData"
const REPORT_TYPES = {
  DAILY_FOREX: "ibd-daily_single-currency",
  MONTHLY_BALANCE: "finance-monthly_balance-sheet",
  LIQUIDITY_WEEKLY: "finance-weekly_liquidity",
  LOAN_RELATED_PARTIES: "credit-monthly_loan-related",
  RESERVE_BASE: "finance-monthly_reserve",
  STATUTORY_REQ: "finance-monthly_statutory",
  KEY_BALANCE_SHEET: "finance-monthly_key-balance-sheet",
  CAPITAL_ADEQUACY: "finance-monthly_capital-adequacy",
  DEPOSIT_RANGE_REGION: "finance-monthly_deposit-range-region",
  DEPOSIT_SECTOR_REGION: "finance-monthly_deposit-sector-region",
  LOAN_BREAKDOWN: "credit-monthly_loan-breakdown",
  LOAN_PORTFOLIO: "credit-monthly_loan-portfolio",
  NPL_PROVISIONS: "credit-monthly_loan-nonperforming",
  LOAN_DISBURSEMENT: "credit-monthly_loan-disbursement",
  LOAN_STATUS: "credit-monthly_loan-status",
  LOAN_CLASSIFICATION: "credit-monthly_loan-classification",
  LARGE_BORROWERS: "credit-monthly_large-borrowers",
  LOAN_RANGE_REGION: "credit-monthly_loan-range-region",
  LOAN_SECTOR_REGION: "credit-monthly_loan-sector-region",
  IFB_RANGE_REGION: "ifb-monthly_deposit-range-region",
  IFB_SECTOR_REGION: "ifb-monthly_deposit-sector-region",
  IFB_BALANCE_SHEET: "ifb-monthly_balance-sheet",
  IFB_PROFIT_LOSS: "ifb-monthly_profit-loss",
  IFB_LOAN_RANGE_REGION: "ifb-monthly_loan-range-region",
  IFB_LOAN_SECTOR_REGION: "ifb-monthly_loan-sector-region",
  COLLATERALIZED_PROPERTY_SOLD_LAST18:
    "credit-quarterly_loan-collateralized-properties",
  LOAN_CLASSIFICATION_PROVISIONING: "credit-quarterly_loan-classification",
  NPL_SECTOR_BRANCH: "credit-quarterly_loan-npl-ecosec-branch",
  COLLATERALIZED_PROPERTY_ACQUIRED_LAST18:
    "credit-quarterly_collateralized-property-acquired-last18",
  LOAN_RANGE_REGION_QUARTERLY: "credit-quarterly_range-region",
  Q_TOP_TWENTY_NPL: "credit-quarterly_loan-nonperforming-top20",
  EXPENSE_BREAKDOWN_QUARTERLY: "finance-quarterly_breakdown-expenses",
  INCOME_ACCOUNT_BREAKDOWN: "finance-quarterly_breakdown-income-account",
  CAPITAL_ADEQUACY_OFFBALANCESHEET: "finance-quarterly_off-balancesheet",
  TOP20_BORROWERS: "credit-quarterly_top20-borrowers",
  BUILDING_CONSTRUCTION: "credit-quarterly_building-construction",
  CONVENTIONAL_LOAN_SECTOR_REGION: "credit-quarterly_loans-sector-region",
  DEPOSIT_RANGE_REGION_QUARTERLY: "finance-quarterly_deposit-range-region",
  FINANCE_PROFIT_LOSS: 'finance-quarterly_profit-loss',
  CAPITAL_ADEQUACY_ONBALANCESHEET: "finance-quarterly_on-balancesheet",
  CAPITAL_ADEQUACY_QUARTERLY: "finance-quarterly_capital-adequacy",
  IFB_LOAN_RANGE_REGION_QUARTERLY: "ifb-quarterly_loan-range",
  IFB_LOAN_SECTOR_REGION_QUARTERLY: "ifb-quarterly_loan-sector",
  QUARTERLY_BALANCE_SHEET: "finance-quarterly_balance-sheet",
  QUARTERLY_TOP_TWENTY_DEPOSITORS: "finance-quarterly_top-twenty-depositors",
  QUARTERLY_MATURITY_OF_ASSETS_LIABILITIES:"finance-quarterly_maturity-assets-liabilities",
  QUARTERLY_MEMORANDUM_AND_CONTINGENT_ACCOUNTS: "finance-quarterly_memorandum",
   IFB_DEPOSIT_RANGE_REGION_QUARTERLY: "ifb-quarterly_deposit-range",
  IFB_DEPOSIT_SECTOR_REGION_QUARTERLY: "ifb-quarterly_deposit-sector",
  QUARTERLY_TOP20_SHAREHOLDERS: 'share-quarterly_top-twenty-shareholders',
    QUARTERLY_TWO_PERCENT_SHAREHOLDERS: 'share-quarterly_two-percent-shareholdings',
    QUARTERLY_MOBILE_TRANSACTIONS: 'digital-banking-quarterly_mobile-transactions',
    QUARTERLY_ATM_POS: 'digital-banking-quarterly_atm-or-pos',
    QUARTERLY_TRANSACTION_STATEMENT: 'finance-quarterly_transaction-statement',
    QUARTERLY_RESTRUCTURED_LOANS: 'credit-quarterly_aggregate-restructured-loans',
    QUARTERLY_DIGITAL_LENDING: 'credit-quarterly_digital-lending',
    QUARTERLY_RECATEGORIZED_LOANS: 'credit-quarterly_recategorized-loans',
    QUARTERLY_OFF_BALANCE_PROVISIONING: 'credit-quarterly_off-balance-provisioning'
};

// export const excelDateToISO = (value) => {
//   if (!value) return "";

//   const str = String(value).trim();

//   // Already ISO format → return as it is
//   if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(str)) {
//     return str;
//   }

//   // Excel serial date
//   const date = new Date(Date.UTC(1899, 11, 30));
//   date.setUTCDate(date.getUTCDate() + Number(value));

//   return date.toISOString().slice(0, 19);
// };
export const excelDateToISO = (value) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const str = String(value).trim();

  // Already full ISO datetime → return as is
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/.test(str)) {
    return str;
  }

  // Date-only string (YYYY-MM-DD) → normalize to full ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const date = new Date(`${str}T00:00:00.000Z`);
    return isNaN(date.getTime()) ? "" : date.toISOString();
  }

  // Excel serial date
  if (typeof value === "number" || /^\d+(\.\d+)?$/.test(str)) {
    const numericValue = Number(value);

    if (numericValue < 1000) {
      return str;
    }

    const msPerDay = 24 * 60 * 60 * 1000;
    const excelEpochUTC = Date.UTC(1899, 11, 30);
    const date = new Date(excelEpochUTC + numericValue * msPerDay);

    if (isNaN(date.getTime())) {
      return "";
    }

    return date.toISOString();
  }

  // Non-date string → return as is
  return str;
};

export const parseExcelReport = (file, reportTypeIn) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array", cellText: true, cellNF: true });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, raw:false});
        

        console.log("Raw Excel Data:", jsonData);

        const reportType = detectReportType(jsonData);
        console.log("Detected report type (from A1):", reportType);

        if (reportTypeIn !== reportType) {
          console.error(
            `Mismatch: dropdown expects "${reportTypeIn}" but A1 was detected as "${reportType}". ` +
              `Check detectReportType() in excelParser.js against the actual A1 value logged above.`,
          );
          throw new Error("Unsupported report type");
        }

        //  const metadata = extractMetadata(jsonData);
        ////console.log("Extracted Metadata:", metadata);

        let hierarchicalData = [];
        let columns = [];
        let additionalColumns = [];
        let noandtitles = [];
        var metadata = {};

        if (reportType === REPORT_TYPES.DAILY_FOREX) {
          const result = extractForexData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractForexMetadata(jsonData);
          //console.log("Extracted Metadata:", metadata);
        } else if (reportType === REPORT_TYPES.MONTHLY_BALANCE) {
          const result = extractBalanceSheetData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractBalanceSheetMetadata(jsonData);
        } else if (reportType === REPORT_TYPES.LIQUIDITY_WEEKLY) {
          const result = extractLiquidityRequirementData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractLiquidityMetadata(jsonData);
          //console.log("Found title on return:", noandtitles);
        } else if (reportType === REPORT_TYPES.LOAN_RELATED_PARTIES) {
          const result = extractLoanRelatedPartiesData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractRelatedPartiesMetadata(jsonData);
          //console.log("Found hierarchicalData  on return:", hierarchicalData );
        } else if (reportType === REPORT_TYPES.RESERVE_BASE) {
          const result = extractReserveBaseData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractReserveBaseMetadata(jsonData);
        } else if (reportType === REPORT_TYPES.LOAN_BREAKDOWN) {
          const result = extractLoanBreakdownData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractLoanBreakdownMetadata(jsonData);
        } else if (reportType === REPORT_TYPES.LOAN_PORTFOLIO) {
          const result = extractLoanPortfolioData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractPortfolioMetadata(jsonData);
        } else if (reportType === REPORT_TYPES.NPL_PROVISIONS) {
          const result = extractNplProvisionsData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractNplProvisionMetadata(jsonData);
        } else if (reportType === REPORT_TYPES.LOAN_DISBURSEMENT) {
          const result = extractLoanDisbursementData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractDisbursementMetadata(jsonData);
        } else if (reportType === REPORT_TYPES.LOAN_STATUS) {
          const result = extractLoanStatusData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractLoanStatusMetadata(jsonData);
        } else if (reportType === REPORT_TYPES.LOAN_CLASSIFICATION) {
          const result = extractLoanClassificationData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractLoanClassificationMetaData(jsonData);
        } else if (reportType === REPORT_TYPES.LARGE_BORROWERS) {
          const result = extractLargeBorrowersData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractLargeBorrowersMetadata(jsonData);
        } else if (reportType === REPORT_TYPES.LOAN_RANGE_REGION) {
          const result = extractLoanRangeRegionData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractLoanRangeRegionMetadata(jsonData);
        } else if (reportType === REPORT_TYPES.LOAN_SECTOR_REGION) {
          const result = extractLoanSectorRegionData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractLoanSectorRegionMetadata(jsonData);
        } else if (reportType === REPORT_TYPES.STATUTORY_REQ) {
          const result = extractLoanStatutoryRequirementData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractStatutoryMetadata(jsonData);
        } else if (reportType === REPORT_TYPES.KEY_BALANCE_SHEET) {
          const result = extractKeyBalanceSheetData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractKeyBalanceSheetMetadata(jsonData);
        } else if (reportType === REPORT_TYPES.CAPITAL_ADEQUACY) {
          const result = extractCapitalAdequacyData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractCapitalMetadata(jsonData);
        } else if (reportType === REPORT_TYPES.DEPOSIT_RANGE_REGION) {
          const result = extractDepositRangeRegionData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractDepositRangeRegionMetadata(jsonData);
        } else if (reportType === REPORT_TYPES.DEPOSIT_SECTOR_REGION) {
          const result = extractDepositSectorRegionData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractDepositSectorRegionMetadata(jsonData);
        } else if (reportType === REPORT_TYPES.IFB_RANGE_REGION) {
          const result = extractIfbDepositRangeRegionData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractIfbDepositRangeRegionMetadata(jsonData);
        } else if (reportType === REPORT_TYPES.IFB_SECTOR_REGION) {
          const result = extractIfbDepositSectorRegionData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractIfbDepositSectorMetadata(jsonData);
        } else if (reportType === REPORT_TYPES.IFB_BALANCE_SHEET) {
          const result = extractIfbBalanceSheetData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractIfbBalanceSheetMetadata(jsonData);
        } else if (reportType === REPORT_TYPES.IFB_PROFIT_LOSS) {
          const result = extractIfbProfitLossData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractIfbProfitLossMetadata(jsonData);
        } else if (reportType === REPORT_TYPES.IFB_LOAN_RANGE_REGION) {
          const result = extractIfbLoanRangeRegionData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractIfbLoanRangeRegionMetadata(jsonData);
        } else if (reportType === REPORT_TYPES.IFB_LOAN_SECTOR_REGION) {
          const result = extractIfbLoanSectorRegionData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractIfbLoanSectorRegionMetadata(jsonData);
        } else if (
          reportType === REPORT_TYPES.COLLATERALIZED_PROPERTY_SOLD_LAST18
        ) {
          const result = extractCollateralizedPropertySoldLast18Data(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractCollateralizedPropertySoldLast18Metadata(jsonData);
        } else if (
          reportType === REPORT_TYPES.LOAN_CLASSIFICATION_PROVISIONING
        ) {
          const result = extractLoanClassificationProvisioningData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractLoanClassificationProvisioningMetadata(jsonData);
        } else if (reportType === REPORT_TYPES.NPL_SECTOR_BRANCH) {
          const result = extractNplSectorBranchData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractNplSectorBranchMetadata(jsonData);
        } else if (
          reportType === REPORT_TYPES.COLLATERALIZED_PROPERTY_ACQUIRED_LAST18
        ) {
          const result =
            extractCollateralizedPropertyAcquiredLast18Data(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata =
            extractCollateralizedPropertyAcquiredLast18Metadata(jsonData);
        } else if (reportType === REPORT_TYPES.LOAN_RANGE_REGION_QUARTERLY) {
          const result = extractLoanRangeRegionQuarterlyData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractLoanRangeRegionQuarterlyMetadata(jsonData);
        } else if (reportType === REPORT_TYPES.Q_TOP_TWENTY_NPL) {
          const result = extractQTopTwentyNplData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractQTopTwentyNplMetadata(jsonData);
        } else if (reportType === REPORT_TYPES.EXPENSE_BREAKDOWN_QUARTERLY) {
          const result = extractExpenseBreakdownData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractExpenseBreakdownMetadata(jsonData);
        } else if (reportType === REPORT_TYPES.INCOME_ACCOUNT_BREAKDOWN) {
          const result = extractIncomeAccountBreakdownData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractIncomeAccountBreakdownMetadata(jsonData);
        } else if (
          reportType === REPORT_TYPES.CAPITAL_ADEQUACY_OFFBALANCESHEET
        ) {
          const result = extractCapitalAdequacyOffBalanceSheetData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractCapitalAdequacyOffBalanceSheetMetadata(jsonData);
        } else if (reportType === REPORT_TYPES.TOP20_BORROWERS) {
          const result = extractTop20BorrowersData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractTop20BorrowersMetadata(jsonData);
        } else if (reportType === REPORT_TYPES.BUILDING_CONSTRUCTION) {
          const result = extractBuildingConstructionLoansData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractBuildingConstructionMetadata(jsonData);
        } 
        else if (
          reportType === REPORT_TYPES.CONVENTIONAL_LOAN_SECTOR_REGION
        ) {
          const result = extractConventionalLoanSectorRegionData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractConventionalLoanSectorRegionMetadata(jsonData);
        }
        else if (
          reportType === REPORT_TYPES.DEPOSIT_RANGE_REGION_QUARTERLY
        ) {
          const result = extractDepositRangeRegionQuarterlyData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractDepositRangeRegionQuarterlyMetadata(jsonData);
        }
        else if (
          reportType === REPORT_TYPES.FINANCE_PROFIT_LOSS
        ) {
          const result = extractFinanceProfitLossData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractFinanceProfitLossMetadata(jsonData);
        }
        else if (
          reportType === REPORT_TYPES.CAPITAL_ADEQUACY_ONBALANCESHEET
        ) {
          const result = extractCapitalAdequacyOnBalanceSheetData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractCapitalAdequacyOnBalanceSheetMetadata(jsonData);
        }
        else if (
          reportType === REPORT_TYPES.CAPITAL_ADEQUACY_QUARTERLY
        ) {
          const result = extractCapitalAdequacyQuarterlyData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractCapitalAdequacyQuarterlyMetadata(jsonData);
        }
        else if (reportType === REPORT_TYPES.IFB_LOAN_RANGE_REGION_QUARTERLY) {
          const result = extractIfbLoanRangeRegionQuarterlyData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractIfbLoanRangeRegionQuarterlyMetadata(jsonData);
        } else if (reportType === REPORT_TYPES.IFB_LOAN_SECTOR_REGION_QUARTERLY) {
          const result = extractIfbLoanSectorRegionQuarterlyData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractIfbLoanSectorRegionQuarterlyMetadata(jsonData);
        } else if (reportType === REPORT_TYPES.QUARTERLY_BALANCE_SHEET) {
          const result = extractQuarterlyBalanceSheetData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractQuarterlyBalanceSheetMetadata(jsonData);
        } else if (
          reportType ===
          REPORT_TYPES.QUARTERLY_MEMORANDUM_AND_CONTINGENT_ACCOUNTS
        ) {
          const result =
            extractQuarterlyMemorandumAndContingentAccountsData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata =
            extractQuarterlyMemorandumAndContingentAccountsMetadata(jsonData);
        } else if (
          reportType === REPORT_TYPES.QUARTERLY_MATURITY_OF_ASSETS_LIABILITIES
        ) {
          const result =
            extractQuarterlyMaturityOfAssetsLiabilitiesData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata =
            extractQuarterlyMaturityOfAssetsLiabilitiesMetadata(jsonData);
        } 
        else if (
          reportType === REPORT_TYPES.QUARTERLY_TOP_TWENTY_DEPOSITORS
        ) {
          const result = extractQuarterlyTopTwentyDepositorsData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractQuarterlyTopTwentyDepositorsMetadata(jsonData);
        } 
         else if (reportType === REPORT_TYPES.IFB_DEPOSIT_RANGE_REGION_QUARTERLY) {
          const result = extractIfbDepositRangeRegionQuarterlyData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractIfbDepositRangeRegionQuarterlyMetadata(jsonData);
        } else if (reportType === REPORT_TYPES.IFB_DEPOSIT_SECTOR_REGION_QUARTERLY) {
          const result = extractIfbDepositSectorRegionQuarterlyData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractIfbDepositSectorQuarterlyMetadata(jsonData);
        } 
        else if (reportType === REPORT_TYPES.QUARTERLY_TOP20_SHAREHOLDERS) {
          const result = extractQuarterlyTopTwentyShareholdersData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractQuarterlyTopTwentyShareholdersMetadata(jsonData);
        }
        else if (reportType === REPORT_TYPES.QUARTERLY_TWO_PERCENT_SHAREHOLDERS) {
          const result = extractQuarterlyTwoPercentShareholdersData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractQuarterlyTwoPercentShareholdersMetadata(jsonData);
        }        else if (reportType === REPORT_TYPES.QUARTERLY_MOBILE_TRANSACTIONS) {
          const result = extractQuarterlyMobileTransactionsData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractQuarterlyMobileTransactionsMetadata(jsonData);
        }
        else if (reportType === REPORT_TYPES.QUARTERLY_ATM_POS) {
          const result = extractQuarterlyAtmPosData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractQuarterlyAtmPosMetadata(jsonData);
        }
        else if (reportType === REPORT_TYPES.QUARTERLY_TRANSACTION_STATEMENT) {
          const result = extractTransactionStatementData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractTransactionStatementMetadata(jsonData);
        }
        else if (reportType === REPORT_TYPES.QUARTERLY_RESTRUCTURED_LOANS) {
          const result = extractRestructuredLoansData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractRestructuredLoansMetadata(jsonData);
        }
        else if (reportType === REPORT_TYPES.QUARTERLY_DIGITAL_LENDING) {
          const result = extractDigitalLendingData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractDigitalLendingMetadata(jsonData);
        }
        else if (reportType === REPORT_TYPES.QUARTERLY_RECATEGORIZED_LOANS) {
          const result = extractRecategorizedLoansData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractRecategorizedLoansMetadata(jsonData);
        }
        else if (reportType === REPORT_TYPES.QUARTERLY_OFF_BALANCE_PROVISIONING) {
          const result = extractOffBalanceProvisioningData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractOffBalanceProvisioningMetadata(jsonData);
        }
         else {
          throw new Error(`Unsupported report type: ${reportType}`);
        }

        // const hierarchicalData = extractHierarchicalData(jsonData);
        // //console.log('Hierarchical Data:', JSON.stringify(hierarchicalData, null, 2));

        console.log("Extracted metadata:", metadata);
        console.log("Extracted columns:", columns);
        console.log(
          "Extracted hierarchicalData (first 5 nodes):",
          hierarchicalData.slice(0, 5),
        );
        console.log("noandtitles:", noandtitles);
        console.log("=========================================");

        const flatData = flattenData(hierarchicalData);

        const report = {
          id: `${reportType}-${new Date().toISOString().split("T")[0].replace(/-/g, "")}`,
          departmentId: metadata.departmentId,
          departmentName: metadata.departmentName,
          reportTypeId: reportType,
          reportTypeName: metadata.reportTitle,
          ReturnKey: metadata.ReturnKey,
          fileName: file.name,
          status: "PENDING",
          createdAt: new Date().toISOString(),
          createdBy: "current-user",
          metadata: metadata,
          noandtitles: noandtitles,
          columns: columns,
          additionalColumns: additionalColumns,
          data: hierarchicalData,
          flatData: flatData,
          validations: [],
          isValid: true,
        };

        resolve(report);
      } catch (error) {
        console.error("Parse error:", error);
        reject(new Error(`Failed to parse Excel file: ${error.message}`));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
};

const detectReportType = (data) => {
  if (!data || data.length === 0) return null;

  // Check first row for ReturnKey
  const firstRow = data[0];

  if (firstRow && firstRow.length > 0) {
    const firstCell = String(firstRow[0] || "").trim();

    if (firstCell && firstCell.includes("SINGLE CURRENCY")) {
      return REPORT_TYPES.DAILY_FOREX;
    }
    if (firstCell && firstCell.includes("FASDBSFABS001")) {
      return REPORT_TYPES.MONTHLY_BALANCE;
    }
    if (firstCell && firstCell.includes("ZS001")) {
      return REPORT_TYPES.LIQUIDITY_WEEKLY;
    }
    if (firstCell && firstCell.includes("BSD_LOAN_PART13002")) {
      return REPORT_TYPES.LOAN_RELATED_PARTIES;
    }
    if (
      firstCell &&
      (firstCell.includes("Reserve Base") || firstCell.includes("RB001"))
    ) {
      return REPORT_TYPES.RESERVE_BASE;
    }
    if (
      firstCell &&
      (firstCell.includes("BD_L&A") || firstCell.includes("BD001"))
    ) {
      return REPORT_TYPES.LOAN_BREAKDOWN;
    }
    if (
      firstCell &&
      (firstCell.includes("EP001") || firstCell.includes("LOA_PORT"))
    ) {
      return REPORT_TYPES.LOAN_PORTFOLIO;
    }
    if (
      firstCell &&
      (firstCell.includes("NPL&PRO") || firstCell.includes("NL001"))
    ) {
      return REPORT_TYPES.NPL_PROVISIONS;
    }
    if (
      firstCell &&
      (firstCell.includes("LOA_ADV_OUT") || firstCell.includes("LA001"))
    ) {
      return REPORT_TYPES.LOAN_DISBURSEMENT;
    }
    if (
      firstCell &&
      (firstCell.includes("LA_STAT") || firstCell.includes("LS001"))
    ) {
      return REPORT_TYPES.LOAN_STATUS;
    }
    if (
      firstCell &&
      (firstCell.includes("M_LCPL") || firstCell.includes("LC001"))
    ) {
      return REPORT_TYPES.LOAN_CLASSIFICATION;
    }
    if (
      firstCell &&
      (firstCell.includes("BOR_TEN_PER") || firstCell.includes("LB002"))
    ) {
      return REPORT_TYPES.LARGE_BORROWERS;
    }
    if (
      firstCell &&
      (firstCell.includes("LOAN_RAN & REG") || firstCell.includes("RL002"))
    ) {
      return REPORT_TYPES.LOAN_RANGE_REGION;
    }
    if (
      firstCell &&
      (firstCell.includes("LOAN_SEC & REG") || firstCell.includes("RS002"))
    ) {
      return REPORT_TYPES.LOAN_SECTOR_REGION;
    }
    if (firstCell && firstCell.includes("SRRYY001")) {
      return REPORT_TYPES.STATUTORY_REQ;
    }
    if (
      (firstCell && firstCell.includes("Key Balance Sheet")) ||
      firstCell.includes("MK001")
    ) {
      return REPORT_TYPES.KEY_BALANCE_SHEET;
    }
    if (
      (firstCell && firstCell.includes("M_CC-On & Off")) ||
      firstCell.includes("KK001")
    ) {
      return REPORT_TYPES.CAPITAL_ADEQUACY;
    }
    if (
      (firstCell && firstCell.includes("CDby Range and Reg")) ||
      firstCell.includes("CM002")
    ) {
      return REPORT_TYPES.DEPOSIT_RANGE_REGION;
    }
    if (
      (firstCell && firstCell.includes("CDby Sector and RegMD002")) ||
      firstCell.includes("MD002")
    ) {
      return REPORT_TYPES.DEPOSIT_SECTOR_REGION;
    }
    if (
      (firstCell && firstCell.includes("DIR RANGE")) ||
      firstCell.includes("RD001")
    ) {
      return REPORT_TYPES.IFB_RANGE_REGION;
    }
    if (
      (firstCell && firstCell.includes("DIF")) ||
      firstCell.includes("IF002")
    ) {
      return REPORT_TYPES.IFB_SECTOR_REGION;
    }
    if (
      (firstCell && firstCell.includes("INT_FRE_BS")) ||
      firstCell.includes("FB001")
    ) {
      return REPORT_TYPES.IFB_BALANCE_SHEET;
    }
    if (
      (firstCell && firstCell.includes("INT_FRE_SP")) ||
      firstCell.includes("BP001")
    ) {
      return REPORT_TYPES.IFB_PROFIT_LOSS;
    }
    if (
      (firstCell && firstCell.includes("IFB_LON_R & R")) ||
      firstCell.includes("WW002")
    ) {
      return REPORT_TYPES.IFB_LOAN_RANGE_REGION;
    }
    if (
      (firstCell && firstCell.includes("IFB_LON_S & R")) ||
      firstCell.includes("ZZ002")
    ) {
      return REPORT_TYPES.IFB_LOAN_SECTOR_REGION;
    }
    if (
      (firstCell && firstCell.includes("COL_SOL_18M")) ||
      firstCell.includes("LL001")
    ) {
      return REPORT_TYPES.COLLATERALIZED_PROPERTY_SOLD_LAST18;
    }
    if (
      (firstCell && firstCell.includes("LOAN_CLA&PROV")) ||
      firstCell.includes("LP001")
    ) {
      return REPORT_TYPES.LOAN_CLASSIFICATION_PROVISIONING;
    }
    if (
      (firstCell && firstCell.includes("NPL_ECPOM")) ||
      firstCell.includes("NE001")
    ) {
      return REPORT_TYPES.NPL_SECTOR_BRANCH;
    }
    if (
      (firstCell && firstCell.includes("COL_ACQ_18M")) ||
      firstCell.includes("OL001")
    ) {
      return REPORT_TYPES.COLLATERALIZED_PROPERTY_ACQUIRED_LAST18;
    }
    if (firstCell && firstCell.includes("LOAN_RAN&REG_RA002")) {
      return REPORT_TYPES.LOAN_RANGE_REGION_QUARTERLY;
    }
    if (
      (firstCell && firstCell.includes("TOP_TWENTY_NPL")) ||
      firstCell.includes("TN001")
    ) {
      return REPORT_TYPES.Q_TOP_TWENTY_NPL;
    }
    if (firstCell && firstCell.includes("BRE_EXPE_BE001")) {
      return REPORT_TYPES.EXPENSE_BREAKDOWN_QUARTERLY;
    }
    if (firstCell && firstCell.includes("BRE_INCO_BA001")) {
      return REPORT_TYPES.INCOME_ACCOUNT_BREAKDOWN;
    }
    if (firstCell && firstCell.includes("CAP_ADQ_OFB_QO001")) {
      return REPORT_TYPES.CAPITAL_ADEQUACY_OFFBALANCESHEET;
    }
    if (
      firstCell &&
      (firstCell.includes("TOP_20_BOR_TB001") || firstCell.includes("TB001"))
    ) {
      return REPORT_TYPES.TOP20_BORROWERS;
    }
    if (
      firstCell &&
      (firstCell.includes("BUIL_CONSTXW002") || firstCell.includes("XW002"))
    ) {
      return REPORT_TYPES.BUILDING_CONSTRUCTION;
    }
    if (
      firstCell &&
      (firstCell.includes("LOAN_SEC&REG") || firstCell.includes("SE002"))
    ) {
      return REPORT_TYPES.CONVENTIONAL_LOAN_SECTOR_REGION;
    }
    if (
      firstCell &&
      (firstCell.includes("DEP_RAN&REG_DR002"))
    ) {
      return REPORT_TYPES.DEPOSIT_RANGE_REGION_QUARTERLY;
    }
    if (
      firstCell &&
      (firstCell.includes("PRO&LOS_PL001"))
    ) {
      return REPORT_TYPES.FINANCE_PROFIT_LOSS;
    }
  
    if (
      firstCell &&
      (firstCell.includes("CAP_ADQ_ITEM_QI001"))
    ) {
      return REPORT_TYPES.CAPITAL_ADEQUACY_ONBALANCESHEET;
    }
    if (
      firstCell &&
      (firstCell.includes("CAP_ADQ_CAP_QC001"))
    ) {
      return REPORT_TYPES.CAPITAL_ADEQUACY_QUARTERLY;
    }
    if (
      firstCell &&
      (firstCell.includes("INT_LON_R&R_EE002"))
    ) {
      return REPORT_TYPES.IFB_LOAN_RANGE_REGION_QUARTERLY;
    }
    if (
      firstCell &&
      (firstCell.includes("INT_LON_S&R_SR002"))
    ) {
      return REPORT_TYPES.IFB_LOAN_SECTOR_REGION_QUARTERLY;
    }
      if (firstCell && firstCell.includes("MEM&CONT_MM001")) {
      return REPORT_TYPES.QUARTERLY_MEMORANDUM_AND_CONTINGENT_ACCOUNTS;
    }
    if (
      (firstCell && firstCell.includes("BAL_SHEET_BS001")) ||
      firstCell.includes("BS001")
    ) {
      return REPORT_TYPES.QUARTERLY_BALANCE_SHEET;
    }
    if (firstCell && firstCell.includes("NBE_MAT_ANL_MA001")) {
      return REPORT_TYPES.QUARTERLY_MATURITY_OF_ASSETS_LIABILITIES;
    }
    if (firstCell && firstCell.includes("NBE_20_DEP_MR001")) {
      return REPORT_TYPES.QUARTERLY_TOP_TWENTY_DEPOSITORS;
    }
    if (firstCell && firstCell.includes("INT_FRE_RANID002")) {
      return REPORT_TYPES.IFB_DEPOSIT_RANGE_REGION_QUARTERLY;
    }
    if (firstCell && firstCell.includes("INT_FRE_SECRI003")) {
      return REPORT_TYPES.IFB_DEPOSIT_SECTOR_REGION_QUARTERLY;
    }
       if (
      firstCell &&
      (firstCell.includes("TWE_SHA_STR_TH001") || firstCell.includes("TH001"))
    ) {
      return REPORT_TYPES.QUARTERLY_TOP20_SHAREHOLDERS;
    }
    if (
      firstCell &&
      (firstCell.includes("SHR_GTR_2_TS001") || firstCell.includes("TS001"))
    ) {
      return REPORT_TYPES.QUARTERLY_TWO_PERCENT_SHAREHOLDERS;
    }
        if (
      firstCell &&
      (firstCell.includes("MOB_TRA_QM001") || firstCell.includes("QM001"))
    ) {
      return REPORT_TYPES.QUARTERLY_MOBILE_TRANSACTIONS;
    }
    if (
      firstCell &&
      (firstCell.includes("QUA_ATM_POS_QP001") || firstCell.includes("QP001"))
    ) {
      return REPORT_TYPES.QUARTERLY_ATM_POS;
    }
       if (firstCell && (firstCell.includes('TRAN_STAT') || firstCell.includes('QQ001'))) {
      return REPORT_TYPES.QUARTERLY_TRANSACTION_STATEMENT;
    }
      if (firstCell && (firstCell.includes('ARLAL001'))) {
      return REPORT_TYPES.QUARTERLY_RESTRUCTURED_LOANS;
    }
      if (firstCell && (firstCell.includes('DigitalLendingDL001'))) {
      return REPORT_TYPES.QUARTERLY_DIGITAL_LENDING;
    }
    if (firstCell && (firstCell.includes('NACNN001') || firstCell.includes('NACNN'))) {
      return REPORT_TYPES.QUARTERLY_RECATEGORIZED_LOANS;
    }
        if (firstCell && (firstCell.includes('POBEPE001') || firstCell.includes('POBEPE'))) {
      return REPORT_TYPES.QUARTERLY_OFF_BALANCE_PROVISIONING;
    }
  }

  return null;
};

const flattenData = (nodes) => {
  const result = [];
  const traverse = (nodes, parentId = null) => {
    nodes.forEach((node) => {
      const flatNode = {
        id: node.id,
        sNo: node.sNo || "",
        label: node.label,
        values: node.values || {},
        rowNumber: node.rowNumber,
        level: node.level || 0,
        isTotalRow: node.isTotalRow || false,
        parentId: parentId,
      };
      result.push(flatNode);
      if (node.children && node.children.length > 0) {
        traverse(node.children, node.id);
      }
    });
  };
  traverse(nodes);
  return result;
};

export const validateReportStructure = (parsedData) => {
  const errors = [];

  if (!parsedData.metadata.institutionCode) {
    errors.push("Institution Code is missing");
  }
  if (!parsedData.metadata.financialYear) {
    errors.push("Financial Year is missing");
  }
  if (!parsedData.metadata.startDate) {
    errors.push("Start Date is missing");
  }
  if (!parsedData.metadata.endDate) {
    errors.push("End Date is missing");
  }
  if (!parsedData.metadata.reportTitle) {
    errors.push("Report Title is missing");
  }

  if (!parsedData.data || parsedData.data.length === 0) {
    errors.push("No data found in the report");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const prepareReportForSubmission = (parsedData) => {
  return {
    id: parsedData.id,
    departmentId: parsedData.departmentId,
    departmentName: parsedData.departmentName,
    reportTypeId: parsedData.reportTypeId,
    reportTypeName: parsedData.reportTypeName,
    ReturnKey: parsedData.ReturnKey,
    fileName: parsedData.fileName,
    status: parsedData.status || "PENDING",
    createdAt: parsedData.createdAt || new Date().toISOString(),
    createdBy: parsedData.createdBy || "current-user",
    metadata: parsedData.metadata,
    columns: parsedData.columns,
    noandtitles: parsedData.noandtitles,
    additionalColumns: parsedData.additionalColumns,
    data: parsedData.data,
    //flatData: parsedData.flatData || flattenData(parsedData.data),
    validations: parsedData.validations || [],
    isValid: parsedData.isValid !== undefined ? parsedData.isValid : true,
  };
};
