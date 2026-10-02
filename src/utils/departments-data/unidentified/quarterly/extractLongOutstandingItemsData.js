import { excelDateToISO } from "../../../utils";
export const extractLongOutstandingItemsMetadata =(data)=>{
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

      if (firstCell.includes("LON_OUT_ITELI001") ) {
        metadata.reportType = "unidentified-quarterly_long-outstanding-items";
        metadata.reportTypeId = "unidentified-quarterly_long-outstanding-items";
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
const extractLongOutstandingItemsData=(data)=>{
  let dataTableStart = -1;
  let noandtitles = [];

  if (data[13]) {
    noandtitles = [
      String(data[15][0] || "").trim(),
      String(data[15][1] || "").trim(),
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
    if (firstCell === "Code") {
      dataTableStart = i + 1;
      break;
    }
  }

  if (dataTableStart === -1) {
    return { hierarchicalData: [], columns: [], additionalColumns: [], noandtitles: [] };
  }
  // Column indices matching the screenshot
  const NO_COL = 0;
  const DESC = 1;
  const AGE_91_180 = 2;
  const AGE_181_365 = 3;
  const AGE_365 = 4;
  const TOTAL = 5;
  const PROVISION_HELD = 6;
  const DESCRIPTION = 7;


  const columns = [
    "Age_91_180_Days",
    "Age_181_365_Days",
    "Age_Gt_365_Days",
    "Total",
    "Provision_Held",
    "Description",
    
  ];

  const getStringValue = (index, row) => {
    if (index !== undefined && index < row.length) {
      return String(row[index] || "").trim();
    }
    return "";
  };
      const getValue = (index, row) => {
      if (index !== undefined && index < row.length) {
        const val = parseFloat(String(row[index] ?? "").replace(/[,%\s]/g, ""));
        if (!isNaN(val) && val !== 0) {
          return val.toFixed(2);
        }
        return '0';
      }
      return '0';
    };

  const topLevelNodes = [];

  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const no = String(row[NO_COL] || "").trim();
    const desc = String(row[DESC] || "").trim();

    // Skip empty / footer rows
    if (!desc) continue;
   

    const values = {
      Age_91_180_Days: getValue(AGE_91_180, row),
      Age_181_365_Days: getValue(AGE_181_365, row),
      Age_Gt_365_Days: getValue(AGE_365, row),
      Total: getValue(TOTAL, row),
      Provision_Held: getStringValue(PROVISION_HELD, row),
      Description: getStringValue(DESCRIPTION, row)
    };

    topLevelNodes.push({
      id: no || "",
      sNo: no,
      label: desc || "",
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
export default extractLongOutstandingItemsData