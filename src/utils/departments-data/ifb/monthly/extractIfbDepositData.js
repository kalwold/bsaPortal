import { excelDateToISO } from "../../../utils";

const REPORT_TYPE_ID = "ifb-quarterly_deposit-data";
const DEPARTMENT_ID = "ifb";
const DEPARTMENT_NAME = "IFB";
const DEFAULT_TITLE = "IFB Deposit Accounts & Depositors";

export const extractDepositBankIFBMetadata = (data) => {
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

  // Rows 0-3 look like:  [ReturnKey | "INSTITUTION Code" | value]
  //                      [         | "FINANCIAL YEAR"    | value] ...
  // The value sits in column C (merged C:D), so start looking at column index 2.
  const getValue = (row) => {
    for (let c = 2; c <= 5; c++) {
      const v = row[c];
      if (v !== undefined && v !== null && String(v).trim() !== "") {
        return String(v).trim();
      }
    }
    return "";
  };

  for (let i = 0; i < Math.min(data.length, 6); i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const firstCell = String(row[0] ?? "").trim();
    const label = String(row[1] ?? "")
      .trim()
      .toLowerCase();

    if (i === 0 && firstCell) {
      metadata.ReturnKey = firstCell;
      if (firstCell.includes("IFBDPO001")) {
        metadata.reportType = REPORT_TYPE_ID;
        metadata.reportTypeId = REPORT_TYPE_ID;
        metadata.departmentId = DEPARTMENT_ID;
        metadata.departmentName = DEPARTMENT_NAME;
        metadata.reportTitle = DEFAULT_TITLE;
      }
    }

    if (label.includes("institution")) {
      metadata.institutionCode = getValue(row);
    } else if (label.includes("financial year")) {
      metadata.financialYear = getValue(row);
    } else if (label.includes("start date")) {
      metadata.startDate = excelDateToISO(getValue(row)) || "";
    } else if (label.includes("end date")) {
      metadata.endDate = excelDateToISO(getValue(row)) || "";
    }
  }

  return metadata;
};

const extractDepositBankIFBData = (data) => {
  // ---- 1. locate the header row (A/A | Afar | Amhara | ... | Total) ----
  let headerIndex = -1;
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    if (String(row[1] ?? "").trim() === "A/A") {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    console.log("extractDepositBankIFBData: could not find header row");
    return { hierarchicalData: [], columns: [], additionalColumns: [] };
  }

  // ---- 2. read regions + Total column from the header row ----
  // NOTE: "A/A" (Addis Ababa) is a region column here, not a label.
  const headerRow = data[headerIndex];
  const regions = [];
  let totalColumnIndex = -1;

  for (let c = 1; c < headerRow.length; c++) {
    const cell = String(headerRow[c] ?? "").trim();
    if (!cell) continue;
    if (cell === "Total") totalColumnIndex = c;
    else regions.push({ name: cell, index: c });
  }

  const columns = [...regions.map((r) => r.name), "Total"];
  const lastCol =
    totalColumnIndex !== -1
      ? totalColumnIndex
      : regions[regions.length - 1].index;

  // ---- helpers ----
  const isEmpty = (v) =>
    v === undefined || v === null || String(v).trim() === "";

  const getValue = (index, row) => {
    if (index !== undefined && index >= 0 && index < row.length) {
      const val = parseFloat(String(row[index] ?? "").replace(/[,%\s]/g, ""));
      if (!isNaN(val) && val !== 0) return val.toFixed(2);
    }
    return "0";
  };

  

  // Active_Total, Inactive_Total, Age_Total, Location_Total,
  // "IFB Savings Accounts_Total", "Total"  (but NOT Total_Male, Total_Business ...)
  const isTotalRow = (label) => /(^|_)total$/i.test(label);

  // CHECK_Age=Total, CHECK_Urban+Rural+Not Specified=Total, CHECK_Value_...=Total
  const isCheckRow = (label) => /^check_/i.test(label);

  // "IFB Savings Accounts", "..._by Age Group", "..._by Location",
  // the "Outstanding Balance (ETB) total Figure" repeated header row, etc.
  const isSectionHeaderRow = (label, row) => {
    if (String(row[1] ?? "").trim() === "A/A") return true; // repeated header row
    if (/_by\s+(age group|location)\s*$/i.test(label)) return true;
    for (let c = 1; c <= lastCol; c++) {
      if (!isEmpty(row[c])) return false;
    }
    return true; // nothing in any value column
  };

  // ---- 3. parse rows into sections > children ----
  const topLevelNodes = [];
  let currentSection = null;
  let sectionNo = 0;
  let rowNo = 0;

  for (let i = headerIndex + 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const label = String(row[0] ?? "").trim();
    if (!label) continue;

    if (isSectionHeaderRow(label, row)) {
      sectionNo += 1;
      rowNo = 0;
      currentSection = {
        id: `${sectionNo}`,
        sNo: `${sectionNo}`,
        label,
        values: {},
        rowNumber: i + 1,
        level: 1,
        isTotalRow: false,
        isSectionHeader: true,
        children: [],
      };
      topLevelNodes.push(currentSection);
      continue;
    }

    const values = {};
    for (const region of regions)
      values[region.name] = getValue(region.index, row);
    values["Total"] = getValue(totalColumnIndex, row);

    rowNo += 1;
    const entry = {
      id: `${sectionNo}.${rowNo}`,
      sNo: `${sectionNo}.${rowNo}`,
      label,
      values,
      rowNumber: i + 1,
      level: currentSection ? 2 : 1,
      isTotalRow: isTotalRow(label),
      isCheckRow: isCheckRow(label),
      isSectionHeader: false,
      section: currentSection ? currentSection.label : "",
      children: [],
    };

    if (currentSection) currentSection.children.push(entry);
    else topLevelNodes.push(entry);
  }

  return {
    hierarchicalData: topLevelNodes,
    columns,
    additionalColumns: [],
    noandtitles: ["No.", "Description"],
  };
};

export default extractDepositBankIFBData;
