export const hrConfig = {
  id: "hr",
  name: "HR",
  periods: [
    {
      id: "quarterly",
      name: "Quarterly",
      reportTypes: [
        {
          key: "HR_QUARTERLY_MANPOWER",
          id: "hr-quarterly_manpower-structure",
          name: "HR manpower structure",
          detect: ["mp_","021mp003"],
        },
      ],
    },]
  }