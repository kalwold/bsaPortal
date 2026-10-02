import { excelDateToISO } from "../../../utils";
export const extractCorporateProfileMetadata =(data)=>{
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

      if (firstCell.includes("CP1_CP001") ) {
        metadata.reportType = "unidentified-quarterly_corporate-profile";
        metadata.reportTypeId = "unidentified-quarterly_corporate-profile";
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
const extractCorporateProfileData=(data)=>{
      const columns = ["Data"];
  let dataTableStart = -1;

  // Find the header row: "S.No." | "Description"
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = String(row[0] || "").trim();
    if (firstCell.toLowerCase().includes("cp1. head")) {
      dataTableStart = i + 1;
      break;
    }
  }
if (dataTableStart === -1) {
    return { hierarchicalData: [], columns, additionalColumns: [] };
  }

    const getStringValue = (index, row) => {
    if (index !== undefined && index < row.length) {
      return String(row[index] || '').trim();
    }
    return '';
  };
  const nodeMap = new Map();
  const topLevelNodes = [];

for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const code = String(row[0] || "").trim();
    const description = String(row[1] || "").trim();
    if (!description || !code) continue;

    const value = getStringValue(2,row)

    const codeParts = code.split(".");
    const level = codeParts.length;
 
    const entry = {
      id: code,
      sNo: code,
      label: description,
      values: { 'Data': value },
      rowNumber: i + 1,
      level,
      isTotalRow: false,
      children: [],
    };

    nodeMap.set(code, entry);

    // Top-level items (1, 2, 3, ...) go straight in; sub-items (4.1, 13.2, ...) nest under their parent
    if (codeParts.length === 1) {
      topLevelNodes.push(entry);
    } else {
      const parentCode = codeParts.slice(0, -1).join(".");
      const parent = nodeMap.get(parentCode);
      if (parent) {
        parent.children.push(entry);
      } else {
        topLevelNodes.push(entry);
      }
    }
  }

  const cleanData = (nodes) => {
    nodes.forEach((node) => {
      if (node.children && node.children.length === 0) {
        delete node.children;
      } else if (node.children) {
        cleanData(node.children);
      }
    });
  };
  cleanData(topLevelNodes);

  return { hierarchicalData: topLevelNodes, columns, additionalColumns: [], noandtitles:['CP1. Head Office Address','Description']};
}
export default extractCorporateProfileData