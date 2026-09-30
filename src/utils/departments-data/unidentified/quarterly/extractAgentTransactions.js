import { excelDateToISO } from "../../../utils";

// report type for QA001
const REPORT_TYPE_ID = "unidentified-quarterly_agent-transaction-by-type-and-amount";
const DEPARTMENT_ID = "unidentified";
const DEPARTMENT_NAME = "Unidentified";

const clean = (v) => String(v ?? "").replace(/\s+/g, " ").trim();
const isFilled = (v) => v !== undefined && v !== null && String(v).trim() !== "";

/* ------------------------------------------------------------------ */
/* Metadata                                                            */
/* Layout: A1 return key, A4 title (merged A4:D7), A8:B11 labels        */
/* (merged) with the value in C.                                        */
/* ------------------------------------------------------------------ */
export const extractAgentTransactionsMetadata = (data) => {
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

    // Value of a label row: first filled cell to the right of the merged label (C..F)
    const labelValue = (() => {
      for (let c = 1; c <= 5; c++) {
        if (isFilled(row[c])) return String(row[c]).trim();
      }
      return "";
    })();

    if (i === 0) {
      if (!firstCell) continue;
      metadata.ReturnKey = firstCell;
      if (firstCell.toUpperCase().includes("QA001")) {
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
  }

  return metadata;
};

/* ------------------------------------------------------------------ */
/* Data                                                                */
/*                                                                     */
/* Excel columns (0-based index) and how each one is read:             */
/*   A S.No. (1..11)                                                    */
/*   B Type of Transactions   (row label, one row per transaction type)*/
/*   C Number of Transactions -> number                                 */
/*   D Amount of Transactions in Birr -> amount                         */
/*   Last row = Total (Sum 1-11): SUM(C15:C25) / SUM(D15:D25)           */
/*                                                                     */
/* The viewer prints `noandtitles` + `columns` as the table header and */
/* looks every cell up in row.values[column], so the column names below */
/* are the titles from the Excel header (lowercase, underscores).      */
/* ------------------------------------------------------------------ */
const NO_AND_TITLES = ["S.No.", "Type of Transactions"]; // S.No. cell + label cell

const TITLES = {
  count: "number_of_transactions",
  amount: "amount_of_transactions_in_birr",
};

const COLUMNS = [TITLES.count, TITLES.amount];

// Input cells: key -> Excel column index
const INPUT_COLUMNS = {
  count: 2,
  amount: 3,
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

// Numeric cells of a row, keyed by the header titles
const buildValues = (n) => ({
  [TITLES.count]: formatValue(n.count),
  [TITLES.amount]: formatValue(n.amount),
});

const extractAgentTransactionsData = (data) => {
  // 1. Header row: "S.No." | "Type of Transactions" (single header row)
  let dataTableStart = -1;
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = clean(row[0]).toLowerCase();
    const secondCell = clean(row[1]).toLowerCase();
    if (firstCell.startsWith("s.no") && secondCell.includes("type of transaction")) {
      dataTableStart = i + 1;
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

  // 2. Entries: one row per transaction type. The type names are pre-filled in
  //    the template, so a row counts when its name or a number is filled in.
  const rows = [];
  const totals = {};
  for (const key of Object.keys(INPUT_COLUMNS)) totals[key] = 0;
  const inputIndexes = [1, ...Object.values(INPUT_COLUMNS)];
  let totalLabel = "Total";
  let totalRowNumber = 0;

  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const firstCell = clean(row[0]);
    const label = clean(row[1]);

    if (firstCell.toLowerCase().startsWith("note")) break; // footnotes, if any

    // "Total (Sum 1-11)" sits in B with S.No. blank - rebuilt from the rows above
    if (label.toLowerCase().startsWith("total")) {
      totalLabel = label;
      totalRowNumber = i + 1;
      continue;
    }

    if (!inputIndexes.some((idx) => isFilled(row[idx]))) continue; // blank row

    const nums = readInputs(row);
    for (const key of Object.keys(totals)) totals[key] += nums[key];

    rows.push({
      id: firstCell || `row-${i}`,
      sNo: firstCell,
      label, // shown under the "Type of Transactions" title
      values: {
        type_of_transactions: label,
        ...buildValues(nums),
      },
      rowNumber: i + 1,
      level: 0,
      isTotalRow: false,
      isSubTotal: false,
      isGrandTotal: false,
    });
  }

  // 3. Total row (last row of the sheet): SUM of every input column
  const totalRow = {
    id: "total",
    sNo: "",
    label: totalLabel,
    values: {
      type_of_transactions: totalLabel,
      ...buildValues(totals),
    },
    rowNumber: totalRowNumber || dataTableStart + rows.length + 1,
    level: 0,
    isTotalRow: true,
    isSubTotal: false,
    isGrandTotal: true,
  };

  return {
    hierarchicalData: [...rows, totalRow],
    columns: COLUMNS,
    additionalColumns: [],
    noandtitles: NO_AND_TITLES,
  };
};

export default extractAgentTransactionsData;
