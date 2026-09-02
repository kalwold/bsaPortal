import * as XLSX from "xlsx";
import extractLiquidityRequirementData, {extractLiquidityMetadata} from "./extractLiquidityRequirementData";
import extractLoanRelatedPartiesData ,{extractRelatedPartiesMetadata} from "./extractLoanRelatedPartiesData";
import extractBalanceSheetData,{extractBalanceSheetMetadata} from "./extractBalanceSheetData";
import extractForexData,{extractForexMetadata} from "./extractForexData";
import extractReserveBaseData,{extractReserveBaseMetadata} from "./extractReserveBaseData";
import extractLoanBreakdownData,{extractLoanBreakdownMetadata} from "./extractLoanBreakdownData";
import extractLoanPortfolioData,{extractPortfolioMetadata} from "./extractLoanPortfolioData";
import extractNplProvisionsData,{extractNplProvisionMetadata}from "./extractNplProvisionsData";
import extractLoanDisbursementData,{extractDisbursementMetadata} from "./extractLoanDisbursementData";
import extractLoanStatusData, {extractLoanStatusMetadata} from "./extractLoanStatusData";
import extractLoanClassificationData ,{extractLoanClassificationMetaData}from "./extractLoanClassificationData";
import extractLargeBorrowersData,{extractLargeBorrowersMetadata} from "./extractLargeBorrowersData";
import extractLoanRangeRegionData,{extractLoanRangeRegionMetadata} from "./extractLoanRangeRegionData";
import extractLoanSectorRegionData,{extractLoanSectorRegionMetadata} from "./extractLoanSectorRegionData";
import extractLoanStatutoryRequirementData,{extractStatutoryMetadata} from "./extractLoanStatutoryRequirementData";
import extractKeyBalanceSheetData,{extractKeyBalanceSheetMetadata} from "./extractKeyBalanceSheetData";
import extractCapitalAdequacyData,{extractCapitalMetadata} from "./extractCapitalAdequacyData";
import extractDepositRangeRegionData,{extractDepositRangeRegionMetadata} from "./extractDepositRangeRegionData";
import extractDepositSectorRegionData,{extractDepositSectorRegionMetadata} from "./extractDepositSectorRegionData";
import extractIfbDepositRangeRegionData,{extractIfbDepositRangeRegionMetadata} from "./extractIfbDepositRangeRegionData";
import extractIfbDepositSectorRegionData,{extractIfbDepositSectorMetadata} from "./extractIfbDepositSectorRegionData";
import extractIfbBalanceSheetData,{extractIfbBalanceSheetMetadata} from "./extractIfbBalanceSheetData";
import extractIfbProfitLossData,{extractIfbProfitLossMetadata} from "./extractIfbProfitLossData";

