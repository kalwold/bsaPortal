import { excelDateToISO } from "../../../utils";
export const extractIfbBalanceSheetMetadata = (data) => {
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

if (firstCell && firstCell.includes('INT_FRE_BS') || firstCell.includes('FB001')) {

        metadata.reportType = 'ifb-monthly_balance-sheet';
        metadata.reportTypeId = 'ifb-monthly_balance-sheet';
        metadata.departmentId = 'ifb';
        metadata.departmentName = 'IFB';
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
      ( i === 12) &&
      (thirdCell || eighthCell || firstCell) &&
      (thirdCell.toLowerCase().includes("in") ||
        eighthCell.toLowerCase().includes("in") || firstCell.toLowerCase().includes('In'))
    ) {
      metadata.unit = thirdCell  || '';
      //console.log("Found Unit:", metadata.unit);
    }
  }
return metadata
}
const extractIfbBalanceSheetData=(data)=> {
  const hierarchicalData = [];
  let dataTableStart = -1;

  let noandtitles = [];
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const firstCell = String(row[0] || "").trim();
    const secondCell = String(row[1] || "").trim();

    if (i === 13) {
      noandtitles = [firstCell, secondCell];
      //console.log("Found title:", noandtitles);
    }
  }

  // Find the data table start
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = String(row[0] || '').trim();
    const secondCell = String(row[1] || '').trim();
    if (firstCell === 'Code' || secondCell === 'Description') {
      dataTableStart = i + 1;
      break;
    }
  }

  if (dataTableStart === -1) {
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;
      const firstCell = String(row[0] || '').trim();
      if (firstCell === 'ASSETS') {
        dataTableStart = i + 1;
        break;
      }
    }
  }

  if (dataTableStart === -1) {
    return { hierarchicalData: [], columns: ['Current_Month'], additionalColumns: [] };
  }

  const topLevelNodes = [];
  const nodeMap = new Map();
  let currentParent = null;  
  let assetsNode = null;
  let liabilitiesNode = null;

  // Find value column
//   let valueColumnIndex = -1;
//   const headerRow = data[dataTableStart - 1];
//   for (let i = 0; i < headerRow.length; i++) {
//     const cell = String(headerRow[i] || '').trim();
//     if (cell === 'Current Month' || cell === 'Current Month ' || cell.includes('Current')) {
//       valueColumnIndex = i;
//       break;
//     }
//   }
//   if (valueColumnIndex === -1) valueColumnIndex = 2;

