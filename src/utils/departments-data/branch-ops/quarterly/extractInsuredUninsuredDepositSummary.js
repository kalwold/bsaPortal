import { excelDateToISO } from "../../../utils";

// ---------------------------------------------------------------------------
// TODO: align these with reportTypes.js / departments.js / the department config
// ---------------------------------------------------------------------------
const RETURN_KEY = "001SD01001"; // cell A1 of the template
const REPORT_TYPE_ID = "branchOps-quarterly_insured-uninsured-deposit-summary";
const DEPARTMENT_ID = "branchOps";
const DEPARTMENT_NAME = "Branch Operation";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

// Safe for sparse rows: Array.from turns holes into undefined, so ?? "" works.
// Collapses newlines / repeated spaces and trims. Date objects become YYYY-MM-DD.
const cellText = (c) =>
  c instanceof Date
    ? c.toISOString().slice(0, 10)
    : String(c ?? "")
        .replace(/\s+/g, " ")
        .trim();

const cellsOf = (row) => Array.from(row || [], cellText);

const firstValueAfter = (cells, idx) => {
  for (let j = idx + 1; j < cells.length; j++) {
    if (cells[j] !== "") return cells[j];
  }
  return "";
};

const toIsoDate = (text) => {
  if (!text) return "";
  // if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  return excelDateToISO(text) || "";
};

const sanitizeKey = (text) =>
  text
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

