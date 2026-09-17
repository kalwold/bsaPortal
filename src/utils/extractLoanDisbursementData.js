import { excelDateToISO } from "./excelParser";
export const extractDisbursementMetadata = (data) => {
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
    const thirteenCell = String(row[11] || "").trim();

    if (i === 0 && firstCell) {
      metadata.ReturnKey = firstCell;
      //console.log("Found Return Key:", metadata.ReturnKey);

if (firstCell.includes('LOA_ADV_OUT') || firstCell.includes('LA001')) {
        metadata.reportType = 'credit-monthly_loan-disbursement';
        metadata.departmentId = 'credit';
        metadata.departmentName = 'Credit';
        metadata.reportTypeId = 'credit-monthly_loan-disbursement';
      }
    }

    if (( i === 3) && (firstCell)) {
       metadata.reportTitle = firstCell || '';
      //console.log("Found Report Title:", metadata.reportTitle);
    }

    if (
     (i === 7 )&&
      (firstCell ) &&
     ( (firstCell || secondCell).includes("Instiution") ||  (firstCell || secondCell).includes("Institution "))
    ) {
      metadata.institutionCode = thirdCell || '';
      //console.log("Found Institution Code:", metadata.institutionCode);
    }

    if (
      (i === 8)&&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("Financial Year")
    ) {
      metadata.financialYear = thirdCell || '';
      //console.log("Found Financial Year:", metadata.financialYear);
    }

    if (
      ( i === 9) &&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("Start Date")
    ) {
     // metadata.startDate = excelDateToISO(secondCell||thirdCell  || fourthCell || "");
     metadata.startDate = excelDateToISO(thirdCell) || '';
      //console.log("Found Start Date:", metadata.startDate);
    }

    if (
      (i === 10 ) &&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("End Date")
    ) {
      metadata.endDate = excelDateToISO(thirdCell) || "";
      // metadata.endDate =excelDateToISO(secondCell||thirdCell  || fourthCell || "");
      //console.log("Found End Date:", metadata.endDate);
    }

    if (
      ( i === 13) &&
      (thirdCell || thirteenCell || firstCell) &&
      (thirdCell.toLowerCase().includes("in") ||
        thirteenCell.toLowerCase().includes("in") || thirteenCell.toLowerCase().includes('In'))
    ) {
      metadata.unit = thirteenCell  || '';
      //console.log("Found Unit:", metadata.unit);
    }
  }
return metadata
}
const extractLoanDisbursementData = (data) => {
  const hierarchicalData = [];
  let dataTableStart = -1;

    let noandtitles = [];


  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    const firstCell = String(row[0] || "").trim();
    const secondCell = String(row[1] || "").trim();

    if (i === 14) {
      noandtitles = [firstCell, secondCell];
      //console.log("Found title:", noandtitles);
    }
  }
  //console.log('=== Extracting Loan Disbursement Data ===');

  // Log first few rows to understand structure
  for (let i = 0; i < Math.min(data.length, 15); i++) {
    const row = data[i];
    if (row) {
      //console.log(`Row ${i}:`, row.map(c => String(c || '').trim()));
    }
  }

  // Find the data table start - look for "Code" column
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = String(row[0] || '').trim();
    if (firstCell === 'Code') {
      dataTableStart = i + 1;
      //console.log('Found data table at row:', dataTableStart);
      break;
    }
  }

  if (dataTableStart === -1) {
    // Try to find by looking for "Agriculture"
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;
      const firstCell = String(row[0] || '').trim();
      if (firstCell === '1') {
        const secondCell = String(row[1] || '').trim();
        if (secondCell && secondCell.includes('Agriculture')) {
          dataTableStart = i;
          //console.log('Found data table at row (alt):', dataTableStart);
          break;
        }
      }
    }
  }

  if (dataTableStart === -1) {
    //console.log('Could not find data table');
    return { hierarchicalData: [], columns: [], additionalColumns: [] };
  }

  // Get the header row to identify column positions
  const headerRow = data[dataTableStart - 1];
  //console.log('Header row:', headerRow.map(c => String(c || '').trim()));

    const sanitizeKey = (text) => {
    return text
      .trim()
      .replace(/\s+/g, '_')           // Replace spaces with underscores
    //   .replace(/[^a-zA-Z0-9_]/g, '')  // Remove special characters
    //   .replace(/_+/g, '_');           // Replace multiple underscores with single
  };
  // Define column groups
  const columnGroups = [
    { prefix: 'Public_Enterprise', baseIndex: 2 },
    { prefix: 'Cooperatives', baseIndex: 5 },
    { prefix: 'Private_Individuals', baseIndex: 8 },
    { prefix: 'Total', baseIndex: 11 }
  ];

  // Each group has: Disbursement, Collection, Outstanding
  const columns = [];
  for (const group of columnGroups) {
        const disbursementKey = sanitizeKey(`${group.prefix}_Disbursement`);
    const collectionKey = sanitizeKey(`${group.prefix}_Collection`);
    const outstandingKey = sanitizeKey(`${group.prefix}_Outstanding`);

    columns.push({
      key: disbursementKey,
      index: group.baseIndex,
      displayName: `${group.prefix} Disbursement`
    });
    columns.push({
      key: collectionKey,
      index: group.baseIndex + 1,
      displayName: `${group.prefix} Collection`
    });
    columns.push({
      key: outstandingKey,
      index: group.baseIndex + 2,
       displayName: `${group.prefix} Outstanding`
    });
  }

  //console.log('Columns mapping:', columns);

  const topLevelNodes = [];
  const nodeMap = new Map();

  // Parse each row
  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const code = String(row[0] || '').trim();
    const description = String(row[1] || '').trim();

    // Skip if no description
    if (!description) continue;
