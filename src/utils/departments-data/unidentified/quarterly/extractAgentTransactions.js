import { buildMetadata, extractFlatReport } from "./reportHelpers";

/* ------------------------------------------------------------------ *
 *  Quarterly Agent Transaction by Type and Amount  (A1 = "AGT_TRA&AMT_QA001")
 *
 *  Layout: A S.No | B Type of Transactions | C Number of Transactions |
 *          D Amount of Transactions in Birr
 *  Rows 1-11 are fixed transaction types, followed by "Total (Sum 1-11)".
 *  Keys: Number_of_Transactions, Amount_of_Transactions_in_Birr
 * ------------------------------------------------------------------ */

const REPORT_TYPE_ID = "unidentified-digital-quarterly_agent-transactions";

const HEADER = { headerDepth: 1 };

export const extractAgentTransactionsMetadata = (data) =>
  buildMetadata(data, {
    codes: ["AGT_TRA&AMT_QA001", "QA001"],
    reportTypeId: REPORT_TYPE_ID,
    departmentId: "unidentified",
    departmentName: "Unidentified",
    header: HEADER,
  });

const extractAgentTransactionsData = (data) =>
  extractFlatReport(data, { header: HEADER }); // all value columns numeric

export default extractAgentTransactionsData;
