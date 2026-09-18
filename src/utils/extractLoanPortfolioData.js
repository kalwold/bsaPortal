import { excelDateToISO } from "./excelParser";
export const extractPortfolioMetadata = (data) => {
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

  console.log("data.length  ", data.length)
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const firstCell = String(row[0] || "").trim();
    const secondCell = String(row[1] || "").trim();
    const thirdCell = String(row[2] || "").trim();
    const fourthCell = String(row[5] || "").trim();
    const eighthCell = String(row[8] || "").trim();
    const thirteenCell = String(row[12] || "").trim();

    if (i === 0 && firstCell) {
      metadata.ReturnKey = firstCell;
      console.log("Found Return Key:", metadata.ReturnKey);
if (firstCell.includes('LOA_PORT') || firstCell.includes('EP001')) {
        metadata.reportType = 'credit-monthly_loan-portfolio';
        metadata.departmentId = 'credit';
        metadata.departmentName = 'Credit';
        metadata.reportTypeId = 'credit-monthly_loan-portfolio';
      }
    }

    if (( i === 3) && (firstCell)) {
       metadata.reportTitle = firstCell || '';
      console.log("Found Report Title:", metadata.reportTitle);
    }

    if (
     (i === 7 )&&
      (firstCell ) &&
     ( (firstCell || secondCell).includes("Instiution") ||  (firstCell || secondCell).includes("Institution "))
    ) {
      metadata.institutionCode = thirdCell || '';
      console.log("Found Institution Code:", metadata.institutionCode);
    }

    if (
      (i === 8)&&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("Financial Year")
    ) {
      metadata.financialYear = thirdCell || '';
      console.log("Found Financial Year:", metadata.financialYear);
    }

    if (
      ( i === 9) &&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("Start Date")
    ) {
     // metadata.startDate = excelDateToISO(secondCell||thirdCell  || fourthCell || "");
     metadata.startDate = excelDateToISO(thirdCell) || '';
      console.log("Found Start Date:", metadata.startDate);
    }

    if (
      (i === 10 ) &&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("End Date")
    ) {
      metadata.endDate = excelDateToISO(thirdCell) || "";
      // metadata.endDate =excelDateToISO(secondCell||thirdCell  || fourthCell || "");
      console.log("Found End Date:", metadata.endDate);
    }

    if (
      ( i === 12) &&
      (thirdCell || fourthCell || firstCell) &&
      (thirdCell.toLowerCase().includes("in") ||
        fourthCell.toLowerCase().includes("in") || firstCell.toLowerCase().includes('In'))
    ) {
      metadata.unit = fourthCell  || '';
      console.log("Found Unit:", metadata.unit);
    }
  }
