import { REPORT_TYPES } from "./departments";

// Loads every extractor module under departments-data/ (recursive)
const ctx = require.context("./departments-data", true, /extract.*\.js$/);

// keys look like "./finance/monthly/extractBalanceSheetData.js"
const modules = Object.fromEntries(ctx.keys().map((key) => [key, ctx(key)]));

// One line per report: type -> file path (relative to departments-data/, no .js)
const REPORT_FILES = {
    [REPORT_TYPES.DAILY_FOREX]: "ibd/daily/extractForexData",
    [REPORT_TYPES.MONTHLY_BALANCE]: "finance/monthly/extractBalanceSheetData",
    [REPORT_TYPES.LIQUIDITY_WEEKLY]: "finance/weekly/extractLiquidityRequirementData",
    [REPORT_TYPES.LOAN_RELATED_PARTIES]: "credit/monthly/extractLoanRelatedPartiesData",
    [REPORT_TYPES.RESERVE_BASE]: "finance/monthly/extractReserveBaseData",
    [REPORT_TYPES.LOAN_BREAKDOWN]: "credit/monthly/extractLoanBreakdownData",
    [REPORT_TYPES.LOAN_PORTFOLIO]: "credit/monthly/extractLoanPortfolioData",
    [REPORT_TYPES.NPL_PROVISIONS]: "credit/monthly/extractNplProvisionsData",
    [REPORT_TYPES.LOAN_DISBURSEMENT]: "credit/monthly/extractLoanDisbursementData",
    [REPORT_TYPES.LOAN_STATUS]: "credit/monthly/extractLoanStatusData",
    [REPORT_TYPES.LOAN_CLASSIFICATION]: "credit/monthly/extractLoanClassificationData",
    [REPORT_TYPES.LARGE_BORROWERS]: "credit/monthly/extractLargeBorrowersData",
    [REPORT_TYPES.LOAN_RANGE_REGION]: "credit/monthly/extractLoanRangeRegionData",
    [REPORT_TYPES.LOAN_SECTOR_REGION]: "credit/monthly/extractLoanSectorRegionData",
    [REPORT_TYPES.STATUTORY_REQ]: "finance/monthly/extractLoanStatutoryRequirementData",
    [REPORT_TYPES.KEY_BALANCE_SHEET]: "finance/monthly/extractKeyBalanceSheetData",
    [REPORT_TYPES.CAPITAL_ADEQUACY]: "finance/monthly/extractCapitalAdequacyData",
    [REPORT_TYPES.DEPOSIT_RANGE_REGION]: "finance/monthly/extractDepositRangeRegionData",
    [REPORT_TYPES.DEPOSIT_SECTOR_REGION]: "finance/monthly/extractDepositSectorRegionData",
    [REPORT_TYPES.IFB_RANGE_REGION]: "ifb/monthly/extractIfbDepositRangeRegionData",
    [REPORT_TYPES.IFB_SECTOR_REGION]: "ifb/monthly/extractIfbDepositSectorRegionData",
    [REPORT_TYPES.IFB_BALANCE_SHEET]: "ifb/monthly/extractIfbBalanceSheetData",
    [REPORT_TYPES.IFB_PROFIT_LOSS]: "ifb/monthly/extractIfbProfitLossData",
    [REPORT_TYPES.IFB_LOAN_RANGE_REGION]: "ifb/monthly/extractIfbLoanRangeRegionData",
    [REPORT_TYPES.IFB_LOAN_SECTOR_REGION]: "ifb/monthly/extractIfbLoanSectorRegionData",
    [REPORT_TYPES.COLLATERALIZED_PROPERTY_SOLD_LAST18]: "credit/quarterly/extractCollateralizedPropertySoldLast18Data",
    [REPORT_TYPES.LOAN_CLASSIFICATION_PROVISIONING]: "credit/quarterly/extractLoanClassificationProvisioningData",
    [REPORT_TYPES.NPL_SECTOR_BRANCH]: "credit/quarterly/extractNplSectorBranchData",
    [REPORT_TYPES.COLLATERALIZED_PROPERTY_ACQUIRED_LAST18]: "credit/quarterly/extractCollateralizedPropertyAcquiredLast18Data",
    [REPORT_TYPES.LOAN_RANGE_REGION_QUARTERLY]: "credit/quarterly/extractLoanRangeRegionQuarterlyData",
    [REPORT_TYPES.Q_TOP_TWENTY_NPL]: "credit/quarterly/extractQTopTwentyNplData",
    [REPORT_TYPES.EXPENSE_BREAKDOWN_QUARTERLY]: "finance/quarterly/extractExpenseBreakdownData", 
    [REPORT_TYPES.INCOME_ACCOUNT_BREAKDOWN]: "finance/quarterly/extractIncomeAccountBreakdownData",
    [REPORT_TYPES.CAPITAL_ADEQUACY_OFFBALANCESHEET]: "finance/quarterly/extractCapitalAdequacyOffBalanceSheetData",
    [REPORT_TYPES.TOP20_BORROWERS]: "credit/quarterly/extractTop20BorrowersData",
    [REPORT_TYPES.BUILDING_CONSTRUCTION]: "credit/quarterly/extractBuildingConstructionLoansData",
    [REPORT_TYPES.CONVENTIONAL_LOAN_SECTOR_REGION]: "credit/quarterly/extractConventionalLoanSectorRegionData",
    [REPORT_TYPES.DEPOSIT_RANGE_REGION_QUARTERLY]: "finance/monthly/extractDepositRangeRegionQuarterlyData", // note: lives in monthly/
    [REPORT_TYPES.FINANCE_PROFIT_LOSS]: "finance/monthly/extractFinanceProfitLossData",
    [REPORT_TYPES.CAPITAL_ADEQUACY_ONBALANCESHEET]: "finance/quarterly/extractCapitalAdequacyOnBalanceSheetData",
    [REPORT_TYPES.CAPITAL_ADEQUACY_QUARTERLY]: "finance/quarterly/extractCapitalAdequacyQuarterlyData",
    [REPORT_TYPES.IFB_LOAN_RANGE_REGION_QUARTERLY]: "ifb/quarterly/extractIfbLoanRangeRegionQuarterlyData",
    [REPORT_TYPES.IFB_LOAN_SECTOR_REGION_QUARTERLY]: "ifb/quarterly/extractIfbLoanSectorRegionQuarterlyData",
    [REPORT_TYPES.QUARTERLY_BALANCE_SHEET]: "finance/quarterly/extractQuarterlyBalanceSheetData",
    [REPORT_TYPES.QUARTERLY_MEMORANDUM_AND_CONTINGENT_ACCOUNTS]: "finance/quarterly/extractQuarterlyMemorandumAndContingentAccountsData",
    [REPORT_TYPES.QUARTERLY_MATURITY_OF_ASSETS_LIABILITIES]: "finance/quarterly/extractQuarterlyMaturityOfAssetsLiabilitiesData",
    [REPORT_TYPES.QUARTERLY_TOP_TWENTY_DEPOSITORS]: "finance/quarterly/extractQuarterlyTopTwentyDepositorsData",
    [REPORT_TYPES.IFB_DEPOSIT_RANGE_REGION_QUARTERLY]: "ifb/quarterly/extractIfbDepositRangeRegionQuarterlyData",
    [REPORT_TYPES.IFB_DEPOSIT_SECTOR_REGION_QUARTERLY]: "ifb/quarterly/extractIfbDepositSectorRegionQuarterlyData",
    [REPORT_TYPES.QUARTERLY_TOP20_SHAREHOLDERS]: "share/quarterly/extractQuarterlyTopTwentyShareholdersData",
    [REPORT_TYPES.QUARTERLY_TWO_PERCENT_SHAREHOLDERS]: "share/quarterly/extractQuarterlyTwoPercentShareholdersData",
    [REPORT_TYPES.QUARTERLY_MOBILE_TRANSACTIONS]: "digital/quarterly/extractQuarterlyMobileTransactionsData",
    [REPORT_TYPES.QUARTERLY_ATM_POS]: "digital/quarterly/extractQuarterlyAtmPosData",
    [REPORT_TYPES.QUARTERLY_TRANSACTION_STATEMENT]: "finance/quarterly/extractTransactionStatementData",
    [REPORT_TYPES.QUARTERLY_RESTRUCTURED_LOANS]: "credit/quarterly/extractRestructuredLoansData",
    [REPORT_TYPES.QUARTERLY_DIGITAL_LENDING]: "credit/quarterly/extractDigitalLendingData",
    [REPORT_TYPES.QUARTERLY_RECATEGORIZED_LOANS]: "credit/quarterly/extractRecategorizedLoansData",
    [REPORT_TYPES.QUARTERLY_OFF_BALANCE_PROVISIONING]: "credit/quarterly/extractOffBalanceProvisioningData",
    [REPORT_TYPES.QUARTERLY_RESTRUCTURED_ABOVE_5PCT]: "credit/quarterly/extractRestructuredAbove5PctData",
    [REPORT_TYPES.QUARTERLY_AGENT_TRANSACTION]: "unidentified/quarterly/extractAgentTransactions",
    [REPORT_TYPES.QUARTERLY_LOANS_TO_INSIDERS]: "unidentified/quarterly/extractLoansToInsiders",
    [REPORT_TYPES.QUARTERLY_BSD_NEW_AGENTS]: "unidentified/quarterly/extractNewAgentsInformation",
    [REPORT_TYPES.QUARTERLY_RELATED_ORG]: "unidentified/quarterly/extractRelatedOrganizations",
    [REPORT_TYPES.WEEKLY_FOREIGN_CURRENCY_LIQUIDITY]: "ibd/weekly/extractForeignCurrencyLiquidity",
    [REPORT_TYPES.WEEKLY_FOREIGN_CURRENCY_RESERVE]: "ibd/weekly/extractForeignCurrencyReserve",
    [REPORT_TYPES.QUARTERLY_AGGREGATE_RECATEGORIZED_LOANS]: "credit/quarterly/extractAggregateRecategorizedLoansData",
    [REPORT_TYPES.MONTHLY_WEIGHTED_AVG_LENDING_RATES]: "credit/monthly/extractWeightedAvgLendingRatesData",
    [REPORT_TYPES.MONTHLY_WEIGHTED_AVG_DEPOSIT_RATES]: "finance/monthly/extractWeightedAvgDepositRatesData",
    [REPORT_TYPES.MONTHLY_IFB_WEIGHTED_AVG_LENDING_RATES]: "ifb/monthly/extractIfbWeightedAvgLendingRatesData",
    [REPORT_TYPES.MONTHLY_IFB_WEIGHTED_AVG_DEPOSIT_RATES]: "ifb/monthly/extractIfbWeightedAvgDepositRatesData",
};

