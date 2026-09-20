import { excelDateToISO } from "../../../utils";
export const extractCollateralizedPropertyAcquiredLast18Metadata = (data)=>{

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
    const fourthCell = String(row[3]).trim();

    if (i === 0 && firstCell) {
   metadata.ReturnKey = firstCell;

      if (firstCell.includes("COL_ACQ_18M") || firstCell.includes("OL001")) {
        metadata.reportType = "credit-quarterly_collateralized-property-acquired-last18";
        metadata.reportTypeId = "credit-quarterly_collateralized-property-acquired-last18";
        metadata.departmentName = "Credit";
        metadata.departmentId = "credit";
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
const extractCollateralizedPropertyAcquiredLast18Data=(data)=>{
  const additionalColumns = [];
  let noandtitles = [];
  let dataTableStartIndex = -1
console.log("input data", data)
 for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (row.length === 0) continue;
    const firstCell = String(row[0]).trim();
    let secondCell = String(row[1]).trim();

    if (i === 13) {
      noandtitles = [firstCell, secondCell];
    }
  }

  // Find the data table start
  for (let i = 0; i < Math.min(data.length, 20); i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
  
    const firstCell = String(row[0]).trim();
     if (firstCell.includes("S.No.")) {
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
    sNo: 0,
    borrowerName: 1,
    outstandingPrincipal: 2,
    outstandingInterest: 3,
    collateralType: 4,
    askedPrice:5,
    highestOfferd:6,
    averageMarketValue:7,
    acquiredDate: 8,
    reevaluationDate: 9,
    acquisitionExpenses:10,
    netMarketValue:11

    };

      const columnNames = [
    "Outstanding_Balance_Principal",
    "Outstanding_Balance_Interest",
    "Type_of_Collateral",
    "Asked_Reserve_Price",
   "Highest_offered_bid_amount",
   "Avarage_Market_Value",
    "Acquired_Date",
    "Reevaluation_Date",
    "Expenses_related_to_the_acquisition",
    "Net_Market_Value"
  ];

  const topLevelNodes = [];


    for (let i = dataTableStartIndex; i < data.length; i++) {
    const row = data[i];
    if (row.length === 0) continue;

    const sNo = String(row[columnMap.sNo] || "").trim();
    const borrowerName = String(row[columnMap.borrowerName] || "").trim();

    if (!borrowerName) continue;

 
    const getValue = (index) => {
      if (index !== undefined && index < row.length) {
        const val = parseFloat(String(row[index] ?? "").replace(/[,%\s]/g, ""));
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

    values["Outstanding_Balance_Principal"] = getValue(
      columnMap.outstandingPrincipal,
    );
    values["Outstanding_Balance_Interest"] = getValue(
      columnMap.outstandingInterest,
    );
    values["Type_of_Collateral"] = getStringValue(columnMap.collateralType);
    values["Asked_Reserve_Price"] = getValue(columnMap.askedPrice);
    values["Highest_offered_bid_amount"] = getValue(
      columnMap.highestOfferd,
    );
    values["Avarage_Market_Value"] = getValue(columnMap.averageMarketValue);
    values["Acquired_Date"] = getStringValue(
      columnMap.acquiredDate
    );
    values["Reevaluation_Date"] = getStringValue(columnMap.reevaluationDate);
    values["Expenses_related_to_the_acquisition"] = getValue(columnMap.acquisitionExpenses)
    values["Net_Market_Value"]=getValue(columnMap.netMarketValue)


    const isTotalRow = (borrowerName === "Total");

    const entry = {
      id: sNo,
      sNo: sNo,
      label: borrowerName,
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
export default extractCollateralizedPropertyAcquiredLast18Data