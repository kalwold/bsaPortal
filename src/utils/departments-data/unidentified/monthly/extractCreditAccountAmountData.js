import { excelDateToISO } from "../../../utils";

const REPORT_TYPE_ID = "unidentified-credit-account-amount-con-bank";
const DEPARTMENT_ID = "unidentified";
const DEPARTMENT_NAME = "Unidentified";
// The template has no title row (only the sheet name "Credit Account & Amount")
// TODO: replace with the title you want shown for this report
const REPORT_TITLE = "Credit Account & Amount Con Bank Report";

// The sheet has red "CHECK_..." rows (e.g. CHECK_Age=Total): formulas whose
// result should be 0. They are part of the report, so they are kept (shown as
// "-" when 0). Set to true only if you ever want to hide them.
const SKIP_CHECK_ROWS = false;

/* ------------------------------------------------------------------ */
/*  Shared helpers                                                     */
/* ------------------------------------------------------------------ */

// Rows from sheet_to_json({ header: 1 }) are sparse: empty cells are holes.
// Array.from visits every index (holes become undefined), unlike .map().
const toCells = (row) => Array.from(row || [], (c) => String(c ?? "").trim());

const collapse = (s) => String(s ?? "").replace(/\s+/g, " ").trim();

// Header row of the data table: the first row with at least 5 non-empty
// cells to the right of column A (the region names). The metadata rows above
// it have at most 3 filled cells.
const findHeaderRowIdx = (data) => {
  for (let i = 0; i < data.length; i++) {
    const cells = toCells(data[i]);
    if (cells.slice(1).filter((c) => c !== "").length >= 5) return i;
  }
  return -1;
};

// Date cell -> ISO string. Handles serial number, Date object or text.
const pad = (n) => String(n).padStart(2, "0");
const dateCellToISO = (raw) => {
  if (raw === null || raw === undefined || raw === "") return "";
  if (raw instanceof Date) {
    return isNaN(raw)
      ? ""
      : `${raw.getFullYear()}-${pad(raw.getMonth() + 1)}-${pad(raw.getDate())}`;
  }
  return excelDateToISO(String(raw).trim()) || "";
};