const valueColumnIndex = 2;
  // Parse the data
  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const code = String(row[0] || '').trim();
    const description = String(row[1] || '').trim();

    if (!description) continue;
    const normalizedCode = code.replace(/\s*\./g, '.').replace(/\.$/, '');

    // === IDENTIFY SECTION HEADERS ===
    const isAssetsSection = description === 'Assets';
    const isLiabilitiesSection = description === "Liabilities and Owner's Equity";
    const isSectionHeader = isAssetsSection || isLiabilitiesSection;

    // === IDENTIFY TOTAL ROWS ===
    const isTotalRow = description.includes('Total Assets') ||
                        description.includes("Liabilities and owners’ Equity (16+17)")
                    //    description.includes('NON-FINANCIAL ASSETS')||
                    //    description.includes('TOTAL LIABILITIES');

    // Extract value
    let value = null;
    if (valueColumnIndex < row.length) {
      const raw = row[valueColumnIndex];
       const cleaned = String(raw).replace(/,/g, "").trim();
      const rawValue = parseFloat(cleaned);
      if (!isNaN(rawValue) && rawValue !== 0) {
        value = rawValue;
      }
    }

    // Determine level
    let level = 0;
    if (normalizedCode && normalizedCode !== '') {
      const codeParts = normalizedCode.split('.');
      level = codeParts.length;
    } else if (isSectionHeader) {
      level = 0;
    } else if (isTotalRow) {
      level = 0;
    }

    const entry = {
      id: normalizedCode || ``,
      sNo: normalizedCode || '',
      label: description,
      values: {
        'Current_Month': value !== null ? value.toFixed(2) : '0'
      },
      rowNumber: i + 1,
      level: level,
      isTotalRow: isTotalRow || false,
      isSectionHeader: isSectionHeader || false,
      isAssetsSection: isAssetsSection || false,
      isLiabilitiesSection: isLiabilitiesSection || false,
      children: []
    };

    if (normalizedCode) {
      nodeMap.set(normalizedCode, entry);
    }

    // === BUILD HIERARCHY ===
    if (!normalizedCode) {
      if (isAssetsSection) {
        // ASSETS section - top level
        topLevelNodes.push(entry);
        assetsNode = entry;
        currentParent = entry;
        //console.log('Added ASSETS section:', entry.label);
      } else if (isLiabilitiesSection) {
        // LIABILITIES & CAPITAL section - top level
        topLevelNodes.push(entry);
        liabilitiesNode = entry;
        currentParent = entry;
        //console.log('Added LIABILITIES & CAPITAL section:', entry.label);
      } else if (isTotalRow) {
        // Total rows - add to appropriate parent
        if (description.includes('Total Assets') && assetsNode) {
          assetsNode.children.push(entry);
          //console.log('Added TOTAL ASSETS to ASSETS section');
        } 
        else if (description.includes("Liabilities and owners’ Equity (16+17)") && liabilitiesNode) {
          liabilitiesNode.children.push(entry);
          //console.log('Added TOTAL LIABILITIES to LIABILITIES section');
        } 
        //else {
        //   topLevelNodes.push(entry);
        //   //console.log('Added total row as top-level:', entry.label);
        // }
      } else {
        // Other rows without code - add to current parent
        if (currentParent) {
          currentParent.children.push(entry);
        } else {
          topLevelNodes.push(entry);
        }
      }
    }
  }

  // === BUILD HIERARCHY FOR CODED NODES ===
  for (const [normalizedCode, node] of nodeMap) {
    const codeParts = normalizedCode.split('.');
    
    if (codeParts.length === 1) {
      // Top level codes (1, 2, 3, ...)
      // Find the appropriate parent section (ASSETS or LIABILITIES)
      const codeNum = parseInt(codeParts[0]);
      let parentSection = null;
      
      if (codeNum >= 1 && codeNum <= 9) {
        // Codes 1-12 belong to ASSETS
        parentSection = assetsNode;
      } else if (codeNum >= 10 && codeNum <= 17) {
        // Codes 13-22 belong to LIABILITIES & CAPITAL
        parentSection = liabilitiesNode;
      }

      if (parentSection) {
        const exists = parentSection.children.some(child => child.id === normalizedCode);
        if (!exists) {
          parentSection.children.push(node);
          //console.log(`Added node ${normalizedCode} to ${parentSection.label}`);
        }
      } else {
        const existing = topLevelNodes.find(n => n.id === normalizedCode);
        if (!existing) {
          topLevelNodes.push(node);
          //console.log(`Added node ${normalizedCode} as top-level (no parent found)`);
        }
      }
    } else if (codeParts.length > 1) {
      // Child nodes (1.1, 1.1.1, etc.)
      const parentCode = codeParts.slice(0, -1).join('.');
      const parent = nodeMap.get(parentCode);
      
      if (parent) {
        const exists = parent.children.some(child => child.id === node.id);
        if (!exists) {
          parent.children.push(node);
          //console.log(`Added node ${normalizedCode} as child of ${parentCode}`);
        }
      } else {
        // Try to find parent by base code
        const baseCode = codeParts[0];
        const baseParent = nodeMap.get(baseCode);
        if (baseParent) {
          const exists = baseParent.children.some(child => child.id === node.id);
          if (!exists) {
            baseParent.children.push(node);
            //console.log(`Added node ${normalizedCode} as child of ${baseCode} (fallback)`);
          }
        }
      }
    }
  }

  // === SORT CHILDREN ===
  const sortChildren = (nodes) => {
    nodes.sort((a, b) => {
      // Put total rows at the end
      //console.log('description total', a)
      if ((a.isTotalRow && !b.isTotalRow)) return 1;
      if ((!a.isTotalRow && b.isTotalRow))return -1;
    //   if ((a.isTotalRow && !b.isTotalRow)&& a.label.includes('TOTAL LIABILITIES AND NET WORTH')) return 1;
    //   if ((!a.isTotalRow && b.isTotalRow)&& b.label.includes('TOTAL LIABILITIES AND NET WORTH'))return -1;
      
      // Sort by S/No
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

  // === CLEAN UP ===
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

  //console.log('Final hierarchy:', JSON.stringify(topLevelNodes, null, 2));

  return {
    hierarchicalData: topLevelNodes,
    columns: ['Current_Month'],
    additionalColumns: [],
    noandtitles: noandtitles
  };
};

export default extractIfbBalanceSheetData