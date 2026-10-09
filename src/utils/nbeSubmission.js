import { reportService } from "../services/reportService";

const isSubmissionFilename = (value) =>
  typeof value === "string" &&
  value.trim() &&
  value.trim().toLowerCase() !== "null" &&
  !/^https?:\/\//i.test(value.trim());

const createMissingFilenameError = () => {
  const error = new Error("No filename returned by NBE.");
  error.fileName = "";
  error.retryStatusCheck = false;
  return error;
};

const getGatewayFilename = (response) => {
  const payload = response?.data ?? response;
  const responsePayload = payload?.responsePayload ?? payload;
  const filename = responsePayload?.filename ?? responsePayload?.fileName;

  if (!isSubmissionFilename(filename)) throw createMissingFilenameError();
  return filename.trim();
};

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
  const validationErrors = getGatewayValidationErrors(payload);
  const duplicateError = validationErrors.find((message) =>
    /duplicat/i.test(message),
  );

  if (!duplicateError) return null;

  const requestPayload = payload?.requestPayload ?? {};
  return {
    fileName: "",
    status: "File is already submitted",
    isError: false,
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

export const submitAndCheckNbeReport = async ({
  endpoint,
  fileName: existingFileName,
}) => {
  if (existingFileName && !isSubmissionFilename(existingFileName)) {
    throw createMissingFilenameError();
  }

  let fileName = existingFileName?.trim();

  if (!fileName) {
    if (!endpoint) {
      throw new Error("No NBE submission endpoint is configured for this report.");
    }

    let gatewayResponse;
    try {
      gatewayResponse = await reportService.submitNbeReport(endpoint);
      console.log("NBE gateway response:", gatewayResponse);
    } catch (error) {
      const duplicateResult = getDuplicateSubmissionResult(
        error.response?.data,
      );
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

    fileName = getGatewayFilename(gatewayResponse);
  }

  let statusResponse;

  console.log(`Checking submission status for file: ${fileName}`);

  try {
    statusResponse = await reportService.getSubmissionStatus(fileName);
  } catch (error) {
    console.error("Submission status request failed:", {
      fileName,
      status: error.response?.status,
      response: error.response?.data,
      message: error.message,
    });
    const statusError = new Error(error.message);
    statusError.fileName = fileName;
    statusError.retryStatusCheck = true;
    throw statusError;
  }

  const statusPayload = statusResponse?.data ?? statusResponse;
  const status = statusPayload?.status ?? statusPayload?.responsePayload?.status;
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
};
