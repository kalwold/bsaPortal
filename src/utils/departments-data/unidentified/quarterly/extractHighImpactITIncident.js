import { excelDateToISO } from "../../../utils";

// TODO: align these with REPORT_TYPES / your department config
const REPORT_TYPE_ID = "unidentified-quarterly_high-impact-it-incident";
const DEPARTMENT_ID = "unidentified";
const DEPARTMENT_NAME = "Unidentified";

/* ------------------------------------------------------------------ */
/*  Metadata                                                           */
/* ------------------------------------------------------------------ */
export const extractHighImpactITIncidentMetadata = (data) => {
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

  // Header block is rows 0-7 (key, title, institution, year, start, end)
  const limit = Math.min(data.length, 9);

  for (let i = 0; i < limit; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const cells = row.map((c) => String(c ?? "").trim());
    const label = cells[0] || "";

    // The template has no merged cells / fixed column for these values, so
    // take the first non-empty cell to the right of the label.
    const valueCell = cells.slice(1).find((c) => c !== "") || "";

    if (i === 0 && label) {
      metadata.ReturnKey = label;

      if (label.includes("ITRHITI001") || label.includes("ITRHITI")) {
        metadata.reportType = REPORT_TYPE_ID;
        metadata.reportTypeId = REPORT_TYPE_ID;
        metadata.departmentId = DEPARTMENT_ID;
        metadata.departmentName = DEPARTMENT_NAME;
      }
    }

    if (i === 3 && label) {
      metadata.reportTitle = label.replace(/\s+/g, " ").trim();
    }

    // "Instiution Code " (typo in the template) / "Institution Code"
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
  }

  return metadata;
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

// Layout (0-based): 0 No | 1 Date and Time of the incident |
//                   2 Description of the incident, its Nature, sources |
//                   3 Impact of the incident
//
// ReportDataTable renders [sNo] [label] [columns...], so column 1 becomes the
// node label and only columns 2 and 3 are value columns.
const COLUMN_DEFS = [
  { key: "Description_of_Incident", index: 2 },
  { key: "Impact_of_Incident", index: 3 },
];

const DEFAULT_TITLES = ["No", "Date and Time of the incident"];

const pad = (n) => String(n).padStart(2, "0");

// "Date and Time" can arrive as text, an Excel serial number or a Date object
// depending on how the sheet was read - normalise all three to readable text.
const formatDateTime = (raw) => {
  if (raw === null || raw === undefined) return "";

  let date = null;
  if (raw instanceof Date) {
    date = raw;
  } else if (typeof raw === "number" && raw > 20000 && raw < 80000) {
    date = new Date(Math.round((raw - 25569) * 86400 * 1000));
    // serial numbers are timezone-less -> read them back as UTC
    const hasTime = raw % 1 !== 0;
    const d = `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
    return hasTime
      ? `${d} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`
      : d;
  }

  if (date && !isNaN(date)) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  return String(raw).trim();
};

const cellText = (raw) => {
  if (raw === null || raw === undefined) return null;
  const str = String(raw).trim();
  return str === "" ? null : str;
};

const extractHighImpactITIncidentData = (data) => {
  const columns = COLUMN_DEFS.map((c) => c.key);

  // ---- 1. Locate the header row (first cell "No") -------------------------
  let headerRowIdx = -1;
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const first = String(row[0] ?? "")
      .trim()
      .toLowerCase()
      .replace(/\.$/, "");
    if (first === "no" && /date/i.test(String(row[1] ?? ""))) {
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

  // ---- 2. Parse the flat list of incidents --------------------------------
  const nodes = [];
  const usedIds = new Set();

  for (let i = headerRowIdx + 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const sNo = String(row[0] ?? "")
      .trim()
      .replace(/\.0+$/, "");
    const label = formatDateTime(row[1]);

    const values = {};
    for (const def of COLUMN_DEFS) {
      values[def.key] = cellText(row[def.index]);
    }

    // The template ships with 100 pre-numbered empty rows -> skip unfilled ones
    const hasContent =
      label !== "" || Object.values(values).some((v) => v !== null);
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
      isTotalRow: false,
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

export default extractHighImpactITIncidentData;
