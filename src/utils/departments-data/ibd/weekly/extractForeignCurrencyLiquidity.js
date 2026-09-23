import { excelDateToISO } from "../../../utils";

// TODO confirm department / id for the registry
const REPORT_TYPE_ID = "ibd-weekly_foreign-currency-liquidity";

const FIRST_VALUE_COL = 2; // A = No., B = FX, values start at C
const HEADER_DEPTH = 3; // rows 9-11; row 12 is the formula legend
const ANCHOR_RE = /^(s\.?\s*no\.?|no\.?)$/i;

// 0-based rows of the top block in this template
const ROW = { title: 3, institution: 4, financialYear: 5, startDate: 6, endDate: 7, unit: 7 };

const TOTAL_RE = /total/i;
const UNIT_RE = /million|thousand/i; // "(Amount in Thousands)"

// All lines of a header cell joined, made safe to use as an object key.
const cleanHeader = (text) =>
  String(text ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l !== "")
    .join(" ")
    .replace(/['’`]/g, "")
    .replace(/%/g, "Percent ")
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const getStr = (row, idx) => (row && idx < row.length ? String(row[idx] ?? "").trim() : "");

// Numbers may arrive as formatted text ("1,250.50", "12.5%"). Blank / zero -> "0".
const getNum = (row, idx) => {
  if (row && idx < row.length) {
    const val = parseFloat(String(row[idx] ?? "").replace(/[,%\s]/g, ""));
    if (!isNaN(val) && val !== 0) return val.toFixed(2);
  }
  return "0";
};

// Finds the header block: [headerRowIdx, dataTableStart)
const locateHeader = (data) => {
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    if (ANCHOR_RE.test(String(row[0] ?? "").trim())) {
      return { headerRowIdx: i, dataTableStart: i + HEADER_DEPTH };
    }
  }
  return { headerRowIdx: -1, dataTableStart: -1 };
};

// Builds [{ key, index, parent, child }] from the multi-row header.
// The legend cell right under the header ("A", "C=A+B", "F=E-D"...) contributes
// its column letter (text before "=") as the last part of the key.
const buildColumns = (data, headerRowIdx, dataTableStart) => {
  const headerRows = data.slice(headerRowIdx, dataTableStart);
  const legendRow = data[dataTableStart]; // first row after the header
  const width = Math.max(0, ...headerRows.map((r) => (r ? r.length : 0)));
  const cols = [];
  const used = new Set();
  let currentParent = "";

  for (let c = FIRST_VALUE_COL; c < width; c++) {
    const parts = headerRows.map((r) => cleanHeader(r ? r[c] : ""));
    const lowerHasText = parts.slice(1).some(Boolean);

    if (parts[0]) {
      currentParent = parts[0];
    } else if (lowerHasText) {
      // Merged parent header: only the first column of the merge holds text,
      // so carry the parent name across the merged range.
      parts[0] = currentParent;
    } else {
      continue; // empty column
    }

    const chain = parts.filter(Boolean).filter((p, i, a) => i === 0 || p !== a[i - 1]);
    const letter = cleanHeader(getStr(legendRow, c).split("=")[0]);
    const keyBase = [...chain, letter].filter(Boolean).join("_");
    let key = keyBase;
    let n = 2;
    while (used.has(key)) key = `${keyBase}_${n++}`;
    used.add(key);

    cols.push({
      key,
      index: c,
      parent: chain.length > 1 ? chain[0] : "",
      child: chain.length > 1 ? chain.slice(1).join("_") : chain[0],
    });
  }
  return cols;
};

export const extractForeignCurrencyLiquidityMetadata = (data) => {
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
    const firstLower = firstCell.toLowerCase();
    // Label cells are merged A:B, so the value can land in B, C, D...
    // Take the first non-empty cell after the label, ignoring the unit note
    // that shares the End Date row.
    const labelValue = (() => {
      for (let c = 1; c <= 5; c++) {
        const v = row[c];
        if (v !== undefined && v !== null && String(v).trim() !== "" && !UNIT_RE.test(String(v))) {
          return String(v).trim();
        }
      }
      return "";
    })();

    if (i === 0 && firstCell) {
      metadata.ReturnKey = firstCell;
      if (firstCell.includes("WFWFCL001") || firstCell.includes("WFCL001")) {
        metadata.reportType = REPORT_TYPE_ID;
        metadata.reportTypeId = REPORT_TYPE_ID;
        metadata.departmentId = "ibd";
        metadata.departmentName = "IBD";
      }
    }

    if (i === ROW.title && firstCell) {
      metadata.reportTitle = firstCell.replace(/\s+/g, " ").trim();
    }

    if (i === ROW.institution && (firstLower.includes("instiution") || firstLower.includes("institution"))) {
      metadata.institutionCode = labelValue || "";
    }

    if (i === ROW.financialYear && firstLower.includes("financial year")) {
      metadata.financialYear = labelValue || "";
    }

    if (i === ROW.startDate && firstLower.includes("start date")) {
      metadata.startDate = excelDateToISO(labelValue) || "";
    }

    if (i === ROW.endDate && firstLower.includes("end date")) {
      metadata.endDate = excelDateToISO(labelValue) || "";
    }

    if (i === ROW.unit) {
      const unitCell = row.find((c) => c && UNIT_RE.test(String(c)));
      if (unitCell) metadata.unit = String(unitCell).trim();
    }
  }

  // Identification: which parent header each value column belongs to.
  const { headerRowIdx, dataTableStart } = locateHeader(data);
  metadata.columnGroups = {};
  if (headerRowIdx !== -1) {
    buildColumns(data, headerRowIdx, dataTableStart).forEach((col) => {
      metadata.columnGroups[col.key] = { parent: col.parent, child: col.child };
    });
  }

  return metadata;
};

const extractForeignCurrencyLiquidityData = (data) => {
  const { headerRowIdx, dataTableStart } = locateHeader(data);

  if (headerRowIdx === -1) {
    return { hierarchicalData: [], columns: [], additionalColumns: [], noandtitles: [] };
  }

  const noandtitles = [getStr(data[headerRowIdx], 0), getStr(data[headerRowIdx], 1)];
  const cols = buildColumns(data, headerRowIdx, dataTableStart);
  const entries = [];

  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const sNo = getStr(row, 0);
    const label = getStr(row, 1).replace(/\s+/g, " ");
    if (!label) continue; // formula legend, blank rows

    const isTotalLabel = !sNo && TOTAL_RE.test(label);
    const anyValue = cols.some((c) => getStr(row, c.index) !== "");
    if (!sNo && !isTotalLabel && !anyValue) continue; // footnote ("# includes foreign currency...")

    const values = {};
    cols.forEach((col) => {
      values[col.key] = getNum(row, col.index);
    });

    entries.push({
      id: sNo,
      sNo,
      label,
      values,
      rowNumber: i + 1,
      level: 1,
      isTotalRow: isTotalLabel,
      isSectionHeader: false,
    });
  }

  return {
    hierarchicalData: entries,
    columns: cols.map((c) => c.key),
    additionalColumns: [],
    noandtitles,
  };
};

export default extractForeignCurrencyLiquidityData;