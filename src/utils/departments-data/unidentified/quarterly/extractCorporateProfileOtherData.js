import { excelDateToISO } from "../../../utils";
export const extractCorporateProfileOtherMetadata =(data)=>{
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

      if (firstCell.includes("CP6_CO001") ) {
        metadata.reportType = "unidentified-quarterly_corporate-profile-other";
        metadata.reportTypeId = "unidentified-quarterly_corporate-profile-other";
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
const extractCorporateProfileOtherData=(data)=>{
      const columns = ["Data"];
  let dataTableStart = -1;

  // Find the header row: "S.No." | "Description"
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = String(row[0] || "").trim();
    if (firstCell.toLowerCase().includes("number of atms")) {
      dataTableStart = i ;
      break;
    }
  }
if (dataTableStart === -1) {
    return { hierarchicalData: [], columns, additionalColumns: [] };
  }
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
  const nodeMap = new Map();
  const topLevelNodes = [];

for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    
    const description = String(row[0] || "").trim();
    if (!description) continue;

    const value = getValue(2,row)

 
    const entry = {
      id: '' ,
      sNo: '' ,
      label: description,
      values: { 'Data': value },
      rowNumber: i + 1,
      isTotalRow: false,
      children: [],
    };


        topLevelNodes.push(entry);
      
    
  }


  return { hierarchicalData: topLevelNodes, columns, additionalColumns: [], noandtitles:['Description']};
}
export default extractCorporateProfileOtherData

