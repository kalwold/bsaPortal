const extractLiquidityRequirementData = (data) => {
  const hierarchicalData = [];
  let dataTableStart = -1;
   let noandtitles = [];
    for (let i = 0; i < data.length; i++) {
    const row = data[i];
    
    const firstCell = String(row[0] || "").trim();
    const secondCell = String(row[1] || "").trim();

    if(i === 13){
      noandtitles = [firstCell,secondCell]
      console.log("Found title:", noandtitles);
    }
  }
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    
    const firstCell = String(row[0] || "").trim();
    const secondCell = String(row[1] || "").trim();

    if (firstCell === "code" || secondCell === "Description") {
    
      dataTableStart = i + 1;
      break;
    }
   
  }

 

  // Alternative: Look for "Required Liquid Assets"
  if (dataTableStart === -1) {
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const secondCell = String(row[1] || "").trim();
      if (secondCell === "Required Liquid Assets") {
        dataTableStart = i;
        break;
      }
    }
  }

  const headerRow = data[dataTableStart - 1];
  
  const dayColumns = [];
  let dayStartIndex = -1;
  
  // Look for day names (Thu, Fri, Sat, Sun, Mon, Tue, Wed)
  for (let i = 0; i < headerRow.length; i++) {
    const cell = String(headerRow[i] || "").trim();
    if (
      cell === "Thu" ||
      cell === "Fri" ||
      cell === "Sat" ||
      cell === "Sun" ||
      cell === "Mon" ||
      cell === "Tue" ||
      cell === "Wed"
    ) {
      if (dayStartIndex === -1) dayStartIndex = i;
      dayColumns.push(cell);
    }
    if (cell === "Weekly Average") {
      dayColumns.push("Weekly_Average");
    }
  }

  if (dayColumns.length === 0) {
    dayStartIndex = 2;
    dayColumns.push(
      "Thu",
      "Fri",
      "Sat",
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Weekly_Average",
    );
  }

  const topLevelNodes = [];
  const nodeMap = new Map();
  let currentParent = null;

  // Loop through each row
  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    if (i > 26) continue;

    const code = String(row[0] || "").trim();
    const description = String(row[1] || "").trim();

    // Skip empty rows, notes, and footers
    if (!description) continue;
    if (description.includes("Note:") || description.includes("_")) continue;

    //  IDENTIFY ROW TYPES 
    const isSectionHeader =
      description === "Required Liquid Assets" ||
      description === "Liquid Assets Held" ||
      description === "Excess/deficit" ||
      description === "Liquidity Ratio";

    const isTotalRow =
      description.includes("Total liquid assets") ||
      description.includes("Excess/deficit") ||
      description.includes("Liquidity Ratio");

    // EXTRACT VALUES FOR EACH DAY
     const values = {};

    const isNullSection = description === 'Required Liquid Assets' || 
                      description === 'Liquid Assets Held';

            if (isNullSection) {
  // Section headers - set all values to null
  for (let j = 0; j < dayColumns.length; j++) {
    values[dayColumns[j]] = null;
  }
} else {

    for (let j = 0; j < dayColumns.length; j++) {
      
      const colIndex = dayStartIndex + j;
      if (colIndex < row.length) {
        const rawValue = parseFloat(row[colIndex]);
        if (!isNaN(rawValue) && rawValue !== 0) {
          values[dayColumns[j]] = rawValue.toFixed(2);
        } else {
          values[dayColumns[j]] = "0";
        }
      } else {
        values[dayColumns[j]] = "0";
      }

    }}

    // DETERMINE HIERARCHY LEVEL
    let level = 0;
    if (code && code !== "") {
      const codeParts = code.split(".");
      level = codeParts.length;
    } else if (isSectionHeader) {
      level = 0;
    } else if (isTotalRow) {
      level = 1;
    }

    //  CREATE THE NODE
    const entry = {
      id: code || "",
      sNo: code || "",
      label: description,
      values: values, // Contains values for each day
      rowNumber: i + 1,
      level: level,
      isTotalRow: isTotalRow || false,
      isSectionHeader: isSectionHeader || false,
      children: [],
    };

    // BUILD HIERARCHY 
    if (code) {
      nodeMap.set(code, entry);
    }

    if (!code) {
      if (isSectionHeader) {
        // Section header (e.g., "Required Liquid Assets")
        topLevelNodes.push(entry);
        currentParent = entry;
      } else if (isTotalRow) {
        // Total rows (e.g., "Total liquid assets")
        if (currentParent) {
          currentParent.children.push(entry);
        } else {
          topLevelNodes.push(entry);
        }
      } else {
        // Other rows without code
        if (currentParent && !currentParent.isSectionHeader) {
          currentParent.children.push(entry);
        } else if (currentParent) {
          currentParent.children.push(entry);
        } else {
          topLevelNodes.push(entry);
        }
      }
    }
  }

  // BUILD HIERARCHY FOR CODED NODES
  for (const [code, node] of nodeMap) {
    const codeParts = code.split(".");

    if (codeParts.length === 1) {
      // Top level (1, 2, 3, 4)
      const existing = topLevelNodes.find((n) => n.id === code);
      if (!existing) {
        topLevelNodes.push(node);
      }
    } else if (codeParts.length > 1) {
      // Child node (1.1, 1.2, etc.)
      const parentCode = codeParts.slice(0, -1).join(".");
      const parent = nodeMap.get(parentCode);

      if (parent) {
        const exists = parent.children.some((child) => child.id === node.id);
        if (!exists) {
          parent.children.push(node);
        }
      } else {
        const baseCode = codeParts[0];
        const baseParent = nodeMap.get(baseCode);
        if (baseParent) {
          const exists = baseParent.children.some(
            (child) => child.id === node.id,
          );
          if (!exists) {
            baseParent.children.push(node);
          }
        }
      }
    }
  }

  // SORT CHILDREN 
  const sortChildren = (nodes) => {
    nodes.sort((a, b) => {
      // Total rows at the end
      if (a.isTotalRow && !b.isTotalRow) return 1;
      if (!a.isTotalRow && b.isTotalRow) return -1;

      // Sort by S/No
      if (a.sNo && b.sNo) {
        const aParts = a.sNo.split(".").map(Number);
        const bParts = b.sNo.split(".").map(Number);
        for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
          if (aParts[i] !== bParts[i]) {
            return aParts[i] - bParts[i];
          }
        }
        return aParts.length - bParts.length;
      }
      return 0;
    });

    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        sortChildren(node.children);
      }
    });
  };

  sortChildren(topLevelNodes);

  // CLEAN UP 
  const cleanData = (nodes) => {
    nodes.forEach((node) => {
      if (node.children && node.children.length === 0) {
        delete node.children;
      } else if (node.children) {
        cleanData(node.children);
      }
    });
  };
  cleanData(topLevelNodes);

  //  RETURN RESULT 
  return {
    hierarchicalData: topLevelNodes,
    columns: dayColumns, // ['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Weekly Average']
    additionalColumns: [],
    noandtitles:noandtitles
  };
};

export default extractLiquidityRequirementData;