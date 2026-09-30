import { REPORT_TYPES } from "../../departments";

export const ibdRegistry = {
  [REPORT_TYPES.WEEKLY_FOREIGN_CURRENCY_LIQUIDITY]:
    "ibd/weekly/extractForeignCurrencyLiquidity",
  [REPORT_TYPES.WEEKLY_FOREIGN_CURRENCY_RESERVE]:
    "ibd/weekly/extractForeignCurrencyReserve",
  [REPORT_TYPES.DAILY_FOREX]: "ibd/daily/extractForexData",
};
