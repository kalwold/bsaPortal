import { buildMetadata, extractFlatReport } from "./reportHelpers";

/* ------------------------------------------------------------------ *
 *  List of Related Organizations  (A1 = "REL_ORG_LO001")
 *
 *  Layout: A Code | B Organization | C Shareholding in % | D Capital Invested
 *  Single header row, template ships with empty rows (no S.No printed),
 *  so the header depth is fixed and blank rows are dropped.
 *  Keys: Shareholding_in_Percent, Capital_Invested
 * ------------------------------------------------------------------ */

// TODO confirm department / frequency / id for the registry
const REPORT_TYPE_ID = "share-quarterly_related-organizations";

const HEADER = { anchorRe: /^(s\.?\s*no\.?|code)$/i, headerDepth: 1 };

export const extractRelatedOrganizationsMetadata = (data) =>
  buildMetadata(data, {
    codes: ["REL_ORG_LO001", "LO001"],
    reportTypeId: REPORT_TYPE_ID,
    departmentId: "share",
    departmentName: "Share",
    header: HEADER,
  });

const extractRelatedOrganizationsData = (data) =>
  extractFlatReport(data, { header: HEADER }); // all value columns numeric

export default extractRelatedOrganizationsData;
