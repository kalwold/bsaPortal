import * as XLSX from "xlsx";
import extractLiquidityRequirementData from "./extractLiquidityRequirementData";
import extractLoanRelatedPartiesData from "./extractLoanRelatedPartiesData";
import extractBalanceSheetData from "./extractBalanceSheetData";
import extractForexData from "./extractForexData";
import extractReserveBaseData from "./extractReserveBaseData";
import extractLoanBreakdownData from "./extractLoanBreakdownData";
import extractLoanPortfolioData from "./extractLoanPortfolioData";
import extractNplProvisionsData from "./extractNplProvisionsData";
import extractLoanDisbursementData from "./extractLoanDisbursementData";
import extractLoanStatusData from "./extractLoanStatusData";
import extractLoanClassificationData from "./extractLoanClassificationData";
import extractLargeBorrowersData from "./extractLargeBorrowersData";
import extractLoanRangeRegionData from "./extractLoanRangeRegionData";
import extractLoanSectorRegionData from "./extractLoanSectorRegionData";
import extractLoanStatutoryRequirementData from "./extractLoanStatutoryRequirementData";
import extractKeyBalanceSheetData from "./extractKeyBalanceSheetData";
import extractCapitalAdequacyData from "./extractCapitalAdequacyData";
import extractDepositRangeRegionData from "./extractDepositRangeRegionData";
import extractDepositSectorRegionData from "./extractDepositSectorRegionData";
import extractIfbDepositRangeRegionData from "./extractIfbDepositRangeRegionData";
import extractIfbDepositSectorRegionData from "./extractIfbDepositSectorRegionData";
import extractIfbBalanceSheetData from "./extractIfbBalanceSheetData";
import extractIfbProfitLossData from "./extractIfbProfitLossData";

