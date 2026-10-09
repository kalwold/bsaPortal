import { reportService } from "../services/reportService";

const isSubmissionFilename = (value) =>
  typeof value === "string" &&
  value.trim() &&
  value.trim().toLowerCase() !== "null" &&
  !/^https?:\/\//i.test(value.trim());

const getGatewayValidationErrors = (response) => {
  const payload = response?.data ?? response;
  const responsePayload = payload?.responsePayload;
  if (!responsePayload || typeof responsePayload !== "object") return [];

  return Object.values(responsePayload)
    .flatMap((value) => (Array.isArray(value?.errors) ? value.errors : []))
    .map((error) => error?.errorMessage)
    .filter((message) => typeof message === "string" && message.trim());
};

const getDuplicateSubmissionResult = (response) => {
  const payload = response?.data ?? response;
  const duplicateError = getGatewayValidationErrors(payload).find((message) =>
    /duplicat/i.test(message),
  );

  if (!duplicateError) return null;

  const requestPayload = payload?.requestPayload ?? {};
  return {
    fileName: "",
    status: "File is already submitted",
    isDuplicate: true,
    submissionData: {
      returnKey: requestPayload.ReturnKey,
      institutionCode: requestPayload.InstCode,
      financialYear: requestPayload.FinYear,
      startDate: requestPayload.StartDate,
      endDate: requestPayload.EndDate,
      returnItemCount: Array.isArray(requestPayload.ReturnItemsList)
        ? requestPayload.ReturnItemsList.length
        : undefined,
    },
  };
};

const getGatewayFilename = (response) => {
  const payload = response?.data ?? response;
  const responsePayload = payload?.responsePayload ?? payload;
  const filename = responsePayload?.filename ?? responsePayload?.fileName;

  if (!isSubmissionFilename(filename)) {
    throw new Error("No filename returned by NBE.");
  }

  return filename.trim();
};

export const triggerNbeSubmission = async (endpoint) => {
  if (!endpoint) {
    throw new Error("No NBE submission endpoint is configured for this report.");
  }

  let gatewayResponse;
  try {
    gatewayResponse = await reportService.submitNbeReport(endpoint);
    console.log("NBE gateway response:", gatewayResponse);
  } catch (error) {
    const duplicateResult = getDuplicateSubmissionResult(error.response?.data);
    if (duplicateResult) return duplicateResult;

    console.error("NBE gateway request failed:", {
      endpoint,
      status: error.response?.status,
      response: error.response?.data,
      message: error.message,
    });
    throw error;
  }

  const duplicateResult = getDuplicateSubmissionResult(gatewayResponse);
  if (duplicateResult) return duplicateResult;

  const validationErrors = getGatewayValidationErrors(gatewayResponse);
  if (validationErrors.length) {
    throw new Error(validationErrors.join("; "));
  }

  return {
    fileName: getGatewayFilename(gatewayResponse),
    status: "Submission request sent. Check status separately.",
  };
};

export const checkNbeSubmissionStatus = async (fileName) => {
  if (!isSubmissionFilename(fileName)) {
    throw new Error("A valid NBE filename is required to check submission status.");
  }

  try {
    const response = await reportService.getSubmissionStatus(fileName);
    const payload = response?.data ?? response;
    const status = payload?.status ?? payload?.responsePayload?.status;
    const statusText =
      typeof status === "string" || typeof status === "number"
        ? String(status)
        : "No status returned";

    return {
      fileName,
      status: statusText,
      isError:
        statusText === "No status returned" ||
        /does not exist(?:s)?|not found|failed|error|rejected/i.test(statusText),
    };
  } catch (error) {
    console.error("Submission status request failed:", {
      fileName,
      status: error.response?.status,
      response: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};
