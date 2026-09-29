import { excelDateToISO } from "../../../utils";
export const extractOffBalanceProvisioningMetadata=(data)=>{
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
    const fourthCell = String(row[3] || "").trim();
    const eighthCell = String(row[8] || "").trim();
    const twelveCell = String(row[7] || "").trim();

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
      //consol.log("Found Return Key:", metadata.ReturnKey);
     

  if (firstCell.includes('POBEPE001') || firstCell.includes('POBEPE')) {
        metadata.reportType = 'credit-quarterly_off-balance-provision';
        metadata.reportTypeId = 'credit-quarterly_off-balance-provision';
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
const extractOffBalanceProvisioningData = (data) => {
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
  console.log('=== Extracting Off-Balance Sheet Provisioning Data (PE001) ===');

  // Log first few rows to understand structure
  for (let i = 0; i < Math.min(data.length, 20); i++) {
    const row = data[i];
    if (row) {
      console.log(`Row ${i}:`, row.map(c => String(c || '').trim()));
    }
  }

  // Find the data table start - look for "Code" column
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = String(row[0] || '').trim();
    if (firstCell === 'Code') {
      dataTableStart = i + 2; // Skip header rows (2 rows of headers)
      console.log('Found data table at row:', dataTableStart);
      break;
    }
  }

  if (dataTableStart === -1) {
    console.log('Could not find data table');
    return { hierarchicalData: [], columns: [], additionalColumns: [] };
  }

  // Column indices (0-based)
  // A(0)=Code, B(1)=Off Balance Sheet Item, C(2)=Amount, D(3)=Provisioning Rate,
  // E(4)=NPL's Amount, F(5)=Provisioning Rate (2%), G(6)=Amount Under litigation, H(7)=Provisioning rate (5%),
  // I(8)=Required Provisions, J(9)=Accumulated provision held in the Previous Period, K(10)=Excess/Shortfall in Provisions
  const CODE_COL = 0;
  const ITEM_COL = 1;
  const AMOUNT_COL = 2;
  const PROVISIONING_RATE_COL = 3;
  const NPL_AMOUNT_COL = 4;
  const NPL_PROVISIONING_RATE_COL = 5;
  const LITIGATION_AMOUNT_COL = 6;
  const LITIGATION_PROVISIONING_RATE_COL = 7;
  const REQUIRED_PROVISIONS_COL = 8;
  const ACCUMULATED_PROVISION_COL = 9;
  const EXCESS_SHORTFALL_COL = 10;

  // Define the columns for this report
  const columns = [
    'Amount',
    'Provisioning_Rate',
    'NPL_Amount',
    'NPL_Provisioning_Rate',
    'Amount_Under_Litigation',
    'Litigation_Provisioning_Rate',
    'Required_Provisions',
    'Accumulated_Provision_Held',
    'Excess_Shortfall_In_Provisions'
  ];

  const topLevelNodes = [];
  const nodeMap = new Map();

  // Helper functions
  const getValue = (index, row) => {
    if (index !== undefined && index < row.length) {
      const val = parseFloat(String(row[index] ?? "").replace(/[,%\s]/g, ""));
      if (!isNaN(val) && val !== 0) {
        return val.toFixed(2);
      }
      return '0';
    }
    return '0';
  };

  const getStringValue = (index, row) => {
    if (index !== undefined && index < row.length) {
      return String(row[index] || '').trim();
    }
    return '';
  };

  // Parse each row
  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const code = String(row[CODE_COL] || '').trim();
    const item = String(row[ITEM_COL] || '').trim();

    // Skip if no code and no item
    if (!code && !item) continue;

    // Skip note rows
    if (item.includes('Note:') || item.includes('If counterparty') || item.includes('Collateral does not')) continue;
    if (item.includes('Additional 2%') || item.includes('Additional 5%')) continue;

    // Skip "Total_Accumulated provision held in the previous period" row
    

    // Check if this is a total row
    const isTotalRow = item.includes('Total Off Balance Sheet Item') || item.includes('Total_Accumulated provision held');

    // Check if this is a header/section row
    const isSectionHeader = code === '1' && item === 'Guarantee';

    // Extract values
    const values = {
      'Amount': getValue(AMOUNT_COL, row),
      'Provisioning_Rate': getValue(PROVISIONING_RATE_COL, row),
      'NPL_Amount': getValue(NPL_AMOUNT_COL, row),
      'NPL_Provisioning_Rate': getValue(NPL_PROVISIONING_RATE_COL, row),
      'Amount_Under_Litigation': getValue(LITIGATION_AMOUNT_COL, row),
      'Litigation_Provisioning_Rate': getValue(LITIGATION_PROVISIONING_RATE_COL, row),
      'Required_Provisions': getValue(REQUIRED_PROVISIONS_COL, row),
      'Accumulated_Provision_Held': getValue(ACCUMULATED_PROVISION_COL, row),
      'Excess_Shortfall_In_Provisions': getValue(EXCESS_SHORTFALL_COL, row)
    };

    // Determine level based on code depth
    let level = 0;
    if (code && code !== '') {
      const codeParts = code.split('.');
      level = codeParts.length;
    }

    const entry = {
      id: code || ``,
      sNo: code || '',
      label: item,
      values: values,
      rowNumber: i + 1,
      level: level,
      isTotalRow: isTotalRow || false,
      isSectionHeader: false,
      children: []
    };

    if (code) {
      nodeMap.set(code, entry);
    }

    // Add to top level or as child
    if (level <= 1) {
      topLevelNodes.push(entry);
    }
  }

  // Build hierarchy for nodes with codes
  for (const [code, node] of nodeMap) {
    const codeParts = code.split('.');
    
    if (codeParts.length === 1) {
      continue;
    } else if (codeParts.length > 1) {
      const parentCode = codeParts.slice(0, -1).join('.');
      const parent = nodeMap.get(parentCode);
      
      if (parent) {
        const exists = parent.children.some(child => child.id === node.id);
        if (!exists) {
          parent.children.push(node);
        }
      } else {
        const baseCode = codeParts[0];
        const baseParent = nodeMap.get(baseCode);
        if (baseParent) {
          const exists = baseParent.children.some(child => child.id === node.id);
          if (!exists) {
            baseParent.children.push(node);
          }
        } else {
          topLevelNodes.push(node);
        }
      }
    }
  }

  // Remove duplicates from top level
  const uniqueTopLevel = [];
  const addedIds = new Set();
  for (const node of topLevelNodes) {
    if (!addedIds.has(node.id)) {
      addedIds.add(node.id);
      uniqueTopLevel.push(node);
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

  sortChildren(uniqueTopLevel);

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
  cleanData(uniqueTopLevel);

  console.log('Total entries:', uniqueTopLevel.length);

  return {
    hierarchicalData: uniqueTopLevel,
    columns: columns,
    additionalColumns: [],
    noandtitles
  };
};
export default extractOffBalanceProvisioningData