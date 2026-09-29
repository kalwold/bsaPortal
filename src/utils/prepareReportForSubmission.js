export const prepareReportForSubmission = (parsedData) => {
  return {
    id: parsedData.id,
    departmentId: parsedData.departmentId,
    departmentName: parsedData.departmentName,
    reportTypeId: parsedData.reportTypeId,
    reportTypeName: parsedData.reportTypeName,
    ReturnKey: parsedData.ReturnKey,
    fileName: parsedData.fileName,
    status: parsedData.status || "PENDING",
    createdAt: parsedData.createdAt || new Date().toISOString(),
    createdBy: parsedData.createdBy || "current-user",
    metadata: parsedData.metadata,
    columns: parsedData.columns,
    noandtitles: parsedData.noandtitles,
    additionalColumns: parsedData.additionalColumns,
    data: parsedData.data,
    //flatData: parsedData.flatData || flattenData(parsedData.data),
    validations: parsedData.validations || [],
    isValid: parsedData.isValid !== undefined ? parsedData.isValid : true,
  };
};