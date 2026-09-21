import { excelDateToISO } from "../../../utils";

/* ------------------------------------------------------------------ *
 *  Weekly Foreign Currency Reserve  (A1 = "CRWFCR001")
 * ------------------------------------------------------------------ */

// TODO confirm department / id for the registry
const REPORT_TYPE_ID = "ibd-weekly_foreign-currency-reserve";

const FIRST_VALUE_COL = 2; // A = No., B = Description, values start at C
const HEADER_DEPTH = 2; // rows 9-10 define the columns
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

const isNumericSNo = (v) =>
  v !== undefined && v !== null && String(v).trim() !== "" && !isNaN(parseFloat(v));

// 1.1, 1.2 ... (non-integer) are children of section 1
const isChildSNo = (v) => isNumericSNo(v) && !Number.isInteger(parseFloat(v));

// Finds the row holding "No." in column A.
const locateHeader = (data) => {
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    if (ANCHOR_RE.test(String(row[0] ?? "").trim())) return i;
  }
  return -1;
};

// Builds [{ key, index, parent, child }] from the header rows.
const buildColumns = (data, headerRowIdx) => {
  const headerRows = data.slice(headerRowIdx, headerRowIdx + HEADER_DEPTH);
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

export const extractForeignCurrencyReserveMetadata = (data) => {
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
      if (firstCell.includes("CRWFCR001") || firstCell.includes("WFCR001")) {
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
  const headerRowIdx = locateHeader(data);
  metadata.columnGroups = {};
  if (headerRowIdx !== -1) {
    buildColumns(data, headerRowIdx).forEach((col) => {
      metadata.columnGroups[col.key] = { parent: col.parent, child: col.child };
    });
  }

  return metadata;
};

const extractForeignCurrencyReserveData = (data) => {
  const headerRowIdx = locateHeader(data);

  if (headerRowIdx === -1) {
    return { hierarchicalData: [], columns: [], additionalColumns: [], noandtitles: [] };
  }

  const noandtitles = [getStr(data[headerRowIdx], 0), getStr(data[headerRowIdx], 1)];
  const cols = buildColumns(data, headerRowIdx);
  const entries = [];

  let section = null; // { id } of the open section header
  let childCount = 0;

  // Row after "No." is already data (the section line shares it with the sub-headers)
  for (let i = headerRowIdx + 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const sNoRaw = row[0];
    const numbered = isNumericSNo(sNoRaw);
    const label = getStr(row, 1).replace(/\s+/g, " ");
    if (!label) continue;

    const values = {};
    cols.forEach((col) => {
      values[col.key] = getNum(row, col.index);
    });

    // ---- currency rows: 1.1, 1.2 ... (level 2)
    if (numbered && isChildSNo(sNoRaw)) {
      childCount++;
      const sNo = section ? `${section.id}.${childCount}` : String(sNoRaw).trim();
      entries.push({
        id: sNo,
        sNo,
        label,
        values,
        rowNumber: i + 1,
        level: 2,
        parentId: section ? section.id : "",
        isTotalRow: false,
        isSectionHeader: false,
      });
      continue;
    }

    // ---- top-level numbered row: section header when 1.x rows follow
    if (numbered) {
      const id = String(sNoRaw).trim();
      const next = data[i + 1];
      const isSectionHeader = !!next && isChildSNo(next[0]);
      if (isSectionHeader) {
        section = { id };
        childCount = 0;
        // D:F of this row hold the sub-header text ("5% Reserve" would parse as 5),
        // so a section header carries no values.
        cols.forEach((col) => {
          values[col.key] = "";
        });
      }
      entries.push({
        id,
        sNo: id,
        label,
        values,
        rowNumber: i + 1,
        level: 1,
        isTotalRow: false,
        isSectionHeader,
      });
      continue;
    }

    // ---- unnumbered "Total" row (a numbered row whose label contains "total"
    // is the section line above, so the numbered check has to come first)
    if (TOTAL_RE.test(label)) {
      entries.push({
        id: "",
        sNo: "",
        label,
        values,
        rowNumber: i + 1,
        level: 1,
        isTotalRow: true,
        isSectionHeader: false,
      });
      section = null;
    }
    // anything else unnumbered is a note -> skipped
  }

  return {
    hierarchicalData: entries,
    columns: cols.map((c) => c.key),
    additionalColumns: [],
    noandtitles,
  };
};

export default extractForeignCurrencyReserveData;
