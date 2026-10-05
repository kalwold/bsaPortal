import { excelDateToISO } from "../../../utils";

/* ------------------------------------------------------------------ */
/*  Metadata                                                           */
/* ------------------------------------------------------------------ */
export const extractLoansToInsidersMetadata = (data) => {
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

  // Header block lives in the first ~15 rows (title, institution, dates, unit)
  const limit = Math.min(data.length, 15);

  for (let i = 0; i < limit; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const cells = row.map((c) => String(c ?? "").trim());
    const firstCell = cells[0] || "";
    const secondCell = cells[1] || "";
    const thirdCell = cells[2] || "";
    const label = firstCell || secondCell;

    // Row 0: return key  (INS_LOAN_QR002)
    if (i === 0 && firstCell) {
      metadata.ReturnKey = firstCell;

      if (firstCell.includes("INS_LOAN") || firstCell.includes("QR002")) {
        // TODO: align these ids with REPORT_TYPES / creditConfig
        metadata.reportType = "unidentified-quarterly_loans-to-insiders";
        metadata.reportTypeId = "unidentified-quarterly_loans-to-insiders";
        metadata.departmentId = "unidentified";
        metadata.departmentName = "Unidentified";
      }
    }

    // Row 3: merged title cell "\nQuarterly Loans to Insiders Report\n\n"
    if (i === 3 && firstCell) {
      metadata.reportTitle = firstCell.replace(/\s+/g, " ").trim();
    }

    // "Instiution code " (typo in the template) / "Institution code"
    if (/^insti\w*\s*code/i.test(label)) {
      metadata.institutionCode = thirdCell;
    }

    if (/financial year/i.test(label)) {
      metadata.financialYear = thirdCell;
    }

    if (/start date/i.test(label)) {
      metadata.startDate = excelDateToISO(thirdCell) || "";
    }

    if (/end date/i.test(label)) {
      metadata.endDate = excelDateToISO(thirdCell) || "";
    }

    // Unit sits alone in a cell (col F) on row 12: "In Millions of Birr"
    if (!metadata.unit) {
      const unitCell = cells.find((c) => /^in\s+\w+/i.test(c));
      if (unitCell) metadata.unit = unitCell;
    }
  }

  return metadata;
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

// Fixed layout of QR002 (0-based column indexes).
// Column 7/8 (H/I) only hold the Loan Status dropdown source list -> ignored.
const COLUMN_DEFS = [
  { key: "Facility_Type", index: 2, type: "text" },
  { key: "Outstanding_Balance", index: 3, type: "number" },
  { key: "Security_Value", index: 4, type: "number" },
  { key: "Security_Type", index: 5, type: "text" },
  { key: "Loan_Status", index: 6, type: "text" },
];

const DEFAULT_TITLES = ["S.No.", "Name of Borrower"];

const extractLoansToInsidersData = (data) => {
  const columns = COLUMN_DEFS.map((c) => c.key);

  // ---- 1. Locate the header row ("S.No.") --------------------------------
  let headerRowIdx = -1;
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const first = String(row[0] ?? "")
      .toLowerCase()
      .replace(/\s+/g, "");
    if (first === "s.no." || first === "s.no" || first === "sno") {
      headerRowIdx = i;
      break;
    }
  }

  if (headerRowIdx === -1) {
    return {
      hierarchicalData: [],
      columns,
      additionalColumns: [],
      noandtitles: DEFAULT_TITLES,
    };
  }

  // Table header is 2 rows (Security -> Value | Type); the UI only needs the
  // first two titles: the S.No cell and the label cell.
  const headerRow = data[headerRowIdx];
  const noandtitles = [
    String(headerRow[0] ?? "").trim() || DEFAULT_TITLES[0],
    String(headerRow[1] ?? "").trim() || DEFAULT_TITLES[1],
  ];

  // ---- 2. Helpers ---------------------------------------------------------
  const readValue = (raw, type) => {
    if (raw === null || raw === undefined) return null;
    const str = String(raw).trim();
    if (str === "") return null;

    if (type === "number") {
      const num = parseFloat(str.replace(/[,%\s]/g, ""));
      return isNaN(num) ? str : num.toFixed(2);
    }
    return str;
  };

  const buildValues = (row) => {
    const values = {};
    for (const def of COLUMN_DEFS) {
      values[def.key] = readValue(row[def.index], def.type);
    }
    return values;
  };

  // ---- 3. Parse rows ------------------------------------------------------
  //
  // NOTE on the S.No column: the template stores codes as numbers, so
  // 1.10 / 1.20 / 1.30 / 1.40 arrive as 1.1 / 1.2 / 1.3 / 1.4 (colliding with
  // 1.1 ... 1.4), and 2.250 arrives as 2.25000000000002. The code text can't
  // be trusted for children, so children are numbered by position inside their
  // parent section (1.1, 1.2 ... 1.40) - counting blank template rows too, so
  // the numbers match the template.
  const topLevelNodes = [];
  const sectionMap = new Map();
  const childCounters = {};

  for (let i = headerRowIdx + 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const rawCode = String(row[0] ?? "")
      .trim()
      .replace(/\.$/, ""); // "2." -> "2"
    const label = String(row[1] ?? "").trim();

    // Stop at footer notes
    if (/^note/i.test(rawCode) || /^note/i.test(label)) break;

    const values = buildValues(row);
    const hasValues = Object.values(values).some((v) => v !== null);
    const isTotalLabel = /total/i.test(label);

    // -- Top-level rows: 1, 2, 3, 4, 5 --
    if (/^\d+$/.test(rawCode)) {
      if (!label && !hasValues) continue;

      const node = {
        id: rawCode,
        sNo: rawCode,
        label,
        values,
        rowNumber: i + 1,
        level: 1,
        isTotalRow: isTotalLabel,
        isSectionHeader: !hasValues && !isTotalLabel, // 1 & 2 have no values
        children: [],
      };
      sectionMap.set(rawCode, node);
      childCounters[rawCode] = 0;
      topLevelNodes.push(node);
      continue;
    }

    // -- Child rows: 1.x / 2.x (numeric codes with a decimal part) --
    if (/^\d+\.\d+/.test(rawCode)) {
      const parentCode = rawCode.split(".")[0];
      childCounters[parentCode] = (childCounters[parentCode] || 0) + 1;

      // Unfilled template rows are skipped (but still counted above)
      if (!label && !hasValues) continue;

      const sNo = `${parentCode}.${childCounters[parentCode]}`;
      const node = {
        id: sNo,
        sNo,
        label,
        values,
        rowNumber: i + 1,
        level: 2,
        isTotalRow: false,
        isSectionHeader: false,
        children: [],
      };

      const parent = sectionMap.get(parentCode);
      if (parent) {
        parent.children.push(node);
      } else {
        topLevelNodes.push(node); // orphan: keep it visible
      }
      continue;
    }

    // -- Rows without a code: only "Sub total ..." / "Grand Total" matter --
    if (isTotalLabel) {
      topLevelNodes.push({
        id: `total_${i + 1}`,
        sNo: "",
        label,
        values,
        rowNumber: i + 1,
        level: 1,
        isTotalRow: true,
        isSectionHeader: false,
        children: [],
      });

      // Grand Total is the last table row; what follows is the footer note
      if (/grand\s*total/i.test(label)) break;
    }
    // anything else (blank rows, "Aggregate a borrower loans..." note) is ignored
  }

  // ---- 4. Clean up empty children arrays ---------------------------------
  const cleanData = (nodes) => {
    nodes.forEach((node) => {
      if (node.children && node.children.length === 0) {
        delete node.children;
      } else if (node.children) {
        cleanData(node.children);
      }
    });
  };
  cleanData(topLevelNodes);

  return {
    hierarchicalData: topLevelNodes,
    columns,
    additionalColumns: [],
    noandtitles,
  };
};

export default extractLoansToInsidersData;
