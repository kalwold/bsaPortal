import { excelDateToISO } from "./excelParser";
export const extractQTopTwentyNplMetadata = (data) => {
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
    const thirtyOneCell = String(row[30] || "").trim();

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
     

if (firstCell.includes('TOP_20') || firstCell.includes('TN001')) {
        metadata.reportType = 'credit-quarterly_loan-nonperforming-top20';
        metadata.departmentId = 'credit';
        metadata.departmentName = 'Credit';
        metadata.reportTypeId = 'credit-quarterly_loan-nonperforming-top20';
      }

    }

    if (( i === 3) && (firstCell)) {
       metadata.reportTitle = firstCell || '';
      //console.log("Found Report Title:", metadata.reportTitle);
    }

    if (
     (i === 7 )&&
      (firstCell ) &&
     ( (firstCell || secondCell).includes("Instiution") ||  (firstCell || secondCell).includes("Institution "))
    ) {
      metadata.institutionCode = thirdCell || '';
      //console.log("Found Institution Code:", metadata.institutionCode);
    }

    if (
      (i === 8)&&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("Financial Year")
    ) {
      metadata.financialYear = thirdCell || '';
      //console.log("Found Financial Year:", metadata.financialYear);
    }

    if (
      ( i === 9) &&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("Start Date")
    ) {
     // metadata.startDate = excelDateToISO(secondCell||thirdCell  || fourthCell || "");
     metadata.startDate = excelDateToISO(thirdCell) || '';
      //console.log("Found Start Date:", metadata.startDate);
    }

    if (
      (i === 10 ) &&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("End Date")
    ) {
      metadata.endDate = excelDateToISO(thirdCell) || "";
      // metadata.endDate =excelDateToISO(secondCell||thirdCell  || fourthCell || "");
      //console.log("Found End Date:", metadata.endDate);
    }

    if (
      ( i === 11) &&
      (thirdCell || thirtyOneCell || firstCell) &&
      (thirdCell.toLowerCase().includes("in") ||
        thirtyOneCell.toLowerCase().includes("in") || firstCell.toLowerCase().includes('In'))
    ) {
      metadata.unit = thirdCell  || '';
      //console.log("Found Unit:", metadata.unit);
    }
  }
return metadata
}

const extractQTopTwentyNplData = (data) => {
  const hierarchicalData = [];
  let dataTableStart = -1;

  let noandtitles = [];

  // =====================================================
  // 1. Extract report code + title
  //    Row 0 typically holds a short "code" (e.g. TOP_20_NPLs_TN001)
  //    and a later row holds the real human-readable title
  //    (e.g. "Quarterly Top Twenty (20) NPLs Report").
  //    We grab the first two non-empty first-cells we see, in order,
  //    instead of hardcoding a row index (that was the bug last time).
  // =====================================================
  for (let i = 0; i < data.length && noandtitles.length < 2; i++) {
    const row = data[i];
    if (!row) continue;
    const firstCell = String(row[0] || '').trim();
    const secondCell = String(row[1] || '').trim();
  if (i===13){
    if (firstCell) {
      noandtitles.push(firstCell, secondCell);
    }}
  }

  // =====================================================
  // 2. Find where the data table starts - look for "S.No." column
  //    The real header spans TWO rows because "Loans" is merged
  //    across "Approved" / "Outstanding" sub-columns, so data
  //    starts 2 rows after the "S.No." row, not 1.
  // =====================================================
  let headerRowIndex = -1;
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = String(row[0] || '').trim().toLowerCase();
    if (firstCell === 's.no.' || firstCell === 's.no' || firstCell === 'sno') {
      headerRowIndex = i;
      dataTableStart = i + 2; // skip the "Approved/Outstanding" sub-header row too
      break;
    }
  }

  if (dataTableStart === -1) {
    // Fallback: look for the first borrower row (S.No. = 1)
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;
      const firstCell = String(row[0] || '').trim();
      if (firstCell === '1') {
        dataTableStart = i;
        break;
      }
    }
  }

  if (dataTableStart === -1) {
    return { hierarchicalData: [], columns: [], additionalColumns: [], noandtitles };
  }

  // Column layout (0-indexed):
  // 0 = S.No.            3 = Loans - Outstanding   6 = Loan status
  // 1 = Name of Borrower 4 = Collateral Value
  // 2 = Loans - Approved 5 = Provision held
  // NOTE: column 8 (I) is a dropdown source list ("Pass", "Special Mention",
  // etc.) used for data validation on column G - it is NOT per-row data
  // and must never be read as a value.
  const COL = {
    sNo: 0,
    name: 1,
    loansApproved: 2,
    loansOutstanding: 3,
    collateralValue: 4,
    provisionHeld: 5,
    loanStatus: 6,
  };

  const toNumber = (val) => {
    const n = parseFloat(val);
    return !isNaN(n) ? n.toFixed(2) : '0';
  };

  const topLevelNodes = [];

  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const sNo = String(row[COL.sNo] || '').trim();
    const name = String(row[COL.name] || '').trim();

    // Stop at the trailing footnote ("Aggregate a borrower loans...")
    if (!sNo && name.toLowerCase().startsWith('aggregate a borrower')) {
      break;
    }

    // Skip fully blank rows
    if (!sNo && !name) continue;

    const nameLower = name.toLowerCase();
    const isSubTotal = nameLower.includes('sub total');
    const isGrandTotal = nameLower.includes('grand total');
    const isTotalRow = isSubTotal || isGrandTotal;

     if (sNo && !isTotalRow) {
      const hasName = name !== '';
      const hasAnyRawValue = [
        row[COL.loansApproved],
        row[COL.loansOutstanding],
        row[COL.collateralValue],
        row[COL.provisionHeld],
      ].some((v) => v !== undefined && v !== null && String(v).trim() !== '');
 
      if (!hasName && !hasAnyRawValue) continue;
    }

    const entry = {
      id: sNo || "",
      sNo: sNo || '',
      label: name,
      values: {
        Loans_Approved: toNumber(row[COL.loansApproved]),
        Loans_Outstanding: toNumber(row[COL.loansOutstanding]),
        Collateral_Value: toNumber(row[COL.collateralValue]),
        Provision_Held: toNumber(row[COL.provisionHeld]),
        Loan_Status: String(row[COL.loanStatus] || '').trim(),
      },
      
      rowNumber: i + 1,
      level: 0,
      isTotalRow,
      isSectionHeader: false,
      children: [],
    };

    topLevelNodes.push(entry);
  }

  // Clean up empty children arrays (kept flat here - no coded hierarchy
  // exists in this sheet, unlike the NPL & Provisions table)
  topLevelNodes.forEach((node) => {
    if (node.children && node.children.length === 0) {
      delete node.children;
    }
  });

  return {
    hierarchicalData: topLevelNodes,
    columns: ['Loans_Approved', 'Loans_Outstanding', 'Collateral_Value', 'Provision_Held', 'Loan_Status'],
    additionalColumns: [],
    noandtitles,
  };
};
export default extractQTopTwentyNplData;