const REPORT_TYPES = {
  DAILY_FOREX: "ibd-daily",
  MONTHLY_BALANCE: "finance-monthly_balance-sheet",
  LIQUIDITY_WEEKLY: "finance-weekly",
  LOAN_RELATED_PARTIES: 'loan-related-parties',
  RESERVE_BASE: 'finance-monthly_reserve',
  STATUTORY_REQ: 'finance-monthly_statutory_requirement',
   KEY_BALANCE_SHEET: 'finance-monthly_key-balance-sheet',
   CAPITAL_ADEQUACY:'finance-monthly_capital-adequacy',
   DEPOSIT_RANGE_REGION:'finance-monthly_deposit-range-region',
   DEPOSIT_SECTOR_REGION: 'finance-monthly_deposit-sector-region',
  LOAN_BREAKDOWN:'credit-monthly_loan-breakdown',
  LOAN_PORTFOLIO: 'credit-monthly_loan-portfolio',
   NPL_PROVISIONS: 'credit-monthly_npl-provisions',
   LOAN_DISBURSEMENT: 'credit-monthly_loan-disbursement',
   LOAN_STATUS: 'credit-monthly_loan-status',
   LOAN_CLASSIFICATION: 'credit-monthly_loan-classification',
   LARGE_BORROWERS: 'credit-monthly_large-borrowers',
   LOAN_RANGE_REGION: 'credit-monthly_loan-range-region',
   LOAN_SECTOR_REGION: 'credit-monthly_loan-sector-region',
   IFB_RANGE_REGION: 'ifb-monthly_deposit-range-region',
   IFB_SECTOR_REGION: 'ifb-monthly_deposit-sector-region',
   IFB_BALANCE_SHEET: 'ifb-monthly_balance-sheet',
   IFB_PROFIT_LOSS: 'ifb-monthly_profit-loss',

   
};
export const parseExcelReport = (file,reportTypeIn) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        console.log("Raw Excel Data:", jsonData);

        const reportType = detectReportType(jsonData);
        console.log("Detected Report Type:", reportType , "SS", reportTypeIn);


        if (reportTypeIn !== reportType ){
          throw new Error('Unsupported report type');}

        const metadata = extractMetadata(jsonData);
        console.log("Extracted Metadata:", metadata);

        let hierarchicalData = [];
        let columns = [];
        let additionalColumns = [];
        let noandtitles=[];

        if (reportType === REPORT_TYPES.DAILY_FOREX) {
          const result = extractForexData(jsonData);
          hierarchicalData = result.hierarchicalData;
         columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles
          } else if (reportType === REPORT_TYPES.MONTHLY_BALANCE) {
          const result = extractBalanceSheetData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles

        } else if (reportType === REPORT_TYPES.LIQUIDITY_WEEKLY) {
          const result = extractLiquidityRequirementData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles
           console.log("Found title on return:", noandtitles);
        }else if(reportType === REPORT_TYPES.LOAN_RELATED_PARTIES){
          const result = extractLoanRelatedPartiesData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles
           console.log("Found hierarchicalData  on return:", hierarchicalData );
        } else if (reportType === REPORT_TYPES.RESERVE_BASE) {
          const result = extractReserveBaseData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles
        }
        else if (reportType === REPORT_TYPES.LOAN_BREAKDOWN) {
          const result = extractLoanBreakdownData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles
        }
        else if (reportType === REPORT_TYPES.LOAN_PORTFOLIO) {
          const result = extractLoanPortfolioData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles
        }
        else if (reportType === REPORT_TYPES.NPL_PROVISIONS) {
          const result = extractNplProvisionsData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles
        }
        else if (reportType === REPORT_TYPES.LOAN_DISBURSEMENT) {
          const result = extractLoanDisbursementData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles;
        }
        else if (reportType === REPORT_TYPES.LOAN_STATUS) {
          const result = extractLoanStatusData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles;
        }else if (reportType === REPORT_TYPES.LOAN_CLASSIFICATION) {
          const result = extractLoanClassificationData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles;
        }
        else if (reportType === REPORT_TYPES.LARGE_BORROWERS) {
          const result = extractLargeBorrowersData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles;
        }
         else if (reportType === REPORT_TYPES.LOAN_RANGE_REGION) {
          const result = extractLoanRangeRegionData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles;
        }
         else if (reportType === REPORT_TYPES.LOAN_SECTOR_REGION) {
          const result = extractLoanSectorRegionData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles;
        }
         else if (reportType === REPORT_TYPES.STATUTORY_REQ) {
          const result = extractLoanStatutoryRequirementData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles;
        }
         else if (reportType === REPORT_TYPES.KEY_BALANCE_SHEET) {
          const result = extractKeyBalanceSheetData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles;
        }
         else if (reportType === REPORT_TYPES.CAPITAL_ADEQUACY) {
          const result = extractCapitalAdequacyData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles;
        }
         else if (reportType === REPORT_TYPES.DEPOSIT_RANGE_REGION) {
          const result = extractDepositRangeRegionData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles;
        }
         else if (reportType === REPORT_TYPES.DEPOSIT_SECTOR_REGION) {
          const result = extractDepositSectorRegionData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles;
        }
         else if (reportType === REPORT_TYPES.IFB_RANGE_REGION) {
          const result = extractIfbDepositRangeRegionData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles;
        }
         else if (reportType === REPORT_TYPES.IFB_SECTOR_REGION) {
          const result = extractIfbDepositSectorRegionData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles;
        }
         else if (reportType === REPORT_TYPES.IFB_BALANCE_SHEET) {
          const result = extractIfbBalanceSheetData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles;
        }
         else if (reportType === REPORT_TYPES.IFB_PROFIT_LOSS) {
          const result = extractIfbProfitLossData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles;
        }
        else {
          throw new Error(`Unsupported report type: ${reportType}`);
        }

        // const hierarchicalData = extractHierarchicalData(jsonData);
        // console.log('Hierarchical Data:', JSON.stringify(hierarchicalData, null, 2));

        const flatData = flattenData(hierarchicalData);

        const report = {
          id: `${reportType}-${new Date().toISOString().split("T")[0].replace(/-/g, "")}`,
          departmentId: metadata.departmentId,
          departmentName: metadata.departmentName,
          reportTypeId:reportType,
          reportTypeName: metadata.reportTitle,
          ReturnKey: metadata.ReturnKey,
          fileName: file.name,
          status: "PENDING",
          createdAt: new Date().toISOString(),
          createdBy: "current-user",
          metadata: metadata,
          noandtitles:noandtitles,
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
    if (firstCell && firstCell.includes("MB001")) {
      return REPORT_TYPES.MONTHLY_BALANCE;
    }
    if (firstCell && firstCell.includes("ZS001")) {
      return REPORT_TYPES.LIQUIDITY_WEEKLY;
    }
    if (firstCell && firstCell.includes("BSD_LOAN_PART13001")){
      return REPORT_TYPES.LOAN_RELATED_PARTIES;
    }
    if (firstCell && (firstCell.includes('Reserve Base') || firstCell.includes('RB001'))) {
      return REPORT_TYPES.RESERVE_BASE;
    }
     if (firstCell && (firstCell.includes('BD_L&A') || firstCell.includes('BD001'))) {
      return REPORT_TYPES.LOAN_BREAKDOWN;
    }
     if (firstCell && (firstCell.includes('Loan and Advances Portfolio Report') || firstCell.includes('LOA_PORT'))) {
        return REPORT_TYPES.LOAN_PORTFOLIO;
      }
       if (firstCell && (firstCell.includes('NPL&PRO') || firstCell.includes('NL001'))) {
      return REPORT_TYPES.NPL_PROVISIONS;
    }
    if (firstCell && (firstCell.includes('LOA_ADV_OUT') || firstCell.includes('LA001'))) {
      return REPORT_TYPES.LOAN_DISBURSEMENT;
    }
    if (firstCell && (firstCell.includes('LA_STAT') || firstCell.includes('LS001'))) {
      return REPORT_TYPES.LOAN_STATUS;
    }
    if (firstCell && (firstCell.includes('M_LCPL') || firstCell.includes('LC001'))) {
      return REPORT_TYPES.LOAN_CLASSIFICATION;
    }
      if (firstCell && (firstCell.includes('BOR_TEN_PER') || firstCell.includes('LB001'))) {
      return REPORT_TYPES.LARGE_BORROWERS;
    }
    if (firstCell && (firstCell.includes('LOAN_RAN & REG') || firstCell.includes('RL001'))) {
      return REPORT_TYPES.LOAN_RANGE_REGION;
    }
    if (firstCell && (firstCell.includes('LOAN_SEC & REG') || firstCell.includes('RS001'))) {
      return REPORT_TYPES.LOAN_SECTOR_REGION;
    }
    if (firstCell && (firstCell.includes('SRRYY001') )) {
      return REPORT_TYPES.STATUTORY_REQ;
    }
    if (firstCell && firstCell.includes('Key Balance Sheet') || firstCell.includes('MK001')) {
      return REPORT_TYPES.KEY_BALANCE_SHEET;
    }
    if (firstCell && firstCell.includes('M_CC-On & Off') || firstCell.includes('KK001')) {
      return REPORT_TYPES.CAPITAL_ADEQUACY;
    }
    if (firstCell && firstCell.includes('CDby Range and Reg') || firstCell.includes('CM001')) {
      return REPORT_TYPES.DEPOSIT_RANGE_REGION;
    }
    if (firstCell && firstCell.includes('CD by S and Reg') || firstCell.includes('MD001')) {
      return REPORT_TYPES.DEPOSIT_SECTOR_REGION;
    }
    if (firstCell && firstCell.includes('DIR RANGE') || firstCell.includes('RD001')) {
      return REPORT_TYPES.IFB_RANGE_REGION;
    }
    if (firstCell && firstCell.includes('DIF') || firstCell.includes('IF001')) {
      return REPORT_TYPES.IFB_SECTOR_REGION;
    }
    if (firstCell && firstCell.includes('INT_FRE_BS') || firstCell.includes('FB001')) {
      return REPORT_TYPES.IFB_BALANCE_SHEET;
    }
    if (firstCell && firstCell.includes('INT_FRE_SP') || firstCell.includes('BP001')) {
      return REPORT_TYPES.IFB_PROFIT_LOSS;
    }
  }
  
  return null;
};

