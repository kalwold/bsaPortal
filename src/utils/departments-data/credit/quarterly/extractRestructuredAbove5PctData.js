import { excelDateToISO } from "../../../utils";
export const extractRestructuredAbove5PctMetadata=(data)=>{
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

  //consol.log("data.length  ", data.length)
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const firstCell = String(row[0] || "").trim();
    const secondCell = String(row[1] || "").trim();
    const thirdCell = String(row[2] || "").trim();
    const fourthCell = String(row[4] || "").trim();
    const eighthCell = String(row[8] || "").trim();
    const twelveCell = String(row[7] || "").trim();

    // //consol.log(`Row ${i + 1}:`, {
    //   firstCell,
    //   secondCell,
    //   thirdCell,
    //   fourthCell,
    //   eighthCell,
    //   tweneeEigntsCell
    // });

    if (i === 0 && firstCell) {
      metadata.ReturnKey = firstCell;
      //consol.log("Found Return Key:", metadata.ReturnKey);
     

  if (firstCell.includes('RLAFCRC001') || firstCell.includes('RC001')) {
        metadata.reportType = 'credit-quarterly_restructured-above-5pct';
        metadata.reportTypeId = 'credit-quarterly_restructured-above-5pct';
        metadata.departmentId = 'credit';
        metadata.departmentName = 'Credit';
      }

    }

    if (( i === 3) && (firstCell)) {
      metadata.reportTitle = firstCell || '';
      //consol.log("Found Report Title:", metadata.reportTitle);
    }

    if (
     (i === 7 )&&
      (firstCell ) &&
     ( (firstCell || secondCell).includes("Instiution") ||  (firstCell || secondCell).includes("Institution "))
    ) {
      metadata.institutionCode = thirdCell || '';
      //consol.log("Found Institution Code:", metadata.institutionCode);
    }

    if (
      (i === 8)&&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("Financial Year")
    ) {
      metadata.financialYear = thirdCell || '';
      //consol.log("Found Financial Year:", metadata.financialYear);
    }

    if (
      ( i === 9) &&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("Start Date")
    ) {
     // metadata.startDate = excelDateToISO(secondCell||thirdCell  || fourthCell || "");
     metadata.startDate = excelDateToISO(thirdCell) || '';
      //consol.log("Found Start Date:", metadata.startDate);
    }

    if (
      (i === 10 ) &&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("End Date")
    ) {
      metadata.endDate = excelDateToISO(thirdCell) || "";
      // metadata.endDate =excelDateToISO(secondCell||thirdCell  || fourthCell || "");
      //consol.log("Found End Date:", metadata.endDate); 
    }

    if (
      ( i === 12) &&
      (fourthCell.toLowerCase().includes("in") || fourthCell.toLowerCase().includes('In'))
    ) {
      metadata.unit = twelveCell  || '';
      //consol.log("Found Unit:", metadata.unit);
    }
  }
