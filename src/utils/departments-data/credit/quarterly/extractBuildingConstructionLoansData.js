import { excelDateToISO } from "../../../utils";

export const extractBuildingConstructionMetadata = (data) => {
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
    if (!row || row.length === 0) continue;

    const firstCell = String(row[0] || "").trim();
    const thirdCell = String(row[2] || "").trim();
    // Label merges differ slightly between templates (some merge the
    // label across A:B, some don't), so the value can land in B, C, D...
    // Scan forward from column B and take the first non-empty cell.
    const labelValue = (() => {
      for (let c = 1; c <= 5; c++) {
        const v = row[c];
        if (v !== undefined && v !== null && String(v).trim() !== "") {
          return String(v).trim();
        }
      }
      return "";
    })();

    // DEBUG: print exactly what's in each metadata-relevant row so you
    // can line it up against what the code below expects (row index,
    // Excel row number, full row contents, and which value it picked).


    if (i === 0 && firstCell) {
      metadata.ReturnKey = firstCell;

      if (firstCell.includes("BUIL_CONSTXW002") || firstCell.includes("XW002")) {
        metadata.reportType = "credit-quarterly_building-construction";
        metadata.reportTypeId = "credit-quarterly_building-construction";
        metadata.departmentId = "credit";
        metadata.departmentName = "Credit";
      }
    }

    if (i === 3 && firstCell) {
      metadata.reportTitle = firstCell.replace(/\s+/g, " ").trim();
    }

    if (
      i === 7 &&
      firstCell &&
      (firstCell.toLowerCase().includes("instiution") ||
        firstCell.toLowerCase().includes("institution"))
    ) {
      metadata.institutionCode = labelValue || "";
    }

    if (
      i === 8 &&
      firstCell &&
      firstCell.toLowerCase().includes("financial year")
    ) {
      metadata.financialYear = labelValue || "";
    }

    if (
      i === 9 &&
      firstCell &&
      firstCell.toLowerCase().includes("start date")
    ) {
      metadata.startDate = excelDateToISO(labelValue) || "";
    }

    if (
      i === 10 &&
      firstCell &&
      firstCell.toLowerCase().includes("end date")
    ) {
      metadata.endDate = excelDateToISO(labelValue) || "";
    }

    if (i === 12) {
      const unitCell = row.find(
        (c) => c && String(c).toLowerCase().includes("million")
      );
      if (unitCell) metadata.unit = String(unitCell).trim();
    }
  }
  return metadata;
};

