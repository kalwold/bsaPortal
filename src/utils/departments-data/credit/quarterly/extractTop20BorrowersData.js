import { excelDateToISO } from "../../../utils";

export const extractTop20BorrowersMetadata = (data) => {
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

      if (firstCell.includes("TOP_20_BOR_TB001") || firstCell.includes("TB001")) {
        metadata.reportType = "credit-quarterly_top20-borrowers";
        metadata.reportTypeId = "credit-quarterly_top20-borrowers";
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

// Columns (0-based): A S.No. | B Name of Borrower | C Collateral Value |
// D Bank's Capital | E Approved loan (A) | F Outstanding balance (B) |
// G Off balance sheet (C) | H Total outstanding exposure (D=B+C) |
// I % of Capital | J Status
const extractTop20BorrowersData = (data) => {
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

  console.log('[TB001] "S.No." header found at row index:', headerRowIdx,
    headerRowIdx === -1 ? '(NOT FOUND — check that A14 literally reads "S.No.")' : `(Excel row ${headerRowIdx + 1})`);

  if (headerRowIdx === -1) {
    return { hierarchicalData: [], columns: [], additionalColumns: [], noandtitles };
  }

  // Header spans 4 rows (main header, on/off balance sheet, approved/outstanding, A/B/C/D=B+C)
  const dataTableStart = headerRowIdx + 4;
  console.log('[TB001] data rows expected to start at index:', dataTableStart, `(Excel row ${dataTableStart + 1})`);

    const getNum = (row, idx) => {
    if (idx < row.length) {
      const raw = row[idx];
      if (raw === undefined || raw === null || String(raw).trim() === "") return "0";
      // Cells arrive from XLSX as formatted display strings (the parser
      // calls sheet_to_json with raw:false), e.g. "7,877,545.00" for a
      // number formatted with thousands separators. parseFloat() stops
      // at the first non-numeric character, so parseFloat("7,877,545.00")
      // silently returns 7 instead of 7877545 — that's the bug that was
      // truncating every value in the GUI (7.00, 54.00, 6.00, 447.00...).
      // Strip commas (and any stray whitespace) before parsing.
      const cleaned = String(raw).replace(/,/g, "").trim();
      const val = parseFloat(cleaned);
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
      console.log(`[TB001] row[${i}] (Excel row ${i + 1}) skipped — sNo="${sNoRaw}", name="${nameCell}"`);
      continue; // skip notes / blank rows
    }
    console.log(`[TB001] row[${i}] (Excel row ${i + 1}) included — sNo="${sNoRaw}", name="${nameCell}", isTotalLabel=${isTotalLabel}`);

    const values = {
      Collateral_Value: getNum(row, 2),
      Banks_Capital: getNum(row, 3),
      Approved_Loan_A: getNum(row, 4),
      Outstanding_Balance_B: getNum(row, 5),
      Off_Balance_Sheet_C: getNum(row, 6),
      Total_Outstanding_Exposure_D: getNum(row, 7),
      Percent_of_Capital: getStr(row, 8),
      Status: getStr(row, 9),
    };

    entries.push({
      id: isTotalLabel ? "" : String(sNoRaw).trim(),
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
    "Collateral_Value",
    "Banks_Capital",
    "Approved_Loan_A",
    "Outstanding_Balance_B",
    "Off_Balance_Sheet_C",
    "Total_Outstanding_Exposure_D",
    "Percent_of_Capital",
    "Status",
  ];

  return {
    hierarchicalData: entries,
    columns: columnNames,
    additionalColumns: [],
    noandtitles,
  };
};

export default extractTop20BorrowersData;
