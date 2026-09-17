

import { excelDateToISO } from "./excelParser";
export const extractIfbProfitLossMetadata = (data) => {
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
    const thirteenCell = String(row[12] || "").trim();

    if (i === 0 && firstCell) {
      metadata.ReturnKey = firstCell;
      //console.log("Found Return Key:", metadata.ReturnKey);

if (firstCell.includes('INT_FRE_SP') || firstCell.includes('BP001')) {
        metadata.reportType = 'ifb-monthly_profit-loss';
        metadata.reportTypeId = 'ifb-monthly_profit-loss';
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
      ( i === 9) 
      //&&
    //   (firstCell || secondCell) &&
    //   (firstCell || secondCell).includes("Start Date")
    ) {
        //console.log('thirdCell', thirdCell)
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

const extractIfbProfitLossData=(data)=>{
    let dataTableStart = -1;
   let noandtitles = [];
    for (let i = 0; i < data.length; i++) {
    const row = data[i];
    
    const firstCell = String(row[0] || "").trim();
    const secondCell = String(row[1] || "").trim();

    if(i === 13){
      noandtitles = [firstCell,secondCell]
      //console.log("Found title:", noandtitles);
    }
  }

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
    if (firstCell === 'S.No.') {
      dataTableStart = i + 1;
      //console.log('Found data table at row:', dataTableStart);
      break;
    }
  }

  if (dataTableStart === -1) {
    //console.log('Could not find data table');
    return { hierarchicalData: [], currencies: ['Amount'], additionalColumns: [] , noandtitles};
  }

  const headerRow = data[dataTableStart - 1];
  //console.log('Header row:', headerRow.map(c => String(c || '').trim()));

   // Find the value column (column C = index 2)
  const valueColumnIndex = 2;
  const topLevelNodes = [];
  const nodeMap = new Map();
  let currentParent = null;

  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const code = String(row[0] || '').trim();
    const description = String(row[1] || '').trim();

     // Skip if no description
    if (!description) continue;

    // Skip footer rows
    if (description.includes('Note:') || description.includes('Note')) continue;

        // Check if this is a total row
    const isTotalRow = description === 'Total distributable income(Sum 1.1-1.7)' ||
                       description === 'Total income(=1.8-1.9)' ||
                       description === 'Operating income before tax and provisions[1.10-(sum 2.1-2.4)]' ||
                       description === 'Net income after tax & provisions (2.7-2.8)';

    const isParent = code && code.includes('.') && !code.match(/\.\d+$/);

       // Extract the value
    let value = '0';
    if (valueColumnIndex < row.length) {
      const rawValue = parseFloat(row[valueColumnIndex]);
      if (!isNaN(rawValue) && rawValue !== 0) {
        value = rawValue.toFixed(2);
      } else {
        value = '0';
      }
    }

// Determine level
    let level = 0;
    if (code && code !== '') {
      const codeParts = code.split('.');
      level = codeParts.length;
    }

    // Determine if this is a section header
    const isSectionHeader = isParent;
    const entry = {
      id: code || ``,
      sNo: code || '',
      label: description,
      values: {
        'Amount': value
      },
      rowNumber: i + 1,
      level: level,
      isTotalRow: isTotalRow || false,
      isSectionHeader: isSectionHeader || false,
      children: []
    };

 nodeMap.set(code, entry);
}

   // Build hierarchy for nodes with codes
  for (const [code, node] of nodeMap) {
    const codeParts = code.split('.');
    
    if (codeParts.length === 1) {
      // Top level nodes (1, 2, 3, 4)
      const existing = topLevelNodes.find(n => n.id === code);
      if (!existing) {
        topLevelNodes.push(node);
        //console.log(`Added top-level node: ${code} - ${node.label}`);
      }
    } else if (codeParts.length > 1) {
      // Child nodes (2.1, 2.4.1, etc.)
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
    //   if (a.isTotalRow && !b.isTotalRow) return 1;
    //   if (!a.isTotalRow && b.isTotalRow) return -1;
      
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

  return {
    hierarchicalData: topLevelNodes,
    columns: ['Amount'],
    additionalColumns: [],
    noandtitles
  };
  
}

export default extractIfbProfitLossData