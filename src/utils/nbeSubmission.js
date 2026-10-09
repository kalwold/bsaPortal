import { reportService } from "../services/reportService";

const getGatewayFilename = (response) => {
  const payload = response?.data ?? response;
  const responsePayload = payload?.responsePayload ?? payload;
  const filename = responsePayload?.filename ?? responsePayload?.fileName;

  if (
    typeof filename === "string" &&
    filename.trim() &&
    filename.trim().toLowerCase() !== "null"
  ) {
    return filename;
  }

  const gatewayError = Object.values(responsePayload ?? {})
    .flatMap((value) => (Array.isArray(value?.errors) ? value.errors : []))
    .map((error) => error.errorMessage)
    .find((message) => typeof message === "string" && message.trim());

  throw new Error(
    gatewayError || "The gateway response did not include a filename.",
  );
};

export const submitAndCheckNbeReport = async ({
  endpoint,
  fileName: existingFileName,
}) => {
  const fileName =
    existingFileName ||
    getGatewayFilename(await reportService.submitNbeReport(endpoint));
  let statusResponse;

  try {
    statusResponse = await reportService.getSubmissionStatus(fileName);
  } catch (error) {
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
