import { excelDateToISO } from "../../../utils";


const REPORT_TYPE_ID = "unidentified-corporate-profile-head-office-address";
const DEPARTMENT_ID = "unidentified";
const DEPARTMENT_NAME = "Unidentified";

// Section 1.2 has no title row: its column names sit on the same row as "1.2",
// so it gets a fixed title here.
const SECTION_TITLE_FALLBACK = { "1.2": "Contact Person" };

const SECTION_NO = /^\d+\.\d+$/; // 1.1, 1.2 ...
const ITEM_NO = /^\d+\.\d+\.\d+$/; // 1.1.1, 1.2.1 ...

const clean = (v) => String(v ?? "").replace(/\s+/g, " ").trim();

// First non-empty cell after the label (values sit in B..D)
const getLabelValue = (row) => {
  for (let c = 1; c <= 3; c++) {
    const v = row[c];
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      return String(v).trim();
    }
  }
  return "";
};

export const extractHeadOfficeProfileMetadata = (data) => {
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

  // Metadata lives above the first block (Excel rows 1-13)
  for (let i = 0; i < Math.min(data.length, 14); i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const firstCell = String(row[0] ?? "").trim();
    if (!firstCell) continue;
    const label = firstCell.toLowerCase();
    const labelValue = getLabelValue(row);

    if (i === 0) {
      metadata.ReturnKey = firstCell;
      if (firstCell.includes("CP001")) {
        metadata.reportType = REPORT_TYPE_ID;
        metadata.reportTypeId = REPORT_TYPE_ID;
        metadata.departmentId = DEPARTMENT_ID;
        metadata.departmentName = DEPARTMENT_NAME;
      }
    } else if (label.includes("corporate profile")) {
      metadata.reportTitle = clean(firstCell);
    } else if (label.includes("instiution") || label.includes("institution")) {
      metadata.institutionCode = labelValue;
    } else if (label.includes("financial year")) {
      metadata.financialYear = labelValue;
    } else if (label.includes("start date")) {
      metadata.startDate = excelDateToISO(labelValue) || "";
    } else if (label.includes("end date")) {
      metadata.endDate = excelDateToISO(labelValue) || "";
    }
  }
  return metadata;
};

const extractHeadOfficeProfileData = (data) => {
  const hierarchicalData = [];
  const allColumns = []; // union of every block's columns, in sheet order

  let section = null; // current block: { title, columns: [{ name, index }] }
  let sectionNode = null;

  // Column names in B.. of a row (merged headers only have the name in the first cell)
  const readColumns = (row) => {
    const cols = [];
    for (let c = 1; c < row.length; c++) {
      const name = clean(row[c]);
      if (name) cols.push({ name, index: c });
    }
    return cols;
  };
  const registerColumns = (cols) => {
    for (const col of cols) {
      if (!allColumns.includes(col.name)) allColumns.push(col.name);
    }
  };

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const aCell = clean(row[0]);

    // 1. Section row: "1.1" | "Location"  (1.2 also carries its column names here)
    if (SECTION_NO.test(aCell)) {
      const inlineCols = readColumns(row);
      const combined = inlineCols.length > 1; // title row and header row are one
      const title = combined
        ? SECTION_TITLE_FALLBACK[aCell] ?? clean(row[1])
        : clean(row[1]);
      section = { no: aCell, title, columns: combined ? inlineCols : [] };
      sectionNode = {
        id: `row-${i}`,
        sNo: aCell,
        label: title,
        values: {},
        rowNumber: i + 1,
        level: 0,
        isTotalRow: false,
        isSectionHeader: true,
        children: [],
        columns: section.columns.map((c) => c.name), // filled in at the header row otherwise
      };
      hierarchicalData.push(sectionNode);
      if (combined) registerColumns(inlineCols);
      continue;
    }

    if (!section) continue; // still in the metadata area

    // 2. Header row: A empty, B.. hold the column names
    if (!aCell) {
      const cols = readColumns(row);
      if (cols.length > 0) {
        section.columns = cols;
        registerColumns(cols);
        if (sectionNode) sectionNode.columns = cols.map((c) => c.name);
      }
      continue;
    }

    // 3. Data row: "1.1.1" | values under the block's header
    if (ITEM_NO.test(aCell)) {
      const values = {};
      for (const col of section.columns) {
        values[col.name] = clean(row[col.index]);
      }
      hierarchicalData.push({
        id: `row-${i}`,
        sNo: aCell,
        label: section.title,
        values,
        rowNumber: i + 1,
        level: 1,
        isTotalRow: false,
        isSectionHeader: false,
        children: [],
      });
    }
  }

  if (hierarchicalData.length === 0) {
    console.log("Could not find data table");
    return { hierarchicalData: [], columns: [], additionalColumns: [], noandtitles: [] };
  }

  return {
    hierarchicalData,
    columns: allColumns,
    additionalColumns: [],
    noandtitles: ["No", "Particulars"],
  };
};

export default extractHeadOfficeProfileData;
