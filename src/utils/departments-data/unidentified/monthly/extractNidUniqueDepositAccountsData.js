import { excelDateToISO } from "../../../utils";

// TODO: align these with REPORT_TYPES / your department config
const REPORT_TYPE_ID = "unidentified-nid-unique-deposit-accounts";
const DEPARTMENT_ID = "unidentified";
const DEPARTMENT_NAME = "Unidentified";

/* ------------------------------------------------------------------ */
/*  Shared helpers                                                     */
/* ------------------------------------------------------------------ */

// Rows from sheet_to_json({ header: 1 }) are sparse: empty cells are holes.
// Array.from visits every index (holes become undefined), unlike .map().
const toCells = (row) => Array.from(row || [], (c) => String(c ?? "").trim());

const collapse = (s) => String(s ?? "").replace(/\s+/g, " ").trim();

// Header row of the record table: the row with the "National ID" column title.
const findHeaderRowIdx = (data) => {
  for (let i = 0; i < data.length; i++) {
    const cells = toCells(data[i]);
    if (cells.some((c) => /^national\s*id$/i.test(c))) return i;
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
export const extractNidUniqueDepositAccountsMetadata = (data) => {
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

  // Layout: A1 = return key; labels in column B (rows 1-4) with the value in
  // C (C:D merge); the report title sits in E3 (E3:G3 merge).
  const headerRowIdx = findHeaderRowIdx(data);
  const limit = headerRowIdx === -1 ? Math.min(data.length, 8) : headerRowIdx;

  for (let i = 0; i < limit; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const cells = toCells(row);

    if (i === 0 && cells[0]) {
      metadata.ReturnKey = cells[0];

      if (cells[0].includes("UQNID001") || cells[0].includes("UQNID")) {
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
    // the title in E3 whenever C3 is blank.
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

    // Title: text to the right of the label/value block (E onwards)
    if (!metadata.reportTitle) {
      const titleCell = cells.slice(4).find((c) => c !== "");
      if (titleCell) metadata.reportTitle = collapse(titleCell);
    }
  }

  return metadata;
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const DEFAULT_TITLES = ["S/No", "National ID"];

// "Account/Service Type" -> "Account_Service_Type"
const sanitizeKey = (text) =>
  String(text ?? "")
    .trim()
    .replace(/[/\\&-]+/g, " ")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

// This report is a list of records, not amounts: every cell is kept as TEXT
// (Age and the other columns are not money, so no toFixed). Blank -> null so
// the UI shows "-". Numbers are written out in full: a 16-digit National ID
// stored as a number must not show up as 1.23457E+15.
const cellText = (raw) => {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "number") {
    if (!isFinite(raw)) return null;
    return Number.isInteger(raw) ? raw.toFixed(0) : String(raw);
  }
  if (raw instanceof Date) {
    return isNaN(raw)
      ? null
      : `${raw.getFullYear()}-${pad(raw.getMonth() + 1)}-${pad(raw.getDate())}`;
  }
  const str = String(raw).trim();
  return str === "" ? null : str;
};

const extractNidUniqueDepositAccountsData = (data) => {
  // ---- 1. Locate the header row ("National ID") ---------------------------
  const headerRowIdx = findHeaderRowIdx(data);

  if (headerRowIdx === -1) {
    return {
      hierarchicalData: [],
      columns: [],
      additionalColumns: [],
      noandtitles: DEFAULT_TITLES,
    };
  }

  // ---- 2. Label column = "National ID"; value columns = the rest ---------
  // Column A is empty in the template (no S/No column), so the S/No is
  // generated. National ID becomes the row label, as the UI renders
  // [sNo] [label] [columns...].
  const headerCells = toCells(data[headerRowIdx]);
  const labelIdx = headerCells.findIndex((c) => /^national\s*id$/i.test(c));

  const columnDefs = [];
  const usedKeys = new Set();
  for (let c = labelIdx + 1; c < headerCells.length; c++) {
    if (!headerCells[c]) continue;
    let key = sanitizeKey(headerCells[c]) || `Column_${c}`;
    if (usedKeys.has(key)) key = `${key}_${c}`;
    usedKeys.add(key);
    columnDefs.push({ key, index: c });
  }
  const columns = columnDefs.map((d) => d.key);

  const noandtitles = [
    DEFAULT_TITLES[0],
    collapse(headerCells[labelIdx]) || DEFAULT_TITLES[1],
  ];

  // ---- 3. Parse the flat list of records ----------------------------------
  const nodes = [];

  for (let i = headerRowIdx + 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const label = cellText(row[labelIdx]) || "";
    if (/^notes?\b/i.test(label)) break;

    const values = {};
    for (const def of columnDefs) {
      values[def.key] = cellText(row[def.index]);
    }

    // The template ships with empty (dropdown-only) rows -> skip unfilled ones
    const hasContent =
      label !== "" || Object.values(values).some((v) => v !== null);
    if (!hasContent) continue;

    // Running record number: unique, so it is a safe React key / expand key
    const sNo = String(nodes.length + 1);

    nodes.push({
      id: sNo,
      sNo,
      label,
      values,
      rowNumber: i + 1,
      level: 1,
      isTotalRow: false,
      isSectionHeader: false,
    });
  }

  return {
    hierarchicalData: nodes,
    columns,
    additionalColumns: [],
    noandtitles,
  };
};

export default extractNidUniqueDepositAccountsData;
