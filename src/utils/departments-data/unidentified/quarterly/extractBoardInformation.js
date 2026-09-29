import { excelDateToISO } from "../../../utils";

const REPORT_TYPE_ID = "unidentified-branchOps-quarterly_board-information";
const DEPARTMENT_ID = "unidentified";
const DEPARTMENT_NAME = "Unidentified";

export const extractBoardInformationMetadata = (data) => {
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

  // Metadata lives above the table header (Excel rows 1-13)
  for (let i = 0; i < Math.min(data.length, 13); i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const firstCell = String(row[0] ?? "").trim();
    if (!firstCell) continue;
    const label = firstCell.toLowerCase();

    // First non-empty cell after the label (values sit in B..H)
    const labelValue = (() => {
      for (let c = 1; c <= 7; c++) {
        const v = row[c];
        if (v !== undefined && v !== null && String(v).trim() !== "") {
          return String(v).trim();
        }
      }
      return "";
    })();

    if (i === 0) {
      metadata.ReturnKey = firstCell;
      if (firstCell.includes("CI001")) {
        metadata.reportType = REPORT_TYPE_ID;
        metadata.reportTypeId = REPORT_TYPE_ID;
        metadata.departmentId = DEPARTMENT_ID;
        metadata.departmentName = DEPARTMENT_NAME;
      }
    } else if (label.includes("corporate profile") || label.includes("board information")) {
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

const extractBoardInformationData = (data) => {
  // 1. Find the header row: "Code" | "Name" | "Title" | "Telephone" ...
  let headerIndex = -1;
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const first = String(row[0] ?? "").trim().toLowerCase();
    const second = String(row[1] ?? "").trim().toLowerCase();
    if (first === "code" && second === "name") {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    console.log("Could not find data table");
    return { hierarchicalData: [], columns: [], additionalColumns: [], noandtitles: [] };
  }

  // 2. Two-row header: "Telephone" (merged over D:E) sits above "Direct Line" / "Mobile"
  const topRow = data[headerIndex] || [];
  const subRow = data[headerIndex + 1] || [];
  const dataStart = headerIndex + 2;

  const cols = [];
  let lastTop = "";
  const width = Math.max(topRow.length, subRow.length);
  for (let c = 2; c < width; c++) {
    const top = String(topRow[c] ?? "").trim();
    const sub = String(subRow[c] ?? "").trim();
    if (top) lastTop = top;
    if (!top && !sub) continue;
    const name = sub ? (lastTop && lastTop !== sub ? `${lastTop} - ${sub}` : sub) : top;
    cols.push({ name, index: c });
    if (!sub) lastTop = top; // a plain single-row header ends any merged group
  }

  const getStringValue = (index, row) => String(row[index] ?? "").trim();

  // 3. Rows: one board member per row, label = Name
  const hierarchicalData = [];
  for (let i = dataStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const label = String(row[1] ?? "").trim(); // Name
    if (!label) continue; // skips the blank template rows

    const values = {};
    for (const col of cols) values[col.name] = getStringValue(col.index, row);

    hierarchicalData.push({
      id: `row-${i}`,
      sNo: String(row[0] ?? "").trim(), // Code
      label,
      values,
      rowNumber: i + 1,
      level: 1,
      isTotalRow: false,
      isSectionHeader: false,
      children: [],
    });
  }

  return {
    hierarchicalData,
    columns: cols.map((c) => c.name),
    additionalColumns: [],
    noandtitles: ["Code", "Name"],
  };
};

export default extractBoardInformationData;
