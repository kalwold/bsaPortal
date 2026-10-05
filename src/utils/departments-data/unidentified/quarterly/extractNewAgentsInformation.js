import { excelDateToISO } from "../../../utils";

// TODO: set these to the right department / report type for NA001
const REPORT_TYPE_ID =
  "unidentified-branchOps-quarterly_new-agents-information";
const DEPARTMENT_ID = "unidentified";
const DEPARTMENT_NAME = "Unidentified";

const clean = (v) =>
  String(v ?? "")
    .replace(/\s+/g, " ")
    .trim();
const isFilled = (v) =>
  v !== undefined && v !== null && String(v).trim() !== "";

/* ------------------------------------------------------------------ */
/* Metadata                                                            */
/* Layout: A1 return key, A4 title (merged A4:M7), A8:B11 labels        */
/* (A10:B10 and A11:B11 are merged) with the value to the right (C).    */
/* ------------------------------------------------------------------ */
export const extractNewAgentsInformationMetadata = (data) => {
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

  // Everything above the table header (Excel rows 1-13)
  for (let i = 0; i < Math.min(data.length, 13); i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const firstCell = clean(row[0]);
    const label = firstCell.toLowerCase();

    // Value of a label row: first filled cell to the right of the label (B..F)
    const labelValue = (() => {
      for (let c = 1; c <= 5; c++) {
        if (isFilled(row[c])) return String(row[c]).trim();
      }
      return "";
    })();

    if (i === 0) {
      if (!firstCell) continue;
      metadata.ReturnKey = firstCell;
      if (firstCell.toUpperCase().includes("NA001")) {
        metadata.reportType = REPORT_TYPE_ID;
        metadata.reportTypeId = REPORT_TYPE_ID;
        metadata.departmentId = DEPARTMENT_ID;
        metadata.departmentName = DEPARTMENT_NAME;
      }
    } else if (label.includes("instiution") || label.includes("institution")) {
      metadata.institutionCode = labelValue;
    } else if (label.includes("financial year")) {
      metadata.financialYear = labelValue;
    } else if (label.includes("start date")) {
      metadata.startDate = excelDateToISO(labelValue) || "";
    } else if (label.includes("end date")) {
      metadata.endDate = excelDateToISO(labelValue) || "";
    } else if (i <= 6 && firstCell && !metadata.reportTitle) {
      // Rows 2-7: the merged title block
      metadata.reportTitle = firstCell;
    }
  }

  return metadata;
};

/* ------------------------------------------------------------------ */
/* Data                                                                */
/*                                                                     */
/* Excel columns (0-based index) and how each one is read:             */
/*   A S.No.                     B Name of Agent  (row label)          */
/*   C-I Agent Address: Region, Town, Woreda, Kebele, Land Mark,       */
/*       P.O.Box, Telephone                        -> text (as typed)  */
/*   J Commercial activity the agent is engaged    -> text             */
/*   K Banking Services                            -> text             */
/*   L Banking Limits                              -> amount (0.00)    */
/*   M Date of commencement                        -> ISO date         */
/*   N Working Hours                               -> text             */
/*   O Responsible Branch                          -> text             */
/*                                                                     */
/* The viewer prints `noandtitles` + `columns` as the table header and */
/* looks every cell up in row.values[column], so the column names below */
/* are the titles from the Excel header (lowercase, underscores).      */
/* ------------------------------------------------------------------ */
const NO_AND_TITLES = ["S.No.", "Name of Agent"]; // S.No. cell + label cell (label = agent name)

const COLUMN_DEFS = [
  { title: "agent_address_region", index: 2, type: "text" },
  { title: "agent_address_town", index: 3, type: "text" },
  { title: "agent_address_woreda", index: 4, type: "text" },
  { title: "agent_address_kebele", index: 5, type: "text" },
  { title: "agent_address_land_mark", index: 6, type: "text" },
  { title: "agent_address_p_o_box", index: 7, type: "text" },
  { title: "agent_address_telephone", index: 8, type: "text" },
  { title: "commercial_activity_the_agent_is_engaged", index: 9, type: "text" },
  { title: "banking_services", index: 10, type: "text" },
  { title: "banking_limits", index: 11, type: "amount" },
  { title: "date_of_commencement", index: 12, type: "date" },
  { title: "working_hours", index: 13, type: "text" },
  { title: "responsible_branch", index: 14, type: "text" },
];

const COLUMNS = COLUMN_DEFS.map((c) => c.title);

// "1,500.50" -> 1500.5 | "(100.00)" -> -100 | " - " / "" -> 0
const toNumber = (raw) => {
  if (!isFilled(raw)) return 0;
  if (typeof raw === "number") return isNaN(raw) ? 0 : raw;
  let s = String(raw).replace(/,/g, "").trim();
  const negative = /^\(.*\)$/.test(s);
  s = s.replace(/[()\s]/g, "");
  const val = parseFloat(s);
  if (isNaN(val)) return 0;
  return negative ? -val : val;
};

const formatAmount = (n) => (n === 0 ? "0" : n.toFixed(2));

const pad = (n) => String(n).padStart(2, "0");

// Serial number, Date object or text -> "YYYY-MM-DD" (empty stays empty)
const toDateValue = (raw) => {
  if (!isFilled(raw)) return "";
  if (raw instanceof Date) {
    return isNaN(raw)
      ? ""
      : `${raw.getFullYear()}-${pad(raw.getMonth() + 1)}-${pad(raw.getDate())}`;
  }
  return excelDateToISO(String(raw).trim()) || clean(raw);
};

// One cell, read the way its column is defined
const readCell = (col, row) => {
  const raw = row[col.index];
  if (col.type === "amount") return formatAmount(toNumber(raw));
  if (col.type === "date") return toDateValue(raw);
  return clean(raw); // text: keep P.O.Box / Telephone exactly as typed
};

const extractNewAgentsInformationData = (data) => {
  // 1. Header row: "S.No." | "Name of Agent" (the Region/Town/... sub-header is the next row)
  let dataTableStart = -1;
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = clean(row[0]).toLowerCase();
    const secondCell = clean(row[1]).toLowerCase();
    if (firstCell.startsWith("s.no") && secondCell.includes("name")) {
      dataTableStart = i + 2; // skip both header rows
      break;
    }
  }

  if (dataTableStart === -1) {
    return {
      hierarchicalData: [],
      columns: COLUMNS,
      additionalColumns: [],
      noandtitles: NO_AND_TITLES,
    };
  }

  // 2. Entries: one agent per row. A row only counts when something was typed
  //    into B..O (S.No. alone is not enough).
  const rows = [];
  const inputIndexes = [1, ...COLUMN_DEFS.map((c) => c.index)];

  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const firstCell = clean(row[0]);

    if (firstCell.toLowerCase().startsWith("note")) break; // footnotes, if any
    if (!inputIndexes.some((idx) => isFilled(row[idx]))) continue; // blank template row

    const agentName = clean(row[1]);

    const values = { name_of_agent: agentName };
    for (const col of COLUMN_DEFS) values[col.title] = readCell(col, row);

    rows.push({
      id: firstCell || `row-${i}`,
      sNo: firstCell,
      label: agentName, // shown under the "Name of Agent" title
      values,
      rowNumber: i + 1,
      level: 0,
      isTotalRow: false,
      isSubTotal: false,
      isGrandTotal: false,
    });
  }

  return {
    hierarchicalData: rows,
    columns: COLUMNS,
    additionalColumns: [],
    noandtitles: NO_AND_TITLES,
  };
};

export default extractNewAgentsInformationData;
