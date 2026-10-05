import { excelDateToISO } from "../../../utils";

// TODO: align these with REPORT_TYPES / your department config
const REPORT_TYPE_ID = "share-quarterly_related-organizations";
const DEPARTMENT_ID = "share";
const DEPARTMENT_NAME = "Share";

/* ------------------------------------------------------------------ */
/*  Metadata                                                           */
/* ------------------------------------------------------------------ */
export const extractRelatedOrganizationsMetadata = (data) => {
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

  // Header block is rows 0-12 (key, title, institution, year, dates, unit)
  const limit = Math.min(data.length, 13);

  for (let i = 0; i < limit; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const cells = Array.from(row, (c) => String(c ?? "").trim()); // Array.from fills holes in sparse rows
    const label = cells[0] || "";

    // Start/End Date labels are merged across A:B, so the value is not in a
    // fixed column -> take the first non-empty cell to the right of the label.
    const valueCell = cells.slice(1).find((c) => c !== "") || "";

    if (i === 0 && label) {
      metadata.ReturnKey = label;

      if (label.includes("REL_ORG") || label.includes("LO001")) {
        metadata.reportType = REPORT_TYPE_ID;
        metadata.reportTypeId = REPORT_TYPE_ID;
        metadata.departmentId = DEPARTMENT_ID;
        metadata.departmentName = DEPARTMENT_NAME;
      }
    }

    if (i === 3 && label) {
      metadata.reportTitle = label.replace(/\s+/g, " ").trim();
    }

    // "Instiution code " (typo in the template) / "Institution code"
    if (/^insti\w*\s*code/i.test(label)) {
      metadata.institutionCode = valueCell;
    }

    if (/financial year/i.test(label)) {
      metadata.financialYear = valueCell;
    }

    if (/start date/i.test(label)) {
      metadata.startDate = valueCell ? excelDateToISO(valueCell) || "" : "";
    }

    if (/end date/i.test(label)) {
      metadata.endDate = valueCell ? excelDateToISO(valueCell) || "" : "";
    }

    // Unit is a standalone cell on row 12: "(Amount in Millions of Birr)"
    if (!metadata.unit) {
      const unitCell = cells.find((c) =>
        /amount\s+in\s+\w+|^\(?\s*in\s+\w+/i.test(c),
      );
      if (unitCell) metadata.unit = unitCell;
    }
  }

  return metadata;
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

// Layout (0-based): 0 Code | 1 Organization | 2 Shareholding in % | 3 Capital Invested
//
// ReportDataTable renders [sNo] [label] [columns...]: Code -> sNo,
// Organization -> label, the last two columns are value columns.
const COLUMN_DEFS = [
  { key: "Shareholding_in_Percent", index: 2, type: "number" },
  { key: "Capital_Invested", index: 3, type: "number" },
];

const DEFAULT_TITLES = ["Code", "Organization"];

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

const extractRelatedOrganizationsData = (data) => {
  const columns = COLUMN_DEFS.map((c) => c.key);

  // ---- 1. Locate the header row (first cell "Code") -----------------------
  let headerRowIdx = -1;
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const first = String(row[0] ?? "")
      .trim()
      .toLowerCase();
    if (first === "code" && /organi[sz]ation/i.test(String(row[1] ?? ""))) {
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

  const headerRow = data[headerRowIdx];
  const noandtitles = [
    String(headerRow[0] ?? "").trim() || DEFAULT_TITLES[0],
    String(headerRow[1] ?? "").trim() || DEFAULT_TITLES[1],
  ];

  // ---- 2. Parse the flat list of organizations ----------------------------
  const nodes = [];
  const usedIds = new Set();

  for (let i = headerRowIdx + 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const sNo = String(row[0] ?? "")
      .trim()
      .replace(/\.0+$/, "");
    const label = String(row[1] ?? "").trim();

    const values = {};
    for (const def of COLUMN_DEFS) {
      values[def.key] = readValue(row[def.index], def.type);
    }

    // Template rows below the header are empty -> skip unfilled ones
    const hasContent =
      sNo !== "" ||
      label !== "" ||
      Object.values(values).some((v) => v !== null);
    if (!hasContent) continue;

    // Ids are React keys / expand state in ReportDataTable -> must be unique
    let id = sNo || `row_${i + 1}`;
    if (usedIds.has(id)) id = `${id}_${i + 1}`;
    usedIds.add(id);

    nodes.push({
      id,
      sNo,
      label,
      values,
      rowNumber: i + 1,
      level: 1,
      isTotalRow: /^total/i.test(label),
      isSectionHeader: false,
    });
  }

  return {
    hierarchicalData: nodes,
    columns,
    additionalColumns: [],
    noandtitles,
  };
};

export default extractRelatedOrganizationsData;
