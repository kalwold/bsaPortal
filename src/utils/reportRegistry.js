import { branchOpsRegistry } from "./departments-data/branch-ops/branchOpsRegistry";
import { creditRegistry } from "./departments-data/credit/creditRegistry";
import { digitalRegistry } from "./departments-data/digital/digitalRegistry";
import { financeRegistry } from "./departments-data/finance/financeRegistry";
import { ifbRegistry } from "./departments-data/ifb/ifbRegistry";

// Loads every extractor module under departments-data/ (recursive)
const ctx = require.context("./departments-data", true, /extract.*\.js$/);

// keys look like "./finance/monthly/extractBalanceSheetData.js"
const modules = Object.fromEntries(ctx.keys().map((key) => [key, ctx(key)]));

// One line per report: type -> file path (relative to departments-data/, no .js)
const REPORT_FILES = {
    ...financeRegistry,
    ...creditRegistry,
    ...ifbRegistry,
    ...digitalRegistry,
    ...branchOpsRegistry
};

function pairExtractors(type, file) {
    const mod = modules[`./${file}.js`]; 
    if (!mod) throw new Error(`[${type}] no module found for "${file}"`);

    const extractData = mod.default;
    const metaKeys = Object.keys(mod).filter((k) => /metadata$/i.test(k));
    console.log("metaKeys", metaKeys , mod)
    if (typeof extractData !== "function") {
        throw new Error(`[${type}] "${file}" has no default export function`);
    }
    if (metaKeys.length !== 1) {
        throw new Error(
            `[${type}] "${file}" must have exactly one *Metadata export, found: ${metaKeys.join(", ") || "none"}`,
        );
    }
   
    return { extractData, extractMetadata: mod[metaKeys[0]] };
}

export const REPORT_EXTRACTORS = Object.fromEntries(
    Object.entries(REPORT_FILES).map(([type, file]) => [type, pairExtractors(type, file)]),
);

export function extractReport(reportType, jsonData) {
    console.log("report files", REPORT_FILES)
    const extractor = REPORT_EXTRACTORS[reportType];
    if (!extractor) throw new Error(`Unsupported report type: ${reportType}`);

    let result;
    try {
        result = extractor.extractData(jsonData);
    } catch (err) {
        throw new Error(
            `extractData failed for "${reportType}" (${extractor.extractData.name}): ${err.message}`,
            { cause: err },
        );
    }

    let metadata;
    try {
        metadata = extractor.extractMetadata(jsonData);
    } catch (err) {
        throw new Error(
            `extractMetadata failed for "${reportType}" (${extractor.extractMetadata.name}): ${err.message}`,
            { cause: err },
        );
    }

    const { hierarchicalData, columns, additionalColumns, noandtitles } = result;
    return { hierarchicalData, columns, additionalColumns, noandtitles, metadata };
}