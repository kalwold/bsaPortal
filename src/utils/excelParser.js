import * as XLSX from "xlsx";
import extractLiquidityRequirementData, {
  extractLiquidityMetadata,
} from "./departments-data/finance/weekly/extractLiquidityRequirementData";
import extractLoanRelatedPartiesData, {
  extractRelatedPartiesMetadata,
} from "./departments-data/credit/monthly/extractLoanRelatedPartiesData";
import extractBalanceSheetData, {
  extractBalanceSheetMetadata,
} from "./departments-data/finance/monthly/extractBalanceSheetData";
import extractForexData, { extractForexMetadata } from "./departments-data/ibd/daily/extractForexData";
import extractReserveBaseData, {
  extractReserveBaseMetadata,
} from "./departments-data/finance/monthly/extractReserveBaseData";
import extractLoanBreakdownData, {
  extractLoanBreakdownMetadata,
} from "./departments-data/credit/monthly/extractLoanBreakdownData";
import extractLoanPortfolioData, {
  extractPortfolioMetadata,
} from "./departments-data/credit/monthly/extractLoanPortfolioData";
import extractNplProvisionsData, {
  extractNplProvisionMetadata,
} from "./departments-data/credit/monthly/extractNplProvisionsData";
import extractLoanDisbursementData, {
  extractDisbursementMetadata,
} from "./departments-data/credit/monthly/extractLoanDisbursementData";
import extractLoanStatusData, {
  extractLoanStatusMetadata,
} from "./departments-data/credit/monthly/extractLoanStatusData";
import extractLoanClassificationData, {
  extractLoanClassificationMetaData,
} from "./departments-data/credit/monthly/extractLoanClassificationData";
import extractLargeBorrowersData, {
  extractLargeBorrowersMetadata,
} from "./departments-data/credit/monthly/extractLargeBorrowersData";
import extractLoanRangeRegionData, {
  extractLoanRangeRegionMetadata,
} from "./departments-data/credit/monthly/extractLoanRangeRegionData";
import extractLoanSectorRegionData, {
  extractLoanSectorRegionMetadata,
} from "./departments-data/credit/monthly/extractLoanSectorRegionData";
import extractConventionalLoanSectorRegionData, {
  extractConventionalLoanSectorRegionMetadata,
} from "./departments-data/credit/quarterly/extractConventionalLoanSectorRegionData";
import extractLoanStatutoryRequirementData, {
  extractStatutoryMetadata,
} from "./departments-data/finance/monthly/extractLoanStatutoryRequirementData";
import extractKeyBalanceSheetData, {
  extractKeyBalanceSheetMetadata,
} from "./departments-data/finance/monthly/extractKeyBalanceSheetData";
import extractCapitalAdequacyData, {
  extractCapitalMetadata,
} from "./departments-data/finance/monthly/extractCapitalAdequacyData";
import extractDepositRangeRegionData, {
  extractDepositRangeRegionMetadata,
} from "./departments-data/finance/monthly/extractDepositRangeRegionData";
import extractDepositSectorRegionData, {
  extractDepositSectorRegionMetadata,
} from "./departments-data/finance/monthly/extractDepositSectorRegionData";
import extractIfbDepositRangeRegionData, {
  extractIfbDepositRangeRegionMetadata,
} from "./departments-data/ifb/monthly/extractIfbDepositRangeRegionData";
import extractIfbDepositSectorRegionData, {
  extractIfbDepositSectorMetadata,
} from "./departments-data/ifb/monthly/extractIfbDepositSectorRegionData";
import extractIfbBalanceSheetData, {
  extractIfbBalanceSheetMetadata,
} from "./departments-data/ifb/monthly/extractIfbBalanceSheetData";
import extractIfbProfitLossData, {
  extractIfbProfitLossMetadata,
} from "./departments-data/ifb/monthly/extractIfbProfitLossData";
import extractIfbLoanRangeRegionData, {
  extractIfbLoanRangeRegionMetadata,
} from "./departments-data/ifb/monthly/extractIfbLoanRangeRegionData";
import extractIfbLoanSectorRegionData, {
  extractIfbLoanSectorRegionMetadata,
} from "./departments-data/ifb/monthly/extractIfbLoanSectorRegionData";
import extractCollateralizedPropertySoldLast18Data, {
  extractCollateralizedPropertySoldLast18Metadata,
} from "./departments-data/credit/quarterly/extractCollateralizedPropertySoldLast18Data";
import extractLoanClassificationProvisioningData, {
  extractLoanClassificationProvisioningMetadata,
} from "./departments-data/credit/quarterly/extractLoanClassificationProvisioningData";
import extractNplSectorBranchData, {
  extractNplSectorBranchMetadata,
} from "./departments-data/credit/quarterly/extractNplSectorBranchData";
import extractCollateralizedPropertyAcquiredLast18Data, {
  extractCollateralizedPropertyAcquiredLast18Metadata,
} from "./departments-data/credit/quarterly/extractCollateralizedPropertyAcquiredLast18Data";
import extractLoanRangeRegionQuarterlyData, {
  extractLoanRangeRegionQuarterlyMetadata,
} from "./departments-data/credit/quarterly/extractLoanRangeRegionQuarterlyData";
import extractQTopTwentyNplData, {
  extractQTopTwentyNplMetadata,
} from "./departments-data/credit/quarterly/extractQTopTwentyNplData";

