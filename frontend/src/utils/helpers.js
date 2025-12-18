// This file can contain helper functions like date formatting, etc.
// Example:
export const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString('en-GB');
};