function pairExtractors(type, file) {
    const mod = modules[`./${file}.js`];   // was: `./departments-data/${file}.js`
    if (!mod) throw new Error(`[${type}] no module found for "${file}"`);

    const extractData = mod.default;
    const metaKeys = Object.keys(mod).filter((k) => /metadata$/i.test(k));

    if (typeof extractData !== "function") {
        throw new Error(`[${type}] "${file}" has no default export function`);
    }
    if (metaKeys.length !== 1) {
        throw new Error(
            `[${type}] "${file}" must have exactly one *Metadata export, found: ${metaKeys.join(", ") || "none"}`,
        );
    }
    return { extractData, extractMetadata: mod[metaKeys[0]] };
}

export const REPORT_EXTRACTORS = Object.fromEntries(
    Object.entries(REPORT_FILES).map(([type, file]) => [type, pairExtractors(type, file)]),
);

export function extractReport(reportType, jsonData) {
    const extractor = REPORT_EXTRACTORS[reportType];
    if (!extractor) throw new Error(`Unsupported report type: ${reportType}`);

    let result;
    try {
        result = extractor.extractData(jsonData);
    } catch (err) {
        throw new Error(
            `extractData failed for "${reportType}" (${extractor.extractData.name}): ${err.message}`,
            { cause: err },
        );
    }

    let metadata;
    try {
        metadata = extractor.extractMetadata(jsonData);
    } catch (err) {
        throw new Error(
            `extractMetadata failed for "${reportType}" (${extractor.extractMetadata.name}): ${err.message}`,
            { cause: err },
        );
    }

    const { hierarchicalData, columns, additionalColumns, noandtitles } = result;
    return { hierarchicalData, columns, additionalColumns, noandtitles, metadata };
}