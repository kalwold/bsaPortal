import { excelDateToISO } from "./excelParser";
export const extractCollateralizedPropertySoldLast18Metadata = (data) => {
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

      if (firstCell.includes("COL_SOL_18M") || firstCell.includes("LL001")) {
        metadata.reportType = "credit-quarterly_loan-collateralized-properties";
        metadata.reportTypeId =
          "credit-quarterly_loan-collateralized-properties";
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

const extractCollateralizedPropertySoldLast18Data = (data) => {
  const columns = [];
  const additionalColumns = [];
  let noandtitles = [];
  let dataTableStartIndex = -1;
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (row.length === 0) continue;
    const firstCell = String(row[0]).trim();
    let secondCell = String(row[1]).trim();

    if (i === 13) {
      noandtitles = [firstCell, secondCell];
    }
  }

  for (let i = 0; i < Math.min(data.length, 20); i++) {
    const row = data[i];
    const firstCell = String(row[0]).trim();

    if (row) {
      console.log(
        `Row ${i}:`,
        row.slice(0, 10).map((c) => String(c || "").trim()),
      );
      console.log(`Row ${i} first cell:`, firstCell);
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
    collateralValue: 5,
    collateralDateSold: 6,
    collateralSalesValue: 7,
    collateralDisposalExpenses: 8,
    collateralNetValue: 9,
  };

  const columnNames = [
    "Outstanding_Balance_Principal",
    "Outstanding_Balance_Interest",
    "Type_of_Collateral",
    "Collateral_Estimated_Value",
    "Collateral_Date_Sold",
    "Collateral_Sales_Value",
    "Collateral_Disposal_Expenses",
    "Collateral_Net_Value",
  ];

  const topLevelNodes = [];

  for (let i = dataTableStartIndex; i < data.length; i++) {
    const row = data[i];
    if (row.length === 0) continue;

    const sNo = String(row[columnMap.sNo] || "").trim();
    const borrowerName = String(row[columnMap.borrowerName] || "").trim();

    if (!borrowerName) continue;
  
  
    if(sNo.includes("*Including taxes, insurance fees, legal fees and other expenses")) continue;
    // Skip rows beyond 166 as they are not relevant for the data table
    if(!borrowerName){
      continue;}
 
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

    const values = {};

    values["Outstanding_Balance_Principal"] = getValue(
      columnMap.outstandingPrincipal,
    );
    values["Outstanding_Balance_Interest"] = getValue(
      columnMap.outstandingInterest,
    );
    values["Type_of_Collateral"] = getStringValue(columnMap.collateralType);
    values["Collateral_Estimated_Value"] = getValue(columnMap.collateralValue);
    values["Collateral_Date_Sold"] = getStringValue(
      columnMap.collateralDateSold,
    );
    values["Collateral_Sales_Value"] = getValue(columnMap.collateralSalesValue);
    values["Collateral_Disposal_Expenses"] = getValue(
      columnMap.collateralDisposalExpenses,
    );
    values["Collateral_Net_Value"] = getValue(columnMap.collateralNetValue);
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
};

export default extractCollateralizedPropertySoldLast18Data;
