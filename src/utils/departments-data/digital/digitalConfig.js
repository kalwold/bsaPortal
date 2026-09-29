export const digitalConfig = {
  id: "digital-banking",
  name: "Digital Banking",
  periods: [
    {
      id: "quarterly",
      name: "Quarterly",
      reportTypes: [
        {
          key: "QUARTERLY_ATM_POS",
          id: "digital-quarterly_atm-pos",
          name: "BSD Quarterly ATM and POS",
          detect: ["MOB_TRA_QM001", "QM001"],
        },
        {
          key: "QUARTERLY_MOBILE_TRANSACTIONS",
          id: "digital-quarterly_mobile-transaction",
          name: "Quarterly Mobile Transactions Report",
          detect: ["QUA_ATM_POS_QP001", "QP001"],
        },
        {
          key: "ACCESS_POINT_USER",
          id: "digital-quarterly_access-point-user",
          name: "Access Point",
          detect: ["POIACC001"],},

             {
          key: "QUARTERLY_DFS_ACCOUNTS_SUBSCRIPTIONS",
          id: "digital-quarterly_dfs-accounts-subscriptions",
          name: "FIDD DFS Accounts & Subscriptions",
          detect: ["FIDDDFS001"],
        },
        
      ],
    },
  ],
};