return metadata
}
const extractRestructuredAbove5PctData = (data) => {
  const hierarchicalData = [];
  let dataTableStart = -1;

     let noandtitles = [];
    for (let i = 0; i < data.length; i++) {
    const row = data[i];
    
    const firstCell = String(row[0] || "").trim();
    const secondCell = String(row[1] || "").trim();

    if(i === 13){
      noandtitles = [firstCell,secondCell]
      //console.log("Found title:", noandtitles);
    }
  }

  // Log first few rows to understand structure
  for (let i = 0; i < Math.min(data.length, 20); i++) {
    const row = data[i];
    if (row) {
      console.log(`Row ${i}:`, row.map(c => String(c || '').trim()));
    }
  }

  // Find the data table start - look for "S.No." column
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = String(row[0] || '').trim();
    if (firstCell === 'S.No.') {
      dataTableStart = i + 2; // Skip header row and empty row
      console.log('Found data table at row:', dataTableStart);
      break;
    }
  }

  if (dataTableStart === -1) {
    console.log('Could not find data table');
    return { hierarchicalData: [], columns: [], additionalColumns: [] };
  }

  const SNO_COL = 0;
  const COUNTERPARTY_COL = 1;
  const LOAN_TYPE_COL = 2;
  const SECTOR_COL = 3;
  const ITERATIONS_COL = 4;
  const RESTRUCTURING_TYPES_COL = 5;
  const ORIGINAL_AMOUNT_COL = 6;
  const LATEST_AMOUNT_COL = 7;
  const LAST_RESTRUCTURING_DATE_COL = 8;
  const CLASSIFICATION_COL = 9;
  const COLLATERAL_TYPE_COL = 10;
  const COLLATERAL_VALUE_COL = 11;
  const PERCENT_CAPITAL_COL = 12;

  // Define the columns for this report
  const columns = [
    'Type_of_Loan_and_Advance',
    'Sector',
    'Number_of_Iterations',
    'Types_of_Restructuring',
    'Original_Amount_of_Loans',
    'Amount_after_Latest_Restructuring',
    'Date_of_Last_Restructuring',
    'Classification_Status',
    'Types_of_Collateral',
    'Value_of_Collateral',
    'Percent_of_Bank_Total_Capital'
  ];

  const topLevelNodes = [];

  // Helper functions
  const getValue = (index, row) => {
    if (index !== undefined && index < row.length) {
     const val = parseFloat(String(row[index] ?? "").replace(/[,%\s]/g, ""));
      if (!isNaN(val) && val !== 0) {
        return val.toFixed(2);
      }
      return '0';
    }
    return '0';
  };

  const getStringValue = (index, row) => {
    if (index !== undefined && index < row.length) {
      return String(row[index] || '').trim();
    }
    return '';
  };

  // Parse each row
  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const sNo = String(row[SNO_COL] || '').trim();
    const counterparty = String(row[COUNTERPARTY_COL] || '').trim();
 const isTotalRow = (counterparty=== 'Total')

    
    // Skip if no counterparty
    if (!counterparty) continue;

    // Skip if this is a note row
    if (counterparty.includes('Note:') || 
        counterparty.includes('*If a counterparty') || 
        counterparty.includes('**Total Capital')) continue;

    // Extract values
    const values = {
      
      'Type_of_Loan_and_Advance': getStringValue(LOAN_TYPE_COL, row),
      'Sector': getStringValue(SECTOR_COL, row),
      'Number_of_Iterations': getValue(ITERATIONS_COL, row),
      'Types_of_Restructuring': getStringValue(RESTRUCTURING_TYPES_COL, row),
      'Original_Amount_of_Loans': getValue(ORIGINAL_AMOUNT_COL, row),
      'Amount_after_Latest_Restructuring': getValue(LATEST_AMOUNT_COL, row),
      'Date_of_Last_Restructuring': getStringValue(LAST_RESTRUCTURING_DATE_COL, row),
      'Classification_Status': getStringValue(CLASSIFICATION_COL, row),
      'Types_of_Collateral': getStringValue(COLLATERAL_TYPE_COL, row),
      'Value_of_Collateral': getValue(COLLATERAL_VALUE_COL, row),
      'Percent_of_Bank_Total_Capital': getValue(PERCENT_CAPITAL_COL, row)
    };

   
    const entry = {
      id: sNo || ``,
      sNo: sNo,
      label: counterparty,
      values: values,
      rowNumber: i + 1,
      level: 1,
      isTotalRow: isTotalRow,
      isSectionHeader: false,
      children: []
    };

    topLevelNodes.push(entry);
  }

  // Sort by S.No
  topLevelNodes.sort((a, b) => {
    const aNum = parseInt(a.sNo);
    const bNum = parseInt(b.sNo);
    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
    return 0;
  });

  console.log('Total entries:', topLevelNodes.length);

  return {
    hierarchicalData: topLevelNodes,
    columns: columns,
    additionalColumns: [],
    noandtitles
  };
};
export default extractRestructuredAbove5PctData