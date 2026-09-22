import { excelDateToISO } from "../../../utils";
export const extractRecategorizedLoansMetadata=(data)=>{
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
    const fourthCell = String(row[3] || "").trim();
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
     

  if (firstCell.includes('NACNN001') || firstCell.includes('NACNN')) {
        metadata.reportType = 'credit-quarterly_recategorized-loans';
        metadata.reportTypeId = 'credit-quarterly_recategorized-loans';
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
      (thirdCell || twelveCell || firstCell) &&
      (thirdCell.toLowerCase().includes("in") ||
        twelveCell.toLowerCase().includes("in") || firstCell.toLowerCase().includes('In'))
    ) {
      metadata.unit = twelveCell  || '';
      //consol.log("Found Unit:", metadata.unit);
    }
  }
return metadata
}

const extractRecategorizedLoansData = (data) => {
  const hierarchicalData = [];
  let dataTableStart = -1;
  let noandtitles = [];
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const firstCell = String(row[0] || "").trim();
    const secondCell = String(row[1] || "").trim();

    if (i === 13) {
      noandtitles = [firstCell, secondCell];
      //console.log("Found title:", noandtitles);
    }
  }
  console.log('=== Extracting Re-categorized Loans Data (NN001) ===');

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
      dataTableStart = i + 2; // Skip header rows (2 rows of headers)
      console.log('Found data table at row:', dataTableStart);
      break;
    }
  }

  if (dataTableStart === -1) {
    console.log('Could not find data table');
    return { hierarchicalData: [], columns: [], additionalColumns: [] };
  }

  // Column indices (0-based)
  // A(0)=S.No., B(1)=Name of Counterparty/Borrower, C(2)=Type of Loan and Advance, 
  // D(3)=Sector, E(4)=Amount of Loans and Advance, F(5)=Date of Re-categorization,
  // G(6)=Classification/Status, H(7)=Collateral Type, I(8)=Collateral Value,
  // J(9)=Loan and Advance as % of Bank's Total Capital
  const SNO_COL = 0;
  const COUNTERPARTY_COL = 1;
  const LOAN_TYPE_COL = 2;
  const SECTOR_COL = 3;
  const AMOUNT_COL = 4;
  const DATE_COL = 5;
  const CLASSIFICATION_COL = 6;
  const COLLATERAL_TYPE_COL = 7;
  const COLLATERAL_VALUE_COL = 8;
  const PERCENT_CAPITAL_COL = 9;

  // Define the columns for this report
  const columns = [
    'Type_of_Loan_and_Advance',
    'Sector',
    'Amount_of_Loans_and_Advance',
    'Date_of_Re_categorization',
    'Classification_Status',
    'Collateral_Type',
    'Collateral_Value',
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

    // Skip if no S.No
    //if (!sNo) continue;

    // Skip total row
    if (counterparty === '**Total Capital Include: (Paid up + Share Premium +Legal +General reserve) only') continue;

    // Skip if no counterparty and it's not a "Nil" entry
    if (!counterparty && sNo !== '1') continue;

    // Skip if this is a note row
    if (counterparty.includes('Note:') || counterparty.includes('*If a counterparty')) continue;

    // Extract values
    const values = {
      'Type_of_Loan_and_Advance': getStringValue(LOAN_TYPE_COL, row),
      'Sector': getStringValue(SECTOR_COL, row),
      'Amount_of_Loans_and_Advance': getValue(AMOUNT_COL, row),
      'Date_of_Re_categorization': getStringValue(DATE_COL, row),
      'Classification_Status': getStringValue(CLASSIFICATION_COL, row),
      'Collateral_Type': getStringValue(COLLATERAL_TYPE_COL, row),
      'Collateral_Value': getValue(COLLATERAL_VALUE_COL, row),
      'Percent_of_Bank_Total_Capital': getValue(PERCENT_CAPITAL_COL, row)
    };

    // Determine if this is an empty row (no data)
    const isEmptyRow = !counterparty && 
                       !values['Type_of_Loan_and_Advance'] &&
                       !values['Sector'] &&
                       values['Amount_of_Loans_and_Advance'] === '0';

    // Skip empty rows (just S.No. without data)
    if (isEmptyRow && counterparty !== 'Nil.') continue;

    // Determine if this is a "Nil" entry
    const isNilEntry = counterparty === 'Nil.' || counterparty === 'Nil';

    const entry = {
      id: sNo || ``,
      sNo: sNo,
      label: counterparty || ``,
      values: values,
      rowNumber: i + 1,
      level: 1,
      isTotalRow: false,
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
export default extractRecategorizedLoansData