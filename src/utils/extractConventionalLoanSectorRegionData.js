
import { excelDateToISO } from "./excelParser";
export const extractConventionalLoanSectorRegionMetadata = (data) => {
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

  //consol.log("data.length  ", data.length)
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const firstCell = String(row[0] || "").trim(); 
    const secondCell = String(row[1] || "").trim(); 
    const thirdCell = String(row[2] || "").trim(); 
    const twelveCell = String(row[16] || "").trim();

    // //consol.log(`Row ${i + 1}:`, {
    //   firstCell,
    //   secondCell,
    //   thirdCell,
    //   fourthCell,
    //   eighthCell,
    //   tweneeEigntsCell
    // });

    if (i === 0 && firstCell) {
  metadata.ReturnKey = firstCell;

  if (firstCell.includes('LOAN_SEC&REG') || firstCell.includes('SE002')) {
    metadata.reportType =
      'quarterly conventional loans by sector and region';
    metadata.reportTypeId =
      'quarterly convetional loans by sector and region';
    metadata.departmentId = 'credit';
    metadata.departmentName = 'Credit';
  }
}

    if (( i === 3) && (firstCell)) {
      metadata.reportTitle = firstCell || '';
      //consol.log("Found Report Title:", metadata.reportTitle);
    }

    if (
     (i === 7 )&&
      (firstCell ) &&
     ( (firstCell || secondCell).includes("Instiution") ||  (firstCell || secondCell).includes("Institution "))
    ) {
      metadata.institutionCode = thirdCell || '';
      //consol.log("Found Institution Code:", metadata.institutionCode);
    }

    if (
      (i === 8)&&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("Financial Year")
    ) {
      metadata.financialYear = thirdCell || '';
      //consol.log("Found Financial Year:", metadata.financialYear);
    }

    if (
      ( i === 9) &&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("Start Date")
    ) {
     // metadata.startDate = excelDateToISO(secondCell||thirdCell  || fourthCell || "");
     metadata.startDate = excelDateToISO(thirdCell) || '';
      //consol.log("Found Start Date:", metadata.startDate);
    }

    if (
      (i === 10 ) &&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("End Date")
    ) {
      metadata.endDate = excelDateToISO(thirdCell) || "";
      // metadata.endDate =excelDateToISO(secondCell||thirdCell  || fourthCell || "");
      //consol.log("Found End Date:", metadata.endDate);
    }

    if (
      ( i === 12) &&
      (thirdCell || twelveCell || firstCell) &&
      (thirdCell.toLowerCase().includes("in") ||
        twelveCell.toLowerCase().includes("in") || firstCell.toLowerCase().includes('In'))
    ) {
      metadata.unit = twelveCell  || '';
      //consol.log("Found Unit:", metadata.unit);
    }
  }
return metadata
}
const extractConventionalLoanSectorRegionData = (data) => {
  const hierarchicalData = [];
  let dataTableStart = -1;
  let noandtitles = [];
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const firstCell = String(row[0] || "").trim();
    let secondCell = String(row[1] || "").trim();



    if (i === 13) {
      noandtitles = [firstCell, secondCell];
      //consol.log("Found title:", noandtitles);
    }
  }
  //consol.log('=== Extracting Loan Range Region Data ===');
const sanitizeKey = (text) => {
  return text
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .replace(/_+/g, '_');
};

  // Log first few rows to understand structure
  for (let i = 0; i < Math.min(data.length, 20); i++) {
    const row = data[i];
    if (row) {
      //consol.log(`Row ${i}:`, row.slice(0, 10).map(c => String(c || '').trim()));
    }
  }

  // Find the data table start - look for "Code" column
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = String(row[0] || '').trim();
    if (firstCell === 'Code') {
      dataTableStart = i + 1;
      //consol.log('Found data table at row:', dataTableStart);
      break;
    }
  }

  if (dataTableStart === -1) {
    // Try to find by looking for "Addis Ababa"
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;
      const firstCell = String(row[0] || '').trim();
      if (firstCell === '1') {
        const secondCell = String(row[1] || '').trim();
        if (secondCell && secondCell.includes('Addis Ababa')) {
          dataTableStart = i;
          //consol.log('Found data table at row (alt):', dataTableStart);
          break;
        }
      }
    }
  }

  if (dataTableStart === -1) {
    //consol.log('Could not find data table');
    return { hierarchicalData: [], columns: [], additionalColumns: [] };
  }

  // Get the header rows to identify column positions
  const headerRow1 = data[dataTableStart - 2];
  const headerRow2 = data[dataTableStart - 1];

  //consol.log('Header Row 1:', headerRow1 ? headerRow1.map(c => String(c || '').trim()) : []);
  //consol.log('Header Row 2:', headerRow2 ? headerRow2.map(c => String(c || '').trim()) : []);

  // Define loan ranges
  const loanRanges = [
    'Public_Enterprise',
    'Private_Coop',
    'Regional_Govt',
    'Banks',
    'Others',
    'Total'
  ];

  // Each range has: Amount and # of Borrowers
  // Column indices: Code(0), Region(1), then for each range: Amount, # of Borrowers
  // So: 0=Code, 1=Region, 2=Amount Range1, 3=Borrowers Range1, 4=Amount Range2, 5=Borrowers Range2, ...

  const topLevelNodes = [];
  const nodeMap = new Map();

  // Parse each row
  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const code = String(row[0] || '').trim();
    const region = String(row[1] || '').trim();

    // Skip if no region
    if (!region) continue;
    
    // Skip footer notes
    //if (region.includes('NOTE') || region.includes('Note') || region.includes('Merchandise') || region.includes('Central Ethiopia Regional State') || re) continue;
