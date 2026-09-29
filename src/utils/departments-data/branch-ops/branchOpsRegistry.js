import { REPORT_TYPES } from "../../departments";

export const branchOpsRegistry = {
  [REPORT_TYPES.SUMMARY_FRAUD_OUTSTANDING]:
    "branch-ops/quarterly/extractFraudOutstandingData",
  [REPORT_TYPES.ACCESS_POINT_USER]:
    "branch-ops/quarterly/extractAccessPointUserData",
};
