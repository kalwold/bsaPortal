const STORAGE_KEY = "pending-nbe-submissions";
const CHANGE_EVENT = "pending-nbe-submissions-changed";

const notifyChanged = () => {
  window.dispatchEvent(new Event(CHANGE_EVENT));
};

export const getPendingNbeSubmissions = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  const submissions = JSON.parse(stored);
  if (!Array.isArray(submissions)) {
    throw new Error("Saved submission retries have an invalid format.");
  }
  return submissions;
};

export const savePendingNbeSubmission = (submission) => {
  const submissions = getPendingNbeSubmissions();
  const nextSubmissions = [
    ...submissions.filter((item) => item.id !== submission.id),
    submission,
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSubmissions));
  notifyChanged();
};

export const updatePendingNbeSubmission = (id, changes) => {
  const submissions = getPendingNbeSubmissions();
  const nextSubmissions = submissions.map((item) =>
    item.id === id ? { ...item, ...changes } : item,
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSubmissions));
  notifyChanged();
};

export const removePendingNbeSubmission = (id) => {
  const submissions = getPendingNbeSubmissions();
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(submissions.filter((item) => item.id !== id)),
  );
  notifyChanged();
};

export const subscribePendingNbeSubmissions = (callback) => {
  const handleLocalChange = () => callback();
  const handleStorageChange = (event) => {
    if (event.key === STORAGE_KEY) callback();
  };

  window.addEventListener(CHANGE_EVENT, handleLocalChange);
  window.addEventListener("storage", handleStorageChange);

  return () => {
    window.removeEventListener(CHANGE_EVENT, handleLocalChange);
    window.removeEventListener("storage", handleStorageChange);
  };
};
