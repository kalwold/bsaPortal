
import { excelDateToISO } from "../../../utils";
export const extractAggregateRecategorizedLoansMetadata = (data) => {
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
    if (!row || row.length === 0) continue;

    const firstCell = String(row[0] || "").trim();
    const thirdCell = String(row[2] || "").trim();
    // Label merges differ slightly between templates (some merge the
    // label across A:B, some don't), so the value can land in B, C, D...
    // Scan forward from column B and take the first non-empty cell.
    const labelValue = (() => {
      for (let c = 1; c <= 5; c++) {
        const v = row[c];
        if (v !== undefined && v !== null && String(v).trim() !== "") {
          return String(v).trim();
        }
      }
      return "";
    })();

    // DEBUG: print exactly what's in each metadata-relevant row so you
    // can line it up against what the code below expects (row index,
    // Excel row number, full row contents, and which value it picked).
    if (i <= 13) {
      console.log(
        `[metadata] row[${i}] (Excel row ${i + 1}):`, row,
        `| firstCell="${firstCell}" | labelValue picked="${labelValue}"`
      );
    }

    if (i === 0 && firstCell) {
      metadata.ReturnKey = firstCell;

      if (firstCell.includes("ANARN001") ) {
        metadata.reportType = "credit-quarterly_aggregate-recategorized-loans";
        metadata.reportTypeId = "credit-quarterly_aggregate-recategorized-loans";
        metadata.departmentId = "credit";
        metadata.departmentName = "Credit";
      }
    }

    if (i === 3 && firstCell) {
      metadata.reportTitle = firstCell.replace(/\s+/g, " ").trim();
    }

    if (
      i === 7 &&
      firstCell &&
      (firstCell.toLowerCase().includes("instiution") ||
        firstCell.toLowerCase().includes("institution"))
    ) {
      metadata.institutionCode = labelValue || "";
    }

    if (
      i === 8 &&
      firstCell &&
      firstCell.toLowerCase().includes("financial year")
    ) {
      metadata.financialYear = labelValue || "";
    }

    if (
      i === 9 &&
      firstCell &&
      firstCell.toLowerCase().includes("start date")
    ) {
      metadata.startDate = excelDateToISO(labelValue) || "";
    }

    if (
      i === 10 &&
      firstCell &&
      firstCell.toLowerCase().includes("end date")
    ) {
      metadata.endDate = excelDateToISO(labelValue) || "";
    }

    if (i === 12) {
      const unitCell = row.find(
        (c) => c && String(c).toLowerCase().includes("million")
      );
      if (unitCell) metadata.unit = String(unitCell).trim();
    }
  }
  return metadata;
};
const extractAggregateRecategorizedLoansData = (data) => {
  const hierarchicalData = [];
  let dataTableStart = -1;
   
const noandtitles = [];
noandtitles.push('S.No.', 'Description')
  console.log('=== Extracting Restructured Loans Data (AL001) ===');

  // Log all rows to understand structure
  for (let i = 0; i < data.length; i++) {
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
      dataTableStart = i + 1;
      console.log('Found data table at row:', dataTableStart);
      break;
    }
  }

  if (dataTableStart === -1) {
    console.log('Could not find data table');
    return { hierarchicalData: [], columns: [], additionalColumns: [] };
  }

  // Column indices
  // A(0)=S.No., B(1)=empty, C(2)=Number of Restructured Loans, D(3)=Amount of Restructured Loans
  const SNO_COL = 0;
  const LABEL_COL = 1;
  const NUMBER_COL = 2;
  const AMOUNT_COL = 3;

  // Define the columns for this report
  const columns = [
    'Number_of_Restructured_Loans',
    'Amount_of_Restructured_Loans'
  ];

  const topLevelNodes = [];

  // Helper functions
  const getNumber = (index) => {
    if (index !== undefined && index < data[0].length) {
      const val = parseFloat(data[0][index]);
      return !isNaN(val) ? val : 0;
    }
    return 0;
  };

  // Parse each row
  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const sNo = String(row[SNO_COL] || '').trim();
    const label = String(row[LABEL_COL] || '').trim();

    // Skip if no label
    if (!label) continue;

    // Skip note rows
    if (label.includes('Note:') || label.includes('*Number')) continue;

    // Determine if this is a total row
    const isTotalRow = label.includes('Total  Loans and Advances Re-Categorized from Non-Accrual To Accrual Status');

    // Extract values
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

    const values = {
      'Number_of_Restructured_Loans': getValue(NUMBER_COL),
      'Amount_of_Restructured_Loans': getValue(AMOUNT_COL)
    };

    // Determine level
    const level = isTotalRow ? 0 : 1;

    const entry = {
      id: sNo || "",
      sNo: sNo || '',
      label: label,
      values: values,
      rowNumber: i + 1,
      level: level,
      isTotalRow: isTotalRow || false,
      isSectionHeader: false,
      children: []
    };

    topLevelNodes.push(entry);
  }

  // Sort - regular rows first, total row last
  topLevelNodes.sort((a, b) => {
    if (a.isTotalRow && !b.isTotalRow) return 1;
    if (!a.isTotalRow && b.isTotalRow) return -1;
    
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
export default extractAggregateRecategorizedLoansData