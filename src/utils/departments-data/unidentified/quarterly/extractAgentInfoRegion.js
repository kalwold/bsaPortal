import { excelDateToISO } from "../../../utils";

// TODO: set these to the right department / report type for AI001
const REPORT_TYPE_ID = "unidentified-branchOps-quarterly_agent-info-region";
const DEPARTMENT_ID = "unidentified";
const DEPARTMENT_NAME = "Unidentified";

export const extractAgentInfoRegionMetadata = (data) => {
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

  // Metadata lives above the table header (Excel rows 1-12)
  for (let i = 0; i < Math.min(data.length, 13); i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const firstCell = String(row[0] ?? "").trim();
    if (!firstCell) continue;
    const label = firstCell.toLowerCase();

    // First non-empty cell after the label (values sit in B..F)
    const labelValue = (() => {
      for (let c = 1; c <= 5; c++) {
        const v = row[c];
        if (v !== undefined && v !== null && String(v).trim() !== "") {
          return String(v).trim();
        }
      }
      return "";
    })();

    if (i === 0) {
      metadata.ReturnKey = firstCell;
      if (firstCell.includes("AI001")) {
        metadata.reportType = REPORT_TYPE_ID;
        metadata.reportTypeId = REPORT_TYPE_ID;
        metadata.departmentId = DEPARTMENT_ID;
        metadata.departmentName = DEPARTMENT_NAME;
      }
    } else if (label.includes("agent information")) {
      metadata.reportTitle = firstCell.replace(/\s+/g, " ").trim();
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

const extractAgentInfoRegionData = (data) => {
  // 1. Find the header row: "S.No." | "Name of the Region" | ...
  let headerIndex = -1;
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const first = String(row[0] ?? "")
      .trim()
      .toLowerCase();
    const second = String(row[1] ?? "")
      .trim()
      .toLowerCase();
    if (first === "s.no." || second === "name of the region") {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    console.log("Could not find data table");
    return {
      hierarchicalData: [],
      columns: [],
      additionalColumns: [],
      noandtitles: [],
    };
  }

  // 2. Value columns: everything after S.No. and Name of the Region
  const headerRow = data[headerIndex];
  const NUMERIC_START = 2;
  const cols = [];
  for (let c = NUMERIC_START; c < headerRow.length; c++) {
    const name = String(headerRow[c] ?? "").trim();
    if (name) cols.push({ name, index: c });
  }
  // "Responsible Branch" is text, all others are numbers
  const isTextColumn = (name) => name.toLowerCase().includes("branch");

  const getValue = (index, row) => {
    const val = parseFloat(String(row[index] ?? "").replace(/[,%\s]/g, ""));
    return !isNaN(val) && val !== 0 ? val.toFixed(2) : "0";
  };
  const getStringValue = (index, row) => String(row[index] ?? "").trim();

  // 3. Rows
  const hierarchicalData = [];
  for (let i = headerIndex + 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const label = String(row[1] ?? "").trim(); // Name of the Region
    if (!label) continue; // skips the blank template rows

    const sNo = String(row[0] ?? "").trim();
    const values = {};
    for (const col of cols) {
      values[col.name] = isTextColumn(col.name)
        ? getStringValue(col.index, row)
        : getValue(col.index, row);
    }

    hierarchicalData.push({
      id: `row-${i}`,
      sNo,
      label,
      values,
      rowNumber: i + 1,
      level: 1,
      isTotalRow: label.toLowerCase().startsWith("total"),
      isSectionHeader: false,
      children: [],
    });
  }

  return {
    hierarchicalData,
    columns: cols.map((c) => c.name),
    additionalColumns: [],
    noandtitles: ["S.No.", "Name of the Region"],
  };
};

export default extractAgentInfoRegionData;
