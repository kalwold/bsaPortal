

import { excelDateToISO } from "./excelParser";
export const extractRelatedPartiesMetadata = (data) => {
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
    const thirtyTwoCell = String(row[12] || "").trim();

    // //console.log(`Row ${i + 1}:`, {
    //   firstCell,
    //   secondCell,
    //   thirdCell,
    //   fourthCell,
    //   eighthCell,
    //   tweneeEigntsCell
    // });

    if (i === 0 && firstCell) {
      metadata.ReturnKey = firstCell;
      //console.log("Found Return Key:", metadata.ReturnKey);
     

     if(firstCell.includes('BSD_LOAN_PART13002')){
        metadata.reportType = "credit-monthly_loan-related";
        metadata.departmentName = "Credit";
        metadata.departmentId = "credit";
        metadata.reportTypeId = "credit-monthly_loan-related";
        //console.log("Found Report Type:", metadata.reportType);
      }
    }

    if (( i === 3) && (firstCell)) {
       metadata.reportTitle = firstCell || '';
      //console.log("Found Report Title:", metadata.reportTitle);
    }

    if (
     (i === 4 )&&
      (thirdCell ) &&
     ( (firstCell || secondCell).includes("Instiution") ||  (firstCell || secondCell).includes("Institution "))
    ) {
      metadata.institutionCode = thirdCell || '';
      //console.log("Found Institution Code:", metadata.institutionCode);
    }

    if (
      (i === 5)&&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("Financial Year")
    ) {
      metadata.financialYear = thirdCell || '';
      //console.log("Found Financial Year:", metadata.financialYear);
    }

    if (
      ( i === 6) &&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("Start Date")
    ) {
     // metadata.startDate = excelDateToISO(secondCell||thirdCell  || fourthCell || "");
     metadata.startDate = excelDateToISO(thirdCell) || '';
      //console.log("Found Start Date:", metadata.startDate);
    }

    if (
      (i === 7 ) &&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("End Date")
    ) {
      metadata.endDate = excelDateToISO(thirdCell) || "";
      // metadata.endDate =excelDateToISO(secondCell||thirdCell  || fourthCell || "");
      //console.log("Found End Date:", metadata.endDate);
    }

    if (
      ( i === 7) &&
      (thirdCell || thirtyTwoCell || firstCell) &&
      (thirdCell.toLowerCase().includes("in") ||
        thirtyTwoCell.toLowerCase().includes("in") || firstCell.toLowerCase().includes('In'))
    ) {
      metadata.unit = thirtyTwoCell  || '';
      //console.log("Found Unit:", metadata.unit);
    }
  }