// Header of the "number" column in the data table: No / S.No. / Code
const CODE_HEADER_RE = /^(s\.?\s*no\.?|sr\.?\s*no\.?|no\.?|code)$/i;
// Row codes such as 1, 2.1, 3.1.1 (a trailing dot is tolerated)
const CODE_RE = /^\d+(\.\d+)*\.?$/;
const TOTAL_RE = /^(grand\s+|sub[\s-]*)?total\b/i;
const FOOTER_RE = /^(general\s+information|notes?\b|source\b|\*)/i;
const COUNT_HEADER_RE =
  /(number|no\.?\s+of|count|#|depositors|borrowers|accounts)/i;

const findHeaderRow = (data) => {
  for (let i = 0; i < data.length; i++) {
    const cells = cellsOf(data[i]);
    if (CODE_HEADER_RE.test(cells[0] || "") && cells.slice(1).some(Boolean)) {
      return i;
    }
  }
  return -1;
};

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------
export const extractInsuredUninsuredDepositSummaryMetadata = (data) => {
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

  const headerIdx = findHeaderRow(data);
  const limit = headerIdx >= 0 ? headerIdx : Math.min(data.length, 20);

  for (let i = 0; i < limit; i++) {
    const cells = cellsOf(data[i]);
    const labelIdx = cells.findIndex((c) => c !== "");
    if (labelIdx === -1) continue;

    // Label may be in A or B (merged A:B); value is the first non-empty cell to its right
    const label = cells[labelIdx];
    const value = firstValueAfter(cells, labelIdx);

    // First non-empty row = return key
    if (!metadata.ReturnKey) {
      metadata.ReturnKey = label;
      if (label.includes(RETURN_KEY)) {
        metadata.reportType = REPORT_TYPE_ID;
        metadata.reportTypeId = REPORT_TYPE_ID;
        metadata.departmentId = DEPARTMENT_ID;
        metadata.departmentName = DEPARTMENT_NAME;
      }
      continue;
    }

    if (/^insti\w*\s*code/i.test(label)) {
      metadata.institutionCode = value;
    } else if (/^financial\s*year/i.test(label)) {
      metadata.financialYear = value;
    } else if (/^start\s*date/i.test(label)) {
      metadata.startDate = toIsoDate(value);
    } else if (/^end\s*date/i.test(label)) {
      metadata.endDate = toIsoDate(value);
    } else if (
      /^\(?\s*(amounts?\s+)?(are\s+)?in\s+(birr|etb|thousands?|millions?|'?000)/i.test(
        label,
      )
    ) {
      metadata.unit = label;
    } else if (/^unit/i.test(label)) {
      metadata.unit = value;
    } else if (!metadata.reportTitle && value === "") {
      // Title row: a lone text cell above the labelled metadata rows
      metadata.reportTitle = label;
    }
  }

  return metadata;
};

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const FALLBACK_COLUMNS = [
  "Current_Quarter_Number_of_Depositors",
  "Current_Quarter_Amount_of_Deposits",
];
const FALLBACK_TITLES = ["No", "Particulars"];

// Number of levels in a code. Numeric cells can only encode two levels
// (2.1) and lose trailing zeros (1.10 -> 1.1), so only depth is read, never position.
const codeDepth = (rawCode, text) => {
  if (typeof rawCode === "number") return Number.isInteger(rawCode) ? 1 : 2;
  return text.replace(/\.+$/, "").split(".").filter(Boolean).length || 1;
};

const formatValue = (v, isCount) => {
  if (v === null || v === undefined) return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);

  let num;
  if (typeof v === "number") {
    num = v;
  } else {
    let s = String(v).replace(/[,%\s]/g, "");
    if (s === "") return null;
    const negative = /^\(.*\)$/.test(s);
    if (negative) s = s.slice(1, -1);
    num = parseFloat(s);
    if (negative) num = -num;
  }
  return Number.isFinite(num) ? num.toFixed(isCount ? 0 : 2) : null;
};

const extractInsuredUninsuredDepositSummaryData = (data) => {
  const headerIdx = findHeaderRow(data);
  if (headerIdx === -1) {
    return {
      hierarchicalData: [],
      columns: FALLBACK_COLUMNS,
      additionalColumns: [],
      noandtitles: FALLBACK_TITLES,
    };
  }

  // ---- Header: column positions are read from the header row ----
  const headerCells = cellsOf(data[headerIdx]);
  const labelIdx = headerCells.findIndex((c, j) => j > 0 && c !== "");
  const noandtitles = [headerCells[0], headerCells[labelIdx]];

  const valueCols = [];
  const usedKeys = new Set();
  for (let j = labelIdx + 1; j < headerCells.length; j++) {
    if (headerCells[j] === "") continue;
    let key = sanitizeKey(headerCells[j]) || `Column_${j + 1}`;
    while (usedKeys.has(key)) key += `_${j + 1}`;
    usedKeys.add(key);
    valueCols.push({
      idx: j,
      key,
      isCount: COUNT_HEADER_RE.test(headerCells[j]),
    });
  }
  if (valueCols.length === 0) {
    return {
      hierarchicalData: [],
      columns: FALLBACK_COLUMNS,
      additionalColumns: [],
      noandtitles,
    };
  }

  // ---- Rows ----
  const roots = [];
  const stack = []; // structural ancestors: { node, depth, sNo, childCount, emitted }
  const usedIds = new Set();
  let rootCount = 0;

  for (let i = headerIdx + 1; i < data.length; i++) {
    const row = data[i];
    if (!row) continue;

    const raw = Array.from(row);
    const cells = cellsOf(row);
    const codeText = cells[0] || "";
    const label = cells[labelIdx] || "";
    const hasCode = codeText !== "";

    // Footer notes: stop
    if (hasCode && !CODE_RE.test(codeText)) break;
    if (!hasCode && FOOTER_RE.test(label)) break;

    // Rows with no code and no label (blank rows, helper columns): skip, not counted
    if (!hasCode && !label) continue;

    // ---- Structure ----
    let depth;
    let parentRec = null;
    let sNo = "";

    if (hasCode) {
      depth = codeDepth(raw[0], codeText);
      while (stack.length && stack[stack.length - 1].depth >= depth)
        stack.pop();
      parentRec = stack.length ? stack[stack.length - 1] : null;
      // Number by position inside the parent, never from the code text
      const n = parentRec ? ++parentRec.childCount : ++rootCount;
      sNo = parentRec ? `${parentRec.sNo}.${n}` : String(n);
    } else {
      // Uncoded row (e.g. "Grand Total"): top level, document order
      depth = 1;
      stack.length = 0;
    }

    const rec = { node: null, depth, sNo, childCount: 0, emitted: false };
    if (hasCode) stack.push(rec);

    // Blank pre-numbered template row: counted above, but not emitted
    if (!label) continue;

    // Nearest emitted ancestor holds the node as a child
    let container = null;
    for (let k = stack.length - 2; k >= 0; k--) {
      if (stack[k].emitted) {
        container = stack[k];
        break;
      }
    }

    let id = sNo || `row-${i + 1}`;
    if (usedIds.has(id)) id = `${id}-r${i + 1}`;
    usedIds.add(id);

    const values = {};
    valueCols.forEach(({ idx, key, isCount }) => {
      values[key] = formatValue(raw[idx], isCount);
    });

    const node = {
      id,
      sNo,
      label,
      values,
      rowNumber: i + 1,
      level: container ? container.node.level + 1 : 0,
      isTotalRow: !hasCode && TOTAL_RE.test(label),
      isSectionHeader: hasCode && depth === 1,
      children: [],
    };

    rec.node = node;
    rec.emitted = true;
    (container ? container.node.children : roots).push(node);
  }

  // ---- Finalise: coded aggregate rows ("Total ... (Sum ...)") are totals; drop empty children ----
  const finalise = (nodes) => {
    nodes.forEach((node) => {
      if (node.children.length > 0) {
        if (node.sNo && TOTAL_RE.test(node.label)) node.isTotalRow = true;
        finalise(node.children);
      } else {
        delete node.children;
      }
    });
  };
  finalise(roots);

  return {
    hierarchicalData: roots,
    columns: valueCols.map((c) => c.key),
    additionalColumns: [],
    noandtitles,
  };
};

export default extractInsuredUninsuredDepositSummaryData;