/* ------------------------------------------------------------------ */
/*  Metadata                                                           */
/* ------------------------------------------------------------------ */
export const extractCreditAccountAmountMetadata = (data) => {
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

  // Layout: A1 = return key; labels sit in column B (rows 1-4) and the value
  // is in C, a C:D merge. Other text in the block (e.g. "Conventional Credit"
  // in F2) is not a value.
  const headerRowIdx = findHeaderRowIdx(data);
  const limit = headerRowIdx === -1 ? Math.min(data.length, 8) : headerRowIdx;

  for (let i = 0; i < limit; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const cells = toCells(row);

    if (i === 0 && cells[0]) {
      metadata.ReturnKey = cells[0];

      if (cells[0].includes("CRECON001") || cells[0].includes("CRECON")) {
        metadata.reportType = REPORT_TYPE_ID;
        metadata.reportTypeId = REPORT_TYPE_ID;
        metadata.departmentId = DEPARTMENT_ID;
        metadata.departmentName = DEPARTMENT_NAME;
      }
    }

    // The label is in A or B depending on the row, so test both.
    const matchLabel = (re) => {
      const idx = [0, 1].find((k) => cells[k] && re.test(cells[k]));
      return idx === undefined ? -1 : idx;
    };

    // Value = first non-empty cell right of the label, but only within the
    // label's merged span (the next 2 cells). Looking further would pick up
    // the stray "Conventional Credit" text in F2 when the value is blank.
    const valueAfter = (labelIdx) => {
      for (let k = labelIdx + 1; k <= labelIdx + 2; k++) {
        if (cells[k]) return { text: cells[k], raw: row[k] };
      }
      return { text: "", raw: "" };
    };

    let idx;
    if ((idx = matchLabel(/insti\w*\s*code/i)) !== -1) {
      metadata.institutionCode = valueAfter(idx).text;
    } else if ((idx = matchLabel(/financial\s*year/i)) !== -1) {
      metadata.financialYear = valueAfter(idx).text;
    } else if ((idx = matchLabel(/start\s*date/i)) !== -1) {
      metadata.startDate = dateCellToISO(valueAfter(idx).raw);
    } else if ((idx = matchLabel(/end\s*date/i)) !== -1) {
      metadata.endDate = dateCellToISO(valueAfter(idx).raw);
    }
  }

  // No title row in this template -> fall back to the constant
  metadata.reportTitle = collapse(REPORT_TITLE);

  return metadata;
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const DEFAULT_TITLES = ["S/No", "Particulars"];

// "A/A" -> "A_A", "B/G" -> "B_G", "Total" -> "Total"
const sanitizeKey = (text) =>
  String(text ?? "")
    .trim()
    .replace(/[/\\&-]+/g, " ")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

// Blank / non-numeric / zero -> null so the UI shows "-". Amounts as strings
// (toFixed(2)), like the sample.
const toAmount = (raw) => {
  if (raw === null || raw === undefined || raw === "") return null;
  const n =
    typeof raw === "number"
      ? raw
      : parseFloat(String(raw).replace(/[,%\s]/g, ""));
  if (isNaN(n) || n === 0) return null;
  return n.toFixed(2);
};

// "Total", "Age_Total", "Location_Total", "Pass – Total" are totals;
// "Total_Male", "Total_Business" are ordinary breakdown rows.
const TOTAL_RE = /(^|[_\s\u2013\u2014-])total$/i;
const CHECK_RE = /^check[_\s]/i;

const isFooterRow = (cells) => /^notes?\b/i.test(cells[0] || "");

const extractCreditAccountAmountData = (data) => {
  // ---- 1. Locate the header row (region names) ----------------------------
  const headerRowIdx = findHeaderRowIdx(data);

  if (headerRowIdx === -1) {
    return {
      hierarchicalData: [],
      columns: [],
      additionalColumns: [],
      noandtitles: DEFAULT_TITLES,
    };
  }

  // ---- 2. Value columns = every named header cell right of column A -------
  // (A5 is empty in this template; B5 "A/A" is already a region column.)
  const headerCells = toCells(data[headerRowIdx]);
  const columnDefs = [];
  const usedKeys = new Set();
  for (let c = 1; c < headerCells.length; c++) {
    if (!headerCells[c]) continue;
    let key = sanitizeKey(headerCells[c]) || `Column_${c}`;
    if (usedKeys.has(key)) key = `${key}_${c}`;
    usedKeys.add(key);
    columnDefs.push({ key, index: c });
  }
  const columns = columnDefs.map((d) => d.key);

  const noandtitles = [
    DEFAULT_TITLES[0],
    headerCells[0] || DEFAULT_TITLES[1],
  ];

  // ---- 3. Parse sections, items and totals --------------------------------
  const hierarchicalData = [];
  let currentSection = null;
  let sectionCount = 0;

  for (let i = headerRowIdx + 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const cells = toCells(row);
    if (isFooterRow(cells)) break;

    const label = collapse(cells[0]);

    if (SKIP_CHECK_ROWS && CHECK_RE.test(label)) continue;

    const values = {};
    for (const def of columnDefs) {
      values[def.key] = toAmount(row[def.index]);
    }
    const hasValues = Object.values(values).some((v) => v !== null);

    // A section header has a label in A and NOTHING else on the row. Item rows
    // always carry at least the "Total" formula cell in column P (even when it
    // is 0 and the inputs are blank), so "any cell right of A" marks an item.
    const hasCellsRightOfA = cells.slice(1).some((c) => c !== "");

    if (!label && !hasValues) continue;

    // -- Section header ------------------------------------------------------
    if (label && !hasCellsRightOfA) {
      sectionCount += 1;
      const id = String(sectionCount);
      currentSection = {
        id,
        sNo: id,
        label,
        values,
        rowNumber: i + 1,
        level: 0,
        isTotalRow: false,
        isSectionHeader: true,
        children: [],
      };
      hierarchicalData.push(currentSection);
      continue;
    }

    // -- Item / total row ----------------------------------------------------
    const isCheckRow = CHECK_RE.test(label);
    const isTotalRow = !isCheckRow && TOTAL_RE.test(label);

    // Ids use the position inside the parent (unique, never from sheet codes).
    // S/No counts only real items, so Total rows don't leave gaps (e.g. 18.3).
    const parent = currentSection;
    const position = parent
      ? parent.children.length + 1
      : hierarchicalData.length + 1;
    const id = parent ? `${parent.id}.${position}` : `r${position}`;
    const isPlainItem = (n) => !n.isTotalRow && !n.isCheckRow && !n.isSectionHeader;
    let sNo = "";
    if (!isTotalRow && !isCheckRow) {
      const itemNo = parent
        ? parent.children.filter(isPlainItem).length + 1
        : hierarchicalData.filter(isPlainItem).length + 1;
      sNo = parent ? `${parent.id}.${itemNo}` : String(itemNo);
    }

    const node = {
      id,
      sNo,
      label,
      values,
      rowNumber: i + 1,
      level: parent ? 1 : 0,
      isTotalRow,
      isCheckRow, // extra flag (ignored by ReportDataTable)
      isSectionHeader: false,
    };

    if (parent) {
      parent.children.push(node);
    } else {
      hierarchicalData.push(node);
    }
  }

  // Remove empty children arrays so the UI only shows chevrons where needed
  for (const node of hierarchicalData) {
    if (node.children && node.children.length === 0) delete node.children;
  }

  return {
    hierarchicalData,
    columns,
    additionalColumns: [],
    noandtitles,
  };
};

export default extractCreditAccountAmountData;