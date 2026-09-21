import {
  buildColumns,
  buildMetadata,
  getStr,
  isDataRow,
  isNumericSNo,
  locateHeader,
  readValues,
  SNO_RE,
  TOTAL_RE,
} from "./reportHelpers";

/* ------------------------------------------------------------------ *
 *  Quarterly Loans to Insiders Report  (A1 = "INS_LOAN_QR002")
 *
 *  Two header rows (rows 14-15):
 *    A S.No | B Name of Borrower | C Facility Type | D Outstanding Balance |
 *    E..F Security -> Value, Type | G Loan Status
 *  (Column I holds the status pick-list used by the template; it is outside
 *   the table and ignored.)
 *
 *  Structure:
 *    1  Loans to Directors              -> section header (level 1)
 *       1.1 ... 1.40                    -> borrower rows  (level 2)
 *       Sub total (Total Loans to BoDs) -> total row
 *    2  Loans to mid-level mgmt & above -> section header, 2.1 ... 2.250, Sub total
 *    3  Loans to other staffs           -> single data row (level 1)
 *    4  No. of staff                    -> single data row (level 1)
 *    5  Sub total / Grand Total         -> total rows
 *
 *  The S.No values are floats in the file (1.1 and 1.10 are both stored as
 *  1.1, and 2.2 as 2.2000000000000002), so borrower ids are regenerated from
 *  the section number + row position (1.1 ... 1.40) and are always unique.
 *  Empty template rows are dropped.
 * ------------------------------------------------------------------ */

const REPORT_TYPE_ID = "unidentified-credit-quarterly_loans-to-insiders";

const HEADER = { anchorRe: SNO_RE, headerDepth: 2 };

export const extractLoansToInsidersMetadata = (data) =>
  buildMetadata(data, {
    codes: ["INS_LOAN_QR002", "QR002"],
    reportTypeId: REPORT_TYPE_ID,
    departmentId: "unidentified",
    departmentName: "Unidentified",
    header: HEADER,
  });

const TEXT_KEYS = new Set(["Facility_Type", "Security_Type", "Loan_Status"]);
const typeOf = (key) => (TEXT_KEYS.has(key) ? "text" : "number");

const isChildSNo = (v) => isNumericSNo(v) && !Number.isInteger(parseFloat(v));

const extractLoansToInsidersData = (data) => {
  const { headerRowIdx, dataTableStart } = locateHeader(data, HEADER);

  if (headerRowIdx === -1) {
    return { hierarchicalData: [], columns: [], additionalColumns: [], noandtitles: [] };
  }

  const noandtitles = [getStr(data[headerRowIdx], 0), getStr(data[headerRowIdx], 1)];
  const cols = buildColumns(data, headerRowIdx, dataTableStart);
  const entries = [];

  let section = null; // { id } of the open section header
  let childCount = 0;

  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    if (!isDataRow(row)) continue; // notes / blank rows

    const sNoRaw = row[0];
    const label = getStr(row, 1).replace(/\s+/g, " ");
    const values = readValues(row, cols, typeOf);
    const hasContent = !!label || cols.some((c) => getStr(row, c.index) !== "");

    // ---- total rows: "Sub total ...", "Grand Total"
    if (TOTAL_RE.test(label)) {
      entries.push({
        id: isNumericSNo(sNoRaw) ? String(sNoRaw).trim() : "",
        sNo: isNumericSNo(sNoRaw) ? String(sNoRaw).trim() : "",
        label,
        values,
        rowNumber: i + 1,
        level: 1,
        isTotalRow: true,
        isSectionHeader: false,
      });
      section = null;
      continue;
    }

    // ---- borrower rows: 1.1, 1.2 ... (level 2)
    if (isChildSNo(sNoRaw)) {
      childCount++; // count every template row so ids follow the sheet position
      if (!hasContent) continue; // unfilled template row
      const sNo = section ? `${section.id}.${childCount}` : String(sNoRaw).trim();
      entries.push({
        id: sNo,
        sNo,
        label,
        values,
        rowNumber: i + 1,
        level: 2,
        parentId: section ? section.id : "",
        isTotalRow: false,
        isSectionHeader: false,
      });
      continue;
    }

    // ---- top-level rows: 1, 2 (sections) / 3, 4 (single data rows)
    if (isNumericSNo(sNoRaw)) {
      const id = String(sNoRaw).trim();
      const next = data[i + 1];
      const isSectionHeader = !!next && isChildSNo(next[0]);
      if (isSectionHeader) {
        section = { id };
        childCount = 0;
      }
      entries.push({
        id,
        sNo: id,
        label,
        values,
        rowNumber: i + 1,
        level: 1,
        isTotalRow: false,
        isSectionHeader,
      });
    }
  }

  return {
    hierarchicalData: entries,
    columns: cols.map((c) => c.key),
    additionalColumns: [],
    noandtitles,
  };
};

export default extractLoansToInsidersData;
