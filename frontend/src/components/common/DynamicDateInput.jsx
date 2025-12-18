import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';

const getDaysInMonth = (month, year) => {
  return new Date(year, month, 0).getDate();
};

const DynamicDateInput = ({
  label,
  name,
  value,
  onChange,
  required,
  min,
  max,
  icon,
  className = "",
}) => {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  // Parse initial value
  useEffect(() => {
    if (value) {
      if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [y, m, d] = value.split("-").map(Number);
        setYear(y);
        setMonth(m);
        setDay(d);
      } else {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          setDay(date.getDate());
          setMonth(date.getMonth() + 1);
          setYear(date.getFullYear());
        }
      }
    } else {
        setDay("");
        setMonth("");
        setYear("");
    }
  }, [value]);

  // Handle internal changes
  const handleDateChange = (field, val) => {
    let newDay = day;
    let newMonth = month;
    let newYear = year;

    if (field === "day") newDay = val;
    if (field === "month") newMonth = val;
    if (field === "year") newYear = val;

    // Adjust day if it exceeds max days for the new month/year
    if (newMonth && newYear) {
      const maxDays = getDaysInMonth(newMonth, newYear);
      if (newDay > maxDays) {
        newDay = ""; // Reset day if invalid for new month
        toast.error(`Invalid date: ${months.find(m => m.value === newMonth)?.label} only has ${maxDays} days.`);
      }
    }

    if (field === "day") setDay(newDay);
    if (field === "month") setMonth(newMonth);
    if (field === "year") setYear(newYear);

    // If all fields are present, trigger onChange
    if (newDay && newMonth && newYear) {
      const formattedDate = `${newYear}-${String(newMonth).padStart(2, "0")}-${String(newDay).padStart(2, "0")}`;
      onChange({ target: { name, value: formattedDate } });
    } else {
      // If incomplete, do we send empty? Yes, if we want to clear.
      if (value) {
          onChange({ target: { name, value: "" } });
      }
    }
  };

  // Generate Year Options
  // Default range: current year - 100 to + 10 ?
  // Or use min/max props to determine range.
  const currentYear = new Date().getFullYear();
  let minYear = currentYear - 100;
  let maxYear = currentYear + 10;

  if (min) minYear = new Date(min).getFullYear();
  if (max) maxYear = new Date(max).getFullYear();

  const years = [];
  for (let y = minYear; y <= maxYear; y++) {
    years.push(y);
  }
  // Sort years? Ascending or Descending? Usually Ascending for future dates, Descending for DOB.
  // Let's do Ascending.

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const daysInMonth = month && year ? getDaysInMonth(month, year) : 31;
  const days = [];
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  return (
    <div className={className}>
      <label className="text-sm font-medium text-gray-700 flex items-center mb-1">
        {icon && <span className="mr-2 text-primary">{icon}</span>}
        {label}
        {required && <span className="ml-1 text-highlight">*</span>}
      </label>
      <div className="flex space-x-2 w-full">
        <select
          value={day}
          onChange={(e) => handleDateChange("day", parseInt(e.target.value))}
          className="flex-1 px-2 py-2 border border-background rounded-lg focus:ring-primary focus:border-primary shadow-sm bg-white min-w-[60px]"
          required={required}
        >
          <option value="">Day</option>
          {days.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          value={month}
          onChange={(e) => handleDateChange("month", parseInt(e.target.value))}
          className="flex-[2] px-2 py-2 border border-background rounded-lg focus:ring-primary focus:border-primary shadow-sm bg-white min-w-[100px]"
          required={required}
        >
          <option value="">Month</option>
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => handleDateChange("year", parseInt(e.target.value))}
          className="flex-1 px-2 py-2 border border-background rounded-lg focus:ring-primary focus:border-primary shadow-sm bg-white min-w-[70px]"
          required={required}
        >
          <option value="">Year</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default DynamicDateInput;
