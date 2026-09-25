import { excelDateToISO } from "../../../utils";

export const extractFraudOutstandingMetadata = (data) => {
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
    console.log(`extractFraudOutstanding row ${i} data =`, row);
    if (!row || row.length === 0) continue;

    const firstCell = String(row[0] || "").trim();

    const labelValue = (() => {
      for (let c = 1; c <= 5; c++) {
        const v = row[c];
        if (v !== undefined && v !== null && String(v).trim() !== "") {
          return String(v).trim();
        }
      }
      return "";
    })();
    // Excel row number, full row contents, and which value it picked).
    if (i <= 13) {
      console.log(
        `[metadata] row[${i}] (Excel row ${i + 1}):`,
        row,
        `| firstCell="${firstCell}" | labelValue picked="${labelValue}"`,
      );
    }

    if (i === 0 && firstCell) {
      metadata.ReturnKey = firstCell;

      if (firstCell.includes("FRA_OUT_FO002") || firstCell.includes("FO002")) {
        metadata.reportType = "branchOps-quarterly_summary-fraud-outstanding";
        metadata.reportTypeId = "branchOps-quarterly_summary-fraud-outstanding";
        metadata.departmentId = "branchOps";
        metadata.departmentName = "Branch Operation";
      }
    }

    if (i === 3 && firstCell) {
      metadata.reportTitle = firstCell.replace(/\s+/g, " ").trim();
    }

    if (
      i === 7 &&
      firstCell &&
      (firstCell.toLowerCase().includes("instiution") ||
        firstCell.toLowerCase().includes("institution"))
    ) {
      metadata.institutionCode = labelValue || "";
    }

    if (
      i === 8 &&
      firstCell &&
      firstCell.toLowerCase().includes("financial year")
    ) {
      metadata.financialYear = labelValue || "";
    }

    if (
      i === 9 &&
      firstCell &&
      firstCell.toLowerCase().includes("start date")
    ) {
      metadata.startDate = excelDateToISO(labelValue) || "";
    }

    if (i === 10 && firstCell && firstCell.toLowerCase().includes("end date")) {
      metadata.endDate = excelDateToISO(labelValue) || "";
    }

    if (i === 12) {
      const unitCell = row.find(
        (c) => c && String(c).toLowerCase().includes("million"),
      );
      if (unitCell) metadata.unit = String(unitCell).trim();
    }
  }
  return metadata;
};

const extractFraudOutstandingData = (data) => {
  let headerRowIdx = -1;
  let noandtitles = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = String(row[0] || "").trim();
    if (firstCell === "S.No.") {
      headerRowIdx = i;
      const secondCell = String(row[1] || "").trim();
      noandtitles = [firstCell, secondCell];
      break;
    }
  }

  console.log(
    '[FO002] "S.No." header found at row index:',
    headerRowIdx,
    headerRowIdx === -1
      ? '(NOT FOUND — check that A14 literally reads "S.No.")'
      : `(Excel row ${headerRowIdx + 1})`,
  );

  if (headerRowIdx === -1) {
    return {
      hierarchicalData: [],
      columns: [],
      additionalColumns: [],
      noandtitles,
    };
  }

  // Header spans 2 rows here (main header on row 14, Number/Amount
  const dataTableStart = headerRowIdx + 2;
  console.log(
    "[FO002] data rows expected to start at index:",
    dataTableStart,
    `(Excel row ${dataTableStart + 1})`,
  );

  const getNum = (row, idx) => {
    if (idx < row.length) {
      const raw = row[idx];
      if (raw === undefined || raw === null || String(raw).trim() === "")
        return "0";
      // Cells arrive from XLSX as formatted display strings (the parser
      // calls sheet_to_json with raw:false), e.g. "7,877,545.00" for a
      // number formatted with thousands separators. parseFloat() stops
      // at the first non-numeric character, so parseFloat("7,877,545.00")
      // silently returns 7 instead of 7877545 — strip commas first.
      const cleaned = String(raw).replace(/,/g, "").trim();
      const val = parseFloat(cleaned);
      if (!isNaN(val) && val !== 0) return val.toFixed(2);
    }
    return "0";
  };
  const getStr = (row, idx) =>
    String((idx < row.length && row[idx]) || "").trim();

  const entries = [];

  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0 || row[i] === 0 || row[i] === "") continue;

    const sNoRaw = row[0];
    const categoryCell = getStr(row, 1);
    const typeOfFraudCell = getStr(row, 2);
    const isNumericSNo =
      sNoRaw !== undefined && sNoRaw !== "" && !isNaN(parseFloat(sNoRaw));
    // This template's grand-total row is just "Total" (no "sub total"/
    // "grand total" wording like TB001), so match on "total" alone.
    const isTotalLabel = /total/i.test(String(sNoRaw || "").trim());

    if (!isNumericSNo && !isTotalLabel) {
      console.log(
        `[FO002] row[${i}] (Excel row ${i + 1}) skipped — sNo="${sNoRaw}"`,
      );
      continue; // skip notes / blank rows
    }
    console.log(
      `[FO002] row[${i}] (Excel row ${i + 1}) included — sNo="${sNoRaw}", category="${categoryCell}", isTotalLabel=${isTotalLabel}`,
    );

    const values = {
      Category: isTotalLabel ? "" : categoryCell,
      Type_of_Fraud: isTotalLabel ? "" : typeOfFraudCell,
      Prev_Qtr_Outstanding_Number_A: getNum(row, 3),
      Prev_Qtr_Outstanding_Amount_B: getNum(row, 4),
      New_Cases_Reported_Number_C: getNum(row, 5),
      New_Cases_Reported_Amount_D: getNum(row, 6),
      Recovered_Number_E: getNum(row, 7),
      Recovered_Amount_F: getNum(row, 8),
      Current_Qtr_Outstanding_Number_G: getNum(row, 9),
      Current_Qtr_Outstanding_Amount_H: getNum(row, 10),
      Written_Off_Amount_I: getNum(row, 11),
      Provision_Held_Amount_J: getNum(row, 12),
    };

    const isRowEmpty =
      !isTotalLabel &&
      !categoryCell &&
      !typeOfFraudCell &&
      Object.values(values).every((v) => v === "" || v === "0");

    if (isRowEmpty) {
      console.log(
        `[FO002] row[${i}] (Excel row ${i + 1}) skipped — S.No=${sNoRaw} but no real data entered`,
      );
      continue;
    }

    entries.push({
      id: isTotalLabel ? "" : String(sNoRaw).trim(),
      sNo: isTotalLabel ? "" : String(sNoRaw).trim(),
      label: isTotalLabel ? "Total" : categoryCell,
      values,
      rowNumber: i + 1,
      level: 1,
      isTotalRow: isTotalLabel,
      isSectionHeader: false,
      children: [],
    });
  }

  entries.forEach((e) => {
    if (e.children && e.children.length === 0) delete e.children;
  });

  const columnNames = [
    "Category",
    "Type_of_Fraud",
    "Prev_Qtr_Outstanding_Number_A",
    "Prev_Qtr_Outstanding_Amount_B",
    "New_Cases_Reported_Number_C",
    "New_Cases_Reported_Amount_D",
    "Recovered_Number_E",
    "Recovered_Amount_F",
    "Current_Qtr_Outstanding_Number_G",
    "Current_Qtr_Outstanding_Amount_H",
    "Written_Off_Amount_I",
    "Provision_Held_Amount_J",
  ];

  return {
    hierarchicalData: entries,
    columns: columnNames,
    additionalColumns: [],
    noandtitles,
  };
};

export default extractFraudOutstandingData;
