import { excelDateToISO } from "../../../utils";
export const extractInsuredDepositorMetadata =(data)=>{
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
    const secondCell = String(row[1] || "").trim();
    const sixCell = String(row[5] || "").trim();

    const labelValue = (() => {
      for (let c = 2; c <= 5; c++) {
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
        `| firstCell="${secondCell}" | labelValue picked="${labelValue}"`,
      );
    }

    if (i === 0 && firstCell) {
      metadata.ReturnKey = firstCell;

      if (firstCell.includes("0016IN05001") ) {
        metadata.reportType = "branchOps-quarterly_deposit-beneficiaries";
        metadata.reportTypeId = "branchOps-quarterly_deposit-beneficiaries";
        metadata.departmentId = "branchOps";
        metadata.departmentName = "Branch Operation";
      }
    }

    if (i === 1 && firstCell) {
      metadata.reportTitle = firstCell.replace(/\s+/g, " ").trim();
    }

    if (
      i === 2 &&
      secondCell &&
      (secondCell.toLowerCase().includes("instiution") ||
        secondCell.toLowerCase().includes("institution"))
    ) {
      metadata.institutionCode = labelValue || "";
    }

    if (
      i === 3 &&
      secondCell &&
      secondCell.toLowerCase().includes("financial year")
    ) {
      metadata.financialYear = labelValue || "";
    }

    if (
      i === 4 &&
      secondCell &&
      secondCell.toLowerCase().includes("start date")
    ) {
      metadata.startDate = excelDateToISO(labelValue) || "";
    }

    if (i === 5 && secondCell && secondCell.toLowerCase().includes("end date")) {
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

const extractInsuredDepositorData = (data) => {
  const hierarchicalData = [];
  let dataTableStart = -1;

  console.log('=== Extracting Insured Depositor Data (0015IN04001) ===');

  // Log first few rows to understand structure
  for (let i = 0; i < Math.min(data.length, 15); i++) {
    const row = data[i];
    if (row) {
      console.log(`Row ${i}:`, row.map(c => String(c || '').trim()));
    }
  }

  // Find the data table start - look for "No." header
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = String(row[0] || '').trim();
    if (firstCell === 'No.') {
      dataTableStart = i + 1;
      console.log('Found data table at row:', dataTableStart);
      break;
    }
  }

  if (dataTableStart === -1) {
    console.log('Could not find data table');
    return { hierarchicalData: [], columns: [], additionalColumns: [] };
  }

  // Column indices (0-based)
  // A(0)=No., B(1)=Depositor's Full Name, C(2)=National ID, D(3)=TIN Number,
  // E(4)=Account Number, F(5)=Deposit Type, G(6)=Insured Deposit balance in Birr,
  // H(7)=Amounts of deposits (compulsory saving) that services as collateral,
  // I(8)=Amount of past due loans held by depositor, J(9)=Net of insurable deposits,
  // K(10)=Compensable deposit amount in Birr, L(11)=Remark
  const NO_COL = 0;
  const DEPOSITOR_NAME_COL = 1;
  const NATIONAL_ID_COL = 2;
  const TIN_NUMBER_COL = 3;
  const ACCOUNT_NUMBER_COL = 4;
  const DEPOSIT_TYPE_COL = 5;
  const INSURED_BALANCE_COL = 6;
  const COLLATERAL_AMOUNT_COL = 7;
  const PAST_DUE_LOANS_COL = 8;
  const NET_INSURABLE_COL = 9;
  const COMPENSABLE_AMOUNT_COL = 10;
  const REMARK_COL = 11;

  // Define the columns for this report
  const columns = [
    'Depositors_Full_Name',
    'National_ID',
    'TIN_Number',
    'Account_Number',
    'Deposit_Type',
    'Insured_Deposit_Balance',
    'Collateral_Compulsory_Saving',
    'Past_Due_Loans',
    'Net_Insurable_Deposits',
    'Compensable_Deposit_Amount',
    'Remark'
  ];

  const topLevelNodes = [];

  // Helper functions
  const getStringValue = (index, row) => {
    if (index !== undefined && index < row.length) {
      return String(row[index] || '').trim();
    }
    return '';
  };

  const getNumericValue = (index, row) => {
    if (index !== undefined && index < row.length) {
      const raw = row[index];
      if (raw === null || raw === undefined || raw === '') return '0';
      const val = parseFloat(String(row[index] ?? "").replace(/[,%\s]/g, ""));
      if (!isNaN(val)) {
        return val.toFixed(2);
      }
      return String(raw).trim();
    }
    return '0';
  };

  // Parse each row
  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const no = String(row[NO_COL] || '').trim();
    const depositorName = String(row[DEPOSITOR_NAME_COL] || '').trim();

    // Skip if no number
    if (!no) continue;

    // Skip footer/note rows
    if (depositorName.includes('Note') || depositorName.includes('Total')) continue;

    // Extract values
    const values = {
      
      'National_ID': getStringValue(NATIONAL_ID_COL, row),
      'TIN_Number': getStringValue(TIN_NUMBER_COL, row),
      'Account_Number': getStringValue(ACCOUNT_NUMBER_COL, row),
      'Deposit_Type': getStringValue(DEPOSIT_TYPE_COL, row),
      'Insured_Deposit_Balance': getNumericValue(INSURED_BALANCE_COL, row),
      'Collateral_Compulsory_Saving': getNumericValue(COLLATERAL_AMOUNT_COL, row),
      'Past_Due_Loans': getNumericValue(PAST_DUE_LOANS_COL, row),
      'Net_Insurable_Deposits': getNumericValue(NET_INSURABLE_COL, row),
      'Compensable_Deposit_Amount': getNumericValue(COMPENSABLE_AMOUNT_COL, row),
      'Remark': getStringValue(REMARK_COL, row)
    };

    

    const entry = {
      id: no || ``,
      sNo: no,
      label: depositorName || ``,
      values: values,
      rowNumber: i + 1,
      level: 1,
      isTotalRow: false,
      isSectionHeader: false,
      children: []
    };

    topLevelNodes.push(entry);
  }

  // Sort by No.
  topLevelNodes.sort((a, b) => {
    const aNum = parseInt(a.sNo);
    const bNum = parseInt(b.sNo);
    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
    return 0;
  });

  console.log('Total entries:', topLevelNodes.length);

  return {
    hierarchicalData: topLevelNodes,
    columns: columns,
    additionalColumns: [],
    noandtitles:['No.', "Depositor's Full Name"]
  };
};
export default extractInsuredDepositorData