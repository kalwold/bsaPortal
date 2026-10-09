import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiRefreshCw, FiSearch, FiTrash2 } from "react-icons/fi";
import {
  checkNbeSubmissionStatus,
  triggerNbeSubmission,
} from "../utils/nbeSubmission";
import {
  getPendingNbeSubmissions,
  removePendingNbeSubmission,
  subscribePendingNbeSubmissions,
  updatePendingNbeSubmission,
} from "../utils/pendingNbeSubmissions";

const PendingSubmissionsPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [busyActions, setBusyActions] = useState({});

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
    setBusyActions((actions) => ({ ...actions, [submission.id]: "submit" }));
    try {
      const result = await triggerNbeSubmission(submission.endpoint);
      if (result.isDuplicate) {
        updatePendingNbeSubmission(submission.id, {
          submissionState: "duplicate",
          lastStatus: result.status,
          lastError: "",
        });
        toast.success(result.status);
      } else {
        updatePendingNbeSubmission(submission.id, {
          fileName: result.fileName,
          submissionState: "awaiting-status",
          lastStatus: result.status,
          lastError: "",
        });
        toast.success("Submission sent. Check its status separately.");
      }
    } catch (error) {
      updatePendingNbeSubmission(submission.id, {
        submissionState: "submission-error",
        lastError: error.message,
      });
      toast.error(`Submission retry failed: ${error.message}`);
    } finally {
      setBusyActions((actions) => {
        return Object.fromEntries(
          Object.entries(actions).filter(([id]) => id !== submission.id),
        );
      });
    }
  };

  const checkSubmissionStatus = async (submission) => {
    setBusyActions((actions) => ({ ...actions, [submission.id]: "status" }));
    try {
      const result = await checkNbeSubmissionStatus(submission.fileName);
      if (result.isError) {
        updatePendingNbeSubmission(submission.id, {
          submissionState: "status-failed",
          lastStatus: result.status,
          lastError: result.status,
        });
        toast.error(result.status);
      } else {
        updatePendingNbeSubmission(submission.id, {
          submissionState: "status-checked",
          lastStatus: result.status,
          lastError: "",
          statusCheckedAt: new Date().toISOString(),
        });
        toast.success(result.status);
      }
    } catch (error) {
      updatePendingNbeSubmission(submission.id, {
        submissionState: "status-error",
        lastError: error.message,
      });
      toast.error(`Status check failed: ${error.message}`);
    } finally {
      setBusyActions((actions) => {
        return Object.fromEntries(
          Object.entries(actions).filter(([id]) => id !== submission.id),
        );
      });
    }
  };

  const deleteSavedSubmission = (submission) => {
    removePendingNbeSubmission(submission.id);
    toast.success("Saved submission removed.");
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">NBE submissions</h1>
        <p className="mt-1 text-sm text-gray-500">
          Approved reports remain here so you can check their NBE status again.
        </p>
      </div>

      {loadError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Could not load saved submissions: {loadError}
        </div>
      )}

      {submissions.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
          No saved NBE submissions.
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => {
            const busyAction = busyActions[submission.id];
            const canRetrySubmission =
              !submission.fileName ||
              submission.submissionState === "submission-error";
            const hasError = [
              "submission-error",
              "status-failed",
              "status-error",
            ].includes(submission.submissionState);
            return (
              <article
                key={submission.id}
                className="rounded-lg border border-amber-200 bg-white p-5 shadow-sm"
              >
                <h2 className="font-semibold text-gray-900">
                  {submission.reportName || submission.reportId}
                </h2>
                <div className="mt-2 space-y-1 text-sm">
                  <p className="break-all text-gray-600">
                    <span className="font-medium">Filename: </span>
                    {submission.fileName || "Not returned by NBE"}
                  </p>
                  <p className={hasError ? "text-red-700" : "text-gray-700"}>
                    <span className="font-medium">Status: </span>
                    {submission.lastError ||
                      submission.lastStatus ||
                      (submission.fileName
                        ? "Submission sent. Status check required."
                        : "Submission needs to be retried.")}
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {canRetrySubmission && (
                    <button
                      type="button"
                      onClick={() => retrySubmission(submission)}
                      disabled={Boolean(busyAction)}
                      className="inline-flex items-center rounded-md bg-[#48198B] px-4 py-2 text-sm font-medium text-white hover:bg-[#37136a] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FiRefreshCw
                        className={`mr-2 h-4 w-4 ${busyAction === "submit" ? "animate-spin" : ""}`}
                      />
                      {busyAction === "submit"
                        ? "Submitting..."
                        : "Retry submission"}
                    </button>
                  )}
                  {submission.fileName && (
                    <button
                      type="button"
                      onClick={() => checkSubmissionStatus(submission)}
                      disabled={Boolean(busyAction)}
                      className="inline-flex items-center rounded-md border border-[#48198B] px-4 py-2 text-sm font-medium text-[#48198B] hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FiSearch
                        className={`mr-2 h-4 w-4 ${busyAction === "status" ? "animate-spin" : ""}`}
                      />
                      {busyAction === "status"
                        ? "Checking status..."
                        : "Check status"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteSavedSubmission(submission)}
                    disabled={Boolean(busyAction)}
                    className="inline-flex items-center rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FiTrash2 className="mr-2 h-4 w-4" />
                    Delete saved submission
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PendingSubmissionsPage;
