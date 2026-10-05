import { excelDateToISO } from "../../../utils";

export const extractInstitutionalInsuredDepositorsMetadata = (data) => {
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

    const labelValue = (() => {
      for (let c = 1; c <= 5; c++) {
        const v = row[c];
        if (v !== undefined && v !== null && String(v).trim() !== "") {
          return String(v).trim();
        }
      }
      return "";
    })();

    // ReturnKey (usually in A1)
    if (i === 0 && firstCell) {
      metadata.ReturnKey = firstCell;

      // Adjust the code below to the real report code when you know it
      if (
        firstCell.includes("0016IN05001") ||
        firstCell.includes("INSTITUTIONAL")
      ) {
        metadata.reportType = "branchOps-institutional-insured-depositors";
        metadata.reportTypeId = "branchOps institutional insured depositors";
        metadata.departmentId = "branchOps";
        metadata.departmentName = "Branch Operation";
      }
    }

    // Title
    if (i === 1 && firstCell) {
      metadata.reportTitle = firstCell.replace(/\s+/g, " ").trim();
    }

    // Institution Code
    if (
      i === 2 &&
      secondCell &&
      (secondCell.toLowerCase().includes("institution") ||
        secondCell.toLowerCase().includes("instiution"))
    ) {
      metadata.institutionCode = labelValue || "";
    }

    // Financial Year
    if (
      i === 3 &&
      secondCell &&
      secondCell.toLowerCase().includes("financial year")
    ) {
      metadata.financialYear = labelValue || "";
    }

    // Start Date
    if (
      i === 4 &&
      secondCell &&
      secondCell.toLowerCase().includes("start date")
    ) {
      metadata.startDate = excelDateToISO(labelValue) || "";
    }

    // End Date
    if (
      i === 5 &&
      secondCell &&
      secondCell.toLowerCase().includes("end date")
    ) {
      metadata.endDate = excelDateToISO(labelValue) || "";
    }
  }

  return metadata;
};

const extractInstitutionalInsuredDepositorsData = (data) => {
  const hierarchicalData = [];
  let dataTableStart = -1;

  console.log("=== Extracting Institutional Insured Depositors Data ===");

  // Find header row that contains "No."
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = String(row[0] || "").trim();
    if (firstCell === "No.") {
      dataTableStart = i + 1;
      console.log("Found data table at row:", dataTableStart);
      break;
    }
  }

  if (dataTableStart === -1) {
    console.log("Could not find data table");
    return { hierarchicalData: [], columns: [], additionalColumns: [] };
  }

  // Column indices matching the screenshot
  const NO_COL = 0;
  const FULL_NAME_COL = 1;
  const ACCOUNT_COL = 2;
  const DATE_OF_COL = 3;
  const TIN_COL = 4;
  const ALT_ACCOUNT_COL = 5;
  const BANK_NAME_COL = 6;
  const HEAD_NAME_COL = 7;
  const ADDRESS_COL = 8;
  const REGION_COL = 9;
  const SUBCITY_COL = 10;
  const WOREDA_COL = 11;
  const MOBILE_COL = 12;
  const FIXED_PHONE_COL = 13;
  const JOINT_ACCOUNT_COL = 14;

  const columns = [
    "Full_Name",
    "Account",
    "Date_of",
    "TIN_Number",
    "Alternative_Account_Number",
    "Name_of_the_Bank",
    "Full_Name_of_Head",
    "Address_of_the_Institution",
    "Region",
    "Sub_City_Zone",
    "Woreda",
    "Mobile_Phone",
    "Fixed_Line_Phone_Number",
    "Is_Joint_Account",
  ];

  const getStringValue = (index, row) => {
    if (index !== undefined && index < row.length) {
      return String(row[index] || "").trim();
    }
    return "";
  };

  const topLevelNodes = [];

  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const no = String(row[NO_COL] || "").trim();
    const fullName = String(row[FULL_NAME_COL] || "").trim();

    // Skip empty / footer rows
    if (!no) continue;
    if (
      fullName.toLowerCase().includes("note") ||
      fullName.toLowerCase().includes("total")
    )
      continue;

    const values = {
      Full_Name: getStringValue(FULL_NAME_COL, row),
      Account: getStringValue(ACCOUNT_COL, row),
      Date_of: getStringValue(DATE_OF_COL, row),
      TIN_Number: getStringValue(TIN_COL, row),
      Alternative_Account_Number: getStringValue(ALT_ACCOUNT_COL, row),
      Name_of_the_Bank: getStringValue(BANK_NAME_COL, row),
      Full_Name_of_Head: getStringValue(HEAD_NAME_COL, row),
      Address_of_the_Institution: getStringValue(ADDRESS_COL, row),
      Region: getStringValue(REGION_COL, row),
      Sub_City_Zone: getStringValue(SUBCITY_COL, row),
      Woreda: getStringValue(WOREDA_COL, row),
      Mobile_Phone: getStringValue(MOBILE_COL, row),
      Fixed_Line_Phone_Number: getStringValue(FIXED_PHONE_COL, row),
      Is_Joint_Account: getStringValue(JOINT_ACCOUNT_COL, row),
    };

    topLevelNodes.push({
      id: no || "",
      sNo: no,
      label: fullName || "",
      values,
      rowNumber: i + 1,
      level: 1,
      isTotalRow: false,
      isSectionHeader: false,
      children: [],
    });
  }

  // Sort by No.
  topLevelNodes.sort((a, b) => {
    const aNum = parseInt(a.sNo, 10);
    const bNum = parseInt(b.sNo, 10);
    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
    return 0;
  });

  console.log("Total entries:", topLevelNodes.length);

  return {
    hierarchicalData: topLevelNodes,
    columns,
    additionalColumns: [],
    noandtitles: ["No.", "Full Name"],
  };
};

export default extractInstitutionalInsuredDepositorsData;
