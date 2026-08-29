const extractLargeBorrowersData = (data) => {
   const hierarchicalData = [];
  let dataTableStart = -1;
  let extraDataStart = -1;
  let noandtitles = [];
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const firstCell = String(row[1] || "").trim();
    let secondCell = String(row[2] || "").trim();

    if (secondCell === 'Name of Borrower') {
      secondCell = 'Name_of_Borrower';
    }

    if (i === 13) {
      noandtitles = [firstCell, secondCell];
      console.log("Found title:", noandtitles);
    }
  }
  
  console.log("Found title:", noandtitles[0]);
  console.log('=== Extracting Loan Related Parties Data ===');

  // Log first few rows to understand structure
  for (let i = 0; i < Math.min(data.length, 20); i++) {
    const row = data[i];
    if (row) {
      console.log(`Row ${i}:`, row.slice(0, 10).map(c => String(c || '').trim()));
    }
  }

  // Find the main data table start - look for "S.No." column
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = String(row[1] || '').trim();
    if (firstCell === 'S.No.') {
      dataTableStart = i + 2;
      console.log('Found data table at row:', dataTableStart);
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
    
    if (fifthCell === 'Borrower' && i > 130) {
      extraDataStart = i+1;
      console.log('Found extra data section at row:', extraDataStart);
      break;
    }
  }

  if (dataTableStart === -1) {
    console.log('Could not find data table');
    return { hierarchicalData: [], columns: [], additionalColumns: [], noandtitles: [] };
  }

  // Get the header row to identify column positions
  const headerRow = data[dataTableStart - 1];
  
  console.log('Header row:', headerRow.map(c => String(c || '').trim()));

  // Define column mappings with descriptive names
  let colMap = {
    sNo: 1,
    borrowerName: 2,
    approvedTermLoans: 3,
    approvedMerchandiseLoans: 4,
    approvedOverdraft: 5,
    totalA: 6,
    capitalB: 7,
    percentOfCapitalC: 8,
    cashCollateralTerm: 9,
    cashCollateralMerchandise: 10,
    cashCollateralOverdraft: 11,
    cashEquivalentTerm: 12,
    cashEquivalentMerchandise: 13,
    cashEquivalentOverdraft: 14,
    federalGuaranteeTerm: 15,
    federalGuaranteeMerchandise: 16,
    federalGuaranteeOverdraft: 17,
    foreignGuaranteeTerm: 18,
    foreignGuaranteeMerchandise: 19,
    foreignGuaranteeOverdraft: 20,
    totalH: 21,
    outstandingTerm: 22,
    outstandingMerchandise: 23,
    outstandingOverdraft: 24,
    totalI: 25,
    adjustedOutstandingJ: 26,
    percentOfCapitalK: 27,
    adjustedTermLoans: 28,
    adjustedMerchandise: 29,
    adjustedOverdraft: 30,
    totalL: 31,
    percentOfCapitalM: 32,
    statusClassification: 33,
  };

  // Find actual column indices from header by matching patterns
  for (let i = 0; i < headerRow.length; i++) {
    const cell = String(headerRow[i] || '').trim();
    console.log(`Column ${i}: "${cell}"`);
    
    if (cell === 'Term Loans' && i < 5) colMap.approvedTermLoans = i;
    if (cell === 'Merchandise Loans*' && i < 5) colMap.approvedMerchandiseLoans = i;
    if (cell === 'Overdraft' && i < 5) colMap.approvedOverdraft = i;
    if (cell.includes('Total (A)')) colMap.totalA = i;
    if (cell.includes('Capital of the Bank')) colMap.capitalB = i;
    if (cell.includes('Percent of Capital')) colMap.percentOfCapitalC = i;
    if (cell.includes('Status (Classification)')) colMap.statusClassification = i;
    
    if (cell === 'Cash Collateral Value (D)') {
      colMap.cashCollateralTerm = i + 1;
      colMap.cashCollateralMerchandise = i + 2;
      colMap.cashCollateralOverdraft = i + 3;
    }
    if (cell === 'Cash Equivalent Collateral Value (E)') {
      colMap.cashEquivalentTerm = i + 1;
      colMap.cashEquivalentMerchandise = i + 2;
      colMap.cashEquivalentOverdraft = i + 3;
    }
    if (cell === 'Federal Guarantee  Collateral Value(F)') {
      colMap.federalGuaranteeTerm = i + 1;
      colMap.federalGuaranteeMerchandise = i + 2;
      colMap.federalGuaranteeOverdraft = i + 3;
    }
    if (cell === '"A" Grade Foreign Guarantee Collateral Value(G)') {
      colMap.foreignGuaranteeTerm = i + 1;
      colMap.foreignGuaranteeMerchandise = i + 2;
      colMap.foreignGuaranteeOverdraft = i + 3;
    }
    if (cell === 'Total (H=sumD-G)') colMap.totalH = i;
    
    if (cell === 'Outstanding Balance') {
      colMap.outstandingTerm = i + 1;
      colMap.outstandingMerchandise = i + 2;
      colMap.outstandingOverdraft = i + 3;
    }
    if (cell === 'Total (I)') colMap.totalI = i;
    if (cell === 'Adjusted Outstanding Balance  (J=I-H)') colMap.adjustedOutstandingJ = i;
    if (cell === 'Percent of Capital (K=J/B*100)') colMap.percentOfCapitalK = i;
    
    if (cell === 'Adjusted Outstanding Balance with O/D Approved Limit') {
      colMap.adjustedTermLoans = i + 1;
      colMap.adjustedMerchandise = i + 2;
      colMap.adjustedOverdraft = i + 3;
    }
    if (cell === 'Total (L)') colMap.totalL = i;
    if (cell === 'Percent of Capital (M=L/B*100)') colMap.percentOfCapitalM = i;
    
    if (cell === 'Pass') colMap.pass = i;
  }

  console.log('Final Column Map:', colMap);

  // Column names for the main data
  const columnNames = [
    'Approved_Loan_Limit-Term_Loans',
    'Approved_Loan_Limit-Merchandise_Loans',
    'Approved_Loan_Limit-Overdraft',
    'Total_Approved_Loan_Limit(A)',
    'Capital_of_the_Bank(B)',
    'Percent_of_Capital(C=A/B*100)',
    'Cash_Collateral-Term_Loans',
    'Cash_Collateral-Merchandise_Loans',
    'Cash_Collateral-Overdraft',
    'Cash_Equivalent-Term_Loans',
    'Cash_Equivalent-Merchandise_Loans',
    'Cash_Equivalent-Overdraft',
    'Federal_Guarantee-Term_Loans',
    'Federal_Guarantee-Merchandise_Loans',
    'Federal_Guarantee-Overdraft',
    'Foreign_Guarantee-Term_Loans',
    'Foreign_Guarantee-Merchandise_Loans',
    'Foreign_Guarantee-Overdraft',
    'Total_Collateral(H)',
    'Outstanding_Balance-Term_Loans',
    'Outstanding_Balance-Merchandise_Loans',
    'Outstanding_Balance-Overdraft',
    'Total_Outstanding(I)',
    'Adjusted_Outstanding(J=I-H)',
    'Percent_of_Capital(K=J/B*100)',
    'Adjusted_Balance-Term_Loans',
    'Adjusted_Balance-Merchandise_Loans',
    'Adjusted_Balance-Overdraft_Approved_Limit',
    'Total_Adjusted_Balance(L)',
    'Percent_of_Capital(M=L/B*100)',
    'Status(Classification)'
  ];

  const mainDataNodes = [];
  const extraDataNodes = [];

  // ============ PARSE MAIN DATA ROWS (16 to 135) ============
  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const sNo = String(row[colMap.sNo] || '').trim();
    const borrowerName = String(row[colMap.borrowerName] || '').trim();
    
    // Skip if no borrower name or if it's a total row
    if (!borrowerName) continue;
    if (borrowerName === 'Grand Total') continue;
    if (i > 135) continue;

    console.log(`Processing main row ${i}: S.No=${sNo}, Borrower=${borrowerName}`);

    const values = {};

    const getValue = (index) => {
      if (index !== undefined && index < row.length) {
        const val = parseFloat(row[index]);
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
    values['Approved_Loan_Limit-Term_Loans'] = getValue(colMap.approvedTermLoans);
    values['Approved_Loan_Limit-Merchandise_Loans'] = getValue(colMap.approvedMerchandiseLoans);
    values['Approved_Loan_Limit-Overdraft'] = getValue(colMap.approvedOverdraft);
    values['Total_Approved_Loan_Limit(A)'] = getValue(colMap.totalA);

    values['Capital_of_the_Bank(B)'] = getValue(colMap.capitalB);
    values['Percent_of_Capital(C=A/B*100)'] = getValue(colMap.percentOfCapitalC);

    values['Cash_Collateral-Term_Loans'] = getValue(colMap.cashCollateralTerm);
    values['Cash_Collateral-Merchandise_Loans'] = getValue(colMap.cashCollateralMerchandise);
    values['Cash_Collateral-Overdraft'] = getValue(colMap.cashCollateralOverdraft);

    values['Cash_Equivalent-Term_Loans'] = getValue(colMap.cashEquivalentTerm);
    values['Cash_Equivalent-Merchandise_Loans'] = getValue(colMap.cashEquivalentMerchandise);
    values['Cash_Equivalent-Overdraft'] = getValue(colMap.cashEquivalentOverdraft);

    values['Federal_Guarantee-Term_Loans'] = getValue(colMap.federalGuaranteeTerm);
    values['Federal_Guarantee-Merchandise_Loans'] = getValue(colMap.federalGuaranteeMerchandise);
    values['Federal_Guarantee-Overdraft'] = getValue(colMap.federalGuaranteeOverdraft);

    values['Foreign_Guarantee-Term_Loans'] = getValue(colMap.foreignGuaranteeTerm);
    values['Foreign_Guarantee-Merchandise_Loans'] = getValue(colMap.foreignGuaranteeMerchandise);
    values['Foreign_Guarantee-Overdraft'] = getValue(colMap.foreignGuaranteeOverdraft);

    values['Total_Collateral(H)'] = getValue(colMap.totalH);

    values['Outstanding_Balance-Term_Loans'] = getValue(colMap.outstandingTerm);
    values['Outstanding_Balance-Merchandise_Loans'] = getValue(colMap.outstandingMerchandise);
    values['Outstanding_Balance-Overdraft'] = getValue(colMap.outstandingOverdraft);
    values['Total_Outstanding(I)'] = getValue(colMap.totalI);

    values['Adjusted_Outstanding(J=I-H)'] = getValue(colMap.adjustedOutstandingJ);
    values['Percent_of_Capital(K=J/B*100)'] = getValue(colMap.percentOfCapitalK);

    values['Adjusted_Balance-Term_Loans'] = getValue(colMap.adjustedTermLoans);
    values['Adjusted_Balance-Merchandise_Loans'] = getValue(colMap.adjustedMerchandise);
    values['Adjusted_Balance-Overdraft_Approved_Limit'] = getValue(colMap.adjustedOverdraft);
    values['Total_Adjusted_Balance(L)'] = getValue(colMap.totalL);
    values['Percent_of_Capital(M=L/B*100)'] = getValue(colMap.percentOfCapitalM);

    values['Status(Classification)'] = getStringValue(colMap.statusClassification);

    const entry = {
      id: sNo || `row-${i}`,
      sNo: sNo || '',
      label: borrowerName,
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
    console.log('=== Extracting Extra Data Section ===');
    
    // Get the extra data header row
    const extraHeaderRow = data[extraDataStart - 1];
    console.log('Extra Header row:', extraHeaderRow);

    // Column mapping for extra data
    let extraColMap = {
      borrower: 2,      // Column C
      adjustedBalance: 3, // Column D
      capital: 4,       // Column E
      collateral: 5,    // Column F
      status: 6,        // Column G
      percentCapital: 7, // Column H
    };

    // Find actual indices from extra header
    for (let i = 0; i < extraHeaderRow.length; i++) {
      const cell = String(extraHeaderRow[i] || '').trim();
      if (cell === 'Borrower') extraColMap.borrower = i;
      if (cell && cell.includes('Adjusted Outstanding Balance')) extraColMap.adjustedBalance = i;
      if (cell && cell.includes('Capital of the Bank')) extraColMap.capital = i;
      if (cell && cell.includes('Cash and Cash Equivalent')) extraColMap.collateral = i;
      if (cell && cell.includes('Status (Classification)')) extraColMap.status = i;
      if (cell && cell.includes('Percent of Capital')) extraColMap.percentCapital = i;
    }

    console.log('Extra Column Map:', extraColMap);

    // Parse extra data rows
    for (let i = extraDataStart; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      const borrower = String(row[extraColMap.borrower] || '').trim();
      
      // Skip if no borrower or if it's empty
      if (!borrower) continue;

      console.log(`Processing extra row ${i}: Borrower=${borrower}`);

      const values = {};

      const getValue = (index) => {
        if (index !== undefined && index < row.length) {
          const val = parseFloat(row[index]);
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
      values['Adjusted_Outstanding_Balance_OD'] = getValue(extraColMap.adjustedBalance);
      values['Capital_of_Bank_Extra'] = getValue(extraColMap.capital);
      values['Cash_Cash_Equivalent_Collateral'] = getValue(extraColMap.collateral);
      values['Status_Classification_Extra'] = getStringValue(extraColMap.status);
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

  console.log('Main loan entries:', mainDataNodes.length);
  console.log('Extra loan entries:', extraDataNodes.length);

  // Create a section node for extra data
  const extraSection = {
    id: 'extra-section',
    sNo: 'EXTRA',
    label: 'Borrower Summary (Below Row 139)',
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
    'Adjusted_Outstanding_Balance_OD',
    'Capital_of_Bank_Extra',
    'Cash_Cash_Equivalent_Collateral',
    'Status_Classification_Extra',
    'Percent_of_Capital_(M=L/B*100)Extra',
   
  ];

  console.log('Total entries:', finalData.length);

  return {
    hierarchicalData: finalData,
    columns: allColumnNames,
    additionalColumns: [],
    noandtitles: noandtitles
  };
};
export default extractLargeBorrowersData