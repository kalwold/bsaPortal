export const ibdConfig = {
    id: "ibd",
    name: "IBD",
    periods: [
        {
            id: "daily",
            name: "Daily",
            reportTypes: [
                { key: "DAILY_FOREX", id: "ibd-daily_single-currency", name: "Daily Foreign Currency Exposure" },
            ],
        },
    ],
}