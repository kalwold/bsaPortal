
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

// export const excelDateToISO = (value) => {
//   if (value === null || value === undefined || value === "") {
//     return "";
//   }

//   const str = String(value).trim();

//   // Already full ISO datetime → return as is
//   if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/.test(str)) {
//     return str;
//   }

//   // Date-only string (YYYY-MM-DD) → normalize to full ISO
//   if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
//     const date = new Date(`${str}T00:00:00.000Z`);
//     return isNaN(date.getTime()) ? "" : date.toISOString();
//   }

//   // Excel serial date
//   if (typeof value === "number" || /^\d+(\.\d+)?$/.test(str)) {
//     const numericValue = Number(value);

//     if (numericValue < 1000) {
//       return str;
//     }

//     const msPerDay = 24 * 60 * 60 * 1000;
//     const excelEpochUTC = Date.UTC(1899, 11, 30);
//     const date = new Date(excelEpochUTC + numericValue * msPerDay);

//     if (isNaN(date.getTime())) {
//       return "";
//     }

//     return date.toISOString();
//   }

//   // Non-date string → return as is
//   return str;
// };



export const excelDateToISO = (value) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const str = String(value).trim();

  // Already full ISO datetime → return as is
  if (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/.test(
      str
    )
  ) {
    return str;
  }

  // Date-only string (YYYY-MM-DD) → normalize to full ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const date = new Date(`${str}T00:00:00.000Z`);
    return isNaN(date.getTime()) ? "" : date.toISOString();
  }

  // US-style date strings:
  // 9/30/26
  // 09/30/26
  // 9/30/2026
  // 09/30/2026
  const slashDateMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);

  if (slashDateMatch) {
    let [, month, day, year] = slashDateMatch;

    month = Number(month);
    day = Number(day);
    year = Number(year);

    // Convert 2-digit year to 20xx
    if (year < 100) {
      year += 2000;
    }

    // Validate date components
    if (
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31
    ) {
      return "";
    }

    const date = new Date(
      Date.UTC(year, month - 1, day, 0, 0, 0, 0)
    );

    // Make sure JavaScript didn't normalize an invalid date
    if (
      isNaN(date.getTime()) ||
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      return "";
    }

    return date.toISOString();
  }

  // Excel serial date
  if (typeof value === "number" || /^\d+(\.\d+)?$/.test(str)) {
    const numericValue = Number(value);

    // Don't treat small numbers as Excel dates
    if (numericValue < 1000) {
      return str;
    }

    const msPerDay = 24 * 60 * 60 * 1000;
    const excelEpochUTC = Date.UTC(1899, 11, 30);

    const date = new Date(
      excelEpochUTC + numericValue * msPerDay
    );

    if (isNaN(date.getTime())) {
      return "";
    }

    return date.toISOString();
  }

  // Non-date string → return as is
  return str;
};
