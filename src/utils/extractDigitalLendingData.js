import { excelDateToISO } from "./excelParser";
export const extractDigitalLendingMetadata=(data)=>{
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

  //console.log("data.length  ", data.length)
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const firstCell = String(row[0] || "").trim();
    const secondCell = String(row[1] || "").trim();
    const thirdCell = String(row[2] || "").trim();
    const fourthCell = String(row[3] || "").trim();
    const eighthCell = String(row[8] || "").trim();
    const tweneeEigntsCell = String(row[33] || "").trim();

    // //console.log(`Row ${i + 1}:`, {
    //   firstCell,
    //   secondCell,
    //   thirdCell,
    //   fourthCell,
    //   eighthCell,
    //   tweneeEigntsCell
    // });

    if (i === 0 && firstCell) {
      metadata.ReturnKey = firstCell;
      //console.log("Found Return Key:", metadata.ReturnKey);

     if (firstCell.includes("DigitalLendingDL001")) {
        metadata.reportType = "credit-quarterly_digital-lending";
        metadata.departmentName = "Credit";
        metadata.departmentId = "credit";
        metadata.reportTypeId = "credit-quarterly_digital-lending";
        //console.log("Found Report Type:", metadata.reportType);
      } 
    }

    if (( i === 2) && (firstCell || secondCell)) {
      metadata.reportTitle = firstCell || '';
      //console.log("Found Report Title:", metadata.reportTitle);
    }

    if (
     (i === 6 )&&
      (firstCell || secondCell) &&
     ( (firstCell || secondCell).includes("Instiution") ||  (firstCell || secondCell).includes("Institution "))
    ) {
      metadata.institutionCode = thirdCell || '';
      //console.log("Found Institution Code:", metadata.institutionCode);
    }

    if (
      (i === 7)&&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("Financial Year")
    ) {
      metadata.financialYear = thirdCell || '';
      //console.log("Found Financial Year:", metadata.financialYear);
    }

    if (
      ( i === 8) &&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("Start Date")
    ) {
     // metadata.startDate = excelDateToISO(secondCell||thirdCell  || fourthCell || "");
     metadata.startDate = excelDateToISO(thirdCell) || '';
      //console.log("Found Start Date:", metadata.startDate);
    }

    if (
      (i === 9 ) &&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("End Date")
    ) {
      metadata.endDate = excelDateToISO(thirdCell) || "";
      // metadata.endDate =excelDateToISO(secondCell||thirdCell  || fourthCell || "");
      //console.log("Found End Date:", metadata.endDate);
    }

    if (
      ( i === 11) &&
      (secondCell.toLowerCase().includes("in") || secondCell.toLowerCase().includes('In'))
    ) {
      metadata.unit = secondCell  || '';
      //console.log("Found Unit:", metadata.unit);
    }
  }

  return metadata;
};
const extractDigitalLendingData =(data)=>{
  const hierarchicalData = [];
  let dataTableStart = -1;
   
const noandtitles = [];
noandtitles.push('S.No.', 'Description')
  console.log('=== Extracting Restructured Loans Data (AL001) ===');

  // Log all rows to understand structure
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (row) {
      console.log(`Row ${i}:`, row.map(c => String(c || '').trim()));
    }
  }

  // Find the data table start - look for "S.No." column
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = String(row[0] || '').trim();
    if (firstCell === 'S.No.') {
      dataTableStart = i + 1;
      console.log('Found data table at row:', dataTableStart);
      break;
    }
  }

  if (dataTableStart === -1) {
    console.log('Could not find data table');
    return { hierarchicalData: [], columns: [], additionalColumns: [] };
  }

  // Column indices
  const colIndex={
   sNo:0,
   disbursment :1,
   collection :2,
   outstanding:3,
   noAccount :2,
   noBorrowers:3,

  }
  // Define the columns for this report
  const columns = [
    'Disbursment',
    'Collections',
    'Outstanding',
    'No_Of_Borrowers_accounts',
    'No_Of_Borrowers'
  ];

  const topLevelNodes = [];

  // Helper functions
  const getNumber = (index) => {
    if (index !== undefined && index < data[0].length) {
      const val = parseFloat(data[0][index]);
      return !isNaN(val) ? val : 0;
    }
    return 0;
  };

  // Parse each row
  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const sNo = String(row[colIndex.sNo] || '').trim();
   



    // Skip note rows
    if (sNo.includes('Note:') ) continue;

    // Determine if this is a total row
    const isTotalRow = sNo.includes('Total Digital Lending ');

    // Extract values
    const getValue = (index) => {
      if (index !== undefined && index < row.length) {
        const val = parseFloat(String(row[index] ?? "").replace(/[,%\s]/g, ""));
        if (!isNaN(val) && val !== 0) {
          return val.toFixed(2);
        }
        return '0';
      }
      return '0';
    };

    const values = {
      'Disbursment': getValue(colIndex.disbursment),
      'Collections': getValue(colIndex.collection),
      'Outstanding': getValue(colIndex.outstanding),
      'No_Of_Borrowers_accounts': getValue(colIndex.noAccount),
      'No_Of_Borrowers': getValue(colIndex.noBorrowers),
    };

    // Determine level
    const level = isTotalRow ? 0 : 1;

    const entry = {
      id: sNo || "",
      sNo: sNo || '',
      label: sNo,
      values: values,
      rowNumber: i + 1,
      level: level,
      isTotalRow: isTotalRow || false,
      isSectionHeader: false,
      children: []
    };

    topLevelNodes.push(entry);
  }

  // Sort - regular rows first, total row last
  topLevelNodes.sort((a, b) => {
    if (a.isTotalRow && !b.isTotalRow) return 1;
    if (!a.isTotalRow && b.isTotalRow) return -1;
    
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
    noandtitles
  };
};
export default extractDigitalLendingData