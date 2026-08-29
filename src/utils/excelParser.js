import * as XLSX from "xlsx";
import extractLiquidityRequirementData from "./extractLiquidityRequirementData";
import extractLoanRelatedPartiesData from "./extractLoanRelatedPartiesData";
import extractBalanceSheetData from "./extractBalanceSheetData";
import extractForexData from "./extractForexData";
import extractReserveBaseData from "./extractReserveBaseData";
import extractLoanBreakdownData from "./extractLoanBreakdownData";
import extractLoanPortfolioData from "./extractLoanPortfolioData";

// Currency columns for foreign currency exposure report

const REPORT_TYPES = {
  DAILY_FOREX: "ibd-daily",
  MONTHLY_BALANCE: "finance-monthly_balance-sheet",
  LIQUIDITY_WEEKLY: "finance-weekly",
  LOAN_RELATED_PARTIES: 'loan-related-parties',
  RESERVE_BASE: 'finance-monthly_reserve-base',
  LOAN_BREAKDOWN:'breakdown-loans-advances',
  LOAN_PORTFOLIO: 'loan-portfolio'
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
         // columns = ["USD","EUR","CHF","GBP","JPY","DJF","KES","INR","DKK","SEK","SAR","CAD","AED","AUD","CNY","NOK","KWD"];
          additionalColumns = result.additionalColumns;
          noandtitles=result.noandtitles
          //noandtitles = ['S/No', 'Particulars']
         // additionalColumns = ['OTHER1', 'OTHER2', 'OTHER3','OVERALL_EXPOSURE']
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
  }
    // const thirdRow = data[3];
    // const thirdCell = String(thirdRow[0] || "").trim();
    // console.log("thirdRow", thirdCell)
    //  if (thirdCell && thirdCell.includes("Loans to Related")){
    //   return REPORT_TYPES.LOAN_RELATED_PARTIES;
    // }
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

    console.log(`Row ${i + 1}:`, {
      firstCell,
      secondCell,
      thirdCell,
      fourthCell,
      eighthCell,
      tweneeEigntsCell
    });

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
        metadata.reportType = 'finance-monthly_reserve-base';
        metadata.departmentName = 'Finance';
        metadata.departmentId='finance';
        metadata.reportTypeId='finance-monthly_reserve-base'
        
      }
      else if(firstCell.includes('BD001')){
        metadata.reportType = 'breakdown-loans-advances';
        metadata.departmentName = 'Credit';
        metadata.departmentId='credit';
        metadata.reportTypeId='breakdown-loans-advances'
      }
      else if (firstCell.includes('LOA_PORT') || firstCell.includes('EP001')) {
        metadata.reportType = 'loan-portfolio';
        metadata.departmentId = 'credit';
        metadata.departmentName = 'Credit Department';
        metadata.reportTypeId = 'loan-portfolio';
      }
    }

    if (i === 3 && (firstCell || secondCell)) {
      metadata.reportTitle = firstCell || secondCell;
      console.log("Found Report Title:", metadata.reportTitle);
    }

    if (
      i === 7 &&
      (firstCell || secondCell) &&
     ( (firstCell || secondCell).includes("Instiution") ||  (firstCell || secondCell).includes("Institution "))
    ) {
      metadata.institutionCode = thirdCell || fourthCell;
      console.log("Found Institution Code:", metadata.institutionCode);
    }

    if (
      i === 8 &&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("Financial Year")
    ) {
      metadata.financialYear = thirdCell  || fourthCell ||  "";
      console.log("Found Financial Year:", metadata.financialYear);
    }

    if (
      i === 9 &&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("Start Date")
    ) {
      metadata.startDate = thirdCell  || fourthCell || "";
      console.log("Found Start Date:", metadata.startDate);
    }

    if (
      i === 10 &&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("End Date")
    ) {
      metadata.endDate = thirdCell  || fourthCell || "";
      console.log("Found End Date:", metadata.endDate);
    }

    if (
      i === 12 &&
      (thirdCell || eighthCell) &&
      (thirdCell.toLowerCase().includes("in") ||
        eighthCell.toLowerCase().includes("in"))
    ) {
      metadata.unit = thirdCell || tweneeEigntsCell || eighthCell;
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
