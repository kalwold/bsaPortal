import { excelDateToISO } from "../../../utils";
export const extractCorporateProfileBoardMetadata=(data)=>{
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
    

    if (i === 0 && firstCell) {
      metadata.ReturnKey = firstCell;

      if (firstCell.includes("CP8_CI001") ) {
        metadata.reportType = "unidentified-quarterly_corporate-profile-board";
        metadata.reportTypeId = "unidentified-quarterly_corporate-profile-board";
        metadata.departmentId = "unidentified";
        metadata.departmentName = "Unidentified";
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

    // if (i === 12) {
    //   const unitCell = row.find(
    //     (c) => c && String(c).toLowerCase().includes("million"),
    //   );
    //   if (unitCell) metadata.unit = String(unitCell).trim();
    // }
  }
  return metadata;
};
const extractCorporateProfileBoardData=(data)=>{
  let dataTableStart = -1;
  let noandtitles = [];

  if (data[13]) {
    noandtitles = [
      String(data[14][0] || "").trim(),
      String(data[14][1] || "").trim(),
    ];
  }
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = String(row[0] || "").trim();
    if (firstCell === "Code") {
      dataTableStart =  i + 1 ;
      break;
    }
  }

  if (dataTableStart === -1) {
    return { hierarchicalData: [], columns: [], additionalColumns: [], noandtitles: [] };
  }
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = String(row[0] || "").trim();
    if (firstCell === "Code" || firstCell === "1" || firstCell === "1.") {
      dataTableStart = firstCell === "Code" ? i + 1 : i;
      break;
    }
  }

  if (dataTableStart === -1) {
    return { hierarchicalData: [], columns: [], additionalColumns: [], noandtitles: [] };
  }
  // Column indices matching the screenshot
  const NO_COL = 0;
  const FULL_NAME_COL = 1;
  const TITLE_COL = 2;
  const PHONE_DIRECT_COL = 3;
  const PHONE_MOBILE_COL = 4;
  const QUALIFICATION_COL = 5;
  const SERVICE_YEAR_COL = 6;
  const IS_DIRECT_INF_COL = 7;


  const columns = [
    "Title",
    "Telephone_Direct_Line",
    "Telephone_Mobile",
    "Qualification",
    "Year_Of_Service",
    "Is_Direct_Influential_Shareholder",
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
    if (!fullName) continue;
   

    const values = {
      Title: getStringValue(TITLE_COL, row),
      Telephone_Direct_Line: getStringValue(PHONE_DIRECT_COL, row),
      Telephone_Mobile: getStringValue(PHONE_MOBILE_COL, row),
      Qualification: getStringValue(QUALIFICATION_COL, row),
      Year_Of_Service: getStringValue(SERVICE_YEAR_COL, row),
      Is_Direct_Influential_Shareholder: getStringValue(IS_DIRECT_INF_COL, row),
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
    noandtitles,
  };
}
export default extractCorporateProfileBoardData;