//if(i >= 76 ) continue;

if(code.includes('Note') || code.includes('NOTE') || region.includes('NOTE') || region.includes('Note') || region.includes('Central Ethiopia Regional State') || region.includes('South Ethiopia Regional State')) continue;

    const normalizedCode = code === '2.' ? '2' : code;
   //consol.log('code' , normalizedCode)
const isSectionHeader =  normalizedCode && !normalizedCode.includes('.')
    // Determine level
    let level = 0;
    if (normalizedCode && normalizedCode !== '') {
      const codeParts = normalizedCode.split('.');
      level = codeParts.length;
    }

    // Extract values for each loan range
    const values = {};

    // For each loan range, extract Amount and # of Borrowers
    for (let j = 0; j < loanRanges.length; j++) {
      const amountIndex = 2 + (j * 3);
      const borrowersIndex = 3 + (j * 3);
       const accountIndex = 4 + (j * 3);

      
      const amountKey = sanitizeKey(`${loanRanges[j]}_Amount`);
      const borrowersKey = sanitizeKey(`${loanRanges[j]}_Borrowers`);
       const accountKey = sanitizeKey(`${loanRanges[j]}_Accounts`);

      // Get Amount
      let amountValue = '0';
      if (amountIndex < row.length) {
        const val = parseFloat(row[amountIndex]);
        if (!isNaN(val) && val !== 0) {
          amountValue = val.toFixed(2);
        }
      }
      values[amountKey] = amountValue;

      // Get # of Borrowers
      let borrowersValue = '0';
      if (borrowersIndex < row.length) {
        const val = parseFloat(row[borrowersIndex]);
        if (!isNaN(val) && val !== 0) {
          borrowersValue = val.toFixed(0);
        }
      }
      values[borrowersKey] = borrowersValue;

         // Get # of Accounts
      let accountsValue = '0';
      if (accountIndex < row.length) {
        const val = parseFloat(row[accountIndex]);
        if (!isNaN(val) && val !== 0) {
          accountsValue = val.toFixed(0);
        }
      }


      values[accountKey] = accountsValue;
    }

    // Create the entry
    const entry = {
      id: normalizedCode || ``,
      sNo: normalizedCode || '',
      label: region,
      values: values,
      rowNumber: i + 1,
      level: level,
      isTotalRow: false,
      isSectionHeader: isSectionHeader || false,
      children: []
    };

    if (normalizedCode) {
      nodeMap.set(normalizedCode, entry);
    }

 
  }

  // Build hierarchy for nodes with codes
  for (const [normalizedCode, node] of nodeMap) {

    const codeParts = normalizedCode.split('.');
    
    if (codeParts.length === 1 ) {
      // Region nodes (1, 2, 3, ...)
      const existing = topLevelNodes.find(n => n.id === normalizedCode);
      if (!existing) {
        topLevelNodes.push(node);
        //consol.log(`Added region node: ${normalizedCode} - ${node.label}`);
      }
    } else if (codeParts.length > 1) {
      // Loan type nodes (1.1, 1.2, etc.)
      const parentCode = codeParts.slice(0, -1).join('.');
      const parent = nodeMap.get(parentCode);
      
      if (parent) {
        const exists = parent.children.some(child => child.id === node.id);
        if (!exists) {
          parent.children.push(node);
          //consol.log(`Added node ${normalizedCode} as child of ${parentCode}`);
        }
      } else {
        // Try to find parent by base code
        const baseCode = codeParts[0];
        const baseParent = nodeMap.get(baseCode);
        if (baseParent) {
          const exists = baseParent.children.some(child => child.id === node.id);
          if (!exists) {
            baseParent.children.push(normalizedCode);
            //consol.log(`Added node ${normalizedCode} as child of ${baseCode} (fallback)`);
          }
        } else {
          // If still no parent, add to top level
          topLevelNodes.push(node);
          //consol.log(`Added node ${normalizedCode} as top-level (no parent found)`);
        }
      }
    }
  }

  // Sort children by code
  const sortChildren = (nodes) => {
    nodes.sort((a, b) => {
      if (a.isTotalRow && !b.isTotalRow) return 1;
      if (!a.isTotalRow && b.isTotalRow) return -1;
      
      if (a.sNo && b.sNo) {
        const aParts = a.sNo.split('.').map(Number);
        const bParts = b.sNo.split('.').map(Number);
        for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
          if (aParts[i] !== bParts[i]) {
            return aParts[i] - bParts[i];
          }
        }
        return aParts.length - bParts.length;
      }
      return 0;
    });

    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        sortChildren(node.children);
      }
    });
  };

  sortChildren(topLevelNodes);

  // Clean up - remove empty children arrays
  const cleanData = (nodes) => {
    nodes.forEach(node => {
      if (node.children && node.children.length === 0) {
        delete node.children;
      } else if (node.children) {
        cleanData(node.children);
      }
    });
  };
  cleanData(topLevelNodes);

  //consol.log('Final top-level nodes:', topLevelNodes.length);
  //consol.log('Top-level nodes:', topLevelNodes.map(n => n.sNo + ' - ' + n.label));

  // Build column names for columns
  const columnNames = [];
  for (const range of loanRanges) {
    columnNames.push(sanitizeKey(`${range}_Amount`));
    columnNames.push(sanitizeKey(`${range}_Borrowers`));
     columnNames.push(sanitizeKey(`${range}_Accounts`));
  }

  return {
    hierarchicalData: topLevelNodes,
    columns: columnNames,
    additionalColumns: [],
    noandtitles
  };
};
export default extractConventionalLoanSectorRegionData