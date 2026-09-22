import { REPORT_TYPES } from "./reportTypes";

export const detectReportType = (data) => {
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
       if (firstCell && (firstCell.includes('RLAFCRC001') || firstCell.includes('RLAFCRC'))) {
      return REPORT_TYPES.QUARTERLY_RESTRUCTURED_ABOVE_5PCT;
    }
       if (firstCell && (firstCell.includes('ANARN001') || firstCell.includes('RN001'))) {
      return REPORT_TYPES.QUARTERLY_AGGREGATE_RECATEGORIZED_LOANS;
    }
       if (firstCell && (firstCell.includes('WAADIR001'))) {
      return REPORT_TYPES.MONTHLY_WEIGHTED_AVG_DEPOSIT_RATES;
    }
       if (firstCell && (firstCell.includes('DPWADP001'))) {
      return REPORT_TYPES.MONTHLY_IFB_WEIGHTED_AVG_DEPOSIT_RATES;
    }
       if (firstCell && (firstCell.includes('LCMWAC001'))) {
      return REPORT_TYPES.MONTHLY_WEIGHTED_AVG_LENDING_RATES
    }
       if (firstCell && (firstCell.includes('IFBLCMWAL001'))) {
      return REPORT_TYPES.MONTHLY_IFB_WEIGHTED_AVG_LENDING_RATES
    }


  }

  return null;
};