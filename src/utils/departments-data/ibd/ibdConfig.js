export const ibdConfig = {
  id: "ibd",
  name: "IBD",
  periods: [
    {
      id: "daily",
      name: "Daily",
      reportTypes: [
        {
          key: "DAILY_FOREX",
          id: "ibd-daily_single-currency",
          name: "Daily Foreign Currency Exposure",
          detect: ["SINGLE CURRENCY"],
        },
      ],
    },
    {
      id: "weekly",
      name: "Weekly",
      reportTypes: [
        {
          key: "WEEKLY_FOREIGN_CURRENCY_LIQUIDITY",
          id: "ibd-weekly_foreign-currency-liquidity",
          name: "Weekly Foreign Currency Liquidity",
          detect: ["WFWFCL001"],
        },
      ],
    },
  ],
};
