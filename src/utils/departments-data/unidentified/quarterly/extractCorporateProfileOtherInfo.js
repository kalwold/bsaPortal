import { excelDateToISO } from "../../../utils";

const REPORT_TYPE_ID = "unidentified-corporate-profile-other-information";
const DEPARTMENT_ID = "unidentified";
const DEPARTMENT_NAME = "Unidentified";

// Labels that belong to the metadata block (everything else with a label is a data row)
const isMetadataLabel = (label) =>
  label.includes("corporate profile") ||
  label.includes("instiution") || // typo exists in the template
  label.includes("institution") ||
  label.includes("financial year") ||
  label.includes("start date") ||
  label.includes("end date");

// First non-empty cell after the label (values sit in B..D, in practice C)
const getLabelValue = (row) => {
  for (let c = 1; c <= 3; c++) {
    const v = row[c];
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      return String(v).trim();
    }
  }
  return "";
};

export const extractCorporateProfileOtherInfoMetadata = (data) => {
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

  // Metadata lives above the KPI rows (Excel rows 1-11)
  for (let i = 0; i < Math.min(data.length, 14); i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const firstCell = String(row[0] ?? "").trim();
    if (!firstCell) continue;
    const label = firstCell.toLowerCase();
    const labelValue = getLabelValue(row);

    if (i === 0) {
      metadata.ReturnKey = firstCell;
      if (firstCell.includes("CO001")) {
        metadata.reportType = REPORT_TYPE_ID;
        metadata.reportTypeId = REPORT_TYPE_ID;
        metadata.departmentId = DEPARTMENT_ID;
        metadata.departmentName = DEPARTMENT_NAME;
      }
    } else if (label.includes("corporate profile")) {
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

const extractCorporateProfileOtherInfoData = (data) => {
  const VALUE_COLUMN = "Value";

  // Counts (ATMs, branches, ...): "1,234" -> "1234"; blank/invalid -> "0"
  const parseCount = (raw) => {
    const val = parseFloat(String(raw ?? "").replace(/[,%\s]/g, ""));
    if (isNaN(val) || val === 0) return "0";
    return Number.isInteger(val) ? String(val) : val.toFixed(2);
  };

  // 1. Find where the KPI rows start: first labelled row after "End Date"
  let endDateIndex = -1;
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    if (
      String(row[0] ?? "")
        .trim()
        .toLowerCase()
        .includes("end date")
    ) {
      endDateIndex = i;
      break;
    }
  }

  if (endDateIndex === -1) {
    console.log("Could not find data table");
    return {
      hierarchicalData: [],
      columns: [],
      additionalColumns: [],
      noandtitles: [],
    };
  }

  // 2. Rows: one KPI per row, label in A, value in the first filled cell of B..D
  const hierarchicalData = [];
  let counter = 0;
  for (let i = endDateIndex + 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const label = String(row[0] ?? "")
      .replace(/\s+/g, " ")
      .trim();
    if (!label) continue; // skips the blank spacer rows
    if (isMetadataLabel(label.toLowerCase())) continue;

    counter += 1;
    hierarchicalData.push({
      id: `row-${i}`,
      sNo: String(counter),
      label,
      values: { [VALUE_COLUMN]: parseCount(getLabelValue(row)) },
      rowNumber: i + 1,
      level: 1,
      isTotalRow: false,
      isSectionHeader: false,
      children: [],
    });
  }

  return {
    hierarchicalData,
    columns: [VALUE_COLUMN],
    additionalColumns: [],
    noandtitles: ["No", "Particulars"],
  };
};

export default extractCorporateProfileOtherInfoData;
