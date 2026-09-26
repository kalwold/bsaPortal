import { excelDateToISO } from "../../../utils";
export const extractWeightedAvgLendingRatesMetadata=(data)=>{

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

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (row.length === 0) continue;
    const firstCell = String(row[0]?row[0]:'').trim();
    const secondCell = String(row[1]?row[1]:'').trim();


    if (i === 0 && firstCell) {
   metadata.ReturnKey = firstCell;

      if (firstCell.includes("LCMWAC001") ) {
        metadata.reportType = "credit-monthly_weighted-avg-lending-rates";
        metadata.reportTypeId = "credit-monthly_weighted-avg-lending-rates";
        metadata.departmentName = "Credit";
        metadata.departmentId = "credit";
      }
    }

      if (( i === 3 ) && (firstCell || secondCell)) {
      metadata.reportTitle = firstCell || '';
      //console.log("Found Report Title:", metadata.reportTitle);
    }

    if (
      i === 4 &&
      (firstCell.includes("Institution") || firstCell.includes("Instiution"))
    ) {
      metadata.institutionCode = secondCell;
    }
    if (i === 5 && firstCell.includes("Financial Year")) {
      metadata.financialYear = secondCell;
    }
    if (i === 6 && firstCell.includes("Start Date")) {
      metadata.startDate = excelDateToISO(secondCell);
    }
    if (i === 7 && firstCell.includes("End Date")) {
      metadata.endDate = excelDateToISO(secondCell);
    }
    if (i === 12 && (secondCell.includes("in") || secondCell.includes("In"))) {
      metadata.unit = secondCell;
    }
  }

  return metadata;
};
const extractWeightedAvgLendingRatesData = (data) => {
  const hierarchicalData = [];
  let dataTableStart = -1;


  // Log all rows to understand structure
  for (let i = 0; i < Math.min(data.length, 30); i++) {
    const row = data[i];
    if (row) {
      console.log(`Row ${i}:`, row.map(c => String(c || '').trim()));
    }
  }

  // Find the data table start - look for "Sector" in column A
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = String(row[0] || '').trim();
    if (firstCell === 'Sector') {
      dataTableStart = i + 2; 
      console.log('Found data table at row:', dataTableStart);
      break;
    }
  }

  if (dataTableStart === -1) {
    console.log('Could not find data table');
    return { hierarchicalData: [], columns: [], additionalColumns: [] };
  }


  const SECTOR_COL = 0;
  const LOAN_CATEGORY_COL = 1;
  const OUTSTANDING_LOAN_COL = 2;
  const NUM_ACCOUNTS_COL = 3;
  const MIN_RATE_COL = 4;
  const MAX_RATE_COL = 5;
  const WEIGHTED_AVG_CATEGORY_COL = 6;
  const WEIGHTED_AVG_SECTOR_COL = 7;

  // Define the columns for this report
  const columns = [
    'Sector',
    'Loan_Category',
    'Outstanding_Loan',
    'No_of_Loan_Accounts',
    'Minimum_Rate',
    'Maximum_Rate',
    'Weighted_Average_Rate_by_Category',
    'Weighted_Average_Rate_by_Sector'
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

    const loanType = String(row[SECTOR_COL] || '').trim();
    const loanCategory = String(row[LOAN_CATEGORY_COL] || '').trim();

    // Skip if both are empty
    if (!loanType && !loanCategory) continue;

    // Skip footer notes
    if (loanType.includes('Note') || loanCategory.includes('Note')) continue;

    // Extract values
    const values = {

      'Sector': getStringValue(SECTOR_COL, row),
      'Loan_Category': getStringValue(LOAN_CATEGORY_COL, row),
      'Outstanding_Loan': getValue(OUTSTANDING_LOAN_COL, row),
      'No_of_Loan_Accounts': getValue(NUM_ACCOUNTS_COL, row),
      'Minimum_Rate': getValue(MIN_RATE_COL, row),
      'Maximum_Rate': getValue(MAX_RATE_COL, row),
      'Weighted_Average_Rate_by_Category': getValue(WEIGHTED_AVG_CATEGORY_COL, row),
      'Weighted_Average_Rate_by_Sector': getValue(WEIGHTED_AVG_SECTOR_COL, row)
    };

          const entry = {
        id: '',
        sNo: '',
        label: "",
        values: values,
        rowNumber: i + 1,
        level: 0,
        isTotalRow: false,
        isSectionHeader: true,
        isloanType: true,
        children: []
      };
      topLevelNodes.push(entry);
  
  }

  console.log('Total Sectors:', topLevelNodes.length);

  return {
    hierarchicalData: topLevelNodes,
    columns: columns,
    additionalColumns: [],
    noandtitles:[" "]
  };
};
export default extractWeightedAvgLendingRatesData