import { excelDateToISO } from "./excelParser";
export const extractLargeBorrowersMetadata = (data) => {
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

  //console.log("data.length  ", data.length)
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const firstCell = String(row[0] || "").trim();
    const secondCell = String(row[1] || "").trim();
    const thirdCell = String(row[2] || "").trim();
    const fourthCell = String(row[3] || "").trim();
    const eighthCell = String(row[8] || "").trim();
    const thirtytwoCell = String(row[11] || "").trim();

    if (i === 0 && firstCell) {
      metadata.ReturnKey = firstCell;
      //console.log("Found Return Key:", metadata.ReturnKey);

if (firstCell.includes('BOR_TEN_PER') || firstCell.includes('LB002')) {
        metadata.reportType = 'credit-monthly_large-borrowers';
        metadata.reportTypeId = 'credit-monthly_large-borrowers';
        metadata.departmentId = 'credit';
        metadata.departmentName = 'Credit';
      }
    }

    if (( i === 3) && (firstCell)) {
       metadata.reportTitle = firstCell || '';
      //console.log("Found Report Title:", metadata.reportTitle);
    }

    if (
     (i === 4 )&&
      
     ( (firstCell || secondCell).includes("Instiution") ||  (firstCell || secondCell).includes("Institution "))
    ) {
      metadata.institutionCode = fourthCell || '';
      //console.log("Found Institution Code:", metadata.institutionCode);
    }

    if (
      (i === 5)&&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("Financial Year")
    ) {
      metadata.financialYear = fourthCell || '';
      //console.log("Found Financial Year:", metadata.financialYear);
    }

    if (
      ( i === 6) &&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("Start Date")
    ) {
     // metadata.startDate = excelDateToISO(secondCell||thirdCell  || fourthCell || "");
     metadata.startDate = excelDateToISO(fourthCell) || '';
      //console.log("Found Start Date:", metadata.startDate);
    }

    if (
      (i === 7) &&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("End Date")
    ) {
      metadata.endDate = excelDateToISO(fourthCell) || "";
      // metadata.endDate =excelDateToISO(secondCell||thirdCell  || fourthCell || "");
      //console.log("Found End Date:", metadata.endDate);
    }

    if (
      ( i === 7) &&
      (thirdCell || thirtytwoCell || firstCell) &&
      (thirdCell.toLowerCase().includes("in") ||
        thirtytwoCell.toLowerCase().includes("in") || firstCell.toLowerCase().includes('In'))
    ) {
      metadata.unit = thirtytwoCell  || '';
      //console.log("Found Unit:", metadata.unit);
    }
  }
return metadata
}

