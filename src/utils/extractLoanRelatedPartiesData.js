 const extractLoanRelatedPartiesData = (data) => {
  const hierarchicalData = [];
  let dataTableStart = -1;
  let noandtitles = [];
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const firstCell = String(row[1] || "").trim();
    let secondCell = String(row[2] || "").trim();

    if (secondCell ==='Name of Borrower'){
      secondCell= 'Name_of_Borrower'
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

  // Find the data table start - look for "S.No." column
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

  // if (dataTableStart === -1) {
  //   // Try to find by looking for "Name of Borrower"
  //   for (let i = 0; i < data.length; i++) {
  //     const row = data[i];
  //     if (!row || row.length === 0) continue;
  //     const secondCell = String(row[2] || '').trim();
  //     if (secondCell === 'Name of Borrower') {
  //       dataTableStart = i + 2;
  //       console.log('Found data table at row (alt):', dataTableStart);
  //       break;
  //     }
  //   }
  // }

  if (dataTableStart === -1) {
    console.log('Could not find data table');
    return { hierarchicalData: [], columns: [], additionalColumns: [] , noandtitles : [] };
  }

  // Get the header row to identify column positions
  const headerRow = data[dataTableStart - 1];
  
  // Print header row for debugging
  console.log('Header row:', headerRow.map(c => String(c || '').trim()));

  // Define column mappings with descriptive names
  let colMap = {
    sNo: 1,
    borrowerName: 2,
    // Approved Loan Limit Amount - Term Loans
    approvedTermLoans: 2,
    // Approved Loan Limit Amount - Merchandise Loans
    approvedMerchandiseLoans: 4,
    // Approved Loan Limit Amount - Overdraft
    approvedOverdraft: 5,
    // Total (A) - sum of Term Loans + Merchandise Loans + Overdraft
    totalA: 6,
    // Capital of the Bank (Paid up + Share Premium + Legal + General reserve) (B)
    capitalB: 7,
    // Percent of Capital (C=A/B*100)
    percentOfCapitalC: 8,
    // Cash Collateral Value - Term Loans
    cashCollateralTerm: 9,
    // Cash Collateral Value - Merchandise Loans
    cashCollateralMerchandise: 10,
    // Cash Collateral Value - Overdraft
    cashCollateralOverdraft: 11,
    // Cash Equivalent Collateral Value - Term Loans
    cashEquivalentTerm: 12,
    // Cash Equivalent Collateral Value - Merchandise Loans
    cashEquivalentMerchandise: 13,
    // Cash Equivalent Collateral Value - Overdraft
    cashEquivalentOverdraft: 14,
    // Federal Guarantee Collateral Value - Term Loans
    federalGuaranteeTerm: 15,
    // Federal Guarantee Collateral Value - Merchandise Loans
    federalGuaranteeMerchandise: 16,
    // Federal Guarantee Collateral Value - Overdraft
    federalGuaranteeOverdraft: 17,
    // "A" Grade Foreign Guarantee Collateral Value - Term Loans
    foreignGuaranteeTerm: 18,
    // "A" Grade Foreign Guarantee Collateral Value - Merchandise Loans
    foreignGuaranteeMerchandise: 19,
    // "A" Grade Foreign Guarantee Collateral Value - Overdraft
    foreignGuaranteeOverdraft: 20,
    // Total (H=sumD-G) - sum of all collateral values
    totalH: 21,
    // Outstanding Balance - Term Loans
    outstandingTerm: 22,
    // Outstanding Balance - Merchandise Loans
    outstandingMerchandise: 23,
    // Outstanding Balance - Overdraft
    outstandingOverdraft: 24,
    // Total (I) - sum of outstanding balances
    totalI: 25,
    // Adjusted Outstanding Balance (J=I-H)
    adjustedOutstandingJ: 26,
    // Percent of Capital (K=J/B*100)
    percentOfCapitalK: 27,
    // Adjusted Outstanding Balance with O/D Approved Limit - Term Loans
    adjustedTermLoans: 28,
    // Adjusted Outstanding Balance with O/D Approved Limit - Merchandise Loans
    adjustedMerchandise: 29,
    // Adjusted Outstanding Balance with O/D Approved Limit - Overdraft Approved Limit
    adjustedOverdraft: 30,
    // Total (L) - sum of adjusted balances
    totalL: 31,
    // Percent of Capital (M=L/B*100)
    percentOfCapitalM: 32,
    // Status (Classification)
    statusClassification: 33,
    // Pass field

  };

  // Find actual column indices from header by matching patterns
  for (let i = 0; i < headerRow.length; i++) {
    const cell = String(headerRow[i] || '').trim();
    console.log(`Column ${i}: "${cell}"`);
    
    // if (cell === 'S.No.') colMap.sNo = i;
    // if (cell === 'Name of Borrower') colMap.borrowerName = i;
    // Look for Term Loans under Approved Loan Limit Amount
    if (cell === 'Term Loans' && i < 5) colMap.approvedTermLoans = i;
    if (cell === 'Merchandise Loans*' && i < 5) colMap.approvedMerchandiseLoans = i;
    if (cell === 'Overdraft' && i < 5) colMap.approvedOverdraft = i;
    if (cell.includes('Total (A)')) colMap.totalA = i;
    if (cell.includes('Capital of the Bank')) colMap.capitalB = i;
    if (cell.includes('Percent of Capital')) colMap.percentOfCapitalC = i;
    if (cell.includes('Status (Classification)')) colMap.statusClassification = i;
    
    // Cash Collateral
    if (cell === 'Cash Collateral Value (D)') {
      // The next three columns are Term Loans, Merchandise, Overdraft
      colMap.cashCollateralTerm = i + 1;
      colMap.cashCollateralMerchandise = i + 2;
      colMap.cashCollateralOverdraft = i + 3;
    }
    // Cash Equivalent
    if (cell === 'Cash Equivalent Collateral Value (E)') {
      colMap.cashEquivalentTerm = i + 1;
      colMap.cashEquivalentMerchandise = i + 2;
      colMap.cashEquivalentOverdraft = i + 3;
    }
    // Federal Guarantee
    if (cell === 'Federal Guarantee  Collateral Value(F)') {
      colMap.federalGuaranteeTerm = i + 1;
      colMap.federalGuaranteeMerchandise = i + 2;
      colMap.federalGuaranteeOverdraft = i + 3;
    }
    // Foreign Guarantee
    if (cell === '"A" Grade Foreign Guarantee Collateral Value(G)') {
      colMap.foreignGuaranteeTerm = i + 1;
      colMap.foreignGuaranteeMerchandise = i + 2;
      colMap.foreignGuaranteeOverdraft = i + 3;
    }
    if (cell === 'Total (H=sumD-G)') colMap.totalH = i;
    
    // Outstanding Balance
    if (cell === 'Outstanding Balance') {
      colMap.outstandingTerm = i + 1;
      colMap.outstandingMerchandise = i + 2;
      colMap.outstandingOverdraft = i + 3;
    }
    if (cell === 'Total (I)') colMap.totalI = i;
    if (cell === 'Adjusted Outstanding Balance  (J=I-H)') colMap.adjustedOutstandingJ = i;
    if (cell === 'Percent of Capital (K=J/B*100)') colMap.percentOfCapitalK = i;
    
    // Adjusted Outstanding Balance with O/D Approved Limit
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

  // Collect all column names for currencies
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
  // const columnNames = [
  //   'Approved_Loan_Limit-Term_Loans',
  //   'Approved_Loan_Limit-Merchandise_Loans',
  //   'Approved_Loan_Limit-Overdraft',
  //   'Total Approved Loan Limit (A)',
  //   'Capital of the Bank (B)',
  //   'Percent of Capital (C=A/B*100)',
  //   'Cash Collateral - Term Loans',
  //   'Cash Collateral - Merchandise Loans',
  //   'Cash Collateral - Overdraft',
  //   'Cash Equivalent - Term Loans',
  //   'Cash Equivalent - Merchandise Loans',
  //   'Cash Equivalent - Overdraft',
  //   'Federal Guarantee - Term Loans',
  //   'Federal Guarantee - Merchandise Loans',
  //   'Federal Guarantee - Overdraft',
  //   'Foreign Guarantee - Term Loans',
  //   'Foreign Guarantee - Merchandise Loans',
  //   'Foreign Guarantee - Overdraft',
  //   'Total Collateral (H)',
  //   'Outstanding Balance - Term Loans',
  //   'Outstanding Balance - Merchandise Loans',
  //   'Outstanding Balance - Overdraft',
  //   'Total Outstanding (I)',
  //   'Adjusted Outstanding (J=I-H)',
  //   'Percent of Capital (K=J/B*100)',
  //   'Adjusted Balance - Term Loans',
  //   'Adjusted Balance - Merchandise Loans',
  //   'Adjusted Balance - Overdraft Approved Limit',
  //   'Total Adjusted Balance (L)',
  //   'Percent of Capital (M=L/B*100)',
  //   'Status (Classification)'
  // ];

  const topLevelNodes = [];

  // Parse each row
  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    console.log("row data", row, colMap.sNo)
    if (!row || row.length === 0) continue;

    const sNo = String(row[colMap.sNo] || '').trim();
    console.log("s.no", sNo)
    // Skip if no S.No or if it's a formula row (starts with =)
    

    const borrowerName = String(row[colMap.borrowerName] || '').trim();
    if (!sNo && borrowerName !== 'Grand Total') continue;
    // Skip if no borrower name
    if (!borrowerName) continue;
    if(i > 135) continue;

    console.log(`Processing row ${i}: S.No=${sNo}, Borrower=${borrowerName}`);

    // Extract all values with proper naming
    const values = {};

    // Helper function to extract value
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

    // Capital and Ratios
    values['Capital_of_the_Bank(B)'] = getValue(colMap.capitalB);
    values['Percent_of_Capital(C=A/B*100)'] = getValue(colMap.percentOfCapitalC);

    // Cash Collateral
    values['Cash_Collateral-Term_Loans'] = getValue(colMap.cashCollateralTerm);
    values['Cash_Collateral-Merchandise_Loans'] = getValue(colMap.cashCollateralMerchandise);
    values['Cash_Collateral-Overdraft'] = getValue(colMap.cashCollateralOverdraft);

    // Cash Equivalent
    values['Cash_Equivalent-Term_Loans'] = getValue(colMap.cashEquivalentTerm);
    values['Cash_Equivalent-Merchandise_Loans'] = getValue(colMap.cashEquivalentMerchandise);
    values['Cash_Equivalent-Overdraft'] = getValue(colMap.cashEquivalentOverdraft);

    // Federal Guarantee
    values['Federal_Guarantee-Term_Loans'] = getValue(colMap.federalGuaranteeTerm);
    values['Federal_Guarantee-Merchandise_Loans'] = getValue(colMap.federalGuaranteeMerchandise);
    values['Federal_Guarantee-Overdraft'] = getValue(colMap.federalGuaranteeOverdraft);

    // Foreign Guarantee
    values['Foreign_Guarantee-Term_Loans'] = getValue(colMap.foreignGuaranteeTerm);
    values['Foreign_Guarantee-Merchandise_Loans'] = getValue(colMap.foreignGuaranteeMerchandise);
    values['Foreign_Guarantee-Overdraft'] = getValue(colMap.foreignGuaranteeOverdraft);

    // Total Collateral
    values['Total_Collateral(H)'] = getValue(colMap.totalH);

    // Outstanding Balance
    values['Outstanding_Balance-Term_Loans'] = getValue(colMap.outstandingTerm);
    values['Outstanding_Balance-Merchandise_Loans'] = getValue(colMap.outstandingMerchandise);
    values['Outstanding_Balance-Overdraft'] = getValue(colMap.outstandingOverdraft);
    values['Total_Outstanding(I)'] = getValue(colMap.totalI);

    // Adjusted Outstanding
    values['Adjusted_Outstanding(J=I-H)'] = getValue(colMap.adjustedOutstandingJ);
    values['Percent_of_Capital(K=J/B*100)'] = getValue(colMap.percentOfCapitalK);

    // Adjusted Outstanding with O/D Approved Limit
    values['Adjusted_Balance-Term_Loans'] = getValue(colMap.adjustedTermLoans);
    values['Adjusted_Balance-Merchandise_Loans'] = getValue(colMap.adjustedMerchandise);
    values['Adjusted_Balance-Overdraft_Approved_Limit'] = getValue(colMap.adjustedOverdraft);
    values['Total_Adjusted_Balance(L)'] = getValue(colMap.totalL);
    values['Percent_of_Capital(M=L/B*100)'] = getValue(colMap.percentOfCapitalM);

    // Status and Pass
    values['Status(Classification)'] = getStringValue(colMap.statusClassification);
    

    // Create the entry
    const entry = {
      id: sNo,
      sNo: sNo,
      label: borrowerName,
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
    return aNum - bNum;
  });

  console.log('Total loan entries:', topLevelNodes.length);
  console.log('Sample entry:', topLevelNodes[0]);

  console.log("data before return", topLevelNodes,columnNames,noandtitles)
  return {
    hierarchicalData: topLevelNodes,
    columns: columnNames,
    additionalColumns: [],
    noandtitles: noandtitles
  };
};
export default extractLoanRelatedPartiesData