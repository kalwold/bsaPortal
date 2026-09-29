import { excelDateToISO } from "../../../utils";

/* ------------------------------------------------------------------ *
 *  Shared helpers for the "S.No | Name | value columns" report layout
 *  (same layout the Top-20 shareholders extractor uses).
 *
 *  Header rows are read from the row that matches `anchorRe` in column A.
 *  If `headerDepth` is given, the header is exactly that many rows.
 *  Use it for templates that ship with EMPTY data rows (no S.No printed),
 *  where auto-detecting "the first numbered row" would swallow the whole
 *  sheet into the header.
 * ------------------------------------------------------------------ */

export const FIRST_VALUE_COL = 2; // A = S.No / Code, B = Name, values start at C

export const SNO_RE = /^s\.?\s*no\.?$/i;
export const TOTAL_RE = /total/i;
export const REMAINING_RE = /remaining/i;

// All lines of a header cell joined ("Date of \ncommencement" -> "Date_of_commencement"),
// made safe to use as an object key.
export const cleanHeader = (text) =>
  String(text ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l !== "")
    .join(" ")
    .replace(/['’`]/g, "")
    .replace(/%/g, "Percent ")
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

export const isNumericSNo = (v) =>
  v !== undefined && v !== null && String(v).trim() !== "" && !isNaN(parseFloat(v));

export const isDataRow = (row) => {
  if (!row || row.length === 0) return false;
  const name = String(row[1] ?? "").trim();
  return isNumericSNo(row[0]) || TOTAL_RE.test(name) || REMAINING_RE.test(name);
};

// Finds the header block: [headerRowIdx, dataTableStart)
export const locateHeader = (data, { anchorRe = SNO_RE, headerDepth } = {}) => {
  let headerRowIdx = -1;
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    if (anchorRe.test(String(row[0] ?? "").trim())) {
      headerRowIdx = i;
      break;
    }
  }
  if (headerRowIdx === -1) return { headerRowIdx: -1, dataTableStart: -1 };

  if (headerDepth) {
    return { headerRowIdx, dataTableStart: headerRowIdx + headerDepth };
  }

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
// A column under a parent header gets "Parent_Child" as its key.
export const buildColumns = (data, headerRowIdx, dataTableStart) => {
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

/* ---------------------------- cell readers ---------------------------- */

export const getStr = (row, idx) => {
  if (!row || idx >= row.length) return "";
  return String(row[idx] ?? "").trim();
};

// Numbers may arrive as formatted text ("1,250.50", "12.5%"). Blank / zero -> "0".
export const getNum = (row, idx) => {
  if (row && idx < row.length) {
    const val = parseFloat(String(row[idx] ?? "").replace(/[,%\s]/g, ""));
    if (!isNaN(val) && val !== 0) return val.toFixed(2);
  }
  return "0";
};

export const getDate = (row, idx) => {
  const raw = row && idx < row.length ? row[idx] : "";
  if (raw === undefined || raw === null || String(raw).trim() === "") return "";
  return excelDateToISO(raw) || String(raw).trim();
};

// typeOf(key) -> "number" | "text" | "date"
export const readValues = (row, cols, typeOf = () => "number") => {
  const values = {};
  cols.forEach((col) => {
    const t = typeOf(col.key);
    values[col.key] =
      t === "text" ? getStr(row, col.index) : t === "date" ? getDate(row, col.index) : getNum(row, col.index);
  });
  return values;
};

/* ------------------------------ metadata ------------------------------ */

// Every template has the same top block:
//   row 1  ReturnKey            row 4   title
//   row 8  Institution code     row 9   Financial Year
//   row 10 Start Date           row 11  End Date
//   row 13 unit ("... Millions ...") when the report has one
export const buildMetadata = (data, { codes, reportTypeId, departmentId, departmentName, header }) => {
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
    // Label cells are sometimes merged A:B, so the value can land in
    // B, C, D... Take the first non-empty cell after the label.
    const labelValue = (() => {
      for (let c = 1; c <= 5; c++) {
        const v = row[c];
        if (v !== undefined && v !== null && String(v).trim() !== "") return String(v).trim();
      }
      return "";
    })();

    if (i === 0 && firstCell) {
      metadata.ReturnKey = firstCell;
      if (codes.some((code) => firstCell.includes(code))) {
        metadata.reportType = reportTypeId;
        metadata.reportTypeId = reportTypeId;
        metadata.departmentId = departmentId;
        metadata.departmentName = departmentName;
      }
    }

    if (i === 3 && firstCell) {
      metadata.reportTitle = firstCell.replace(/\s+/g, " ").trim();
    }

    if (
      i === 7 &&
      firstCell &&
      (firstCell.toLowerCase().includes("instiution") || firstCell.toLowerCase().includes("institution"))
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
  const { headerRowIdx, dataTableStart } = locateHeader(data, header);
  metadata.columnGroups = {};
  if (headerRowIdx !== -1) {
    buildColumns(data, headerRowIdx, dataTableStart).forEach((col) => {
      metadata.columnGroups[col.key] = { parent: col.parent, child: col.child };
    });
  }

  return metadata;
};

/* ---------------------- flat table (one level) ------------------------ */

// For reports that are a simple list of rows (+ optional total row).
// Column A = S.No / Code, column B = label, the rest come from the header.
// A row is kept when it has a label AND (an S.No/Code, or is a total row,
// or has at least one value), so unfilled template rows are dropped.
export const extractFlatReport = (data, { header, typeOf }) => {
  const { headerRowIdx, dataTableStart } = locateHeader(data, header);

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
    if (!label) continue;

    const isTotalLabel = !sNo && TOTAL_RE.test(label);
    const anyValue = cols.some((c) => getStr(row, c.index) !== "");
    if (!sNo && !isTotalLabel && !anyValue) continue; // stray note

    entries.push({
      id: sNo,
      sNo,
      label,
      values: readValues(row, cols, typeOf),
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