return metadata
}
const extractLoanRelatedPartiesData = (data) => {
  const hierarchicalData = [];
  let dataTableStart = -1;
  let extraDataStart = -1;
  let noandtitles = [];
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const firstCell = String(row[1] || "").trim();
    let secondCell = String(row[2] || "").trim();

    if (secondCell === 'Name of Counterparty*') {
      secondCell = 'Name_of_Counterparty';
    }

    if (i === 8) {
      noandtitles = [firstCell, secondCell];
      //console.log("Found title:", noandtitles);
    }
  }
  
  //console.log("Found title:", noandtitles[0]);
  //console.log('=== Extracting Loan Related Parties Data ===');

  // Log first few rows to understand structure
  for (let i = 0; i < Math.min(data.length, 20); i++) {
    const row = data[i];
    if (row) {
      console.log(`Row ${i}:`, row.slice(0, 10).map(c => String(c || '').trim()));
    }
  }

  // Find the main data table start - look for "S/N" column
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = String(row[1] || '').trim();
    if (firstCell === 'S/N') {
      dataTableStart = i + 2;
      //console.log('Found data table at row:', dataTableStart);
      break;
    }
  }

  // Find the extra data section - look for "Borrower" column (row 141)
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = String(row[0] || '').trim();
    const secondCell = String(row[1] || '').trim();
    const thirdCell = String(row[2] || '').trim();
    const fifthCell = String(row[4] || '').trim()
    
    if (fifthCell === 'Name of Counterparty' && i > 221) {
      extraDataStart = i+1;
      //console.log('Found extra data section at row:', extraDataStart);
      break;
    }
  }

  if (dataTableStart === -1) {
    //console.log('Could not find data table');
    return { hierarchicalData: [], columns: [], additionalColumns: [], noandtitles: [] };
  }

  // Get the header row to identify column positions
  const headerRow = data[dataTableStart - 1];
  
  //console.log('Header row:', headerRow.map(c => String(c || '').trim()));

  // Define column mappings with descriptive names
  let colMap = {
    sNo: 1,
    counterpartyName: 2,
    natureOfCounterparty: 3,
    typeOfExposure: 4,
    sectorOfExposure: 5,
    approved_Limit: 6,
    outstandingBalance_A: 7,
    offBalanceExposure_B: 8,
    totalOutstanding_C: 9,
    maturityDate: 10,
    capital: 11,
    percentOfCapital: 12,
    statusClassification: 13,
    collateralType: 14,
    collateralValue: 15,
  };

  // Find actual column indices from header by matching patterns
  for (let i = 0; i < headerRow.length; i++) {
    const cell = String(headerRow[i] || '').trim();
    //console.log(`Column ${i}: "${cell}"`);
    
    if (cell === 'Name of Counterparty*' && i < 5) colMap.natureOfCounterparty = i;
    if (cell === 'Nature of Counterparty (e.g. influential shareholder, director, subsidiary ….)' && i < 5) colMap.natureOfCounterparty = i;
    if (cell === 'Type of Exposure' && i < 5) colMap.typeOfExposure = i;
    if (cell.includes('Sector of Exposure')) colMap.sectorOfExposure = i;
    if (cell.includes('Approved Limit/Facility')) colMap.approved_Limit = i;
    if (cell.includes('Exposure Amount/ Outstanding Balance (on-balance sheet)')) colMap.outstandingBalance_A = i;
    if (cell.includes('Off-balance Sheet Exposure Amount (e.g. guarantee)')) colMap.offBalanceExposure_B = i;
    if (cell.includes('Total Outstanding Balance')) colMap.totalOutstanding_C = i;
    if (cell.includes('Maturity Date')) colMap.maturityDate = i;
    if (cell.includes('Capital')) colMap.capital = i;
    if (cell.includes('Exposure Amount (A+B) as Percent of Total Capital')) colMap.percentOfCapital = i;
     if (cell.includes('Status (Classification)')) colMap.statusClassification = i;
    // if (cell.includes('Status (Classification)')) colMap.collateralValue = i;
    
    if (cell === 'Collateral') {
      colMap.collateralType = i + 1;
      colMap.collateralValue = i + 2;
      
    }
    // if (cell === 'Cash Equivalent Collateral Value (E)') {
    //   colMap.cashEquivalentTerm = i + 1;
    //   colMap.cashEquivalentMerchandise = i + 2;
    //   colMap.cashEquivalentOverdraft = i + 3;
    // }
    // if (cell === 'Federal Guarantee  Collateral Value(F)') {
    //   colMap.federalGuaranteeTerm = i + 1;
    //   colMap.federalGuaranteeMerchandise = i + 2;
    //   colMap.federalGuaranteeOverdraft = i + 3;
    // }
    // if (cell === '"A" Grade Foreign Guarantee Collateral Value(G)') {
    //   colMap.foreignGuaranteeTerm = i + 1;
    //   colMap.foreignGuaranteeMerchandise = i + 2;
    //   colMap.foreignGuaranteeOverdraft = i + 3;
    // }
    // if (cell === 'Total (H=sumD-G)') colMap.totalH = i;
    
    // if (cell === 'Outstanding Balance') {
    //   colMap.outstandingTerm = i + 1;
    //   colMap.outstandingMerchandise = i + 2;
    //   colMap.outstandingOverdraft = i + 3;
    // }
    // if (cell === 'Total (I)') colMap.totalI = i;
    // if (cell === 'Adjusted Outstanding Balance  (J=I-H)') colMap.adjustedOutstandingJ = i;
    // if (cell === 'Percent of Capital (K=J/B*100)') colMap.percentOfCapitalK = i;
    
    // if (cell === 'Adjusted Outstanding Balance with O/D Approved Limit') {
    //   colMap.adjustedTermLoans = i + 1;
    //   colMap.adjustedMerchandise = i + 2;
    //   colMap.adjustedOverdraft = i + 3;
    // }
    // if (cell === 'Total (L)') colMap.totalL = i;
    // if (cell === 'Percent of Capital (M=L/B*100)') colMap.percentOfCapitalM = i;
    
    // if (cell === 'Pass') colMap.pass = i;
  }

  //console.log('Final Column Map:', colMap);

  // Column names for the main data
  const columnNames = [
    //'Name_of_Counterparty',
    'Type_of_Exposure',
    'Sector_of_Exposure',
    'Approved_Limit',
    'Outstanding_Balance_A',
    'Off_Balance_Exposure_B',
    'Total_Outstanding_C',
    'Maturity_Date',
    'Capital',
    'Percent_of_Capital',
    'Status_Classification',
    'Collateral_Type',
    'Collateral_Value',
  ];

  const mainDataNodes = [];
  const extraDataNodes = [];

  // ============ PARSE MAIN DATA ROWS (16 to 135) ============
  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const sNo = String(row[colMap.sNo] || '').trim();
    const counterpartyName = String(row[colMap.counterpartyName] || '').trim();
    
    // Skip if no borrower name or if it's a total row
    if (!counterpartyName) continue;
    if (counterpartyName === 'Grand Total') continue;
    if (i > 135) continue;

    //console.log(`Processing main row ${i}: S.No=${sNo}, Borrower=${counterpartyName}`);

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

    // Approved Loan Limit Amount
    values['Type_of_Exposure'] = getValue(colMap.typeOfExposure);
    values['Sector_of_Exposure'] = getValue(colMap.sectorOfExposure);
    values['Approved_Limit'] = getValue(colMap.approvedLimit);
    values['Exposure_Amount(A)'] = getValue(colMap.exposureAmountA);

    values['Off-Balance Sheet_Exposure(B)'] = getValue(colMap.offBalanceExposureB);
    values['Total_Outstanding(C)'] = getValue(colMap.totalOutstandingC);

    values['Maturity-Date'] = getValue(colMap.maturityDate);
    values['Capital'] = getValue(colMap.capital);
    values['Percent_of_Capital'] = getValue(colMap.percentOfCapital);

    values['Status(Classification)'] = getStringValue(colMap.statusClassification);
    values['Collateral_Type'] = getStringValue(colMap.collateralType);
    values['Collateral_Value'] = getValue(colMap.collateralValue);

    const entry = {
      id: sNo || `row-${i}`,
      sNo: sNo || '',
      label: counterpartyName,
      values: values,
      rowNumber: i + 1,
      level: 1,
      isTotalRow: false,
      isSectionHeader: false,
      children: []
    };

    mainDataNodes.push(entry);
  }

  // ============ PARSE EXTRA DATA SECTION (Rows 141+) ============
  if (extraDataStart !== -1) {
    //console.log('=== Extracting Extra Data Section ===');
    
    // Get the extra data header row
    const extraHeaderRow = data[extraDataStart - 1];
    //console.log('Extra Header row:', extraHeaderRow);

    // Column mapping for extra data
    let extraColMap = {
      counterpartyNameExtra: 4,      // Column E
      counterpartyNatureExtra: 5, // Column F
      sectorOfExposureExtra: 6, // Column G
      totalOutstandingBalExtra: 7,       // Column H
      capital: 8,       // Column I
      status: 9,        // Column J
      percentCapital: 10, // Column K
    };

    // Find actual indices from extra header
    for (let i = 0; i < extraHeaderRow.length; i++) {
      const cell = String(extraHeaderRow[i] || '').trim();
      if (cell === 'Name of Counterparty') extraColMap.counterpartyNameExtra = i;
      if (cell && cell.includes('Nature of Counterparty ')) extraColMap.counterpartyNatureExtra = i;
      if (cell && cell.includes('Sector of Exposure')) extraColMap.sectorOfExposureExtra = i;
      if (cell && cell.includes('Total Outstanding Balance After Deduction Cash and Cash Equivalent')) extraColMap.totalOutstandingBalExtra = i;
      if (cell && cell.includes('Capital of Bank')) extraColMap.capital = i;
      if (cell && cell.includes('Status (Classification)')) extraColMap.status = i;
      if (cell && cell.includes('Percent of Capital (M=L/B*100)')) extraColMap.percentCapital = i;
    }

    //console.log('Extra Column Map:', extraColMap);

    // Parse extra data rows
    for (let i = extraDataStart; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      const counterpartyName = String(row[extraColMap.counterpartyNameExtra] || '').trim();
      
      // Skip if no counterparty name or if it's empty
      if (!counterpartyName) continue;

      //console.log(`Processing extra row ${i}: Counterparty=${counterpartyName}`);

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
   //   values['Name_of_Counterparty'] = getStringValue(extraColMap.counterpartyNameExtra);
      values['Nature_of_Counterparty_Extra'] = getStringValue(extraColMap.counterpartyNatureExtra);
      values['Sector_of_Exposure_Extra'] = getStringValue(extraColMap.sectorOfExposureExtra);
      values['Total_Outstanding_Balance_Extra'] = getValue(extraColMap.totalOutstandingBalExtra);
      values['Capital_of_Bank_Extra'] = getValue(extraColMap.capital);
      values['Status_Classification_Extra'] = getStringValue(extraColMap.status);
      values['Percent_of_Capital_(M=L/B*100)Extra'] = getValue(extraColMap.percentCapital);
 

      const entry = {
        id: `extra-${i}`,
        sNo: `E${i}`,
        label: counterpartyName,
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

  // Sort main data by S.No
  mainDataNodes.sort((a, b) => {
    const aNum = parseInt(a.sNo);
    const bNum = parseInt(b.sNo);
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return aNum - bNum;
    }
    return 0;
  });

  // Sort extra data by row number
  extraDataNodes.sort((a, b) => {
    return a.rowNumber - b.rowNumber;
  });

  //console.log('Main loan entries:', mainDataNodes.length);
  //console.log('Extra loan entries:', extraDataNodes.length);

  // Create a section node for extra data
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
  const finalData = [...mainDataNodes];
  if (extraDataNodes.length > 0) {
    finalData.push(extraSection);
  }

  // Add extra columns to the list
  const allColumnNames = [
    ...columnNames,
    // Extra section columns
   
    'Nature_of_Counterparty_Extra',
    'Sector_of_Exposure_Extra',
    'Total_Outstanding_Balance_Extra',
    'Capital_of_Bank_Extra',
    'Status_Classification_Extra',
    'Percent_of_Capital_(M=L/B*100)Extra',
   
  ];

  //console.log('Total entries:', finalData.length);

  return {
    hierarchicalData: finalData,
    columns: allColumnNames,
    additionalColumns: [],
    noandtitles: noandtitles
  };
};
export default extractLoanRelatedPartiesData;
