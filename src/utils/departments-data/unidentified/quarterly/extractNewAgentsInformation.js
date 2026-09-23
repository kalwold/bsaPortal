import { buildMetadata, extractFlatReport } from "./reportHelpers";

/* ------------------------------------------------------------------ *
 *  BSD Quarterly New Agents Information Report  (A1 = "AG_INFO_NA001")
 *
 *  Two header rows (rows 14-15):
 *    A S.No | B Name of Agent |
 *    C..I Agent Address -> Region, Town, Woreda, Kebele, Land Mark, P.O.Box, Telephone
 *    J Commercial activity the agent is engaged |
 *    K..L Banking -> Services, Limits |
 *    M Date of commencement | N Working Hours | O Responsible Branch
 *
 *  Keys e.g. Agent_Address_Region, Banking_Services, Banking_Limits,
 *  Date_of_commencement. Mostly text; Limits is numeric, commencement a date.
 * ------------------------------------------------------------------ */

const REPORT_TYPE_ID = "unidentified-digital-quarterly_new-agents";

const HEADER = { headerDepth: 2 };

export const extractNewAgentsInformationMetadata = (data) =>
  buildMetadata(data, {
    codes: ["AG_INFO_NA001", "NA001"],
    reportTypeId: REPORT_TYPE_ID,
    departmentId: "unidentified",
    departmentName: "Unidentified",
    header: HEADER,
  });

const typeOf = (key) => {
  if (key === "Banking_Limits") return "number";
  if (key === "Date_of_commencement") return "date";
  return "text";
};

const extractNewAgentsInformationData = (data) =>
  extractFlatReport(data, { header: HEADER, typeOf });

export default extractNewAgentsInformationData;