// Columns (0-based): A S.No. (dot-coded, e.g. 1, 1.1, 1.2, 2, 2.1 ...) |
// B Name of Borrower | C Loan Type | D Outstanding Balance | E Loan Status |
// F Collateral Type | G Collateral Value | H Provision held
const extractBuildingConstructionLoansData = (data) => {
  let headerRowIdx = -1;
  let noandtitles = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = String(row[0] || "").trim();
    if (firstCell === "S.No.") {
      headerRowIdx = i;
      const secondCell = String(row[1] || "").trim();
      noandtitles = [firstCell, secondCell];
      break;
    }
  }

  console.log('[XW002] "S.No." header found at row index:', headerRowIdx,
    headerRowIdx === -1 ? '(NOT FOUND — check that A14 literally reads "S.No.")' : `(Excel row ${headerRowIdx + 1})`);

  if (headerRowIdx === -1) {
    return { hierarchicalData: [], columns: [], additionalColumns: [], noandtitles };
  }

  // Header spans 2 rows (main header, then Type/Value sub-header for Collateral)
  const dataTableStart = headerRowIdx + 2;
  console.log('[XW002] data rows expected to start at index:', dataTableStart, `(Excel row ${dataTableStart + 1})`);
  let loggedRows = 0;

  const getNum = (row, idx) => {
    if (idx < row.length) {
      const raw = row[idx];
      if (raw === undefined || raw === null || raw === "") return "0";
      // The parser reads cells with `raw:false`, which returns the cell's
      // *formatted display string*. Most data cells have no thousands
      // separator in their number format, so parseFloat works fine on
      // them — but rows like "Sub Total" are formatted with "#,##0.00",
      // so SheetJS hands back e.g. "7,646,621,934.00", and parseFloat()
      // stops at the first comma (giving 7 instead of 7646621934).
      // Strip commas before parsing so both cases work.
      const cleaned = String(raw).replace(/,/g, "").trim();
      const val = parseFloat(cleaned);
      if (!isNaN(val) && val !== 0) return val.toFixed(2);
    }
    return "0";
  };
  const getStr = (row, idx) => String((idx < row.length && row[idx]) || "").trim();

  const sanitizeCode = (code) => String(code).trim();

  const topLevelNodes = [];
  const nodeMap = new Map();
  const summaryRows = []; // trailing rows like "Sub Grand total", "Total construction loans", etc.
  let lastTopLevelCode = null; // tracks the current top-level group (e.g. "1", "2") for attaching subtotal rows

  // Loop 1: scan data rows, build nodeMap / summaryRows, and attach
  // blank-S.No. "Sub Total" style rows as trailing children of the
  // current top-level group instead of dropping them.
  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const codeRaw = row[0];
    const name = getStr(row, 1);
    const isBlankCode =
      codeRaw === undefined || codeRaw === "" || isNaN(parseFloat(codeRaw));

      if (!name && codeRaw.includes('.')) continue
    if (isBlankCode) {
      // Blank S.No. but a "Sub Total"/"Total" style label -> attach it as
      // a trailing child of the last top-level group instead of dropping it.
      if (/total/i.test(name) && lastTopLevelCode) {
        const values = {
          Loan_Type: getStr(row, 2),
          Outstanding_Balance: getNum(row, 3),
          Loan_Status: getStr(row, 4),
          Collateral_Type: getStr(row, 5),
          Collateral_Value: getNum(row, 6),
          Provision_Held: getNum(row, 7),
        };

        const subtotalEntry = {
          // The UI renders `id` as the S.No. column, so `id` must be
          // blank too (matching `sNo`) for the cell to show empty.
          // `_key` is a private, internal-only identifier — never
          // rendered — kept solely so this entry stays distinguishable
          // from others during processing if that's ever needed later.
          id: "",
          sNo: "",
          _key: `${lastTopLevelCode}.subtotal-${i}`,
          label: name,
          values,
          rowNumber: i + 1,
          level: 2,
          isTotalRow: true,
          isSectionHeader: false,
          isSubtotalRow: true,
          children: [],
        };

        const parent = nodeMap.get(lastTopLevelCode);
        if (parent) {
          parent.children.push(subtotalEntry);
        } else {
          topLevelNodes.push(subtotalEntry);
        }
      } else if (loggedRows < 30) {
        console.log(`[XW002] row[${i}] (Excel row ${i + 1}) skipped — no numeric S.No.:`, row);
        loggedRows++;
      }
      continue;
    }

    const code = sanitizeCode(codeRaw);
    const loanType = getStr(row, 2);
    const label = name;

    if (loggedRows < 30) {
      console.log(`[XW002] row[${i}] (Excel row ${i + 1}) included — code="${code}", name="${name}", loanType="${loanType}"`);
      loggedRows++;
    }

    const values = {
      Loan_Type: loanType,
      Outstanding_Balance: getNum(row, 3),
      Loan_Status: getStr(row, 4),
      Collateral_Type: getStr(row, 5),
      Collateral_Value: getNum(row, 6),
      Provision_Held: getNum(row, 7),
    };

    const isTotalRow = /total/i.test(label);
    const level = code.includes(".") ? code.split(".").length : 1;

    const entry = {
      id: code,
      sNo: code,
      label: name,
      values,
      rowNumber: i + 1,
      level,
      isTotalRow,
      isSectionHeader: !code.includes(".") && !isTotalRow,
      children: [],
    };

    // Rows like 3, 4, 5, 6, 7 near the bottom that are plain summary/total
    // lines (not children of 1 or 2) get kept as their own top-level nodes.
    if (isTotalRow && !code.includes(".")) {
      summaryRows.push(entry);
    } else {
      nodeMap.set(code, entry);
    }

    // Remember the current top-level group so a following blank-code
    // subtotal row knows which parent to attach to.
    lastTopLevelCode = code.split(".")[0];
  }

  // Loop 2: walk nodeMap and assemble topLevelNodes / parent-child links.
  for (const [code, node] of nodeMap) {
    const codeParts = code.split(".");
    if (codeParts.length === 1) {
      if (!topLevelNodes.find((n) => n.id === code)) topLevelNodes.push(node);
    } else {
      const parentCode = codeParts[0];
      const parent = nodeMap.get(parentCode);
      if (parent) {
        if (!parent.children.some((c) => c.id === node.id)) {
          parent.children.push(node);
        }
      } else {
        topLevelNodes.push(node);
      }
    }
  }

  topLevelNodes.push(...summaryRows);
  const compareSNo = (a, b) => {
    // Subtotal rows have a blank sNo (nothing to parse), so ordering
    // for them can't come from sNo at all — they're always forced to
    // the end of their sibling group via isSubtotalRow instead.
    if (a.isSubtotalRow && !b.isSubtotalRow) return 1;
    if (!a.isSubtotalRow && b.isSubtotalRow) return -1;
    if (a.isSubtotalRow && b.isSubtotalRow) return 0;

    // A segment that isn't a plain number is mapped to Infinity instead
    // of NaN, so it always sorts *after* every numbered sibling at that
    // level, rather than freezing whatever order entries happened to be
    // inserted in.
    const toParts = (sNo) =>
      String(sNo ?? "")
        .trim()
        .split(".")
        .map((part) => {
          const n = Number(part);
          return Number.isNaN(n) ? Infinity : n;
        });

    const aParts = toParts(a.sNo);
    const bParts = toParts(b.sNo);

    const maxLength = Math.max(aParts.length, bParts.length);

    for (let i = 0; i < maxLength; i++) {
      const aPart = aParts[i] ?? 0;
      const bPart = bParts[i] ?? 0;

      if (aPart !== bPart) {
        return aPart - bPart;
      }
    }

    return 0;
  };
  const sortChildren = (nodes) => {
    nodes.sort(compareSNo);

    nodes.forEach((n) => {
      if (n.children?.length) {
        sortChildren(n.children);
      }
    });
  };
  sortChildren(topLevelNodes);

  const cleanData = (nodes) => {
    nodes.forEach((n) => {
      if (n.children && n.children.length === 0) delete n.children;
      else if (n.children) cleanData(n.children);
    });
  };
  cleanData(topLevelNodes);

  const columnNames = [
    "Loan_Type",
    "Outstanding_Balance",
    "Loan_Status",
    "Collateral_Type",
    "Collateral_Value",
    "Provision_Held",
  ];

  return {
    hierarchicalData: topLevelNodes,
    columns: columnNames,
    additionalColumns: [],
    noandtitles,
  };
};

export default extractBuildingConstructionLoansData;