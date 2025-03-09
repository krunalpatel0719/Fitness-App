import { format, parseISO } from "date-fns";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

// Date formatting for different timeframes
export const formatDisplayDate = (dateStr, timeframe) => {
  const date = parseISO(dateStr);

  switch (timeframe) {
    case "day":
      return format(date, "ha"); 
    case "week":
      return format(date, "EEE"); 
    case "month":
      return format(date, "d");
    case "6 months":
    case "year":
      return format(date, "MMM");
    default:
      return format(date, "MMM d");
  }
};

// Function to fill missing dates in a dataset
export const fillMissingDates = (data, dateRange) => {
  if (!dateRange.start || !dateRange.end || !data.length) return data;

  const result = [];
  const dataMap = data.reduce((acc, day) => {
    acc[day.date] = day;
    return acc;
  }, {});

  const currentDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);

  while (currentDate <= endDate) {
    const dateStr = format(currentDate, "yyyy-MM-dd");
    if (dataMap[dateStr]) {
      result.push(dataMap[dateStr]);
    } else {
      const emptyEntry = { date: dateStr };
      
      if (data[0]) {
        Object.keys(data[0]).forEach(key => {
          if (key !== 'date') {
            if (typeof data[0][key] === 'number') {
              emptyEntry[key] = 0;
            } else if (typeof data[0][key] === 'object' && !Array.isArray(data[0][key])) {
              emptyEntry[key] = {};
            } else if (Array.isArray(data[0][key])) {
              emptyEntry[key] = [];
            }
          }
        });
      }

      result.push(emptyEntry);
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return result;
};

// Calculate trend percentage between current and previous value
export const calculateTrend = (currentValue, previousValue, minThreshold = 0) => {
  if (previousValue <= minThreshold) return 0;

  let trend = 0;
  if (currentValue > 0) {
    trend = ((currentValue - previousValue) / previousValue) * 100;
  } else if (previousValue > 0) {
    trend = -100;
  }

  return Math.round(trend);
};

// Get trend display information (color and icon)
export const getTrendInfo = (value) => {
  if (value > 0)
    return {
      color: "text-green-500",
      icon: <ArrowUpIcon className="w-4 h-4" />,
    };
  if (value < 0)
    return {
      color: "text-red-500",
      icon: <ArrowDownIcon className="w-4 h-4" />,
    };
  return {
    color: "text-yellow-500",
    icon: null,
  };
};

// Get appropriate label for average based on timeframe
export const getAverageLabel = (timeframe) => {
  switch (timeframe) {
    case "day":
      return "Daily Total";
    case "week":
      return "Weekly Average";
    case "month":
      return "Monthly Average";
    case "6months":
    case "6 months":
      return "6 Month Average";
    case "year":
      return "Yearly Average";
    default:
      return "Average";
  }
};