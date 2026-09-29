export const validateReportStructure = (parsedData) => {
  const errors = [];

  console.log("parsed meta data ",parsedData.metadata)
  if (!parsedData.metadata.institutionCode) {
    errors.push("Institution Code is missing");
  }
  if (!parsedData.metadata.financialYear) {
    errors.push("Financial Year is missing");
  }
  if (!parsedData.metadata.startDate) {
    errors.push("Start Date is missing");
  }
  if (!parsedData.metadata.endDate) {
    errors.push("End Date is missing");
  }
  if (!parsedData.metadata.reportTitle) {
    errors.push("Report Title is missing");
  }

  if (!parsedData.data || parsedData.data.length === 0) {
    errors.push("No data found in the report");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};