return metadata
}
const extractLoanPortfolioData = (data) => {
  const hierarchicalData = [];
  let dataTableStart = -1;
  let noandtitles = [];

  console.log("=== Extracting Loan Portfolio Data ===");

  // =====================================================
  // 1. Extract title information
  // =====================================================
  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    const firstCell = String(row[0] || "").trim();
    const secondCell = String(row[1] || "").trim();

    if (i === 13) {
      noandtitles = [firstCell, secondCell];
      console.log("Found title:", noandtitles);
    }
  }

  // =====================================================
  // 2. Log first few rows
  // =====================================================
  for (let i = 0; i < Math.min(data.length, 20); i++) {
    const row = data[i];

    if (row) {
      console.log(
        `Row ${i}:`,
        row.map((c) => String(c || "").trim())
      );
    }
  }

  // =====================================================
  // 3. Find table start using "Code"
  // =====================================================
  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    if (!row || row.length === 0) continue;

    const firstCell = String(row[0] || "").trim();

    if (firstCell === "Code") {
      dataTableStart = i + 1;

      console.log(
        "Found data table at row:",
        dataTableStart
      );

      break;
    }
  }

  // =====================================================
  // 4. Alternative table start
  // =====================================================
  if (dataTableStart === -1) {
    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      if (!row || row.length === 0) continue;

      const firstCell = String(row[0] || "").trim();
      const secondCell = String(row[1] || "").trim();

      if (
        firstCell === "1.1" ||
        secondCell === "Advance on import bills"
      ) {
        dataTableStart = i;

        console.log(
          "Found data table at row (alt):",
          dataTableStart
        );

        break;
      }
    }
  }

  // =====================================================
  // 5. If table not found
  // =====================================================
  if (dataTableStart === -1) {
    console.log("Could not find data table");

    return {
      hierarchicalData: [],

      columns: [
        "Disbursement_Amount",
        "Disbursement_Percentage",
        "Outstanding_Amount",
        "Outstanding_Percentage"
      ],

      additionalColumns: [],

      noandtitles
    };
  }

  // =====================================================
  // 6. Hierarchy variables
  // =====================================================

  const topLevelNodes = [];

  // Parent 1
  let section1Parent = null;

  // Parent 2
  let section2Parent = null;

  // Current child of section 2
  // Will contain 2.1 or 2.2
  let currentSubsection = null;

  // =====================================================
  // 7. Parse rows
  // =====================================================

  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];

    if (!row || row.length === 0) continue;

    const code = String(row[0] || "").trim();
    const description = String(row[1] || "").trim();

    // -----------------------------------------------------
    // Skip empty descriptions
    // -----------------------------------------------------
    if (!description) {
      continue;
    }

    // -----------------------------------------------------
    // Skip notes
    // -----------------------------------------------------
    if (description.includes("Note:")) {
      continue;
    }

    // =====================================================
    // 8. Identify row types
    // =====================================================

    // 1.1, 1.2, 1.3, ...
    const isSection1Item =
      /^1\.\d+$/.test(code);

    // 2.1, 2.2, ...
    const isSection2Item =
      /^2\.\d+$/.test(code);

    // Any Total row
    const isTotalRow =
      description.includes("Total(sum") ||
      description.includes("Total(") ||
      description.includes("Total (sum");

    // =====================================================
    // IMPORTANT:
    //
    // Detect the TOTAL for section 2:
    //
    // Total(sum 2.1-2.2)
    //
    // This MUST go under 2, not under 2.2.
    // =====================================================

    const normalizedDescription = description
      .replace(/\s+/g, "")
      .replace(/[–—]/g, "-")
      .toLowerCase();

    const isSection2Total =
      isTotalRow &&
      (
        normalizedDescription.includes("2.1-2.2") ||
        normalizedDescription.includes("2.1to2.2")
      );

    // =====================================================
    // 9. Extract values
    // =====================================================

    let disbursementAmount = "0.00";
    let disbursementPercentage = "0.00";
    let outstandingAmount = "0.00";
    let outstandingPercentage = "0.00";

    // -----------------------------------------------------
    // Column C - Disbursement Amount
    // -----------------------------------------------------
    if (row.length > 2) {
      const rawValue = String(row[2] || "")
        .replace(/,/g, "")
        .trim();

      const val = parseFloat(rawValue);

      if (!isNaN(val)) {
        disbursementAmount = val.toFixed(2);
      }
    }

    // -----------------------------------------------------
    // Column D - Disbursement Percentage
    // -----------------------------------------------------
    if (row.length > 3) {
      const rawValue = String(row[3] || "")
        .replace(/,/g, "")
        .replace(/%/g, "")
        .trim();

      const val = parseFloat(rawValue);

      if (!isNaN(val)) {
        disbursementPercentage = (val).toFixed(2) ;
      }
    }

    // -----------------------------------------------------
    // Column E - Outstanding Amount
    // -----------------------------------------------------
    if (row.length > 4) {
      const rawValue = String(row[4] || "")
        .replace(/,/g, "")
        .trim();

      const val = parseFloat(rawValue);

      if (!isNaN(val)) {
        outstandingAmount = val.toFixed(2);
      }
    }

    // -----------------------------------------------------
    // Column F - Outstanding Percentage
    // -----------------------------------------------------
    if (row.length > 5) {
      const rawValue = String(row[5] || "")
        .replace(/,/g, "")
        .replace(/%/g, "")
        .trim();

      const val = parseFloat(rawValue);

      if (!isNaN(val)) {
        outstandingPercentage = (val).toFixed(2) ;
      }
    }

    // =====================================================
    // 10. Create entry
    // =====================================================

    const entry = {
      id: code || "",
      sNo: code || "",
      label: description,

      values: {
        "Disbursement_Amount": disbursementAmount,
        "Disbursement_Percentage":
          disbursementPercentage,
        "Outstanding_Amount":
          outstandingAmount,
        "Outstanding_Percentage":
          outstandingPercentage
      },

      rowNumber: i + 1,

      level: 0,

      isTotalRow: isTotalRow,
      isSectionHeader: false,
      isMainSection: false,

      children: []
    };

    // =====================================================
    // 11. SECTION 1
    //
    // 1.1
    // 1.2
    // 1.3
    //
    // All go under:
    //
    // 1 - Loans by Category
    // =====================================================

    if (isSection1Item) {

      // Create parent 1
      if (!section1Parent) {

        section1Parent = {
          id: "1",
          sNo: "1",
          label: "Loans by Category",

          values: {
            "Disbursement_Amount": "0.00",
            "Disbursement_Percentage": "0.00",
            "Outstanding_Amount": "0.00",
            "Outstanding_Percentage": "0.00"
          },

          rowNumber: dataTableStart,

          level: 0,

          isTotalRow: false,
          isSectionHeader: true,
          isMainSection: false,

          children: []
        };

        topLevelNodes.push(section1Parent);
      }

      entry.level = 1;

      section1Parent.children.push(entry);

      console.log(
        `Added ${code} under section 1`
      );

      continue;
    }

    // =====================================================
    // 12. SECTION 2 ITEMS
    //
    // 2.1
    // 2.2
    //
    // Both go under:
    //
    // 2 - Loans by Purpose
    // =====================================================

    if (isSection2Item) {

      // Create parent 2
      if (!section2Parent) {

        section2Parent = {
          id: "2",
          sNo: "2",
          label: "Loans by Purpose",

          values: {
            "Disbursement_Amount": "0.00",
            "Disbursement_Percentage": "0.00",
            "Outstanding_Amount": "0.00",
            "Outstanding_Percentage": "0.00"
          },

          rowNumber: i + 1,

          level: 0,

          isTotalRow: false,
          isSectionHeader: true,
          isMainSection: false,

          children: []
        };

        topLevelNodes.push(section2Parent);
      }

      // ---------------------------------------------------
      // IMPORTANT:
      //
      // This is now the current subsection.
      //
      // If code = 2.1:
      // currentSubsection = 2.1
      //
      // If code = 2.2:
      // currentSubsection = 2.2
      // ---------------------------------------------------

      currentSubsection = entry;

      entry.level = 1;

      section2Parent.children.push(entry);

      console.log(
        `Added ${code} under section 2`
      );

      continue;
    }

    // =====================================================
    // 13. TOTAL FOR SECTION 2
    //
    // Total(sum 2.1-2.2)
    //
    // MUST be:
    //
    // 2
    //   2.1
    //   2.2
    //   Total(sum 2.1-2.2)
    // =====================================================

    if (isSection2Total) {

      if (section2Parent) {

        entry.level = 1;

        section2Parent.children.push(entry);

        console.log(
          "Added TOTAL 2.1-2.2 under section 2"
        );

      } else {

        entry.level = 0;

        topLevelNodes.push(entry);
      }

      continue;
    }

    // =====================================================
    // 14. OTHER TOTALS
    //
    // Total for 2.1:
    //
    // 2
    //   2.1
    //      Total
    //
    // Total for 2.2:
    //
    // 2
    //   2.2
    //      Total
    // =====================================================

    if (isTotalRow) {

      // -----------------------------------------------
      // Total belongs to current 2.1 / 2.2
      // -----------------------------------------------
      if (currentSubsection) {

        entry.level = 2;

        currentSubsection.children.push(entry);

        console.log(
          `Added TOTAL under ${currentSubsection.sNo}`
        );
      }

      // -----------------------------------------------
      // Otherwise total belongs to section 1
      // -----------------------------------------------
      else if (section1Parent) {

        entry.level = 1;

        section1Parent.children.push(entry);

        console.log(
          "Added TOTAL under section 1"
        );
      }

      // -----------------------------------------------
      // Fallback
      // -----------------------------------------------
      else {

        entry.level = 0;

        topLevelNodes.push(entry);
      }

      continue;
    }

    // =====================================================
    // 15. OTHER DATA ROWS
    // =====================================================

    // If inside 2.1 or 2.2
    if (currentSubsection) {

      entry.level = 2;

      currentSubsection.children.push(entry);

      console.log(
        `Added ${code} under ${currentSubsection.sNo}`
      );

      continue;
    }

    // If inside section 1
    if (section1Parent) {

      entry.level = 1;

      section1Parent.children.push(entry);

      console.log(
        `Added ${code} under section 1`
      );

      continue;
    }

    // If inside section 2
    if (section2Parent) {

      entry.level = 1;

      section2Parent.children.push(entry);

      console.log(
        `Added ${code} under section 2`
      );

      continue;
    }

    // Fallback
    entry.level = 0;

    topLevelNodes.push(entry);
  }

  // =====================================================
  // 16. Sort children
  //
  // Totals always appear at the bottom of their
  // respective parent.
  // =====================================================

  const sortChildren = (nodes) => {

    nodes.sort((a, b) => {

      // Total always comes last
      if (a.isTotalRow && !b.isTotalRow) {
        return 1;
      }

      if (!a.isTotalRow && b.isTotalRow) {
        return -1;
      }

      // Sort by S.No
      if (a.sNo && b.sNo) {

        const aParts = a.sNo
          .split(".")
          .map(Number);

        const bParts = b.sNo
          .split(".")
          .map(Number);

        for (
          let i = 0;
          i < Math.min(
            aParts.length,
            bParts.length
          );
          i++
        ) {

          if (aParts[i] !== bParts[i]) {
            return aParts[i] - bParts[i];
          }
        }

        return (
          aParts.length -
          bParts.length
        );
      }

      return 0;
    });

    // Recursively sort children
    nodes.forEach((node) => {

      if (
        node.children &&
        node.children.length > 0
      ) {
        sortChildren(node.children);
      }

    });
  };

  sortChildren(topLevelNodes);

  // =====================================================
  // 17. Remove empty children arrays
  // =====================================================

  const cleanData = (nodes) => {

    nodes.forEach((node) => {

      if (
        node.children &&
        node.children.length === 0
      ) {

        delete node.children;

      } else if (node.children) {

        cleanData(node.children);
      }

    });
  };

  cleanData(topLevelNodes);

  // =====================================================
  // 18. Debug final hierarchy
  // =====================================================

  console.log(
    "Final top-level nodes:",
    topLevelNodes.length
  );

  console.log(
    "Top-level nodes:",
    topLevelNodes.map(
      (n) => `${n.sNo} - ${n.label}`
    )
  );

  console.log(
    "FINAL HIERARCHY:",
    JSON.stringify(
      topLevelNodes,
      null,
      2
    )
  );

  // =====================================================
  // 19. Return
  // =====================================================

  return {
    hierarchicalData: topLevelNodes,

    columns: [
      "Disbursement_Amount",
      "Disbursement_Percentage",
      "Outstanding_Amount",
      "Outstanding_Percentage"
    ],

    additionalColumns: [],

    noandtitles
  };
};

export default extractLoanPortfolioData;