import { excelDateToISO } from "../../../utils";

// TODO: set these to the right department / report type for CD001
const REPORT_TYPE_ID = "unidentified-branchOps-quarterly_avg-interest-rate-deposits";
const DEPARTMENT_ID = "unidentified";
const DEPARTMENT_NAME = "Unidentified";

export const extractAvgInterestRateDepositsMetadata = (data) => {
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
  for (let i = 0; i < Math.min(data.length, 14); i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const firstCell = String(row[0] ?? "").trim();
    if (!firstCell) continue;
    const label = firstCell.toLowerCase();

    // First non-empty cell after the label (values sit in B..C)
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
      if (firstCell.includes("CD001")) {
        metadata.reportType = REPORT_TYPE_ID;
        metadata.reportTypeId = REPORT_TYPE_ID;
        metadata.departmentId = DEPARTMENT_ID;
        metadata.departmentName = DEPARTMENT_NAME;
      }
    } else if (label.includes("corporate profile") || label.includes("interest rate")) {
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

const extractAvgInterestRateDepositsData = (data) => {
  // 1. Find the header row: [ , "Particular", "Interest Rate (Annual)" ]
  let headerIndex = -1;
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    if (String(row[1] ?? "").trim().toLowerCase() === "particular") {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    console.log("Could not find data table");
    return { hierarchicalData: [], columns: [], additionalColumns: [], noandtitles: [] };
  }

  // 2. Value columns: everything after No. and Particular
  const headerRow = data[headerIndex];
  const cols = [];
  for (let c = 2; c < headerRow.length; c++) {
    const name = String(headerRow[c] ?? "").trim();
    if (name) cols.push({ name, index: c });
  }

  const getValue = (index, row) => {
    const val = parseFloat(String(row[index] ?? "").replace(/[,%\s]/g, ""));
    return !isNaN(val) && val !== 0 ? val.toFixed(2) : "0";
  };

  // 3. Rows. S.No. is 1, 1.1, 1.2 ... 2, 2.1 ... 3 -> parent = integer part
  const topLevelNodes = [];
  const parentsBySection = {};

  for (let i = headerIndex + 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const label = String(row[1] ?? "").trim();
    if (!label) continue; // skips the blank template rows

    const sNo = String(row[0] ?? "").trim();
    const isChild = sNo.includes(".");
    const section = sNo.split(".")[0];

    const values = {};
    for (const col of cols) values[col.name] = getValue(col.index, row);

    const entry = {
      id: `row-${i}`,
      sNo,
      label,
      values,
      rowNumber: i + 1,
      level: isChild ? 2 : 1,
      isTotalRow: false,
      isSectionHeader: false,
      children: [],
    };

    if (isChild && parentsBySection[section]) {
      parentsBySection[section].children.push(entry);
      parentsBySection[section].isSectionHeader = true;
    } else {
      parentsBySection[section] = entry;
      topLevelNodes.push(entry);
    }
  }

  return {
    hierarchicalData: topLevelNodes,
    columns: cols.map((c) => c.name),
    additionalColumns: [],
    noandtitles: ["No.", "Particular"],
  };
};

export default extractAvgInterestRateDepositsData;
