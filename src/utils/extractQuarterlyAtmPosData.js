import { excelDateToISO } from "./excelParser";

/* ------------------------------------------------------------------ *
 *  BSD Quarterly ATM and POS Report  (A1 = "QUA_ATM_POS_QP001")
 *
 *  Layout (0-based column index):
 *    A  Types of E-payment (row label, no S.No column)
 *    B  Number of Machines | C  Number of Users |
 *    D  Number of Transaction | E  Amount of Transaction in Birr
 *  Rows: ATM, POS, Debit/Credit Card, then a Total row.
 *
 *  The header is one flat row, so there are no parent headers and the
 *  column keys are simply the cleaned header names. (If a parent header
 *  row is ever added above the sub-headers, its name is automatically
 *  prepended to the child key.)
 * ------------------------------------------------------------------ */

const FIRST_VALUE_COL = 1; // A = label, values start at B

const normText = (v) => String(v ?? "").replace(/[\s\u00a0]+/g, " ").trim();
const TOTAL_RE = /^total/i;

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

const isDataRow = (row) => !!row && normText(row[0]) !== "";

// Header row = the row whose column A reads "Types of E-payment".
const locateHeader = (data) => {
  let headerRowIdx = -1;
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    if (/types?\s+of\s+e-?\s*payments?/i.test(normText(row[0]))) {
      headerRowIdx = i;
      break;
    }
  }
  if (headerRowIdx === -1) return { headerRowIdx: -1, dataTableStart: -1 };

  // Data starts on the first row after the header that has a label
  let dataTableStart = data.length;
  for (let i = headerRowIdx + 1; i < data.length; i++) {
    if (isDataRow(data[i])) {
      dataTableStart = i;
      break;
    }
  }
  return { headerRowIdx, dataTableStart };
};

const buildColumns = (data, headerRowIdx, dataTableStart) => {
  const headerRows = data.slice(headerRowIdx, dataTableStart);
  const width = Math.max(0, ...headerRows.map((r) => (r ? r.length : 0)));
  const cols = [];
  const used = new Set();
  let currentParent = "";

  for (let c = FIRST_VALUE_COL; c < width; c++) {
    const parts = headerRows.map((r) => cleanHeader(r ? r[c] : ""));
    const lowerHasText = parts.slice(1).some(Boolean);
    if (parts[0]) currentParent = parts[0];
    else if (lowerHasText) parts[0] = currentParent;
    else continue;

    const chain = parts.filter(Boolean).filter((p, i, a) => i === 0 || p !== a[i - 1]);
    let key = chain.join("_");
    let n = 2;
    while (used.has(key)) key = `${chain.join("_")}_${n++}`;
    used.add(key);
    cols.push({ key, index: c });
  }
  return cols;
};

export const extractQuarterlyAtmPosMetadata = (data) => {
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
    // Label cells are merged A:B, so the value can land in B, C, D...
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
      if (firstCell.includes("QUA_ATM_POS_QP001") || firstCell.includes("QP001")) {
        metadata.reportType = "digital-banking-quarterly_atm-or-pos";
        metadata.reportTypeId = "digital-banking-quarterly_atm-or-pos";
        metadata.departmentId = "digital-banking";
        metadata.departmentName = "Digital Banking";
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
      const unitCell = row.find((c) => c && /million|birr/i.test(String(c)));
      if (unitCell) metadata.unit = String(unitCell).trim();
    }
  }
  return metadata;
};

const extractQuarterlyAtmPosData = (data) => {
  const { headerRowIdx, dataTableStart } = locateHeader(data);

  if (headerRowIdx === -1) {
    return { hierarchicalData: [], columns: [], additionalColumns: [], noandtitles: [] };
  }

  // No S.No column in this template: first title is empty, second is the
  // row-label header.
  const noandtitles = ["", normText(data[headerRowIdx][0])];

  const cols = buildColumns(data, headerRowIdx, dataTableStart);

  const getNum = (row, idx) => {
    if (idx < row.length) {
      const val = parseFloat(String(row[idx] ?? "").replace(/[,%\s\u00a0]/g, ""));
      if (!isNaN(val) && val !== 0) return val.toFixed(2);
    }
    return "0";
  };

  const entries = [];

  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    if (!isDataRow(row)) continue; // skip blank rows

    const label = normText(row[0]);
    const isTotalLabel = TOTAL_RE.test(label);

    const values = {};
    cols.forEach((col) => {
      values[col.key] = getNum(row, col.index);
    });

    entries.push({
      id: isTotalLabel ? "" : label,
      sNo: "",
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

export default extractQuarterlyAtmPosData;
