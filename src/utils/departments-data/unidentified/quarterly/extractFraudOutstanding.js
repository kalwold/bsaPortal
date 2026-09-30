import { excelDateToISO } from "../../../utils";

// report type for FO002
const REPORT_TYPE_ID = "unidentified-branchOps-quarterly_fraud-outstanding";
const DEPARTMENT_ID = "unidentified";
const DEPARTMENT_NAME = "Unidentified";

const clean = (v) => String(v ?? "").replace(/\s+/g, " ").trim();
const isFilled = (v) => v !== undefined && v !== null && String(v).trim() !== "";

/* ------------------------------------------------------------------ */
/* Metadata                                                            */
/* Layout: A1 return key, A4 title (merged A4:K7), A8:C11 labels        */
/* (merged) with the value in D, L13:M13 optional unit note.            */
/* ------------------------------------------------------------------ */
export const extractFraudOutstandingMetadata = (data) => {
  const metadata = {
    reportTitle: "",
    ReturnKey: "",
    institutionCode: "",
    financialYear: "",
    startDate: "",
    endDate: "",
    reportType: "",
    reportTypeId: "",
    unit: "",
    departmentName: "",
    departmentId: "",
  };

  // Everything above the table header (Excel rows 1-13)
  for (let i = 0; i < Math.min(data.length, 13); i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const firstCell = clean(row[0]);
    const label = firstCell.toLowerCase();

    // Value of a label row: first filled cell to the right of the merged label (D..F)
    const labelValue = (() => {
      for (let c = 1; c <= 5; c++) {
        if (isFilled(row[c])) return String(row[c]).trim();
      }
      return "";
    })();

    if (i === 0) {
      if (!firstCell) continue;
      metadata.ReturnKey = firstCell;
      if (firstCell.toUpperCase().includes("FO002")) {
        metadata.reportType = REPORT_TYPE_ID;
        metadata.reportTypeId = REPORT_TYPE_ID;
        metadata.departmentId = DEPARTMENT_ID;
        metadata.departmentName = DEPARTMENT_NAME;
      }
    } else if (label.includes("instiution") || label.includes("institution")) {
      metadata.institutionCode = labelValue;
    } else if (label.includes("financial year")) {
      metadata.financialYear = labelValue;
    } else if (label.includes("start date")) {
      metadata.startDate = excelDateToISO(labelValue) || "";
    } else if (label.includes("end date")) {
      metadata.endDate = excelDateToISO(labelValue) || "";
    } else if (i <= 6 && firstCell && !metadata.reportTitle) {
      // Rows 2-7: the merged title block
      metadata.reportTitle = firstCell;
    }

    // Row 13: optional unit note above the last two columns (L13:M13)
    if (i === 12) {
      for (let c = 0; c < row.length; c++) {
        if (isFilled(row[c])) {
          metadata.unit = clean(row[c]);
          break;
        }
      }
    }
  }

  return metadata;
};

/* ------------------------------------------------------------------ */
/* Data                                                                */
/*                                                                     */
/* Excel columns (0-based index) and what the sheet does with them:    */
/*   A S.No. (locked, pre-numbered 1..300)                             */
/*   B Category            C Type of Fraud                             */
/*   D (A) prev. quarter - Number     E (B) prev. quarter - Amount     */
/*   F (C) new cases - Number         G (D) new cases - Amount         */
/*   H (E) recovered - Number         I (F) recovered - Amount         */
/*   J (G) outstanding - Number  = A + C - E   <- formula, not input   */
/*   K (H) outstanding - Amount  = B + D - F   <- formula, not input   */
/*   L (I) written off - Amount       M (J) provision held - Amount    */
/*   Row 16 = Total: SUM of each input column, J/K use the same formulas*/
/*                                                                     */
/* The viewer prints `noandtitles` + `columns` as the table header and */
/* looks every cell up in row.values[column], so the column names below */
/* are the titles from the Excel header (lowercase, underscores).                         */
/* ------------------------------------------------------------------ */
const NO_AND_TITLES = ["S.No.", "Category"]; // S.No. cell + label cell (label = Category)

const TITLES = {
  fraudType: "type_of_fraud",
  prevNumber: "fraud_cases_outstanding_as_of_the_end_of_the_previous_quarter_number_a",
  prevAmount: "fraud_cases_outstanding_as_of_the_end_of_the_previous_quarter_amount_b",
  newNumber: "new_fraud_cases_reported_during_the_current_quarter_number_c",
  newAmount: "new_fraud_cases_reported_during_the_current_quarter_amount_d",
  recNumber: "fraud_amount_recovered_during_the_current_quarter_number_e",
  recAmount: "fraud_amount_recovered_during_the_current_quarter_amount_f",
  outNumber: "fraud_outstanding_at_the_end_of_the_current_quarter_number_g",
  outAmount: "fraud_outstanding_at_the_end_of_the_current_quarter_amount_h",
  writtenOff: "fraud_amount_written_off_during_the_current_quarter_i",
  provision: "provision_held_for_fraud_outstanding_as_of_end_of_current_quarter_j",
};

