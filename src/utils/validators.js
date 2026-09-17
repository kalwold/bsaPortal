export const validateExcelFormat = (data, template) => {
  const errors = [];

  if (!data || data.length === 0) {
    errors.push('Excel file is empty');
    return { isValid: false, errors };
  }

  // Check for required headers
  const requiredColumns = template?.requiredColumns || [];
  const dataColumns = Object.keys(data[0]);

  const missingColumns = requiredColumns.filter(
    col => !dataColumns.includes(col)
  );

  if (missingColumns.length > 0) {
    errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};