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
  }
  return best ? best.id : null;
};