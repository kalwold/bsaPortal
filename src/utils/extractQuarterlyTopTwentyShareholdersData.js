import { excelDateToISO } from "./excelParser";

/* ------------------------------------------------------------------ *
 *  Quarterly Top Twenty (20) Shareholding Structure  (A1 = "TWE_SHA_STR_TH001")
 *
 *  Layout (0-based column index):
 *    A  S.No | B  Name (label) | C.. value columns
 *  The header block starts on the row whose column A reads "S.No"
 *  and ends on the row before the first numbered data row, so it can
 *  be 1 row (TH001) or several rows (TS001) without changing the code.
 *
 *  IDENTIFICATION RULE: when a value column sits under a parent header
 *  (e.g. "Number of Shares Held" -> "Subscribed"), the parent name is
 *  prepended to the child, giving a unique key such as
 *  "Number_of_Shares_Held_Subscribed". Columns with no parent keep
 *  their own name.
 * ------------------------------------------------------------------ */

const FIRST_VALUE_COL = 2; // A = S.No, B = Name, values start at C

// First line of a header cell, made safe to use as an object key.
const cleanHeader = (text) => {
  const firstLine =
    String(text ?? "")
      .split(/\r?\n/)
      .map((l) => l.trim())
      .find((l) => l !== "") || "";
  return firstLine
    .replace(/['’`]/g, "")
    .replace(/%/g, "Percent ")
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
};

const TOTAL_RE = /total/i; // Sub-total, Grand total, Total Subscribed shares...
const REMAINING_RE = /remaining/i; // "The remaining shares all together"

const isNumericSNo = (v) =>
  v !== undefined && v !== null && String(v).trim() !== "" && !isNaN(parseFloat(v));

const isDataRow = (row) => {
  if (!row || row.length === 0) return false;
  const name = String(row[1] ?? "").trim();
  return isNumericSNo(row[0]) || TOTAL_RE.test(name) || REMAINING_RE.test(name);
};

// Finds the header block: [headerRowIdx, dataTableStart)
const locateHeader = (data) => {
  let headerRowIdx = -1;
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    if (/^s\.?\s*no\.?$/i.test(String(row[0] ?? "").trim())) {
      headerRowIdx = i;
      break;
    }
  }
  if (headerRowIdx === -1) return { headerRowIdx: -1, dataTableStart: -1 };

  let dataTableStart = data.length;
  for (let i = headerRowIdx + 1; i < data.length; i++) {
    if (isDataRow(data[i])) {
      dataTableStart = i;
      break;
    }
  }
  return { headerRowIdx, dataTableStart };
};

// Builds [{ key, index, parent, child }] from the (possibly multi-row) header.
const buildColumns = (data, headerRowIdx, dataTableStart) => {
  const headerRows = data.slice(headerRowIdx, dataTableStart);
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
    let key = chain.join("_");
    let n = 2;
    while (used.has(key)) key = `${chain.join("_")}_${n++}`;
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

export const extractQuarterlyTopTwentyShareholdersMetadata = (data) => {
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
    // Label cells are merged A:B in this template, so the value can land in
    // B, C, D... Take the first non-empty cell after the label.
    const labelValue = (() => {
      for (let c = 1; c <= 5; c++) {
        const v = row[c];
        if (v !== undefined && v !== null && String(v).trim() !== "") {
          return String(v).trim();
        }
      }
      return "";
    })();

    if (i === 0 && firstCell) {
      metadata.ReturnKey = firstCell;
      if (firstCell.includes("TWE_SHA_STR_TH001") || firstCell.includes("TH001")) {
        metadata.reportType = "finance-quarterly_top20-shareholders";
        metadata.reportTypeId = "finance-quarterly_top20-shareholders";
        metadata.departmentId = "finance";
        metadata.departmentName = "Finance";
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

    if (i === 8 && firstCell && firstCell.toLowerCase().includes("financial year")) {
      metadata.financialYear = labelValue || "";
    }

    if (i === 9 && firstCell && firstCell.toLowerCase().includes("start date")) {
      metadata.startDate = excelDateToISO(labelValue) || "";
    }

    if (i === 10 && firstCell && firstCell.toLowerCase().includes("end date")) {
      metadata.endDate = excelDateToISO(labelValue) || "";
    }

    if (i === 12) {
      const unitCell = row.find((c) => c && String(c).toLowerCase().includes("million"));
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

const extractQuarterlyTopTwentyShareholdersData = (data) => {
  const { headerRowIdx, dataTableStart } = locateHeader(data);

  if (headerRowIdx === -1) {
    return { hierarchicalData: [], columns: [], additionalColumns: [], noandtitles: [] };
  }

  const noandtitles = [
    String(data[headerRowIdx][0] || "").trim(),
    String(data[headerRowIdx][1] || "").trim(),
  ];

  const cols = buildColumns(data, headerRowIdx, dataTableStart);

  // Numbers may arrive as formatted text ("1,250.50", "12.5%"), so strip
  // separators before parsing. Blank / zero -> "0" (same as other extractors).
  const getNum = (row, idx) => {
    if (idx < row.length) {
      const val = parseFloat(String(row[idx] ?? "").replace(/[,%\s]/g, ""));
      if (!isNaN(val) && val !== 0) return val.toFixed(2);
    }
    return "0";
  };
  const getStr = (row, idx) => String((idx < row.length && row[idx]) || "").trim();

  const entries = [];

  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    if (!isDataRow(row)) continue; // skip notes / blank rows

    const sNoRaw = row[0];
    const nameCell = getStr(row, 1).replace(/\s+/g, " ");
    const numbered = isNumericSNo(sNoRaw);
    const isTotalLabel = !numbered && TOTAL_RE.test(nameCell);

    const values = {};
    cols.forEach((col) => {
      values[col.key] = getNum(row, col.index);
    });

    entries.push({
      id: numbered ? String(sNoRaw).trim() : "",
      sNo: numbered ? String(sNoRaw).trim() : "",
      label: nameCell,
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

export default extractQuarterlyTopTwentyShareholdersData;
