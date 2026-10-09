import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiRefreshCw } from "react-icons/fi";
import { submitAndCheckNbeReport } from "../utils/nbeSubmission";
import {
  getPendingNbeSubmissions,
  removePendingNbeSubmission,
  subscribePendingNbeSubmissions,
  updatePendingNbeSubmission,
} from "../utils/pendingNbeSubmissions";

const PendingSubmissionsPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [retryingIds, setRetryingIds] = useState([]);

  const refreshSubmissions = useCallback(() => {
    try {
      setSubmissions(getPendingNbeSubmissions());
      setLoadError("");
    } catch (error) {
      setLoadError(error.message);
    }
  }, []);

  useEffect(() => {
    refreshSubmissions();
    return subscribePendingNbeSubmissions(refreshSubmissions);
  }, [refreshSubmissions]);

  const retrySubmission = async (submission) => {
    setRetryingIds((ids) => [...ids, submission.id]);
    try {
      const result = await submitAndCheckNbeReport({
        endpoint: submission.endpoint,
        fileName: submission.retryStatusCheck
          ? submission.fileName
          : undefined,
      });

      if (result.isError) {
        updatePendingNbeSubmission(submission.id, {
          fileName: result.fileName,
          retryStatusCheck: false,
          lastError: result.status,
        });
        toast.error(result.status);
      } else {
        removePendingNbeSubmission(submission.id);
        toast.success("Report submission succeeded.");
      }
    } catch (error) {
      updatePendingNbeSubmission(submission.id, {
        fileName: error.fileName ?? submission.fileName,
        retryStatusCheck:
          error.retryStatusCheck ?? submission.retryStatusCheck,
        lastError: error.message,
      });
      toast.error(`Submission retry failed: ${error.message}`);
    } finally {
      setRetryingIds((ids) => ids.filter((id) => id !== submission.id));
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Submission retries
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Failed submissions stay here until their status check succeeds.
        </p>
      </div>

      {loadError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Could not load saved retries: {loadError}
        </div>
      )}

      {submissions.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
          No pending submission retries.
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => {
            const isRetrying = retryingIds.includes(submission.id);
            return (
              <article
                key={submission.id}
                className="rounded-lg border border-amber-200 bg-white p-5 shadow-sm"
              >
                <h2 className="font-semibold text-gray-900">
                  {submission.reportName || submission.reportId}
                </h2>
                {submission.fileName && (
                  <p className="mt-1 break-all text-sm text-gray-600">
                    File: {submission.fileName}
                  </p>
                )}
                <p className="mt-2 text-sm text-red-700">
                  {submission.lastError || "Submission needs to be retried."}
                </p>
                <button
                  type="button"
                  onClick={() => retrySubmission(submission)}
                  disabled={isRetrying}
                  className="mt-4 inline-flex items-center rounded-md bg-[#48198B] px-4 py-2 text-sm font-medium text-white hover:bg-[#37136a] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FiRefreshCw
                    className={`mr-2 h-4 w-4 ${isRetrying ? "animate-spin" : ""}`}
                  />
                  {isRetrying
                    ? "Retrying..."
                    : submission.retryStatusCheck
                      ? "Retry status check"
                      : "Retry submission"}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PendingSubmissionsPage;