const extractMetadata = (data) => {
  const metadata = {
    reportTitle: "",
    ReturnKey: "",
    institutionCode: "",
    financialYear: "",
    startDate: "",
    endDate: "",
    reportType: "",
    unit: "",
    departmentName: "",
    departmentId: "",
  };

  console.log("data.length  ", data.length)
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const firstCell = String(row[0] || "").trim();
    const secondCell = String(row[1] || "").trim();
    const thirdCell = String(row[2] || "").trim();
    const fourthCell = String(row[3] || "").trim();
    const eighthCell = String(row[8] || "").trim();
    const tweneeEigntsCell = String(row[33] || "").trim();

    // console.log(`Row ${i + 1}:`, {
    //   firstCell,
    //   secondCell,
    //   thirdCell,
    //   fourthCell,
    //   eighthCell,
    //   tweneeEigntsCell
    // });

    if (i === 0 && firstCell) {
      metadata.ReturnKey = firstCell;
      console.log("Found Return Key:", metadata.ReturnKey);

      if (firstCell.includes("SINGLE CURRENCY")) {
        metadata.reportType = "single-currency-exposure";
        metadata.departmentName = "IBD";
        metadata.departmentId = "ibd";
        metadata.reportTypeId = "ibd-daily";
        console.log("Found Report Type:", metadata.reportType);
      } else if (firstCell.includes("MB001")) {
        metadata.reportType = "finance-monthly_balance-sheet";
        metadata.departmentName = "Finance";
        metadata.departmentId = "finance";
        metadata.reportTypeId = "finance-monthly_balance-sheet";
        console.log("Found Report Type:", metadata.reportType);
      } else if (firstCell.includes("ZS001")) {
        metadata.reportType = "finance-weekly";
        metadata.departmentName = "Finance";
        metadata.departmentId = "finance";
        metadata.reportTypeId = "finance-weekly";
        console.log("Found Report Type:", metadata.reportType);
      } else if(firstCell.includes('BSD_LOAN_PART13001')){
        metadata.reportType = "loan-related-parties";
        metadata.departmentName = "Credit";
        metadata.departmentId = "credit";
        metadata.reportTypeId = "loan-related-parties";
        console.log("Found Report Type:", metadata.reportType);
      }
      else if (firstCell.includes('RB001')){
        metadata.reportType = 'finance-monthly_reserve';
        metadata.departmentName = 'Finance';
        metadata.departmentId='finance';
        metadata.reportTypeId='finance-monthly_reserve'
        
      }
      else if(firstCell.includes('BD001')){
        metadata.reportType = 'credit-monthly_loan-breakdown';
        metadata.departmentName = 'Credit';
        metadata.departmentId='credit';
        metadata.reportTypeId='credit-monthly_loan-breakdown'
      }
      else if (firstCell.includes('LOA_PORT') || firstCell.includes('EP001')) {
        metadata.reportType = 'credit-monthly_loan-portfolio';
        metadata.departmentId = 'credit';
        metadata.departmentName = 'Credit';
        metadata.reportTypeId = 'credit-monthly_loan-portfolio';
      }
      else if (firstCell.includes('NPL&PRO') || firstCell.includes('NL001')) {
        metadata.reportType = 'credit-monthly_npl-provisions';
        metadata.departmentId = 'credit';
        metadata.departmentName = 'Credit';
        metadata.reportTypeId = 'credit-monthly_npl-provisions';
      }else if (firstCell.includes('LOA_ADV_OUT') || firstCell.includes('LA001')) {
        metadata.reportType = 'credit-monthly_loan-disbursement';
        metadata.departmentId = 'credit';
        metadata.departmentName = 'Credit';
        metadata.reportTypeId = 'credit-monthly_loan-disbursement';
      }
      else if (firstCell.includes('LA_STAT') || firstCell.includes('LS001')) {
        metadata.reportType = 'credit-monthly_loan-status';
        metadata.departmentId = 'credit';
        metadata.departmentName = 'Credit';
        metadata.reportTypeId = 'credit-monthly_loan-status';
      }else if (firstCell.includes('M_LCPL') || firstCell.includes('LC001')) {
        metadata.reportType = 'credit-monthly_loan-classification';
        metadata.departmentId = 'credit';
        metadata.departmentName = 'Credit';
        metadata.reportTypeId = 'credit-monthly_loan-classification';
      }
      else if (firstCell.includes('BOR_TEN_PER') || firstCell.includes('LB001')) {
        metadata.reportType = 'credit-monthly_large-borrowers';
        metadata.reportTypeId = 'credit-monthly_large-borrowers';
        metadata.departmentId = 'credit';
        metadata.departmentName = 'Credit';
      }
       else if (firstCell.includes('LOAN_RAN & REG') || firstCell.includes('RL001')) {
        metadata.reportType = 'credit-monthly_loan-range-region';
        metadata.reportTypeId = 'credit-monthly_loan-range-region';
        metadata.departmentId = 'credit';
        metadata.departmentName = 'Credit';
      }
       else if (firstCell.includes('LOAN_SEC & REG') || firstCell.includes('RS001')) {
        metadata.reportType = 'credit-monthly_loan-sector-region';
        metadata.reportTypeId = 'credit-monthly_loan-sector-region';
        metadata.departmentId = 'credit';
        metadata.departmentName = 'Credit';
      }
       else if (firstCell.includes('SRRYY001')) {
        metadata.reportType = 'finance-monthly_statutory_requirement';
        metadata.reportTypeId = 'finance-monthly_statutory_requirement';
        metadata.departmentId = 'finance';
        metadata.departmentName = 'Finance';
      }
       else if (firstCell.includes('Key Balance Sheet') || firstCell.includes('MK001')) {
        metadata.reportType = 'finance-monthly_key-balance-sheet';
        metadata.reportTypeId = 'finance-monthly_key-balance-sheet';
        metadata.departmentId = 'finance';
        metadata.departmentName = 'Finance';
      }
       else if (firstCell.includes('M_CC-On & Off') || firstCell.includes('KK001')) {
        metadata.reportType = 'finance-monthly_capital-adequacy';
        metadata.reportTypeId = 'finance-monthly_capital-adequacy';
        metadata.departmentId = 'finance';
        metadata.departmentName = 'Finance';
      }
       else if (firstCell.includes('CD by S and Reg') || firstCell.includes('MD001')) {
        metadata.reportType = 'finance-monthly_deposit-sector-region';
        metadata.reportTypeId = 'finance-monthly_deposit-sector-region';
        metadata.departmentId = 'finance';
        metadata.departmentName = 'Finance';
      }
       else if (firstCell.includes('CDby Range and Reg') || firstCell.includes('CM001')) {
        metadata.reportType = 'finance-monthly_deposit-range-region';
        metadata.reportTypeId = 'finance-monthly_deposit-range-region';
        metadata.departmentId = 'finance';
        metadata.departmentName = 'Finance';
      }
       else  if (firstCell && firstCell.includes('DIF') || firstCell.includes('IF001')) {

        metadata.reportType = 'ifb-monthly_deposit-sector-region';
        metadata.reportTypeId = 'ifb-monthly_deposit-sector-region';
        metadata.departmentId = 'ifb';
        metadata.departmentName = 'IFB';
      }
       else if (firstCell.includes('DIR RANGE') || firstCell.includes('RD001')) {
        metadata.reportType = 'ifb-monthly_deposit-range-region';
        metadata.reportTypeId = 'ifb-monthly_deposit-range-region';
        metadata.departmentId = 'ifb';
        metadata.departmentName = 'IFB';
      }
       else  if (firstCell && firstCell.includes('INT_FRE_BS') || firstCell.includes('FB001')) {

        metadata.reportType = 'ifb-monthly_balance-sheet';
        metadata.reportTypeId = 'ifb-monthly_balance-sheet';
        metadata.departmentId = 'ifb';
        metadata.departmentName = 'IFB';
      }
       else if (firstCell.includes('INT_FRE_SP') || firstCell.includes('BP001')) {
        metadata.reportType = 'ifb-monthly_profit-loss';
        metadata.reportTypeId = 'ifb-monthly_profit-loss';
        metadata.departmentId = 'ifb';
        metadata.departmentName = 'IFB';
      }
    }

    if ((i === 2 || i === 3) && (firstCell || secondCell)) {
      metadata.reportTitle = firstCell || secondCell;
      console.log("Found Report Title:", metadata.reportTitle);
    }

    if (
     (i === 6 || i === 7 )&&
      (firstCell || secondCell) &&
     ( (firstCell || secondCell).includes("Instiution") ||  (firstCell || secondCell).includes("Institution "))
    ) {
      metadata.institutionCode = secondCell||thirdCell || fourthCell;
      console.log("Found Institution Code:", metadata.institutionCode);
    }

    if (
      (i === 8 || i === 7)&&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("Financial Year")
    ) {
      metadata.financialYear = secondCell||thirdCell  || fourthCell ||  "";
      console.log("Found Financial Year:", metadata.financialYear);
    }

    if (
      (i === 8 || i === 9) &&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("Start Date")
    ) {
      metadata.startDate = secondCell||thirdCell  || fourthCell || "";
      console.log("Found Start Date:", metadata.startDate);
    }

    if (
      (i === 10 || i === 9) &&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("End Date")
    ) {
      metadata.endDate = secondCell||thirdCell  || fourthCell || "";
      console.log("Found End Date:", metadata.endDate);
    }

    if (
      (i === 9 || i === 12) &&
      (thirdCell || eighthCell || firstCell) &&
      (thirdCell.toLowerCase().includes("in") ||
        eighthCell.toLowerCase().includes("in") || firstCell.toLowerCase().includes('In'))
    ) {
      metadata.unit = firstCell||thirdCell || tweneeEigntsCell || eighthCell;
      console.log("Found Unit:", metadata.unit);
    }
  }

  return metadata;
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
    columns: parsedData.columns ,
    noandtitles:parsedData.noandtitles,
    additionalColumns: parsedData.additionalColumns,
    data: parsedData.data,
    //flatData: parsedData.flatData || flattenData(parsedData.data),
    validations: parsedData.validations || [],
    isValid: parsedData.isValid !== undefined ? parsedData.isValid : true,
  };
};