const REPORT_TYPES = {
  DAILY_FOREX: "ibd-daily",
  MONTHLY_BALANCE: "finance-monthly_balance-sheet",
  LIQUIDITY_WEEKLY: "finance-weekly",
  LOAN_RELATED_PARTIES: 'loan-related-parties',
  RESERVE_BASE: 'finance-monthly_reserve',
  STATUTORY_REQ: 'finance-monthly_statutory',
   KEY_BALANCE_SHEET: 'finance-monthly_key-balance-sheet',
   CAPITAL_ADEQUACY:'finance-monthly_capital-adequacy',
   DEPOSIT_RANGE_REGION:'finance-monthly_deposit-range-region',
   DEPOSIT_SECTOR_REGION: 'finance-monthly_deposit-sector-region',
  LOAN_BREAKDOWN:'credit-monthly_loan-breakdown',
  LOAN_PORTFOLIO: 'credit-monthly_loan-portfolio',
   NPL_PROVISIONS: 'credit-monthly_loan-nonperforming',
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

// const excelDateToISO = (serial) => {
//   const date = new Date(Date.UTC(1899, 11, 30));
//   date.setUTCDate(date.getUTCDate() + Number(serial));

//   return date.toISOString().slice(0, 19);
// };

export const excelDateToISO = (value) => {
  if (!value) return '';

  const str = String(value).trim();

  // Already ISO format → return as it is
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(str)) {
    return str;
  }

  // Excel serial date
  const date = new Date(Date.UTC(1899, 11, 30));
  date.setUTCDate(date.getUTCDate() + Number(value));

  return date.toISOString().slice(0, 19);
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

        //consol.log("Raw Excel Data:", jsonData);

        const reportType = detectReportType(jsonData);
        //consol.log("Detected Report Type:", reportType , "SS", reportTypeIn);


        if (reportTypeIn !== reportType ){
          throw new Error('Unsupported report type');}

      //  const metadata = extractMetadata(jsonData);
        ////consol.log("Extracted Metadata:", metadata);

        let hierarchicalData = [];
        let columns = [];
        let additionalColumns = [];
        let noandtitles=[];
        var metadata = {};

        if (reportType === REPORT_TYPES.DAILY_FOREX) {
          const result = extractForexData(jsonData);
          hierarchicalData = result.hierarchicalData;
         columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles
          metadata = extractForexMetadata(jsonData);
          //consol.log("Extracted Metadata:", metadata);
          } else if (reportType === REPORT_TYPES.MONTHLY_BALANCE) {
          const result = extractBalanceSheetData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles
          metadata = extractBalanceSheetMetadata(jsonData);
        } else if (reportType === REPORT_TYPES.LIQUIDITY_WEEKLY) {
          const result = extractLiquidityRequirementData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles
          metadata = extractLiquidityMetadata(jsonData);
           //consol.log("Found title on return:", noandtitles);
        }else if(reportType === REPORT_TYPES.LOAN_RELATED_PARTIES){
          const result = extractLoanRelatedPartiesData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles;
          metadata = extractRelatedPartiesMetadata(jsonData);
           //consol.log("Found hierarchicalData  on return:", hierarchicalData );
        } else if (reportType === REPORT_TYPES.RESERVE_BASE) {
          const result = extractReserveBaseData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles
          metadata = extractReserveBaseMetadata(jsonData);
        }
        else if (reportType === REPORT_TYPES.LOAN_BREAKDOWN) {
          const result = extractLoanBreakdownData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles;
          metadata = extractLoanBreakdownMetadata(jsonData);
        }
        else if (reportType === REPORT_TYPES.LOAN_PORTFOLIO) {
          const result = extractLoanPortfolioData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles
          metadata = extractPortfolioMetadata(jsonData);
        }
        else if (reportType === REPORT_TYPES.NPL_PROVISIONS) {
          const result = extractNplProvisionsData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles;
          metadata = extractNplProvisionMetadata(jsonData);
        }
        else if (reportType === REPORT_TYPES.LOAN_DISBURSEMENT) {
          const result = extractLoanDisbursementData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles;
          metadata = extractDisbursementMetadata(jsonData);
        }
        else if (reportType === REPORT_TYPES.LOAN_STATUS) {
          const result = extractLoanStatusData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles;
          metadata = extractLoanStatusMetadata(jsonData);
        }else if (reportType === REPORT_TYPES.LOAN_CLASSIFICATION) {
          const result = extractLoanClassificationData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles;
          metadata=extractLoanClassificationMetaData(jsonData)
        }
        else if (reportType === REPORT_TYPES.LARGE_BORROWERS) {
          const result = extractLargeBorrowersData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles;
          metadata = extractLargeBorrowersMetadata(jsonData);
        }
         else if (reportType === REPORT_TYPES.LOAN_RANGE_REGION) {
          const result = extractLoanRangeRegionData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles;
          metadata = extractLoanRangeRegionMetadata(jsonData);
        }
         else if (reportType === REPORT_TYPES.LOAN_SECTOR_REGION) {
          const result = extractLoanSectorRegionData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles;
          metadata = extractLoanSectorRegionMetadata(jsonData);
        }
         else if (reportType === REPORT_TYPES.STATUTORY_REQ) {
          const result = extractLoanStatutoryRequirementData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles;
          metadata = extractStatutoryMetadata(jsonData);
        }
         else if (reportType === REPORT_TYPES.KEY_BALANCE_SHEET) {
          const result = extractKeyBalanceSheetData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles;
          metadata = extractKeyBalanceSheetMetadata(jsonData);
        }
         else if (reportType === REPORT_TYPES.CAPITAL_ADEQUACY) {
          const result = extractCapitalAdequacyData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles;
          metadata = extractCapitalMetadata(jsonData);
        }
         else if (reportType === REPORT_TYPES.DEPOSIT_RANGE_REGION) {
          const result = extractDepositRangeRegionData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles;
          metadata = extractDepositRangeRegionMetadata(jsonData);
        }
         else if (reportType === REPORT_TYPES.DEPOSIT_SECTOR_REGION) {
          const result = extractDepositSectorRegionData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles;
          metadata = extractDepositSectorRegionMetadata(jsonData);
        }
         else if (reportType === REPORT_TYPES.IFB_RANGE_REGION) {
          const result = extractIfbDepositRangeRegionData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles;
          metadata = extractIfbDepositRangeRegionMetadata(jsonData);
        }
         else if (reportType === REPORT_TYPES.IFB_SECTOR_REGION) {
          const result = extractIfbDepositSectorRegionData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles;
          metadata = extractIfbDepositSectorMetadata(jsonData);
        }
         else if (reportType === REPORT_TYPES.IFB_BALANCE_SHEET) {
          const result = extractIfbBalanceSheetData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles;
          metadata = extractIfbBalanceSheetMetadata(jsonData);
        }
         else if (reportType === REPORT_TYPES.IFB_PROFIT_LOSS) {
          const result = extractIfbProfitLossData(jsonData);
          hierarchicalData = result.hierarchicalData;
          columns = result.columns;
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles;
          metadata = extractIfbProfitLossMetadata(jsonData);
        }
        else {
          throw new Error(`Unsupported report type: ${reportType}`);
        }

        // const hierarchicalData = extractHierarchicalData(jsonData);
        // //consol.log('Hierarchical Data:', JSON.stringify(hierarchicalData, null, 2));

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
