import { excelDateToISO } from "../../../utils";

const REPORT_TYPE_ID = "unidentified-quarterly_avg-interest-rate-loans";
const DEPARTMENT_ID = "unidentified";
const DEPARTMENT_NAME = "Unidentified";

export const extractAvgInterestRateLoansMetadata = (data) => {
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

    // First non-empty cell after the label (values sit in B..D)
    const labelValue = (() => {
      for (let c = 1; c <= 3; c++) {
        const v = row[c];
        if (v !== undefined && v !== null && String(v).trim() !== "") {
          return String(v).trim();
        }
      }
      return "";
    })();

    if (i === 0) {
      metadata.ReturnKey = firstCell;
      if (firstCell.includes("CL001")) {
        metadata.reportType = REPORT_TYPE_ID;
        metadata.reportTypeId = REPORT_TYPE_ID;
        metadata.departmentId = DEPARTMENT_ID;
        metadata.departmentName = DEPARTMENT_NAME;
      }
    } else if (
      label.includes("corporate profile") ||
      label.includes("interest rate")
    ) {
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

const extractAvgInterestRateLoansData = (data) => {
  // 1. Find the header row: "Reference" | "Loans and Advances/Loan Products" | ...
  let headerIndex = -1;
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    if (
      String(row[0] ?? "")
        .trim()
        .toLowerCase() === "reference"
    ) {
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

  // 2. Value columns: everything after Reference and the product name
  const headerRow = data[headerIndex];
  const cols = [];
  for (let c = 2; c < headerRow.length; c++) {
    const name = String(headerRow[c] ?? "").trim();
    if (name) cols.push({ name, index: c });
  }
  // "Remark" is free text, the rest are numbers
  const isTextColumn = (name) => name.toLowerCase().includes("remark");

  const getValue = (index, row) => {
    const val = parseFloat(String(row[index] ?? "").replace(/[,%\s]/g, ""));
    return !isNaN(val) && val !== 0 ? val.toFixed(2) : "0";
  };
  const getStringValue = (index, row) => String(row[index] ?? "").trim();

  // 3. Rows: one loan product per row
  const hierarchicalData = [];
  for (let i = headerIndex + 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const label = String(row[1] ?? "").trim();
    if (!label) continue; // skips the blank template rows

    const values = {};
    for (const col of cols) {
      values[col.name] = isTextColumn(col.name)
        ? getStringValue(col.index, row)
        : getValue(col.index, row);
    }

    hierarchicalData.push({
      id: `row-${i}`,
      sNo: String(row[0] ?? "").trim(), // Reference
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
    noandtitles: ["Reference", "Loans and Advances/Loan Products"],
  };
};

export default extractAvgInterestRateLoansData;
