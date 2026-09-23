import { ALL_REPORTS } from "./departments";

const RULES = ALL_REPORTS.filter((r) => r.detect?.length);

export const detectReportType = (data) => {
  const firstCell = String(data?.[0]?.[0] ?? "").trim();
  if (!firstCell) return null;

  let best = null;
  for (const report of RULES) {
    for (const pattern of report.detect) {
      if (firstCell.includes(pattern) && (!best || pattern.length > best.length)) {
        best = { id: report.id, length: pattern.length };
      }
    }
       if (firstCell && (firstCell.includes('ANARN001') || firstCell.includes('RN001'))) {
      return REPORT_TYPES.QUARTERLY_AGGREGATE_RECATEGORIZED_LOANS;
    }
       if (firstCell && (firstCell.includes('WAADIR001'))) {
      return REPORT_TYPES.MONTHLY_WEIGHTED_AVG_DEPOSIT_RATES;
    }
       if (firstCell && (firstCell.includes('DPWADP001'))) {
      return REPORT_TYPES.MONTHLY_IFB_WEIGHTED_AVG_DEPOSIT_RATES;
    }
       if (firstCell && (firstCell.includes('LCMWAC001'))) {
      return REPORT_TYPES.MONTHLY_WEIGHTED_AVG_LENDING_RATES
    }
       if (firstCell && (firstCell.includes('IFBLCMWAL001'))) {
      return REPORT_TYPES.MONTHLY_IFB_WEIGHTED_AVG_LENDING_RATES
    }


  }
  return best ? best.id : null;
};