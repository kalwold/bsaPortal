const extractLoanStatusData = (data) => {
  const hierarchicalData = [];
  let dataTableStart = -1;

   let noandtitles = [];

const sanitizeKey = (text) => {
  return text
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .replace(/_+/g, '_');
};
  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    const firstCell = String(row[0] || "").trim();
    const secondCell = String(row[1] || "").trim();

    if (i === 13) {
      noandtitles = [firstCell, secondCell];
      console.log("Found title:", noandtitles);
    }
  }
  console.log('=== Extracting Loan Status Data ===');

  // Log first few rows to understand structure
  for (let i = 0; i < Math.min(data.length, 15); i++) {
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
      dataTableStart = i + 1;
      console.log('Found data table at row:', dataTableStart);
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
          console.log('Found data table at row (alt):', dataTableStart);
          break;
        }
      }
    }
  }

  if (dataTableStart === -1) {
    console.log('Could not find data table');
    return { hierarchicalData: [], columns: [], additionalColumns: [] };
  }

  // Get the header row to identify column positions
  const headerRow = data[dataTableStart - 1];
  console.log('Header row:', headerRow.map(c => String(c || '').trim()));

  // Define column groups with sanitized keys
  const columnGroups = [
    { prefix: 'Public_Enterprises', baseIndex: 2 },
    { prefix: 'Cooperatives', baseIndex: 5 },
    { prefix: 'Private_Individuals', baseIndex: 8 }
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

  console.log('Columns mapping:', columns);

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

    // Skip footer rows or notes
    if (description.includes('Note:') || description.includes('Note') || description.includes('Total')) continue;

    // Check if this is a total row
    const isTotalRow = description === 'Total';

    // Check if this is a parent section (like 4 International trade)
    const isParent = code && code.includes('.') && !code.match(/\.\d+$/);

    // Extract values for each column using the sanitized keys
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
      id: code || `row-${i}`,
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
      // Rows without code - add to top level
      if (isTotalRow) {
        // Find the appropriate parent for total
        const totalParent = nodeMap.get('13');
        if (totalParent) {
          totalParent.children.push(entry);
          console.log(`Added ${description} as child of 13`);
        } else {
          topLevelNodes.push(entry);
        }
      } else {
        topLevelNodes.push(entry);
      }
    }
  }

  // Build hierarchy for nodes with codes
  for (const [code, node] of nodeMap) {
    const codeParts = code.split('.');
    
    if (codeParts.length === 1) {
      // Top level nodes (1-13)
      const existing = topLevelNodes.find(n => n.id === code);
      if (!existing) {
        topLevelNodes.push(node);
        console.log(`Added top-level node: ${code} - ${node.label}`);
      }
    } else if (codeParts.length > 1) {
      // Child nodes (4.1, 4.2, etc.)
      const parentCode = codeParts.slice(0, -1).join('.');
      const parent = nodeMap.get(parentCode);
      
      if (parent) {
        const exists = parent.children.some(child => child.id === node.id);
        if (!exists) {
          parent.children.push(node);
          console.log(`Added node ${code} as child of ${parentCode} , ${node}`);
        }
      } else {
        // Try to find parent by base code
        const baseCode = codeParts[0];
        const baseParent = nodeMap.get(baseCode);
        if (baseParent) {
          const exists = baseParent.children.some(child => child.id === node.id);
          if (!exists) {
            baseParent.children.push(node);
            console.log(`Added node ${code} as child of ${baseCode} (fallback)`);
          }
        } else {
          // If still no parent, add to top level
          topLevelNodes.push(node);
          console.log(`Added node ${code} as top-level (no parent found)`);
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

  console.log('Final top-level nodes:', topLevelNodes.length);
  console.log('Top-level nodes:', topLevelNodes.map(n => n.sNo + ' - ' + n.label));

  // Get sanitized column names for columns
  const currencyColumns = columns.map(c => c.key);

  return {
    hierarchicalData: topLevelNodes,
    columns: currencyColumns,
    additionalColumns: [],
    noandtitles
};}
export default extractLoanStatusData