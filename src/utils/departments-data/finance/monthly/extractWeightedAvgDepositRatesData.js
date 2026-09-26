import { excelDateToISO } from "../../../utils";
export const extractWeightedAvgDepositRatesMetadata=(data)=>{

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
    const firstCell = String(row[0] ? row[0] : '').trim();
    const secondCell = String(row[1] ? row[1] : '').trim();
    

    if (i === 0 && firstCell) {
   metadata.ReturnKey = firstCell;

      if (firstCell.includes("WAADIR001") ) {
        metadata.reportType = "finance-monthly_weighted-avg-deposit-rates";
        metadata.reportTypeId = "finance-monthly_weighted-avg-deposit-rates";
        metadata.departmentName = "Finance";
        metadata.departmentId = "finance";
      }
    }

      if (( i === 3 ) && (firstCell || secondCell)) {
      metadata.reportTitle = firstCell;
      //console.log("Found Report Title:", metadata.reportTitle);
    }

    if (
      i === 4 &&
      (firstCell.includes("Institution") || firstCell.includes("Instiution"))
    ) {
      metadata.institutionCode = secondCell ;
    }
    if (i === 5 && firstCell.includes("Financial Year")) {
      metadata.financialYear = secondCell ;
    }
    if (i === 6 && firstCell.includes("Start Date")) {
      metadata.startDate = excelDateToISO(secondCell) ;
    }
    if (i === 7 && firstCell.includes("End Date")) {
      metadata.endDate = excelDateToISO(secondCell) ;
    }
   
  }


  console.log("returned metadata", metadata)
  return metadata;
};
const extractWeightedAvgDepositRatesData = (data) => {
  const hierarchicalData = [];
  let dataTableStart = -1;

  console.log('=== Extracting Weighted Average Deposit Interest Rates Data (ADIR001) ===');

  // Log all rows to understand structure
  for (let i = 0; i < Math.min(data.length, 30); i++) {
    const row = data[i];
    if (row) {
      console.log(`Row ${i}:`, row.map(c => String(c || '').trim()));
    }
  }

  // Find the data table start - look for "Deposit Type" in column A
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = String(row[0] || '').trim();
    if (firstCell === 'Deposit Type') {
      dataTableStart = i + 2; 
      console.log('Found data table at row:', dataTableStart);
      break;
    }
  }

  if (dataTableStart === -1) {
    console.log('Could not find data table');
    return { hierarchicalData: [], columns: [], additionalColumns: [] };
  }

  // Column indices (0-based)
  // A(0)=Deposit Type, B(1)=Deposit Category, C(2)=Total Deposit Amount,
  // D(3)=No. of Deposit Accounts, E(4)=Minimum Rate, F(5)=Maximum Rate,
  // G(6)=Weighted Average Rate by Category, H(7)=Weighted Average Rate by Type
  const DEPOSIT_TYPE_COL = 0;
  const DEPOSIT_CATEGORY_COL = 1;
  const TOTAL_AMOUNT_COL = 2;
  const NUM_ACCOUNTS_COL = 3;
  const MIN_RATE_COL = 4;
  const MAX_RATE_COL = 5;
  const WEIGHTED_AVG_CATEGORY_COL = 6;
  const WEIGHTED_AVG_TYPE_COL = 7;

  // Define the columns for this report
  const columns = [
    'Deposit_Type',
    'Deposit_Category',
    'Total_Deposit_Amount',
    'No_of_Deposit_Accounts',
    'Minimum_Rate',
    'Maximum_Rate',
    'Weighted_Average_Rate_by_Category',
    'Weighted_Average_Rate_by_Type'
  ];

  const topLevelNodes = [];
  const depositTypeNodes = new Map();

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

    const depositType = String(row[DEPOSIT_TYPE_COL] || '').trim();
    const depositCategory = String(row[DEPOSIT_CATEGORY_COL] || '').trim();

    // Skip if both are empty
    if (!depositType && !depositCategory) continue;

    // Skip footer notes
    if (depositType.includes('Note') || depositCategory.includes('Note')) continue;

    // Extract values
    const values = {

      'Deposit_Type': getStringValue(DEPOSIT_TYPE_COL, row),
      'Deposit_Category': getStringValue(DEPOSIT_CATEGORY_COL, row),
      'Total_Deposit_Amount': getValue(TOTAL_AMOUNT_COL, row),
      'No_of_Deposit_Accounts': getValue(NUM_ACCOUNTS_COL, row),
      'Minimum_Rate': getValue(MIN_RATE_COL, row),
      'Maximum_Rate': getValue(MAX_RATE_COL, row),
      'Weighted_Average_Rate_by_Category': getValue(WEIGHTED_AVG_CATEGORY_COL, row),
      'Weighted_Average_Rate_by_Type': getValue(WEIGHTED_AVG_TYPE_COL, row)
    };

          const entry = {
        id: '',
        sNo: '',
        label: '',
        values: values,
        rowNumber: i + 1,
        level: 0,
        isTotalRow: false,
        isSectionHeader: true,
        isDepositType: true,
        children: []
      };
      topLevelNodes.push(entry);
  
  }

  console.log('Total deposit types:', topLevelNodes.length);

  return {
    hierarchicalData: topLevelNodes,
    columns: columns,
    additionalColumns: [],
    noandtitles:[" "]
  };
};
export default extractWeightedAvgDepositRatesData