import { REPORT_TYPES } from "../../departments";

export const branchOpsRegistry = {
  [REPORT_TYPES.SUMMARY_FRAUD_OUTSTANDING]:
    "branch-ops/quarterly/extractFraudOutstandingData",
  [REPORT_TYPES.DEPOSIT_BENEFICIARIES]:
    "branch-ops/quarterly/extractDepositBeneficiariesData",
  [REPORT_TYPES.INSURED_DEPOSITOR_IFB]:
    "branch-ops/quarterly/extractInsuredDepositorIfbData",
  [REPORT_TYPES.INSTITUTIONAL_INSURED_DEPOSITORS]:
    "branch-ops/quarterly/extractInstitutionalInsuredDepositorsData",
  [REPORT_TYPES.INSURED_DEPOSITOR_CON]:
    "branch-ops/quarterly/extractInsuredDepositorConvantionalData",
};
