import { excelDateToISO } from "./excelParser";

// ==================== METADATA EXTRACTION ====================
export const extractDepositProfitRateMetadata = (data) => {
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
    const fourthCell = String(row[3] || "").trim();
    const eighthCell = String(row[8] || "").trim();
    const twelveCell = String(row[11] || "").trim();

    if (i === 0 && firstCell) {
      metadata.ReturnKey = firstCell;
      if (
        firstCell.includes("DEPOSIT_PROFIT_RATE") ||
        firstCell.includes("Interest_Free_Banks") ||
        firstCell.includes("DPWADP") ||
        firstCell.includes("RS002")
      ) {
        metadata.reportType = "deposit-profit-rate-interest-free";
        metadata.reportTypeId = "deposit-profit-rate-interest-free";
        metadata.departmentId = "deposit";
        metadata.departmentName = "Deposit";
      }
    }

    if (i === 3 && firstCell) {
      metadata.reportTitle = firstCell || "";
    }

    if (
      i === 4 &&
      firstCell &&
      ((firstCell || secondCell).includes("Institution") ||
        (firstCell || secondCell).includes("Instiution"))
    ) {
      metadata.institutionCode = thirdCell || "";
    }

    if (
      i === 5 &&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("Financial Year")
    ) {
      metadata.financialYear = thirdCell || "";
    }

    if (
      i === 6 &&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("Start Date")
    ) {
      metadata.startDate = excelDateToISO(thirdCell) || "";
    }

    if (
      i === 7 &&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("End Date")
    ) {
      metadata.endDate = excelDateToISO(thirdCell) || "";
    }

    if (
      i === 8 &&
      (thirdCell || twelveCell || firstCell) &&
      (thirdCell.toLowerCase().includes("in") ||
        twelveCell.toLowerCase().includes("in") ||
        firstCell.toLowerCase().includes("in"))
    ) {
      metadata.unit = twelveCell || "";
    }
  }

  return metadata;
};

// ==================== BUILD OUTPUT JSON ====================
const extractDepositProfitRateData = (data) => {
  const metadata = extractDepositProfitRateMetadata(data);

  const finYearStr = metadata.financialYear || "";
  const finYearNum = parseInt(finYearStr, 10) || 0;

  const output = {
    ReturnKey: metadata.ReturnKey || "DPWADP001",
    InstCode: metadata.institutionCode || "",
    FinYear: finYearNum,
    StartDate: metadata.startDate || "",
    EndDate: metadata.endDate || "",
    ReturnItemsList: [],
    DynamicItemsList: [
      {
        Area: 216,
        _areaName:
          "Monthly Weighted Average Deposit Profit Rates (Interest-Free Banks)",
        DynamicItems: [
          {
            Code: "1.1",
            Value: "",
            _description: "Deposit Type ",
            _dataType: "DATE",
            _required: false,
          },
          {
            Code: "1.2",
            Value: "",
            _description: "Deposit Category ",
            _dataType: "TEXT",
            _required: false,
          },
          {
            Code: "1.3",
            Value: "",
            _description: "Total Deposit Amount  ( in Mn Birr)",
            _dataType: "NUMERIC",
            _required: false,
          },
          {
            Code: "1.4",
            Value: "",
            _description: "No. of Deposit Accounts by Category",
            _dataType: "NUMERIC",
            _required: false,
          },
          {
            Code: "1.5",
            Value: "",
            _description:
              "Lending Interest Rates (% per annum)_ Minimum Rate \nby Deposit \ncategory",
            _dataType: "NUMERIC",
            _required: false,
          },
          {
            Code: "1.6",
            Value: "",
            _description:
              "Lending Interest Rates (% per annum)_ Maximum Rate \nby Deposit \ncategory",
            _dataType: "NUMERIC",
            _required: false,
          },
          {
            Code: "1.7",
            Value: "",
            _description:
              "Lending Interest Rates (% per annum)_ Weighted \nAverage Rate \nby Deposit \ncategory ",
            _dataType: "NUMERIC",
            _required: false,
          },
          {
            Code: "1.8",
            Value: "",
            _description:
              "Lending Interest Rates (% per annum)_ Weighted Average Rate \nby Deposit Type",
            _dataType: "NUMERIC",
            _required: false,
          },
        ],
      },
    ],
  };

  return output;
};

export default extractDepositProfitRateData;