const COLUMNS = [
  TITLES.fraudType,
  TITLES.prevNumber,
  TITLES.prevAmount,
  TITLES.newNumber,
  TITLES.newAmount,
  TITLES.recNumber,
  TITLES.recAmount,
  TITLES.outNumber,
  TITLES.outAmount,
  TITLES.writtenOff,
  TITLES.provision,
];

// Input cells (the only ones a user types into): key -> Excel column index
const INPUT_COLUMNS = {
  prevNumber: 3,
  prevAmount: 4,
  newNumber: 5,
  newAmount: 6,
  recNumber: 7,
  recAmount: 8,
  writtenOff: 11,
  provision: 12,
};

// "1,500.50" -> 1500.5 | "(100.00)" -> -100 | " - " / "" -> 0
const toNumber = (raw) => {
  if (!isFilled(raw)) return 0;
  if (typeof raw === "number") return isNaN(raw) ? 0 : raw;
  let s = String(raw).replace(/,/g, "").trim();
  const negative = /^\(.*\)$/.test(s);
  s = s.replace(/[()\s]/g, "");
  const val = parseFloat(s);
  if (isNaN(val)) return 0;
  return negative ? -val : val;
};

const formatValue = (n) => (n === 0 ? "0" : n.toFixed(2));

// Input cells of one row as numbers
const readInputs = (row) => {
  const nums = {};
  for (const [key, idx] of Object.entries(INPUT_COLUMNS)) nums[key] = toNumber(row[idx]);
  return nums;
};

// Numeric cells of a row, keyed by the header titles.
// Outstanding uses the same formulas the sheet has in J and K (and on the Total row).
const buildValues = (n) => ({
  [TITLES.prevNumber]: formatValue(n.prevNumber),
  [TITLES.prevAmount]: formatValue(n.prevAmount),
  [TITLES.newNumber]: formatValue(n.newNumber),
  [TITLES.newAmount]: formatValue(n.newAmount),
  [TITLES.recNumber]: formatValue(n.recNumber),
  [TITLES.recAmount]: formatValue(n.recAmount),
  [TITLES.outNumber]: formatValue(n.prevNumber + n.newNumber - n.recNumber),
  [TITLES.outAmount]: formatValue(n.prevAmount + n.newAmount - n.recAmount),
  [TITLES.writtenOff]: formatValue(n.writtenOff),
  [TITLES.provision]: formatValue(n.provision),
});

const extractFraudOutstandingData = (data) => {
  // 1. Header row: "S.No." | "Category" | "Type of Fraud" (Number/Amount sub-header is the next row)
  let dataTableStart = -1;
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = clean(row[0]).toLowerCase();
    const secondCell = clean(row[1]).toLowerCase();
    if (firstCell.startsWith("s.no") && secondCell.includes("category")) {
      dataTableStart = i + 2; // skip both header rows
      break;
    }
  }

  if (dataTableStart === -1) {
    return {
      hierarchicalData: [],
      columns: COLUMNS,
      additionalColumns: [],
      noandtitles: NO_AND_TITLES,
    };
  }

  // 2. Entries. Column A is pre-numbered for 300 rows, so a row only counts
  //    when something was typed into an input cell (B, C, D-I, L, M).
  const rows = [];
  const totals = {};
  for (const key of Object.keys(INPUT_COLUMNS)) totals[key] = 0;
  const inputIndexes = [1, 2, ...Object.values(INPUT_COLUMNS)];

  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const firstCell = clean(row[0]);

    if (firstCell.toLowerCase().startsWith("note")) break; // footnotes start here
    if (firstCell.toLowerCase() === "total") continue; // rebuilt from the rows below

    if (!inputIndexes.some((idx) => isFilled(row[idx]))) continue; // blank template row

    const nums = readInputs(row);
    for (const key of Object.keys(totals)) totals[key] += nums[key];

    rows.push({
      id: firstCell || `row-${i}`,
      sNo: firstCell,
      label: clean(row[1]), // shown under the "Category" title
      values: {
        Category: clean(row[1]),
        [TITLES.fraudType]: clean(row[2]),
        ...buildValues(nums),
      },
      rowNumber: i + 1,
      level: 0,
      isTotalRow: false,
      isSubTotal: false,
      isGrandTotal: false,
    });
  }

  // 3. Total row (sits above the entries in the sheet): SUM of every input column
  const totalRow = {
    id: "total",
    sNo: "",
    label: "Total",
    values: {
      Category: "Total",
      [TITLES.fraudType]: "",
      ...buildValues(totals),
    },
    rowNumber: dataTableStart + 1,
    level: 0,
    isTotalRow: true,
    isSubTotal: false,
    isGrandTotal: true,
  };

  return {
    hierarchicalData: [totalRow, ...rows],
    columns: COLUMNS,
    additionalColumns: [],
    noandtitles: NO_AND_TITLES,
  };
};

export default extractFraudOutstandingData;