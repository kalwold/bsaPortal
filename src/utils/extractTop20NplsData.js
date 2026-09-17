import { excelDateToISO } from "./excelParser";

export const extractTop20NplsMetadata = (data) => {
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

      if (firstCell.includes("TOP_20_NPLs_TN001") || firstCell.includes("TN001")) {
        metadata.reportType = "credit-quarterly_top20-npls";
        metadata.reportTypeId = "credit-quarterly_top20-npls";
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

// Columns (0-based): A S.No. | B Name of Borrower | C Loans Approved |
// D Loans Outstanding | E Collateral Value | F Provision held | G Loan status
const extractTop20NplsData = (data) => {
  let headerRowIdx = -1;
  let noandtitles = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = String(row[0] || "").trim();
    if (firstCell === "S.No.") {
      headerRowIdx = i;
      const secondCell = String(row[1] || "").trim();
      noandtitles = [firstCell, secondCell];
      break;
    }
  }

  console.log('[TN001] "S.No." header found at row index:', headerRowIdx,
    headerRowIdx === -1 ? '(NOT FOUND — check that A14 literally reads "S.No.")' : `(Excel row ${headerRowIdx + 1})`);

  if (headerRowIdx === -1) {
    return { hierarchicalData: [], columns: [], additionalColumns: [], noandtitles };
  }

  // Header spans 2 rows (main header, then Approved/Outstanding sub-header)
  const dataTableStart = headerRowIdx + 2;
  console.log('[TN001] data rows expected to start at index:', dataTableStart, `(Excel row ${dataTableStart + 1})`);

  const getNum = (row, idx) => {
    if (idx < row.length) {
      const val = parseFloat(row[idx]);
      if (!isNaN(val) && val !== 0) return val.toFixed(2);
    }
    return "0";
  };
  const getStr = (row, idx) => String((idx < row.length && row[idx]) || "").trim();

  const entries = [];

  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const sNoRaw = row[0];
    const nameCell = getStr(row, 1);
    const isNumericSNo = sNoRaw !== undefined && sNoRaw !== "" && !isNaN(parseFloat(sNoRaw));
    const isTotalLabel = /sub total|grand total/i.test(nameCell);

    if (!isNumericSNo && !isTotalLabel) {
      console.log(`[TN001] row[${i}] (Excel row ${i + 1}) skipped — sNo="${sNoRaw}", name="${nameCell}"`);
      continue; // skip notes / blank rows
    }
    console.log(`[TN001] row[${i}] (Excel row ${i + 1}) included — sNo="${sNoRaw}", name="${nameCell}", isTotalLabel=${isTotalLabel}`);

    const values = {
      Loans_Approved: getNum(row, 2),
      Loans_Outstanding: getNum(row, 3),
      Collateral_Value: getNum(row, 4),
      Provision_Held: getNum(row, 5),
      Loan_Status: getStr(row, 6),
    };

    entries.push({
      id: isTotalLabel ? `total-${i}` : String(sNoRaw).trim(),
      sNo: isTotalLabel ? "" : String(sNoRaw).trim(),
      label: nameCell,
      values,
      rowNumber: i + 1,
      level: 1,
      isTotalRow: isTotalLabel,
      isSectionHeader: false,
      children: [],
    });
  }

  entries.forEach((e) => {
    if (e.children && e.children.length === 0) delete e.children;
  });

  const columnNames = [
    "Loans_Approved",
    "Loans_Outstanding",
    "Collateral_Value",
    "Provision_Held",
    "Loan_Status",
  ];

  return {
    hierarchicalData: entries,
    columns: columnNames,
    additionalColumns: [],
    noandtitles,
  };
};

export default extractTop20NplsData;
