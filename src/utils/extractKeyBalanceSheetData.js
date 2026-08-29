const extractKeyBalanceSheetData = (data) => {
  const hierarchicalData = [];

  const sanitizeKey = (text) => {
  return text
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .replace(/_+/g, '_');
};
  let dataTableStart = -1;

  console.log('=== Extracting Key Balance Sheet Data ===');

  // Log first few rows to understand structure
  for (let i = 0; i < Math.min(data.length, 20); i++) {
    const row = data[i];
    if (row) {
      console.log(`Row ${i}:`, row.map(c => String(c || '').trim()));
    }
  }

  // Find the data table start - look for "Particulars" column
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = String(row[0] || '').trim();
    if (firstCell === 'Particulars') {
      dataTableStart = i + 1;
      console.log('Found data table at row:', dataTableStart);
      break;
    }
  }

  if (dataTableStart === -1) {
    // Try to find by looking for "Total assets"
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;
      const firstCell = String(row[0] || '').trim();
      if (firstCell && firstCell.includes('Total assets')) {
        dataTableStart = i;
        console.log('Found data table at row (alt):', dataTableStart);
        break;
      }
    }
  }

  if (dataTableStart === -1) {
    console.log('Could not find data table');
    return { hierarchicalData: [], columns: ['Amount'], additionalColumns: [] };
  }

  // Get the header row
  const headerRow = data[dataTableStart - 1];
  console.log('Header row:', headerRow.map(c => String(c || '').trim()));

  // Find the value column (column B = index 1)
  const valueColumnIndex = 1;
  const topLevelNodes = [];

  // Parse each row
  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const label = String(row[0] || '').trim();
    
    // Skip if no label
    if (!label) continue;
   if(i >22) continue;
    // Skip note rows
    if (label.includes('Note:') || label.includes('Note')) continue;

    // Check if this is a metric we care about
    // let matchedMetric = null;
    // for (const metric of metricLabels) {
    //   if (label === metric || label.includes(metric)) {
    //     matchedMetric = metric;
    //     break;
    //   }
    // }

    // Also check if it's one of the other metrics (loans, deposits, etc.)


    if (label) {
      // Extract the value
      let value = '0';
      if (valueColumnIndex < row.length) {
        const rawVal = parseFloat(row[valueColumnIndex]);
        if (!isNaN(rawVal) && rawVal !== 0) {
          value = rawVal.toFixed(2);
        }
      }

      const values = {
        'Amount': value
      };

      const entry = {
        id: '',
        sNo: '',
        label: label,
        values: values,
        rowNumber: i + 1,
        level: 0,
        isTotalRow: false,
        isSectionHeader: false,
        children: []
      };

      topLevelNodes.push(entry);
        }
  }

  console.log('Total metric entries:', topLevelNodes);

  return {
    hierarchicalData: topLevelNodes,
    columns: ['Amount'],
    additionalColumns: [],
    noandtitles:['Particulars']
  };
};
export default extractKeyBalanceSheetData