if (i>40) continue;
    // Skip footer rows or notes
    if (description.includes('Note:') || description.includes('Note')) continue;

    // Check if this is a total row
    const isTotalRow = description === 'Total' || 
                       description.includes('Total') ;
                      //  description === 'Lending to Government' ||
                      //  description === 'Direct Advance' ||
                      //  description === 'Government Bonds' ||
                      //  description === 'Special Bank' ||
                      //  description === 'Treasury bills' ||
                      //  description === 'Loans & Advances in legal' ||
                      //  description === 'Interbank lending' ||
                      //  description === 'others';

    // Check if this is a parent section (like 4 International Trade)
    const isParent = code && code.includes('.') && !code.match(/\.\d+$/);

    // Extract values for each column
    const values = {};
    for (const col of columns) {
      let value = '0';
      if (col.index < row.length) {
        const rawValue = parseFloat(row[col.index]);
        if (!isNaN(rawValue) && rawValue !== 0) {
          value = rawValue.toFixed(2);
        } else {
          value = '0';
        }
      }
      values[col.key] = value;
    }

    // Determine level
    let level = 0;
    if (code && code !== '') {
      const codeParts = code.split('.');
      level = codeParts.length;
    } else if (isTotalRow) {
      level = 0;
    }

    // Determine if this is a section header
    const isSectionHeader = isParent && !isTotalRow;

    const entry = {
      id: code || ``,
      sNo: code || '',
      label: description,
      values: values,
      rowNumber: i + 1,
      level: level,
      isTotalRow: isTotalRow || false,
      isSectionHeader: isSectionHeader || false,
      children: []
    };

    if (code) {
      nodeMap.set(code, entry);
    }

    if (!code) {
      // Rows without code are usually totals
      if (isTotalRow) {
        // Find the appropriate parent based on description
        let parent = null;
        if (description.includes('Total') && !description.includes('Lending')) {
          // This is the main total row - find the parent
          const totalParent = nodeMap.get('13');
          if (totalParent) {
            totalParent.children.push(entry);
            //console.log(`Added ${description} as child of 13`);
          } else {
            topLevelNodes.push(entry);
          }
        } else if (description === 'Lending to Government') {
          parent = nodeMap.get('14');
        } else if (description === 'Direct Advance') {
          parent = nodeMap.get('15');
        } else if (description === 'Government Bonds') {
          parent = nodeMap.get('16');
        } else if (description === 'Special Bank') {
          parent = nodeMap.get('17');
        } else if (description === 'Treasury bills') {
          parent = nodeMap.get('18');
        } else if (description === 'Loans & Advances in legal') {
          parent = nodeMap.get('19');
        } else if (description === 'Interbank lending') {
          parent = nodeMap.get('20');
        } else if (description === 'others') {
          parent = nodeMap.get('21');
        }
        
        if (parent) {
          const exists = parent.children.some(child => child.id === entry.id);
          if (!exists) {
            parent.children.push(entry);
          }
        } else {
          topLevelNodes.push(entry);
        }
      } else {
        // Other rows without code
        topLevelNodes.push(entry);
      }
    }
  }

  // Build hierarchy for nodes with codes
  for (const [code, node] of nodeMap) {
    const codeParts = code.split('.');
    
    if (codeParts.length === 1) {
      // Top level nodes (1-22)
      const existing = topLevelNodes.find(n => n.id === code);
      if (!existing) {
        topLevelNodes.push(node);
        //console.log(`Added top-level node: ${code} - ${node.label}`);
      }
    } else if (codeParts.length > 1) {
      // Child nodes (4.1, 4.2, etc.)
      const parentCode = codeParts.slice(0, -1).join('.');
      const parent = nodeMap.get(parentCode);
      
      if (parent) {
        const exists = parent.children.some(child => child.id === node.id);
        if (!exists) {
          parent.children.push(node);
          //console.log(`Added node ${code} as child of ${parentCode}`);
        }
      } else {
        // Try to find parent by base code
        const baseCode = codeParts[0];
        const baseParent = nodeMap.get(baseCode);
        if (baseParent) {
          const exists = baseParent.children.some(child => child.id === node.id);
          if (!exists) {
            baseParent.children.push(node);
            //console.log(`Added node ${code} as child of ${baseCode} (fallback)`);
          }
        } else {
          // If still no parent, add to top level
          topLevelNodes.push(node);
          //console.log(`Added node ${code} as top-level (no parent found)`);
        }
      }
    }
  }

  // Sort children by code
  const sortChildren = (nodes) => {
    nodes.sort((a, b) => {
      // if (a.isTotalRow && !b.isTotalRow) return 1;
      // if (!a.isTotalRow && b.isTotalRow) return -1;
      
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

  //console.log('Final top-level nodes:', topLevelNodes.length);
  //console.log('Top-level nodes:', topLevelNodes.map(n => n.sNo + ' - ' + n.label));

  // Get column names for columns
  const currencyColumns = columns.map(c => c.key);

  return {
    hierarchicalData: topLevelNodes,
    columns: currencyColumns,
    additionalColumns: [],
    noandtitles
};
}
export default extractLoanDisbursementData;
