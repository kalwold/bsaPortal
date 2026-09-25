import { excelDateToISO } from "../../../utils";
export const extractCapitalAdequacyOnBalanceSheetMetadata =(data)=>{

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
    const firstCell = String(row[0]?row[0]:'').trim();
    const secondCell = String(row[1]?row[1]:'').trim();
    const thirdCell = String(row[2]?row[2]:'').trim();
    const fourthCell = String(row[5]?row[5]:'').trim();

    if (i === 0 && firstCell) {
   metadata.ReturnKey = firstCell;

      if (firstCell.includes("CAP_ADQ_ITEM_QI001") ) {
        metadata.reportType = "finance-quarterly_onbalance-sheet";
        metadata.reportTypeId = "finance-quarterly_onbalance-sheet";
        metadata.departmentName = "Finance";
        metadata.departmentId = "finance";
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
const extractCapitalAdequacyOnBalanceSheetData=(data)=>{
    const sanitizeKey = (text) => {
  return text
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .replace(/_+/g, '_');
};
  const additionalColumns = [];
  let noandtitles = [];
  let dataTableStartIndex = -1

 for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (row.length === 0) continue;
    const firstCell = String(row[0]).trim();
    let secondCell = String(row[1]).trim();

    if (i === 13) {
      noandtitles = [sanitizeKey(firstCell), sanitizeKey(secondCell)];
    }
  }

  // Find the data table start
  for (let i = 0; i < Math.min(data.length, 20); i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
  
    const firstCell = String(row[0]).trim();
     if (firstCell.includes("Code")) {
      console.log("Found data table header at row", i);
      dataTableStartIndex = i + 2;
      break;
    }
  }
if (dataTableStartIndex === -1) {
      console.log("Could not find data table");
      return { hierarchicalData: [], columns: [], additionalColumns: [] };
    }
  
     const headerRow = data[dataTableStartIndex - 2];
    console.log(
      "Header row:",
      headerRow.map((c) => String(c || "").trim()),
    );

    const columnMap = {
    code: 0,
    description: 1,
    amount_A: 2,
    weight_B:3,
    riskWeightedAssets_C:4,

    };

      const columnNames = [

    "Amount_A",
   "Weight_B",
   "Risk_Weighted_Assets_C"
  ];

  const topLevelNodes = [];
 const nodeMap = new Map();

    for (let i = dataTableStartIndex; i < data.length; i++) {
    const row = data[i];
    if (row.length === 0) continue;

   
    const sNo = String(row[columnMap.code] || "").trim();
    const description = String(row[columnMap.description] || "").trim();

    if (!description || sNo==='* Total Amount on Column "C"  should be equal to total assets on balance sheet') continue;

 
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

    
    const values = {};
    values["Amount_A"] = getValue(
      columnMap.amount_A,
    );
    values["Weight_B"] = getValue(columnMap.weight_B);
    values["Risk_Weighted_Assets_C"] = getValue(
      columnMap.riskWeightedAssets_C
    );

    const isTotalRow = (description === "Total *");

    const entry = {
      id: sNo,
      sNo: sNo,
      label: description,
      values: values,
      rowNumber: i + 1,
      level: 1,
      isTotalRow: isTotalRow,
      isSectionHeader: false,
      children: [],
    };
   
if(sNo)
    {
      nodeMap.set(sNo, entry);
    }

    //topLevelNodes.push(entry);
  }

// topLevelNodes.sort((a, b) => {
//     const aSNo = parseInt(a.sNo);
//     const bSNo = parseInt(b.sNo);
//     if (isNaN(aSNo) && isNaN(bSNo)) return 0;
//     if (isNaN(aSNo)) return 1;
//     if (isNaN(bSNo)) return -1;
//     return aSNo - bSNo;
//   });

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

  

  return {
    hierarchicalData: topLevelNodes,
    columns: columnNames,
    additionalColumns,
    noandtitles,
  };


}
export default extractCapitalAdequacyOnBalanceSheetData