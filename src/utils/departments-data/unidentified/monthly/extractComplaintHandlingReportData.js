import { excelDateToISO } from "../../../utils";

// TODO: align these with REPORT_TYPES / your department config
const REPORT_TYPE_ID = "unidentified-monthly_complaint-handling";
const DEPARTMENT_ID = "unidentified";
const DEPARTMENT_NAME = "Unidentified";

/* ------------------------------------------------------------------ */
/*  Shared helpers                                                     */
/* ------------------------------------------------------------------ */

// Rows from sheet_to_json({ header: 1 }) are sparse: empty cells are holes.
// Array.from visits every index (holes become undefined), unlike .map().
const toCells = (row) => Array.from(row || [], (c) => String(c ?? "").trim());

const collapse = (s) => String(s ?? "").replace(/\s+/g, " ").trim();

// Header row of the data table: first cell "Items" with region names to the right.
const findHeaderRowIdx = (data) => {
  for (let i = 0; i < data.length; i++) {
    const cells = toCells(data[i]);
    if (cells.length === 0) continue;
    if (/^items?$/i.test(cells[0]) && cells.slice(1).some((c) => c !== "")) {
      return i;
    }
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
export const extractComplaintHandlingReportMetadata = (data) => {
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

  // Header block sits above the data table: key, institution code,
  // financial year, start date, end date, (blank), title, then "Items" row.
  const headerRowIdx = findHeaderRowIdx(data);
  const limit = headerRowIdx === -1 ? Math.min(data.length, 12) : headerRowIdx;

  for (let i = 0; i < limit; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const cells = toCells(row);
    const label = cells[0] || "";
    if (!label) continue;

    // Fields have no fixed column / merged cell: take the first non-empty
    // cell to the right of the label (keep the raw value for dates).
    const valueIdx = cells.findIndex((c, idx) => idx > 0 && c !== "");
    const valueCell = valueIdx === -1 ? "" : cells[valueIdx];
    const valueRaw = valueIdx === -1 ? "" : row[valueIdx];

    if (i === 0) {
      metadata.ReturnKey = label;

      if (label.includes("CHFCPE001") || label.includes("CHFCPE")) {
        metadata.reportType = REPORT_TYPE_ID;
        metadata.reportTypeId = REPORT_TYPE_ID;
        metadata.departmentId = DEPARTMENT_ID;
        metadata.departmentName = DEPARTMENT_NAME;
      }
      continue;
    }

    // "Financial Institution  Code" (double space / typos in other templates)
    if (/insti\w*\s*code/i.test(label)) {
      metadata.institutionCode = valueCell;
    } else if (/financial\s*year/i.test(label)) {
      metadata.financialYear = valueCell;
    } else if (/start\s*date/i.test(label)) {
      metadata.startDate = dateCellToISO(valueRaw);
    } else if (/end\s*date/i.test(label)) {
      metadata.endDate = dateCellToISO(valueRaw);
    } else if (!metadata.reportTitle) {
      // First remaining text row above the table is the title
      // ("Monthly Complaints Report"); collapse newlines from merged titles.
      metadata.reportTitle = collapse(label);
    }
  }

  return metadata;
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const DEFAULT_TITLES = ["S/No", "Items"];

// "B/Gumuz" -> "B_Gumuz", "Addis Ababa" -> "Addis_Ababa"
const sanitizeKey = (text) =>
  String(text ?? "")
    .trim()
    .replace(/[/\\&-]+/g, " ")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

// Blank / non-numeric / zero -> null so the UI shows "-" (the sheet's own
// number format also renders zero as "-"). Amounts as strings, like the sample.
const toAmount = (raw) => {
  if (raw === null || raw === undefined || raw === "") return null;
  const n =
    typeof raw === "number"
      ? raw
      : parseFloat(String(raw).replace(/[,%\s]/g, ""));
  if (isNaN(n) || n === 0) return null;
  return n.toFixed(2);
};

// "1.0 Summary of the ..." (digits, dot, digits, space, text). Deliberately
// requires the dot so item rows like "11 to 30" or "16-34yrs" don't match.
const SECTION_RE = /^\d+\.\d+\s+\S/;
const SECTION_PREFIX_RE = /^\d+\.\d+\s+/;
const TOTAL_RE = /^(sub\s*)?total\b/i;

const isFooterRow = (cells) => {
  const label = cells[0] || "";
  if (/^report\s+(prepared|approved)/i.test(label)) return true;
  if (/^notes?\b/i.test(label)) return true;
  // "Name | Signiture | Date" sign-off block
  return (
    cells.some((c) => /^name$/i.test(c)) && cells.some((c) => /^sign/i.test(c))
  );
};

const extractComplaintHandlingReportData = (data) => {
  // ---- 1. Locate the header row ("Items") ---------------------------------
  const headerRowIdx = findHeaderRowIdx(data);

  if (headerRowIdx === -1) {
    return {
      hierarchicalData: [],
      columns: [],
      additionalColumns: [],
      noandtitles: DEFAULT_TITLES,
    };
  }

  // ---- 2. Value columns = every named header cell right of the label ------
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

  const noandtitles = [DEFAULT_TITLES[0], headerCells[0] || DEFAULT_TITLES[1]];

  // ---- 3. Parse sections, items and totals --------------------------------
  const hierarchicalData = [];
  let currentSection = null;
  let sectionCount = 0;

  for (let i = headerRowIdx + 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const cells = toCells(row);
    if (isFooterRow(cells)) break;

    const rawLabel = collapse(cells[0]);

    const values = {};
    for (const def of columnDefs) {
      values[def.key] = toAmount(row[def.index]);
    }
    const hasValues = Object.values(values).some((v) => v !== null);

    if (!rawLabel && !hasValues) continue;

    // -- Section header ------------------------------------------------------
    if (SECTION_RE.test(rawLabel) && !hasValues) {
      sectionCount += 1;
      const id = String(sectionCount);
      currentSection = {
        id,
        sNo: id,
        label: rawLabel.replace(SECTION_PREFIX_RE, ""),
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
    const isTotalRow = TOTAL_RE.test(rawLabel);

    // Number by position inside the parent (codes in the sheet are not used).
    // Ids stay unique because the position is unique within each parent.
    const parent = currentSection;
    const position = parent ? parent.children.length + 1 : hierarchicalData.length + 1;
    const id = parent ? `${parent.id}.${position}` : `r${position}`;

    const node = {
      id,
      sNo: isTotalRow ? "" : id,
      label: rawLabel,
      values,
      rowNumber: i + 1,
      level: parent ? 1 : 0,
      isTotalRow,
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

export default extractComplaintHandlingReportData;
