import { excelDateToISO } from "../../../utils";
export const extractDepositBeneficiariesMetadata =(data)=>{
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
const extractDepositBeneficiariesData = (data) => {
  const hierarchicalData = [];
  let dataTableStart = -1;

  console.log('=== Extracting Deposit Account Beneficiaries Data (0016IN05001) ===');

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
  // A(0)=No., B(1)=Depositor's Full Name, C(2)=Depositor's National ID,
  // D(3)=Depositor's TIN Number, E(4)=Depositor's Account Number,
  // F(5)=Full Name of the Beneficiary, G(6)=Beneficiary's National ID,
  // H(7)=Beneficiary's TIN Number, I(8)=Region, J(9)=Sub-city/Zone,
  // K(10)=Woreda, L(11)=Cell Phone, M(12)=% Share, N(13)=Amount in Birr
  const NO_COL = 0;
  const DEPOSITOR_NAME_COL = 1;
  const DEPOSITOR_NATIONAL_ID_COL = 2;
  const DEPOSITOR_TIN_COL = 3;
  const DEPOSITOR_ACCOUNT_COL = 4;
  const BENEFICIARY_NAME_COL = 5;
  const BENEFICIARY_NATIONAL_ID_COL = 6;
  const BENEFICIARY_TIN_COL = 7;
  const REGION_COL = 8;
  const SUBCITY_COL = 9;
  const WOREDA_COL = 10;
  const CELL_PHONE_COL = 11;
  const PERCENT_SHARE_COL = 12;
  const AMOUNT_COL = 13;

  // Define the columns for this report
  const columns = [
    'Depositors_National_ID',
    'Depositors_TIN_Number',
    'Depositors_Account_Number',
    'Full_Name_of_Beneficiary',
    'Beneficiarys_National_ID',
    'Beneficiarys_TIN_Number',
    'Region',
    'Sub_City_Zone',
    'Woreda',
    'Cell_Phone',
    'Percent_Share',
    'Amount_in_Birr'
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

    // Skip if both no and depositorName are empty
    if (!no && !depositorName) continue;

    // Skip footer/note rows
    if (depositorName.includes('Note') || depositorName.includes('Total')) continue;

    // Extract values - all as strings since they are identifiers/text
    const values = {
     
      'Depositors_National_ID': getStringValue(DEPOSITOR_NATIONAL_ID_COL, row),
      'Depositors_TIN_Number': getStringValue(DEPOSITOR_TIN_COL, row),
      'Depositors_Account_Number': getStringValue(DEPOSITOR_ACCOUNT_COL, row),
      'Full_Name_of_Beneficiary': getStringValue(BENEFICIARY_NAME_COL, row),
      'Beneficiarys_National_ID': getStringValue(BENEFICIARY_NATIONAL_ID_COL, row),
      'Beneficiarys_TIN_Number': getStringValue(BENEFICIARY_TIN_COL, row),
      'Region': getStringValue(REGION_COL, row),
      'Sub_City_Zone': getStringValue(SUBCITY_COL, row),
      'Woreda': getStringValue(WOREDA_COL, row),
      'Cell_Phone': getStringValue(CELL_PHONE_COL, row),
      'Percent_Share': getNumericValue(PERCENT_SHARE_COL, row),
      'Amount_in_Birr': getNumericValue(AMOUNT_COL, row)
    };

 

    const entry = {
      id: no || '',
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
export default extractDepositBeneficiariesData