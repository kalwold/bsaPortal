
// export const excelDateToISO = (value) => {
//   if (!value) return "";

//   const str = String(value).trim();

//   // Already ISO format → return as it is
//   if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(str)) {
//     return str;
//   }

//   // Excel serial date
//   const date = new Date(Date.UTC(1899, 11, 30));
//   date.setUTCDate(date.getUTCDate() + Number(value));

//   return date.toISOString().slice(0, 19);
// };

export const excelDateToISO = (value) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const str = String(value).trim();

  // Already full ISO datetime → return as is
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/.test(str)) {
    return str;
  }

  // Date-only string (YYYY-MM-DD) → normalize to full ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const date = new Date(`${str}T00:00:00.000Z`);
    return isNaN(date.getTime()) ? "" : date.toISOString();
  }

  // Excel serial date
  if (typeof value === "number" || /^\d+(\.\d+)?$/.test(str)) {
    const numericValue = Number(value);

    if (numericValue < 1000) {
      return str;
    }

    const msPerDay = 24 * 60 * 60 * 1000;
    const excelEpochUTC = Date.UTC(1899, 11, 30);
    const date = new Date(excelEpochUTC + numericValue * msPerDay);

    if (isNaN(date.getTime())) {
      return "";
    }

    return date.toISOString();
  }

  // Non-date string → return as is
  return str;
};