import { excelDateToISO } from "../../../utils";

/* ------------------------------------------------------------------ *
 *  Quarterly Mobile Transactions Report  (A1 = "MOB_TRA_QM001")
 *
 *  Layout (0-based column index):
 *    A  Code | B  Indicators | C.. value column(s) ("Current Quarter")
 *
 *  Codes are dotted: "4" is a parent, "4.1" / "4.2" / "4.3" are its
 *  children. Codes can arrive padded with non-breaking spaces
 *  ("1\u00a0\u00a0 ") or as numbers (4.1), so they are normalised first.
 *
 *  HIERARCHY: same approach as the loan range/region extractor. Every
 *  row becomes a node in a map; "4.1" is attached to parent "4" through
 *  `children`, and only top-level nodes (1, 2, 3, 4, 5, 6) are returned.
 *  Children are sorted by code, and empty `children` arrays are removed.
 *
 *  IDENTIFICATION RULE: names such as "Fund Transfer" repeat under more
 *  than one parent, so the parent's name is appended to the child's label
 *  ("Fund Transfer - Total No. of transactions"). Set
 *  APPEND_PARENT_NAME to false to keep the plain name. The untouched
 *  name is always kept in `shortLabel`; `parentId` / `parentLabel` point
 *  back to the parent.
 * ------------------------------------------------------------------ */

const FIRST_VALUE_COL = 2; // A = Code, B = Indicator, values start at C
const CODE_RE = /^\d+(\.\d+)*$/;
const APPEND_PARENT_NAME = true;

const normCode = (v) => String(v ?? "").replace(/[\s\u00a0]+/g, "").trim();
const normText = (v) => String(v ?? "").replace(/[\s\u00a0]+/g, " ").trim();
const isCodeRow = (row) => !!row && CODE_RE.test(normCode(row[0]));

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

// Header row = the row whose column A reads "Code".
const locateHeader = (data) => {
  let headerRowIdx = -1;
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    if (normText(row[0]).toLowerCase() === "code") {
      headerRowIdx = i;
      break;
    }
  }
  if (headerRowIdx === -1) return { headerRowIdx: -1, dataTableStart: -1 };

  let dataTableStart = data.length;
  for (let i = headerRowIdx + 1; i < data.length; i++) {
    if (isCodeRow(data[i])) {
      dataTableStart = i;
      break;
    }
  }
  return { headerRowIdx, dataTableStart };
};

// [{ key, index }] – one entry per value column in the header block.
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

export const extractQuarterlyMobileTransactionsMetadata = (data) => {
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
      if (firstCell.includes("MOB_TRA_QM001") || firstCell.includes("QM001")) {
        metadata.reportType = "digital-quarterly_mobile-transaction";
        metadata.reportTypeId = "digital-quarterly_mobile-transaction";
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

    // Unit line reads "(Amount in Birr)" in this template
    if (i === 12) {
      const unitCell = row.find(
        (c) => c && /million|birr/i.test(String(c)),
      );
      if (unitCell) metadata.unit = String(unitCell).trim();
    }
  }
  return metadata;
};

const extractQuarterlyMobileTransactionsData = (data) => {
  const { headerRowIdx, dataTableStart } = locateHeader(data);

  if (headerRowIdx === -1) {
    return { hierarchicalData: [], columns: [], additionalColumns: [], noandtitles: [] };
  }

  const noandtitles = [
    normText(data[headerRowIdx][0]),
    normText(data[headerRowIdx][1]),
  ];

  const cols = buildColumns(data, headerRowIdx, dataTableStart);

  const getNum = (row, idx) => {
    if (idx < row.length) {
      const val = parseFloat(String(row[idx] ?? "").replace(/[,%\s\u00a0]/g, ""));
      if (!isNaN(val) && val !== 0) return val.toFixed(2);
    }
    return "0";
  };

  const nodeMap = new Map();
  const topLevelNodes = [];

  // 1) One node per coded row
  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    if (!isCodeRow(row)) continue; // skip notes / blank rows

    const code = normCode(row[0]);
    const shortLabel = normText(row[1]);
    const parts = code.split(".");

    const values = {};
    cols.forEach((col) => {
      values[col.key] = getNum(row, col.index);
    });

    nodeMap.set(code, {
      id: code,
      sNo: code,
      label: shortLabel,
      shortLabel,
      parentId: null,
      parentLabel: "",
      values,
      rowNumber: i + 1,
      level: parts.length,
      isTotalRow: false,
      isSectionHeader: false,
      children: [],
    });
  }

  // 2) Attach children to their parents ("4.1" -> "4")
  for (const [code, node] of nodeMap) {
    const parts = code.split(".");
    if (parts.length === 1) {
      topLevelNodes.push(node);
      continue;
    }
    const parent =
      nodeMap.get(parts.slice(0, -1).join(".")) || nodeMap.get(parts[0]);
    if (parent) {
      node.parentId = parent.id;
      node.parentLabel = parent.shortLabel;
      if (APPEND_PARENT_NAME) node.label = `${node.shortLabel} - ${parent.shortLabel}`;
      parent.children.push(node);
    } else {
      topLevelNodes.push(node); // no parent found
    }
  }

  // 3) Sort by code, numerically
  const sortChildren = (nodes) => {
    nodes.sort((a, b) => {
      const aParts = a.sNo.split(".").map(Number);
      const bParts = b.sNo.split(".").map(Number);
      for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
        if (aParts[i] !== bParts[i]) return aParts[i] - bParts[i];
      }
      return aParts.length - bParts.length;
    });
    nodes.forEach((n) => n.children.length > 0 && sortChildren(n.children));
  };
  sortChildren(topLevelNodes);

  // 4) Remove empty children arrays
  const cleanData = (nodes) => {
    nodes.forEach((n) => {
      if (n.children.length === 0) delete n.children;
      else cleanData(n.children);
    });
  };
  cleanData(topLevelNodes);

  return {
    hierarchicalData: topLevelNodes,
    columns: cols.map((c) => c.key),
    additionalColumns: [],
    noandtitles,
  };
};

export default extractQuarterlyMobileTransactionsData;
