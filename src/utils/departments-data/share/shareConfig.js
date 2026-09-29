export const shareConfig = {
    id: "share",
    name: "Share",
    periods: [
        {
            id: "quarterly",
            name: "Quarterly",
            reportTypes: [
                { key: "QUARTERLY_TOP20_SHAREHOLDERS", id: "share-quarterly_top-two-shareholders", name: "Top Twenty (20) Shareholding Structure Report", detect: ["TWE_SHA_STR_TH001", "TH001"] },
                { key: "QUARTERLY_TWO_PERCENT_SHAREHOLDERS", id: "share-quarterly_two-percent-shareholdings", name: "Two Percent (2%) and above Shareholdings of the Banks Total Share Capital Report", detect: ["SHR_GTR_2_TS001", "TS001"] },
            ],
        },
    ],
}