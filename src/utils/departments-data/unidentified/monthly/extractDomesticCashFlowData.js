import { excelDateToISO } from "../../../utils";

// TODO: align these with REPORT_TYPES / your department config
const REPORT_TYPE_ID = "unidentified-monthly_domestic-cash-flow";
const DEPARTMENT_ID = "unidentified";
const DEPARTMENT_NAME = "Unidentified";

/* ------------------------------------------------------------------ */
/*  Shared helpers                                                     */
/* ------------------------------------------------------------------ */

// Rows from sheet_to_json({ header: 1 }) are sparse: empty cells are holes.
// Array.from visits every index (holes become undefined), unlike .map().
const toCells = (row) => Array.from(row || [], (c) => String(c ?? "").trim());

const collapse = (s) => String(s ?? "").replace(/\s+/g, " ").trim();

// Header row of the data table: the row that holds the "Amount" column title.
const findHeaderRowIdx = (data) => {
  for (let i = 0; i < data.length; i++) {
    const cells = toCells(data[i]);
    if (cells.some((c, idx) => idx > 0 && /^amount$/i.test(c))) return i;
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
export const extractDomesticCashFlowMetadata = (data) => {
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

  // Layout: A1 = return key; B2 = title; B3 = sheet tag ("User_Temp");
  // labels in column B (rows 4-7) with the value in C.
  const headerRowIdx = findHeaderRowIdx(data);
  const limit = headerRowIdx === -1 ? Math.min(data.length, 10) : headerRowIdx;

  for (let i = 0; i < limit; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const cells = toCells(row);

    if (i === 0 && cells[0]) {
      metadata.ReturnKey = cells[0];

      if (cells[0].includes("CASHFLOWSTD001") || cells[0].includes("CASHFLOWSTD")) {
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

    // Value = first non-empty cell right of the label (within the next 2
    // cells, so stray text further right is never taken as the value).
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
    } else if (i > 0 && !metadata.reportTitle && cells[1]) {
      // First remaining text row above the table = title (B2)
      metadata.reportTitle = collapse(cells[1]);
    }
  }

  // Unit ("In Millions of Birr") sits in the row under the "Amount" header
  if (headerRowIdx !== -1) {
    for (let i = headerRowIdx; i <= Math.min(headerRowIdx + 2, data.length - 1); i++) {
      const unit = toCells(data[i]).find((c, idx) => idx > 0 && /^in\s+\S+/i.test(c));
      if (unit) {
        metadata.unit = collapse(unit);
        break;
      }
    }
  }

  return metadata;
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const DEFAULT_TITLES = ["S/No", "Particulars"];

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

// Leading outline code of a row, tolerant of the template's typos:
//   "1.1.1.  Private"   "5. 2  Total ..."   "1.4.7 . Interest"   "10.Excess"
const CODE_RE = /^(\d+(?:\s*\.\s*\d+)*)\s*\.?\s*/;
// Lettered group headers: "A. Source of Funds", "B.  Uses of Funds"
const SECTION_RE = /^([A-Za-z])\.\s+(\S.*)$/;
const TOTAL_RE = /\btotal\b|^excess\s*\/\s*deficit/i;

const isFooterRow = (label) => /^(source|notes?)\b/i.test(label);

const extractDomesticCashFlowData = (data) => {
  // ---- 1. Locate the header row ("Amount") --------------------------------
  const headerRowIdx = findHeaderRowIdx(data);

  if (headerRowIdx === -1) {
    return {
      hierarchicalData: [],
      columns: [],
      additionalColumns: [],
      noandtitles: DEFAULT_TITLES,
    };
  }

  // ---- 2. Label column + value columns from the header --------------------
  // Labels live in column B (A is empty); value columns are the named header
  // cells to the right of the label column.
  const headerCells = toCells(data[headerRowIdx]);
  let labelIdx = headerCells.findIndex((c) => c !== "");
  if (labelIdx === -1) labelIdx = 1;

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

  // Header title is "Cash flow\n   Particulars" -> collapse whitespace
  const noandtitles = [
    DEFAULT_TITLES[0],
    collapse(headerCells[labelIdx]) || DEFAULT_TITLES[1],
  ];

  // ---- 3. Parse the outline ------------------------------------------------
  // Top level: lettered sections (A, B) followed by numbered rows 1..N.
  // Nesting comes from the DEPTH of each row's outline code, not its text:
  // a row's parent is the nearest previous row with a shallower code
  // (the template numbers some rows inconsistently, e.g. 5.3.x under 5.4).
  // S/No and ids are numbered by position, so they are always unique.
  const hierarchicalData = [];
  const usedIds = new Set();
  const stack = []; // { node, depth }
  let topCounter = 0;

  const uniqueId = (id, rowNumber) => {
    let out = id;
    if (usedIds.has(out)) out = `${out}_${rowNumber}`;
    usedIds.add(out);
    return out;
  };

  for (let i = headerRowIdx + 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const rawLabel = collapse(String(row[labelIdx] ?? ""));
    if (isFooterRow(rawLabel)) break;

    const values = {};
    for (const def of columnDefs) {
      values[def.key] = toAmount(row[def.index]);
    }
    const hasValues = Object.values(values).some((v) => v !== null);

    // Skips the unit row ("In Millions of Birr") and blank rows
    if (!rawLabel && !hasValues) continue;

    const codeMatch = rawLabel.match(CODE_RE);

    // -- Lettered section header ("A. Source of Funds") ----------------------
    const sectionMatch = !codeMatch && rawLabel.match(SECTION_RE);
    if (sectionMatch && !hasValues) {
      const id = uniqueId(sectionMatch[1].toUpperCase(), i + 1);
      hierarchicalData.push({
        id,
        sNo: sectionMatch[1].toUpperCase(),
        label: collapse(sectionMatch[2]),
        values,
        rowNumber: i + 1,
        level: 0,
        isTotalRow: false,
        isSectionHeader: true,
      });
      stack.length = 0;
      continue;
    }

    // -- Numbered row ----------------------------------------------------------
    const depth = codeMatch
      ? codeMatch[1].split(/\s*\.\s*/).filter(Boolean).length
      : 1;
    const label = collapse(codeMatch ? rawLabel.slice(codeMatch[0].length) : rawLabel);

    while (stack.length && stack[stack.length - 1].depth >= depth) stack.pop();
    const parent = stack.length ? stack[stack.length - 1].node : null;

    let id;
    if (parent) {
      id = uniqueId(`${parent.id}.${parent.children.length + 1}`, i + 1);
    } else {
      topCounter += 1;
      id = uniqueId(String(topCounter), i + 1);
    }

    const node = {
      id,
      sNo: id,
      label,
      values,
      rowNumber: i + 1,
      level: parent ? parent.level + 1 : 0,
      isTotalRow: TOTAL_RE.test(label),
      isSectionHeader: false,
      children: [],
    };

    if (parent) {
      parent.children.push(node);
    } else {
      hierarchicalData.push(node);
    }
    stack.push({ node, depth });
  }

  // Remove empty children arrays so the UI only shows chevrons where needed
  const cleanData = (nodes) => {
    nodes.forEach((node) => {
      if (node.children && node.children.length === 0) {
        delete node.children;
      } else if (node.children) {
        cleanData(node.children);
      }
    });
  };
  cleanData(hierarchicalData);

  return {
    hierarchicalData,
    columns,
    additionalColumns: [],
    noandtitles,
  };
};

export default extractDomesticCashFlowData;