import extractExpenseBreakdownData, {
  extractExpenseBreakdownMetadata,
} from "./departments-data/finance/quarterly/extractExpenseBreakdownData";
import extractIncomeAccountBreakdownData, {
  extractIncomeAccountBreakdownMetadata,
} from "./departments-data/finance/quarterly/extractIncomeAccountBreakdownData";
import extractCapitalAdequacyOffBalanceSheetData, {
  extractCapitalAdequacyOffBalanceSheetMetadata,
} from "./departments-data/finance/quarterly/extractCapitalAdequacyOffBalanceSheetData";
import extractTop20BorrowersData, {
  extractTop20BorrowersMetadata,
} from "./departments-data/credit/quarterly/extractTop20BorrowersData";
import extractBuildingConstructionLoansData, {
  extractBuildingConstructionMetadata,
} from "./departments-data/credit/quarterly/extractBuildingConstructionLoansData";
import extractDepositRangeRegionQuarterlyData, {extractDepositRangeRegionQuarterlyMetadata} from "./departments-data/finance/monthly/extractDepositRangeRegionQuarterlyData";
import extractFinanceProfitLossData,{extractFinanceProfitLossMetadata} from "./departments-data/finance/monthly/extractFinanceProfitLossData";
import extractCapitalAdequacyOnBalanceSheetData,{extractCapitalAdequacyOnBalanceSheetMetadata} from "./departments-data/finance/quarterly/extractCapitalAdequacyOnBalanceSheetData";
import extractCapitalAdequacyQuarterlyData,{extractCapitalAdequacyQuarterlyMetadata} from "./departments-data/finance/quarterly/extractCapitalAdequacyQuarterlyData";
import extractIfbLoanRangeRegionQuarterlyData,{extractIfbLoanRangeRegionQuarterlyMetadata} from "./departments-data/ifb/quarterly/extractIfbLoanRangeRegionQuarterlyData";
import extractIfbLoanSectorRegionQuarterlyData,{extractIfbLoanSectorRegionQuarterlyMetadata} from "./departments-data/ifb/quarterly/extractIfbLoanSectorRegionQuarterlyData";
import extractQuarterlyBalanceSheetData, {
  extractQuarterlyBalanceSheetMetadata,
} from "./departments-data/finance/quarterly/extractQuarterlyBalanceSheetData";
import extractQuarterlyTopTwentyDepositorsData, {
  extractQuarterlyTopTwentyDepositorsMetadata,
} from "./departments-data/finance/quarterly/extractQuarterlyTopTwentyDepositorsData";
import extractQuarterlyMaturityOfAssetsLiabilitiesData, {
  extractQuarterlyMaturityOfAssetsLiabilitiesMetadata,
} from "./departments-data/finance/quarterly/extractQuarterlyMaturityOfAssetsLiabilitiesData";
import extractQuarterlyMemorandumAndContingentAccountsData, {
  extractQuarterlyMemorandumAndContingentAccountsMetadata,
} from "./departments-data/finance/quarterly/extractQuarterlyMemorandumAndContingentAccountsData";
import extractIfbDepositRangeRegionQuarterlyData,{extractIfbDepositRangeRegionQuarterlyMetadata} from "./departments-data/ifb/quarterly/extractIfbDepositRangeRegionQuarterlyData";
import extractIfbDepositSectorRegionQuarterlyData,{extractIfbDepositSectorQuarterlyMetadata} from "./departments-data/ifb/quarterly/extractIfbDepositSectorRegionQuarterlyData";
import extractQuarterlyTopTwentyShareholdersData, {
  extractQuarterlyTopTwentyShareholdersMetadata,
} from "./departments-data/share/quarterly/extractQuarterlyTopTwentyShareholdersData";
import extractQuarterlyTwoPercentShareholdersData, {
  extractQuarterlyTwoPercentShareholdersMetadata,
} from "./departments-data/share/quarterly/extractQuarterlyTwoPercentShareholdersData";
import extractQuarterlyMobileTransactionsData, {
  extractQuarterlyMobileTransactionsMetadata,
} from "./departments-data/digital/quarterly/extractQuarterlyMobileTransactionsData";
import extractQuarterlyAtmPosData, {
  extractQuarterlyAtmPosMetadata,
} from "./departments-data/digital/quarterly/extractQuarterlyAtmPosData";
import extractTransactionStatementData,{extractTransactionStatementMetadata} from "./departments-data/finance/quarterly/extractTransactionStatementData";
import extractRestructuredLoansData,{extractRestructuredLoansMetadata} from "./departments-data/credit/quarterly/extractRestructuredLoansData";
import extractDigitalLendingData, {extractDigitalLendingMetadata} from "./departments-data/credit/quarterly/extractDigitalLendingData";
import extractRecategorizedLoansData, {extractRecategorizedLoansMetadata} from "./departments-data/credit/quarterly/extractRecategorizedLoansData";
import extractOffBalanceProvisioningData ,{extractOffBalanceProvisioningMetadata} from "./departments-data/credit/quarterly/extractOffBalanceProvisioningData"
import extractRestructuredAbove5PctData,{extractRestructuredAbove5PctMetadata} from "./departments-data/credit/quarterly/extractRestructuredAbove5PctData";
import { detectReportType } from "./detectReportType";
import { REPORT_TYPES } from "./reportTypes";
import extractAggregateRecategorizedLoansData, {extractAggregateRecategorizedLoansMetadata} from './departments-data/credit/quarterly/extractAggregateRecategorizedLoansData';
import extractWeightedAvgDepositRatesData , {extractWeightedAvgDepositRatesMetadata} from './departments-data/finance/monthly/extractWeightedAvgDepositRatesData';
import extractIfbWeightedAvgDepositRatesData , {extractIfbWeightedAvgDepositRatesMetadata} from './departments-data/ifb/monthly/extractIfbWeightedAvgDepositRatesData';
import extractWeightedAvgLendingRatesData,{extractWeightedAvgLendingRatesMetadata} from "./departments-data/credit/monthly/extractWeightedAvgLendingRatesData";
import extractIfbWeightedAvgLendingRatesData,{extractIfbWeightedAvgLendingRatesMetadata} from "./departments-data/ifb/monthly/extractIfbWeightedAvgLendingRatesData";


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
        else if (reportType === REPORT_TYPES.QUARTERLY_RESTRUCTURED_ABOVE_5PCT) {
          const result = extractRestructuredAbove5PctData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractRestructuredAbove5PctMetadata(jsonData);
        }
        else if (reportType === REPORT_TYPES.QUARTERLY_AGGREGATE_RECATEGORIZED_LOANS) {
          const result = extractAggregateRecategorizedLoansData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractAggregateRecategorizedLoansMetadata(jsonData);
        }
        else if (reportType === REPORT_TYPES.MONTHLY_WEIGHTED_AVG_DEPOSIT_RATES) {
          const result = extractWeightedAvgDepositRatesData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractWeightedAvgDepositRatesMetadata(jsonData);
          
        }
        else if (reportType === REPORT_TYPES.MONTHLY_IFB_WEIGHTED_AVG_DEPOSIT_RATES) {
          const result = extractIfbWeightedAvgDepositRatesData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractIfbWeightedAvgDepositRatesMetadata(jsonData);
          
        }
        else if (reportType === REPORT_TYPES.MONTHLY_WEIGHTED_AVG_LENDING_RATES) {
          const result = extractWeightedAvgLendingRatesData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractWeightedAvgLendingRatesMetadata(jsonData);
          
        }
        else if (reportType === REPORT_TYPES.MONTHLY_IFB_WEIGHTED_AVG_LENDING_RATES) {
          const result = extractIfbWeightedAvgLendingRatesData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles = result.noandtitles;
          metadata = extractIfbWeightedAvgLendingRatesMetadata(jsonData); 
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