const extractLargeBorrowersData = (data) => {
  const hierarchicalData = [];
  let dataTableStart = -1;
  let extraDataStart = -1;
    let noandtitles = [];
      for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const firstCell = String(row[1] || "").trim();
    let secondCell = String(row[2] || "").trim();

    if (secondCell === 'Name of Counterparty*') {
      secondCell = 'Name of Counterparty';
    }

    if (i === 8) {
      noandtitles = [firstCell, secondCell];
      //console.log("Found title:", noandtitles);
    }
  }

  console.log('=== Extracting Large Exposures Data (LB002) ===');

  // Log first few rows to understand structure
  for (let i = 0; i < Math.min(data.length, 25); i++) {
    const row = data[i];
    if (row) {
      console.log(`Row ${i}:`, row.slice(0, 15).map(c => String(c || '').trim()));
    }
  }

  // Find the data table start - look for "S/N" column
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = String(row[1] || '').trim();
    if (firstCell === 'S/N') {
      dataTableStart = i + 1;
      console.log('Found data table at row:', dataTableStart);
      break;
    }
  }

  if (dataTableStart === -1) {
    // Try to find by looking for "Name of Counterparty*"
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;
      const secondCell = String(row[1] || '').trim();
      if (secondCell && secondCell.includes('Name of Counterparty')) {
        dataTableStart = i + 1;
        console.log('Found data table at row (alt):', dataTableStart);
        break;
      }
    }
  }

    for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = String(row[0] || '').trim();
    const secondCell = String(row[1] || '').trim();
    const thirdCell = String(row[2] || '').trim();
    const fourthCell = String(row[3] || '').trim();
    const fifthCell = String(row[4] || '').trim()
    
    if (fourthCell === 'Name of Counterparty' && i > 221) {
      extraDataStart = i+1;
      //console.log('Found extra data section at row:', extraDataStart);
      break;
    }
  }

  if (dataTableStart === -1) {
    console.log('Could not find data table');
    return { hierarchicalData: [], currencies: [], additionalColumns: [] };
  }

  // Get the header rows to identify column positions
  const headerRow = data[dataTableStart - 1];
  console.log('Header row:', headerRow.map(c => String(c || '').trim()));

  // Define column indices based on the header
  // S/N (0), Name of Counterparty* (1), Type of Exposure (2), Sector of Exposure (3), 
  // Approved Limit/Facility (4), Exposure Amount/Outstanding Balance (A) (5), 
  // Off-balance Sheet Exposure Amount (B) (6), Total Outstanding Balance C=A+B (7), 
  // Maturity Date (8), Capital (9), Exposure Amount as Percent of Total Capital (10), 
  // Status (classification) (11), Collateral Type (12), Estimated/Face value (13), 
  // Pass (14), etc.

  const columnMap = {
    sNo: 1,
    counterpartyName: 2,
    typeOfExposure: 3,
    sectorOfExposure: 4,
    approvedLimit: 5,
    exposureAmountA: 6,
    offBalanceSheetB: 7,
    totalOutstandingC: 8,
    maturityDate: 9,
    capital: 10,
    percentOfCapital: 11,
    statusClassification: 12,
    collateralType: 13,
    collateralValue: 14,

    // Some columns might be at different indices
  };

  // Try to find actual column positions from header
  // for (let i = 0; i < headerRow.length; i++) {
  //   const cell = String(headerRow[i] || '').trim();
  //   // if (cell === 'S/N') columnMap.sNo = i+1;
  //   // if (cell === 'Name of Counterparty*') columnMap.counterpartyName = i;
  //   if (cell === 'Type of Exposure') columnMap.typeOfExposure = i;
  //   if (cell === 'Sector of Exposure') columnMap.sectorOfExposure = i;
  //   if (cell === 'Approved Limit/Facility') columnMap.approvedLimit = i;
  //   if (cell === 'Exposure Amount/ Outstanding Balance (on-balance sheet)' || cell === 'Exposure Amount/ Outstanding Balance') columnMap.exposureAmountA = i;
  //   if (cell === 'Off-balance Sheet Exposure Amount (e.g. guarantee)' || cell === 'Off-balance Sheet Exposure Amount') columnMap.offBalanceSheetB = i;
  //   if (cell === 'Total Outstanding Balance' || cell === 'Total Outstanding Balance') columnMap.totalOutstandingC = i;
  //   if (cell === 'Maturity Date') columnMap.maturityDate = i;
  //   if (cell === 'Capital') columnMap.capital = i;
  //   if (cell === 'Exposure Amount (A+B) as Percent of Total Capital') columnMap.percentOfCapital = i;
  //   if (cell === 'Status (classification)') columnMap.statusClassification = i;
  //   if (cell === 'Type' && i > 12) columnMap.collateralType = i;
  //   if (cell === 'Estimated /Face value' || cell === 'Estimated') columnMap.collateralValue = i;

  // }

  console.log('Column Map:', columnMap);

  // Define the column names for currencies
  const columnNames = [
  
    'Type_of_Exposure',
    'Sector_of_Exposure',
    'Approved_Limit_Facility',
    'Exposure_Amount_A',
    'Off_Balance_Sheet_B',
    'Total_Outstanding_C',
    'Maturity_Date',
    'Capital',
    'Percent_of_Total_Capital',
    'Status_Classification',
    'Collateral_Type',
    'Collateral_Estimated_Value',
  ];

  const topLevelNodes = [];
  const extraDataNodes = [];
  // Parse each row
  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const sNo = String(row[columnMap.sNo] || '').trim();
    const counterpartyName = String(row[columnMap.counterpartyName] || '').trim();

    // Skip if no S/N or it's a formula row
    if (!sNo || sNo.startsWith('=')) continue;

    // Skip total row
    if (sNo === 'Total') continue;

    // Skip if no counterparty name
    if (!counterpartyName) continue;

    console.log(`Processing row ${i}: S/N=${sNo}, Counterparty=${counterpartyName}`);

    // Helper function to get value from row
    const getValue = (index) => {
      if (index !== undefined && index < row.length) {
        const val = parseFloat(String(row[index] ?? "").replace(/[,%\s]/g, ""));
        if (!isNaN(val) && val !== 0) {
          return val.toFixed(2);
        }
        return '0';
      }
      return '0';
    };

    const getStringValue = (index) => {
      if (index !== undefined && index < row.length) {
        return String(row[index] || '').trim();
      }
      return '';
    };

    // Extract all values
    const values = {};

    // Basic fields
    // values['S/N'] = sNo;
    // values['Name_of_Counterparty'] = counterpartyName;
    values['Type_of_Exposure'] = getStringValue(columnMap.typeOfExposure);
    values['Sector_of_Exposure'] = getStringValue(columnMap.sectorOfExposure);
    values['Approved_Limit_Facility'] = getValue(columnMap.approvedLimit);
    values['Exposure_Amount_A'] = getValue(columnMap.exposureAmountA);
    values['Off_Balance_Sheet_B'] = getValue(columnMap.offBalanceSheetB);
    values['Total_Outstanding_C'] = getValue(columnMap.totalOutstandingC);
    values['Maturity_Date'] = getStringValue(columnMap.maturityDate);
    values['Capital'] = getValue(columnMap.capital);
    values['Percent_of_Total_Capital'] = getValue(columnMap.percentOfCapital);
    values['Status_Classification'] = getStringValue(columnMap.statusClassification);
    values['Collateral_Type'] = getStringValue(columnMap.collateralType);
    values['Collateral_Estimated_Value'] = getValue(columnMap.collateralValue);
    

    // Create the entry - each counterparty is a top-level node
    const entry = {
      id: sNo,
      sNo: sNo,
      label: counterpartyName,
      values: values,
      rowNumber: i + 1,
      level: 1,
      isTotalRow: false,
      isSectionHeader: false,
      children: []
    };

    topLevelNodes.push(entry);
  }

  // ============ PARSE EXTRA DATA SECTION ============
  if (extraDataStart !== -1) {
 const extraHeaderRow = data[extraDataStart - 1];

     let extraColMap = {
      counterpartyName: 3,      // Column D
      sectorOfExposureEX: 4, // Column E
      totalOutstandingBalEX: 5,       // Column F
      Capital_of_Bank_Extra: 6, 
      Status_Classification_Extra: 7,     // Column F

      percentCapital: 8, // Column G
    };  

     for (let i = extraDataStart; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      const borrower = String(row[extraColMap.counterpartyName] || '').trim();
      
      // Skip if no borrower or if it's empty
      if (!borrower) continue;

      //console.log(`Processing extra row ${i}: Borrower=${borrower}`);

      const values = {};

      const getValue = (index) => {
        if (index !== undefined && index < row.length) {
          const val = parseFloat(String(row[index] ?? "").replace(/[,%\s]/g, ""));
          return !isNaN(val) && val !== 0 ? val.toFixed(2) : '0';
        }
        return '0';
      };

      const getStringValue = (index) => {
        if (index !== undefined && index < row.length) {
          return String(row[index] || '').trim();
        }
        return '';
      };

      // Extra data values
     // values['Borrower']=getValue(extraColMap.borrower)
      values['Sector_of_Exposure_Extra'] = getStringValue(extraColMap.sectorOfExposureEX);
      values['Total_Outstanding_Balance_Extra'] = getValue(extraColMap.totalOutstandingBalEX);
      values['Capital_of_Bank_Extra'] = getValue(extraColMap.Capital_of_Bank_Extra);
      values['Status_Classification_Extra'] = getStringValue(extraColMap.Status_Classification_Extra);
      values['Percent_of_Capital_(M=L/B*100)Extra'] = getValue(extraColMap.percentCapital);
 

      const entry = {
        id: `extra-${i}`,
        sNo: `E${i}`,
        label: borrower,
        values: values,
        rowNumber: i + 1,
        level: 1,
        isTotalRow: false,
        isSectionHeader: false,
        isExtraData: true,
        children: []
      };

      extraDataNodes.push(entry);
    }
  }
     
  // Sort by S/N
  topLevelNodes.sort((a, b) => {
    const aNum = parseInt(a.sNo);
    const bNum = parseInt(b.sNo);
    if (isNaN(aNum) && isNaN(bNum)) return 0;
    if (isNaN(aNum)) return 1;
    if (isNaN(bNum)) return -1;
    return aNum - bNum;
  });

    // Sort extra data by row number
  extraDataNodes.sort((a, b) => {
    return a.rowNumber - b.rowNumber;
  });

    const extraSection = {
    id: 'extra-section',
    sNo: 'EXTRA',
    label: 'Borrower Summary',
    values: {},
    rowNumber: 141,
    level: 0,
    isTotalRow: false,
    isSectionHeader: true,
    isExtraSection: true,
    children: extraDataNodes
  };

    // Combine main data and extra section
  const finalData = [...topLevelNodes];
  if (extraDataNodes.length > 0) {
    finalData.push(extraSection);
  }

  // Add extra columns to the list
  const allColumnNames = [
    ...columnNames,
    // Extra section columns
    'Sector_of_Exposure_Extra',
    'Total_Outstanding_Balance_Extra',
    'Capital_of_Bank_Extra',
    'Status_Classification_Extra',
    'Percent_of_Capital_(M=L/B*100)Extra',
   
  ];

  console.log('Total counterparty entries:', topLevelNodes.length);
  console.log('Sample entry:', topLevelNodes[0]);
  console.log('noandtitles:', noandtitles);



  return {
    hierarchicalData: finalData,
    columns: allColumnNames,
    additionalColumns: [],
    noandtitles: noandtitles
  };
};

export default extractLargeBorrowersData