// SINGLE SOURCE OF TRUTH for departments, periods and reports.

import { creditConfig } from "./departments-data/credit/creditConfig";
import { digitalConfig } from "./departments-data/digital/digitalConfig";
import { financeConfig } from "./departments-data/finance/financeConfig";
import { ibdConfig } from "./departments-data/ibd/ibdConfig";
import { ifbConfig } from "./departments-data/ifb/ifbConfig";
import { shareConfig } from "./departments-data/share/shareConfig";
import { unidentifiedConfig } from "./departments-data/unidentified/unidentifiedConfig";
import { hrConfig } from "./departments-data/hr/hrConfig";

export const DEPARTMENTS = [ibdConfig, financeConfig, creditConfig, ifbConfig, shareConfig, digitalConfig, unidentifiedConfig,hrConfig];

export const ALL_REPORTS = DEPARTMENTS.flatMap((d) =>
    d.periods.flatMap((p) => p.reportTypes),
);


// Flat shape used by reportService: [{ id, name, reportTypes: [...] }]
export const DEPARTMENT_DATA = DEPARTMENTS.map((dept) => ({
    id: dept.id,
    name: dept.name,
    reportTypes: dept.periods.flatMap((p) => p.reportTypes),
}));

// Replaces reportTypes.js: REPORT_TYPES.EXPENSE_BREAKDOWN_QUARTERLY -> "finance-quarterly_breakdown-expenses"
export const REPORT_TYPES = Object.freeze(
    Object.fromEntries(
        ALL_REPORTS
            .filter((r) => r.key).map((r) => [r.key, r.id]),
    ),
);

export const getDepartment = (departmentId) =>
    DEPARTMENTS.find((d) => d.id === departmentId);

export const findReportType = (reportTypeId) => {
    for (const dept of DEPARTMENTS) {
        for (const period of dept.periods) {
            const report = period.reportTypes.find((r) => r.id === reportTypeId);
            if (report) return { department: dept, period, report };
        }
    }
    return null;
};

// ---------------------------------------------------------------------------
// Dev-only consistency check
// ---------------------------------------------------------------------------
if (process.env.NODE_ENV === "development") {
    const ids = new Set();
    const keys = new Set();

    ALL_REPORTS
        .forEach((r) => {
            if (ids.has(r.id)) {
                // A repeated id is only OK when it has no key (an intentional menu repeat)
                if (r.key) console.warn(`[departments] duplicate id "${r.id}"`);
                return;
            }
            ids.add(r.id);

            if (!r.key) {
                console.warn(`[departments] report "${r.id}" has no key`);
            } else if (keys.has(r.key)) {
                console.warn(`[departments] duplicate key "${r.key}"`);
            } else {
                keys.add(r.key);
            }
        });
}