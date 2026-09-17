import { excelDateToISO } from "./excelParser"
export const extractCapitalAdequacyOffBalanceSheetMetadata =(data)=>{

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
    if (row.length === 0) continue;
    const firstCell = String(row[0]).trim();
    const secondCell = String(row[1]).trim();
    const thirdCell = String(row[2]).trim();
    const fourthCell = String(row[5]).trim();

    if (i === 0 && firstCell) {
   metadata.ReturnKey = firstCell;

      if (firstCell.includes("CAP_ADQ_OFB_QO001") ) {
        metadata.reportType = "finance-quarterly_off-balancesheet";
        metadata.reportTypeId = "finance-quarterly_off-balancesheet";
        metadata.departmentName = "Finance";
        metadata.departmentId = "finance";
      }
    }

      if (( i === 3 ) && (firstCell || secondCell)) {
      metadata.reportTitle = firstCell || '';
      //console.log("Found Report Title:", metadata.reportTitle);
    }

    if (
      i === 7 &&
      (firstCell.includes("Institution") || firstCell.includes("Instiution"))
    ) {
      metadata.institutionCode = thirdCell;
    }
    if (i === 8 && firstCell.includes("Financial Year")) {
      metadata.financialYear = thirdCell;
    }
    if (i === 9 && firstCell.includes("Start Date")) {
      metadata.startDate = excelDateToISO(thirdCell);
    }
    if (i === 10 && firstCell.includes("End Date")) {
      metadata.endDate = excelDateToISO(thirdCell);
    }
    if (i === 12 && (fourthCell.includes("in") || fourthCell.includes("In"))) {
      metadata.unit = fourthCell;
    }
  }

  return metadata;
};
const extractCapitalAdequacyOffBalanceSheetData=(data)=>{
    const sanitizeKey = (text) => {
  return text
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .replace(/_+/g, '_');
};
  const additionalColumns = [];
  let noandtitles = [];
  let dataTableStartIndex = -1

 for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (row.length === 0) continue;
    const firstCell = String(row[0]).trim();
    let secondCell = String(row[1]).trim();

    if (i === 13) {
      noandtitles = [sanitizeKey(firstCell), sanitizeKey(secondCell)];
    }
  }

  // Find the data table start
  for (let i = 0; i < Math.min(data.length, 20); i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
  
    const firstCell = String(row[0]).trim();
     if (firstCell.includes("Code")) {
      console.log("Found data table header at row", i);
      dataTableStartIndex = i + 2;
      break;
    }
  }
if (dataTableStartIndex === -1) {
      console.log("Could not find data table");
      return { hierarchicalData: [], columns: [], additionalColumns: [] };
    }
  
     const headerRow = data[dataTableStartIndex - 1];
    console.log(
      "Header row:",
      headerRow.map((c) => String(c || "").trim()),
    );

    const columnMap = {
    code: 0,
    obsa: 1,
    faceValue_A: 2,
    creditConversionFactor_B: 3,
    amount_C: 4,
    weight_D:5,
    CreditEquivalent_E:6,

    };

      const columnNames = [
    "Face_Value_A",
    "Credit_Conversion_Factor_B",
    "Amount_C",
   "Weight_D",
   "Credit_Equivalent_E"
  ];

  const topLevelNodes = [];


    for (let i = dataTableStartIndex; i < data.length; i++) {
    const row = data[i];
    if (row.length === 0) continue;

    const sNo = String(row[columnMap.code] || "").trim();
    const obsa = String(row[columnMap.obsa] || "").trim();

    if (!obsa) continue;

 
    const getValue = (index) => {
      if (index !== undefined && index < row.length) {
        const val = parseFloat(row[index]);
        if (!isNaN(val) && val !== 0) {
          return val.toFixed(2);
        }
        return "0";
      }
      return "0";
    };

    const getStringValue = (index) => {
      if (index !== undefined && index < row.length) {
        return String(row[index] || "").trim();
      }
      return "";
    };

      const getDateValue = (index) => {
      if (index !== undefined && index < row.length) {
        return excelDateToISO(row[index]);
      }
      return "";
    };

    const values = {};

   
    values["Face_Value_A"] = getValue(
      columnMap.faceValue_A,
    );
    values["Credit_Conversion_Factor_B"] = getValue(columnMap.creditConversionFactor_B);
    values["Asked_Reserve_Price"] = getValue(columnMap.askedPrice);
    values["Amount_C"] = getValue(
      columnMap.amount_C,
    );
    values["Weight_D"] = getValue(columnMap.weight_D);
    values["Credit_Equivalent_E"] = getValue(
      columnMap.CreditEquivalent_E
    );

    const isTotalRow = (obsa === "Total Risk weighted Off - BSA");

    const entry = {
      id: sNo,
      sNo: sNo,
      label: obsa,
      values: values,
      rowNumber: i + 1,
      level: 1,
      isTotalRow: isTotalRow,
      isSectionHeader: false,
      children: [],
    };

    topLevelNodes.push(entry);
  }

topLevelNodes.sort((a, b) => {
    const aSNo = parseInt(a.sNo);
    const bSNo = parseInt(b.sNo);
    if (isNaN(aSNo) && isNaN(bSNo)) return 0;
    if (isNaN(aSNo)) return 1;
    if (isNaN(bSNo)) return -1;
    return aSNo - bSNo;
  });

  return {
    hierarchicalData: topLevelNodes,
    columns: columnNames,
    additionalColumns,
    noandtitles,
  };


}
export default extractCapitalAdequacyOffBalanceSheetData