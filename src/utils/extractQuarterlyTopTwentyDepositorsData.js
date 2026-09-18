import { excelDateToISO } from "./excelParser";

export const extractQuarterlyTopTwentyDepositorsMetadata = (data) => {
  const metadata = {
    reportTitle: "",
    ReturnKey: "",
    institutionCode: "",
    financialYear: "",
    startDate: "",
    endDate: "",
    reportType: "",
    unit: "",
    departmentName: "",
    departmentId: "",
  };

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const firstCell = String(row[0] || "").trim();
    const secondCell = String(row[1] || "").trim();
    const thirdCell = String(row[2] || "").trim();
    const unitCell = String(row[6] || "").trim(); // column G carries "In millions of birr"

    // Row 1: return key / report identifier
    if (i === 0 && firstCell) {
      metadata.ReturnKey = firstCell;

      if (firstCell.includes("NBE_20_DEP_MR001")) {
        metadata.reportType = "finance-top_twenty_depositors";
        metadata.departmentName = "Finance";
        metadata.departmentId = "finance";
        metadata.reportTypeId = "finance-top_twenty_depositors";
      }
    }

    // Row 4: report title ("Quartely Top Twenty (20) Depositors' Report")
    if (i === 3 && (firstCell || secondCell)) {
      metadata.reportTitle = firstCell || "";
    }

    // Row 8: Institution code
    if (
      i === 7 &&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("Instiution")
    ) {
      metadata.institutionCode = thirdCell || "";
    }

    // Row 9: Financial Year
    if (
      i === 8 &&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("Financial Year")
    ) {
      metadata.financialYear = thirdCell || "";
    }

    // Row 10: Start Date
    if (
      i === 9 &&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("Start Date")
    ) {
      metadata.startDate = excelDateToISO(thirdCell) || "";
    }

    // Row 11: End Date
    if (
      i === 10 &&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("End Date")
    ) {
      metadata.endDate = excelDateToISO(thirdCell) || "";
    }

    // Row 13: unit note, e.g. "In millions of birr"
    if (i === 12 && unitCell && unitCell.toLowerCase().includes("in")) {
      metadata.unit = unitCell;
    }
  }

  return metadata;
};

const extractQuarterlyTopTwentyDepositorsData = (data) => {
  const columns = [
    "Demand_Current",
    "Saving",
    "Time_Fixed",
    "Days_Left_for_Maturity",
    "Total_per_depositor",
  ];
  let dataTableStart = -1;

  // Find the header row: "S.No" | "Name of Depositor" (the sub-header with Demand/Saving/Time sits one row below)
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = String(row[0] || "").trim();
    const secondCell = String(row[1] || "").trim();
    if (firstCell === "S.No" && secondCell.toLowerCase().includes("name of depositor")) {
      dataTableStart = i + 2; // skip both header rows
      break;
    }
  }

  if (dataTableStart === -1) {
    return { hierarchicalData: [], columns, additionalColumns: [] };
  }

  const rows = [];

  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const firstCell = String(row[0] || "").trim();
    const secondCell = String(row[1] || "").trim();

    if (secondCell.toLowerCase().includes("note")) continue;
    if ( !secondCell) continue;
if (secondCell.includes('Note:'))continue
    const isSubTotal = secondCell.toLowerCase().includes("sub total");
    const isGrandTotal = secondCell.toLowerCase().includes("grand total");

    const getVal = (idx) => {
      const raw = row[idx];
      if (raw === undefined || raw === null || String(raw).trim() === "") return "0";
      const cleaned = String(raw).replace(/,/g, "").trim();
      const val = parseFloat(cleaned);
      return !isNaN(val) ? val.toFixed(2) : "0";
    };
  

    const entry = {
      id: firstCell || "",
      sNo: firstCell || "",
      label: isSubTotal || isGrandTotal ? secondCell : secondCell || '',
      values: {
        Demand_Current: getVal(2),
        Saving: getVal(3),
        Time_Fixed: getVal(4),
        Days_Left_for_Maturity: getVal(5),
        Total_per_depositor: getVal(6),
      },
      rowNumber: i + 1,
      level: 0,
      isTotalRow: isSubTotal || isGrandTotal,
      isSubTotal,
      isGrandTotal,
    };

    rows.push(entry);
  }

  return { hierarchicalData: rows, columns, additionalColumns: [] };
};

export default extractQuarterlyTopTwentyDepositorsData;
