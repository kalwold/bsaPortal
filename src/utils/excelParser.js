import * as XLSX from "xlsx";
import extractLiquidityRequirementData from "./extractLiquidityRequirementData";
import extractLoanRelatedPartiesData from "./extractLoanRelatedPartiesData";
import extractBalanceSheetData from "./extractBalanceSheetData";
import extractForexData from "./extractForexData";
import extractReserveBaseData from "./extractReserveBaseData";

// Currency columns for foreign currency exposure report

const REPORT_TYPES = {
  DAILY_FOREX: "ibd-daily",
  MONTHLY_BALANCE: "finance-monthly_balance-sheet",
  LIQUIDITY_WEEKLY: "finance-weekly",
  LOAN_RELATED_PARTIES: 'loan-related-parties',
  RESERVE_BASE: 'finance-monthly_reserve-base'
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





// const extractLiquidityRequirementData = (data) => {
//   const hierarchicalData = [];
//   let dataTableStart = -1;
//    let noandtitles = [];
//     for (let i = 0; i < data.length; i++) {
//     const row = data[i];
    
//     const firstCell = String(row[0] || "").trim();
//     const secondCell = String(row[1] || "").trim();

//     if(i === 13){
//       noandtitles = [firstCell,secondCell]
//       console.log("Found title:", noandtitles);
//     }
//   }
//   for (let i = 0; i < data.length; i++) {
//     const row = data[i];
    
//     const firstCell = String(row[0] || "").trim();
//     const secondCell = String(row[1] || "").trim();

//     if (firstCell === "code" || secondCell === "Description") {
    
//       dataTableStart = i + 1;
//       break;
//     }
   
//   }

 

//   // Alternative: Look for "Required Liquid Assets"
//   if (dataTableStart === -1) {
//     for (let i = 0; i < data.length; i++) {
//       const row = data[i];
//       const secondCell = String(row[1] || "").trim();
//       if (secondCell === "Required Liquid Assets") {
//         dataTableStart = i;
//         break;
//       }
//     }
//   }

//   const headerRow = data[dataTableStart - 1];
  
//   const dayColumns = [];
//   let dayStartIndex = -1;
  
//   // Look for day names (Thu, Fri, Sat, Sun, Mon, Tue, Wed)
//   for (let i = 0; i < headerRow.length; i++) {
//     const cell = String(headerRow[i] || "").trim();
//     if (
//       cell === "Thu" ||
//       cell === "Fri" ||
//       cell === "Sat" ||
//       cell === "Sun" ||
//       cell === "Mon" ||
//       cell === "Tue" ||
//       cell === "Wed"
//     ) {
//       if (dayStartIndex === -1) dayStartIndex = i;
//       dayColumns.push(cell);
//     }
//     if (cell === "Weekly Average") {
//       dayColumns.push("Weekly_Average");
//     }
//   }

//   if (dayColumns.length === 0) {
//     dayStartIndex = 2;
//     dayColumns.push(
//       "Thu",
//       "Fri",
//       "Sat",
//       "Sun",
//       "Mon",
//       "Tue",
//       "Wed",
//       "Weekly_Average",
//     );
//   }

//   const topLevelNodes = [];
//   const nodeMap = new Map();
//   let currentParent = null;

//   // Loop through each row
//   for (let i = dataTableStart; i < data.length; i++) {
//     const row = data[i];
//     if (!row || row.length === 0) continue;
//     if (i > 26) continue;

//     const code = String(row[0] || "").trim();
//     const description = String(row[1] || "").trim();

//     // Skip empty rows, notes, and footers
//     if (!description) continue;
//     if (description.includes("Note:") || description.includes("_")) continue;

//     //  IDENTIFY ROW TYPES 
//     const isSectionHeader =
//       description === "Required Liquid Assets" ||
//       description === "Liquid Assets Held" ||
//       description === "Excess/deficit" ||
//       description === "Liquidity Ratio";

//     const isTotalRow =
//       description.includes("Total liquid assets") ||
//       description.includes("Excess/deficit") ||
//       description.includes("Liquidity Ratio");

//     // EXTRACT VALUES FOR EACH DAY
//      const values = {};

//     const isNullSection = description === 'Required Liquid Assets' || 
//                       description === 'Liquid Assets Held';

//             if (isNullSection) {
//   // Section headers - set all values to null
//   for (let j = 0; j < dayColumns.length; j++) {
//     values[dayColumns[j]] = null;
//   }
// } else {

//     for (let j = 0; j < dayColumns.length; j++) {
      
//       const colIndex = dayStartIndex + j;
//       if (colIndex < row.length) {
//         const rawValue = parseFloat(row[colIndex]);
//         if (!isNaN(rawValue) && rawValue !== 0) {
//           values[dayColumns[j]] = rawValue.toFixed(2);
//         } else {
//           values[dayColumns[j]] = "0";
//         }
//       } else {
//         values[dayColumns[j]] = "0";
//       }

//     }}

//     // DETERMINE HIERARCHY LEVEL
//     let level = 0;
//     if (code && code !== "") {
//       const codeParts = code.split(".");
//       level = codeParts.length;
//     } else if (isSectionHeader) {
//       level = 0;
//     } else if (isTotalRow) {
//       level = 1;
//     }

//     //  CREATE THE NODE
//     const entry = {
//       id: code || "",
//       sNo: code || "",
//       label: description,
//       values: values, // Contains values for each day
//       rowNumber: i + 1,
//       level: level,
//       isTotalRow: isTotalRow || false,
//       isSectionHeader: isSectionHeader || false,
//       children: [],
//     };

//     // BUILD HIERARCHY 
//     if (code) {
//       nodeMap.set(code, entry);
//     }

//     if (!code) {
//       if (isSectionHeader) {
//         // Section header (e.g., "Required Liquid Assets")
//         topLevelNodes.push(entry);
//         currentParent = entry;
//       } else if (isTotalRow) {
//         // Total rows (e.g., "Total liquid assets")
//         if (currentParent) {
//           currentParent.children.push(entry);
//         } else {
//           topLevelNodes.push(entry);
//         }
//       } else {
//         // Other rows without code
//         if (currentParent && !currentParent.isSectionHeader) {
//           currentParent.children.push(entry);
//         } else if (currentParent) {
//           currentParent.children.push(entry);
//         } else {
//           topLevelNodes.push(entry);
//         }
//       }
//     }
//   }

//   // BUILD HIERARCHY FOR CODED NODES
//   for (const [code, node] of nodeMap) {
//     const codeParts = code.split(".");

//     if (codeParts.length === 1) {
//       // Top level (1, 2, 3, 4)
//       const existing = topLevelNodes.find((n) => n.id === code);
//       if (!existing) {
//         topLevelNodes.push(node);
//       }
//     } else if (codeParts.length > 1) {
//       // Child node (1.1, 1.2, etc.)
//       const parentCode = codeParts.slice(0, -1).join(".");
//       const parent = nodeMap.get(parentCode);

//       if (parent) {
//         const exists = parent.children.some((child) => child.id === node.id);
//         if (!exists) {
//           parent.children.push(node);
//         }
//       } else {
//         const baseCode = codeParts[0];
//         const baseParent = nodeMap.get(baseCode);
//         if (baseParent) {
//           const exists = baseParent.children.some(
//             (child) => child.id === node.id,
//           );
//           if (!exists) {
//             baseParent.children.push(node);
//           }
//         }
//       }
//     }
//   }

//   // SORT CHILDREN 
//   const sortChildren = (nodes) => {
//     nodes.sort((a, b) => {
//       // Total rows at the end
//       if (a.isTotalRow && !b.isTotalRow) return 1;
//       if (!a.isTotalRow && b.isTotalRow) return -1;

//       // Sort by S/No
//       if (a.sNo && b.sNo) {
//         const aParts = a.sNo.split(".").map(Number);
//         const bParts = b.sNo.split(".").map(Number);
//         for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
//           if (aParts[i] !== bParts[i]) {
//             return aParts[i] - bParts[i];
//           }
//         }
//         return aParts.length - bParts.length;
//       }
//       return 0;
//     });

//     nodes.forEach((node) => {
//       if (node.children && node.children.length > 0) {
//         sortChildren(node.children);
//       }
//     });
//   };

//   sortChildren(topLevelNodes);

//   // CLEAN UP 
//   const cleanData = (nodes) => {
//     nodes.forEach((node) => {
//       if (node.children && node.children.length === 0) {
//         delete node.children;
//       } else if (node.children) {
//         cleanData(node.children);
//       }
//     });
//   };
//   cleanData(topLevelNodes);

//   //  RETURN RESULT 
//   return {
//     hierarchicalData: topLevelNodes,
//     columns: dayColumns, // ['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Weekly Average']
//     additionalColumns: [],
//     noandtitles:noandtitles
//   };
// };

// const extractLoanRelatedPartiesData = (data) => {
//   const hierarchicalData = [];
//   let dataTableStart = -1;
//   let noandtitles = [];
//   for (let i = 0; i < data.length; i++) {
//     const row = data[i];
//     const firstCell = String(row[1] || "").trim();
//     let secondCell = String(row[2] || "").trim();

//     if (secondCell ==='Name of Borrower'){
//       secondCell= 'Name_of_Borrower'
//     }
    

//     if (i === 13) {
//       noandtitles = [firstCell, secondCell];
//       console.log("Found title:", noandtitles);
//     }
//   }
//   console.log("Found title:", noandtitles[0]);
//   console.log('=== Extracting Loan Related Parties Data ===');

//   // Log first few rows to understand structure
//   for (let i = 0; i < Math.min(data.length, 20); i++) {
//     const row = data[i];
//     if (row) {
//       console.log(`Row ${i}:`, row.slice(0, 10).map(c => String(c || '').trim()));
//     }
//   }

//   // Find the data table start - look for "S.No." column
//   for (let i = 0; i < data.length; i++) {
//     const row = data[i];
//     if (!row || row.length === 0) continue;
//     const firstCell = String(row[1] || '').trim();
//     if (firstCell === 'S.No.') {
//       dataTableStart = i + 2;
//       console.log('Found data table at row:', dataTableStart);
//       break;
//     }
//   }

//   // if (dataTableStart === -1) {
//   //   // Try to find by looking for "Name of Borrower"
//   //   for (let i = 0; i < data.length; i++) {
//   //     const row = data[i];
//   //     if (!row || row.length === 0) continue;
//   //     const secondCell = String(row[2] || '').trim();
//   //     if (secondCell === 'Name of Borrower') {
//   //       dataTableStart = i + 2;
//   //       console.log('Found data table at row (alt):', dataTableStart);
//   //       break;
//   //     }
//   //   }
//   // }

//   if (dataTableStart === -1) {
//     console.log('Could not find data table');
//     return { hierarchicalData: [], columns: [], additionalColumns: [] , noandtitles : [] };
//   }

//   // Get the header row to identify column positions
//   const headerRow = data[dataTableStart - 1];
  
//   // Print header row for debugging
//   console.log('Header row:', headerRow.map(c => String(c || '').trim()));

//   // Define column mappings with descriptive names
//   let colMap = {
//     sNo: 1,
//     borrowerName: 2,
//     // Approved Loan Limit Amount - Term Loans
//     approvedTermLoans: 2,
//     // Approved Loan Limit Amount - Merchandise Loans
//     approvedMerchandiseLoans: 4,
//     // Approved Loan Limit Amount - Overdraft
//     approvedOverdraft: 5,
//     // Total (A) - sum of Term Loans + Merchandise Loans + Overdraft
//     totalA: 6,
//     // Capital of the Bank (Paid up + Share Premium + Legal + General reserve) (B)
//     capitalB: 7,
//     // Percent of Capital (C=A/B*100)
//     percentOfCapitalC: 8,
//     // Cash Collateral Value - Term Loans
//     cashCollateralTerm: 9,
//     // Cash Collateral Value - Merchandise Loans
//     cashCollateralMerchandise: 10,
//     // Cash Collateral Value - Overdraft
//     cashCollateralOverdraft: 11,
//     // Cash Equivalent Collateral Value - Term Loans
//     cashEquivalentTerm: 12,
//     // Cash Equivalent Collateral Value - Merchandise Loans
//     cashEquivalentMerchandise: 13,
//     // Cash Equivalent Collateral Value - Overdraft
//     cashEquivalentOverdraft: 14,
//     // Federal Guarantee Collateral Value - Term Loans
//     federalGuaranteeTerm: 15,
//     // Federal Guarantee Collateral Value - Merchandise Loans
//     federalGuaranteeMerchandise: 16,
//     // Federal Guarantee Collateral Value - Overdraft
//     federalGuaranteeOverdraft: 17,
//     // "A" Grade Foreign Guarantee Collateral Value - Term Loans
//     foreignGuaranteeTerm: 18,
//     // "A" Grade Foreign Guarantee Collateral Value - Merchandise Loans
//     foreignGuaranteeMerchandise: 19,
//     // "A" Grade Foreign Guarantee Collateral Value - Overdraft
//     foreignGuaranteeOverdraft: 20,
//     // Total (H=sumD-G) - sum of all collateral values
//     totalH: 21,
//     // Outstanding Balance - Term Loans
//     outstandingTerm: 22,
//     // Outstanding Balance - Merchandise Loans
//     outstandingMerchandise: 23,
//     // Outstanding Balance - Overdraft
//     outstandingOverdraft: 24,
//     // Total (I) - sum of outstanding balances
//     totalI: 25,
//     // Adjusted Outstanding Balance (J=I-H)
//     adjustedOutstandingJ: 26,
//     // Percent of Capital (K=J/B*100)
//     percentOfCapitalK: 27,
//     // Adjusted Outstanding Balance with O/D Approved Limit - Term Loans
//     adjustedTermLoans: 28,
//     // Adjusted Outstanding Balance with O/D Approved Limit - Merchandise Loans
//     adjustedMerchandise: 29,
//     // Adjusted Outstanding Balance with O/D Approved Limit - Overdraft Approved Limit
//     adjustedOverdraft: 30,
//     // Total (L) - sum of adjusted balances
//     totalL: 31,
//     // Percent of Capital (M=L/B*100)
//     percentOfCapitalM: 32,
//     // Status (Classification)
//     statusClassification: 33,
//     // Pass field

//   };

//   // Find actual column indices from header by matching patterns
//   for (let i = 0; i < headerRow.length; i++) {
//     const cell = String(headerRow[i] || '').trim();
//     console.log(`Column ${i}: "${cell}"`);
    
//     // if (cell === 'S.No.') colMap.sNo = i;
//     // if (cell === 'Name of Borrower') colMap.borrowerName = i;
//     // Look for Term Loans under Approved Loan Limit Amount
//     if (cell === 'Term Loans' && i < 5) colMap.approvedTermLoans = i;
//     if (cell === 'Merchandise Loans*' && i < 5) colMap.approvedMerchandiseLoans = i;
//     if (cell === 'Overdraft' && i < 5) colMap.approvedOverdraft = i;
//     if (cell.includes('Total (A)')) colMap.totalA = i;
//     if (cell.includes('Capital of the Bank')) colMap.capitalB = i;
//     if (cell.includes('Percent of Capital')) colMap.percentOfCapitalC = i;
//     if (cell.includes('Status (Classification)')) colMap.statusClassification = i;
    
//     // Cash Collateral
//     if (cell === 'Cash Collateral Value (D)') {
//       // The next three columns are Term Loans, Merchandise, Overdraft
//       colMap.cashCollateralTerm = i + 1;
//       colMap.cashCollateralMerchandise = i + 2;
//       colMap.cashCollateralOverdraft = i + 3;
//     }
//     // Cash Equivalent
//     if (cell === 'Cash Equivalent Collateral Value (E)') {
//       colMap.cashEquivalentTerm = i + 1;
//       colMap.cashEquivalentMerchandise = i + 2;
//       colMap.cashEquivalentOverdraft = i + 3;
//     }
//     // Federal Guarantee
//     if (cell === 'Federal Guarantee  Collateral Value(F)') {
//       colMap.federalGuaranteeTerm = i + 1;
//       colMap.federalGuaranteeMerchandise = i + 2;
//       colMap.federalGuaranteeOverdraft = i + 3;
//     }
//     // Foreign Guarantee
//     if (cell === '"A" Grade Foreign Guarantee Collateral Value(G)') {
//       colMap.foreignGuaranteeTerm = i + 1;
//       colMap.foreignGuaranteeMerchandise = i + 2;
//       colMap.foreignGuaranteeOverdraft = i + 3;
//     }
//     if (cell === 'Total (H=sumD-G)') colMap.totalH = i;
    
//     // Outstanding Balance
//     if (cell === 'Outstanding Balance') {
//       colMap.outstandingTerm = i + 1;
//       colMap.outstandingMerchandise = i + 2;
//       colMap.outstandingOverdraft = i + 3;
//     }
//     if (cell === 'Total (I)') colMap.totalI = i;
//     if (cell === 'Adjusted Outstanding Balance  (J=I-H)') colMap.adjustedOutstandingJ = i;
//     if (cell === 'Percent of Capital (K=J/B*100)') colMap.percentOfCapitalK = i;
    
//     // Adjusted Outstanding Balance with O/D Approved Limit
//     if (cell === 'Adjusted Outstanding Balance with O/D Approved Limit') {
//       colMap.adjustedTermLoans = i + 1;
//       colMap.adjustedMerchandise = i + 2;
//       colMap.adjustedOverdraft = i + 3;
//     }
//     if (cell === 'Total (L)') colMap.totalL = i;
//     if (cell === 'Percent of Capital (M=L/B*100)') colMap.percentOfCapitalM = i;
    
//     if (cell === 'Pass') colMap.pass = i;
//   }

//   console.log('Final Column Map:', colMap);

//   // Collect all column names for currencies
//   const columnNames = [
//   'Approved_Loan_Limit-Term_Loans',
//   'Approved_Loan_Limit-Merchandise_Loans',
//   'Approved_Loan_Limit-Overdraft',
//   'Total_Approved_Loan_Limit(A)',
//   'Capital_of_the_Bank(B)',
//   'Percent_of_Capital(C=A/B*100)',
//   'Cash_Collateral-Term_Loans',
//   'Cash_Collateral-Merchandise_Loans',
//   'Cash_Collateral-Overdraft',
//   'Cash_Equivalent-Term_Loans',
//   'Cash_Equivalent-Merchandise_Loans',
//   'Cash_Equivalent-Overdraft',
//   'Federal_Guarantee-Term_Loans',
//   'Federal_Guarantee-Merchandise_Loans',
//   'Federal_Guarantee-Overdraft',
//   'Foreign_Guarantee-Term_Loans',
//   'Foreign_Guarantee-Merchandise_Loans',
//   'Foreign_Guarantee-Overdraft',
//   'Total_Collateral(H)',
//   'Outstanding_Balance-Term_Loans',
//   'Outstanding_Balance-Merchandise_Loans',
//   'Outstanding_Balance-Overdraft',
//   'Total_Outstanding(I)',
//   'Adjusted_Outstanding(J=I-H)',
//   'Percent_of_Capital(K=J/B*100)',
//   'Adjusted_Balance-Term_Loans',
//   'Adjusted_Balance-Merchandise_Loans',
//   'Adjusted_Balance-Overdraft_Approved_Limit',
//   'Total_Adjusted_Balance(L)',
//   'Percent_of_Capital(M=L/B*100)',
//   'Status(Classification)'
// ];
//   // const columnNames = [
//   //   'Approved_Loan_Limit-Term_Loans',
//   //   'Approved_Loan_Limit-Merchandise_Loans',
//   //   'Approved_Loan_Limit-Overdraft',
//   //   'Total Approved Loan Limit (A)',
//   //   'Capital of the Bank (B)',
//   //   'Percent of Capital (C=A/B*100)',
//   //   'Cash Collateral - Term Loans',
//   //   'Cash Collateral - Merchandise Loans',
//   //   'Cash Collateral - Overdraft',
//   //   'Cash Equivalent - Term Loans',
//   //   'Cash Equivalent - Merchandise Loans',
//   //   'Cash Equivalent - Overdraft',
//   //   'Federal Guarantee - Term Loans',
//   //   'Federal Guarantee - Merchandise Loans',
//   //   'Federal Guarantee - Overdraft',
//   //   'Foreign Guarantee - Term Loans',
//   //   'Foreign Guarantee - Merchandise Loans',
//   //   'Foreign Guarantee - Overdraft',
//   //   'Total Collateral (H)',
//   //   'Outstanding Balance - Term Loans',
//   //   'Outstanding Balance - Merchandise Loans',
//   //   'Outstanding Balance - Overdraft',
//   //   'Total Outstanding (I)',
//   //   'Adjusted Outstanding (J=I-H)',
//   //   'Percent of Capital (K=J/B*100)',
//   //   'Adjusted Balance - Term Loans',
//   //   'Adjusted Balance - Merchandise Loans',
//   //   'Adjusted Balance - Overdraft Approved Limit',
//   //   'Total Adjusted Balance (L)',
//   //   'Percent of Capital (M=L/B*100)',
//   //   'Status (Classification)'
//   // ];

//   const topLevelNodes = [];

//   // Parse each row
//   for (let i = dataTableStart; i < data.length; i++) {
//     const row = data[i];
//     console.log("row data", row, colMap.sNo)
//     if (!row || row.length === 0) continue;

//     const sNo = String(row[colMap.sNo] || '').trim();
//     console.log("s.no", sNo)
//     // Skip if no S.No or if it's a formula row (starts with =)
    

//     const borrowerName = String(row[colMap.borrowerName] || '').trim();
//     if (!sNo && borrowerName !== 'Grand Total') continue;
//     // Skip if no borrower name
//     if (!borrowerName) continue;
//     if(i > 135) continue;

//     console.log(`Processing row ${i}: S.No=${sNo}, Borrower=${borrowerName}`);

//     // Extract all values with proper naming
//     const values = {};

//     // Helper function to extract value
//     const getValue = (index) => {
//       if (index !== undefined && index < row.length) {
//         const val = parseFloat(row[index]);
//         return !isNaN(val) && val !== 0 ? val.toFixed(2) : '0';
//       }
//       return '0';
//     };

//     const getStringValue = (index) => {
//       if (index !== undefined && index < row.length) {
//         return String(row[index] || '').trim();
//       }
//       return '';
//     };

//     // Approved Loan Limit Amount
//     values['Approved_Loan_Limit-Term_Loans'] = getValue(colMap.approvedTermLoans);
//     values['Approved_Loan_Limit-Merchandise_Loans'] = getValue(colMap.approvedMerchandiseLoans);
//     values['Approved_Loan_Limit-Overdraft'] = getValue(colMap.approvedOverdraft);
//     values['Total_Approved_Loan_Limit(A)'] = getValue(colMap.totalA);

//     // Capital and Ratios
//     values['Capital_of_the_Bank(B)'] = getValue(colMap.capitalB);
//     values['Percent_of_Capital(C=A/B*100)'] = getValue(colMap.percentOfCapitalC);

//     // Cash Collateral
//     values['Cash_Collateral-Term_Loans'] = getValue(colMap.cashCollateralTerm);
//     values['Cash_Collateral-Merchandise_Loans'] = getValue(colMap.cashCollateralMerchandise);
//     values['Cash_Collateral-Overdraft'] = getValue(colMap.cashCollateralOverdraft);

//     // Cash Equivalent
//     values['Cash_Equivalent-Term_Loans'] = getValue(colMap.cashEquivalentTerm);
//     values['Cash_Equivalent-Merchandise_Loans'] = getValue(colMap.cashEquivalentMerchandise);
//     values['Cash_Equivalent-Overdraft'] = getValue(colMap.cashEquivalentOverdraft);

//     // Federal Guarantee
//     values['Federal_Guarantee-Term_Loans'] = getValue(colMap.federalGuaranteeTerm);
//     values['Federal_Guarantee-Merchandise_Loans'] = getValue(colMap.federalGuaranteeMerchandise);
//     values['Federal_Guarantee-Overdraft'] = getValue(colMap.federalGuaranteeOverdraft);

//     // Foreign Guarantee
//     values['Foreign_Guarantee-Term_Loans'] = getValue(colMap.foreignGuaranteeTerm);
//     values['Foreign_Guarantee-Merchandise_Loans'] = getValue(colMap.foreignGuaranteeMerchandise);
//     values['Foreign_Guarantee-Overdraft'] = getValue(colMap.foreignGuaranteeOverdraft);

//     // Total Collateral
//     values['Total_Collateral(H)'] = getValue(colMap.totalH);

//     // Outstanding Balance
//     values['Outstanding_Balance-Term_Loans'] = getValue(colMap.outstandingTerm);
//     values['Outstanding_Balance-Merchandise_Loans'] = getValue(colMap.outstandingMerchandise);
//     values['Outstanding_Balance-Overdraft'] = getValue(colMap.outstandingOverdraft);
//     values['Total_Outstanding(I)'] = getValue(colMap.totalI);

//     // Adjusted Outstanding
//     values['Adjusted_Outstanding(J=I-H)'] = getValue(colMap.adjustedOutstandingJ);
//     values['Percent_of_Capital(K=J/B*100)'] = getValue(colMap.percentOfCapitalK);

//     // Adjusted Outstanding with O/D Approved Limit
//     values['Adjusted_Balance-Term_Loans'] = getValue(colMap.adjustedTermLoans);
//     values['Adjusted_Balance-Merchandise_Loans'] = getValue(colMap.adjustedMerchandise);
//     values['Adjusted_Balance-Overdraft_Approved_Limit'] = getValue(colMap.adjustedOverdraft);
//     values['Total_Adjusted_Balance(L)'] = getValue(colMap.totalL);
//     values['Percent_of_Capital(M=L/B*100)'] = getValue(colMap.percentOfCapitalM);

//     // Status and Pass
//     values['Status(Classification)'] = getStringValue(colMap.statusClassification);
    

//     // Create the entry
//     const entry = {
//       id: sNo,
//       sNo: sNo,
//       label: borrowerName,
//       values: values,
//       rowNumber: i + 1,
//       level: 1,
//       isTotalRow: false,
//       isSectionHeader: false,
//       children: []
//     };

//     topLevelNodes.push(entry);
//   }

//   // Sort by S.No
//   topLevelNodes.sort((a, b) => {
//     const aNum = parseInt(a.sNo);
//     const bNum = parseInt(b.sNo);
//     return aNum - bNum;
//   });

//   console.log('Total loan entries:', topLevelNodes.length);
//   console.log('Sample entry:', topLevelNodes[0]);

//   console.log("data before return", topLevelNodes,columnNames,noandtitles)
//   return {
//     hierarchicalData: topLevelNodes,
//     columns: columnNames,
//     additionalColumns: [],
//     noandtitles: noandtitles
//   };
// };

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
