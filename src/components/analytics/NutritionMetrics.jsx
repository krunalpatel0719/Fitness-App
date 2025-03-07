"use client";
import { useState, useEffect } from "react";
import { format, parseISO, isToday, isThisWeek, isSameDay } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CircularProgressbar,
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  Utensils,
  Coffee,
  Apple,
  Sandwich,
  Trophy,
  Clock,
} from "lucide-react";

export function NutritionMetrics({
  foodData,
  timeframe,
  dateRange,
  userMetrics,
}) {
  const [dailyMetrics, setDailyMetrics] = useState([]);
  const [caloriesByDay, setCaloriesByDay] = useState([]);
  const [macroAverages, setMacroAverages] = useState({
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [mealTypeDistribution, setMealTypeDistribution] = useState([]);
  const [dailyAvgCalories, setDailyAvgCalories] = useState(0);
  const [dailyAvgProtein, setDailyAvgProtein] = useState(0);
  const [goalProgress, setGoalProgress] = useState({ calories: 0, protein: 0 });
  const [caloriesTrend, setCaloriesTrend] = useState(0); // +ve for up, -ve for down
  const [proteinTrend, setProteinTrend] = useState(0); // +ve for up, -ve for down
  const [hasCurrentPeriodData, setHasCurrentPeriodData] = useState(true);

  // Default goals
  const DEFAULT_CALORIE_GOAL = 2000;
  const DEFAULT_PROTEIN_GOAL = 150;

  // Calorie goal from userMetrics or default
  const calorieGoal = userMetrics?.dailyCalories || DEFAULT_CALORIE_GOAL;
  const proteinGoal = userMetrics?.dailyProtein || DEFAULT_PROTEIN_GOAL;

  // Icon mappings for meal types
  const mealTypeIcons = {
    Breakfast: <Coffee className="h-4 w-4" />,
    Lunch: <Utensils className="h-4 w-4" />,
    Dinner: <Utensils className="h-4 w-4" />,
    Snack: <Apple className="h-4 w-4" />,
    Other: <Sandwich className="h-4 w-4" />,
  };

  const getAverageLabel = () => {
    switch (timeframe) {
      case "day":
        return "Daily Average";
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
        return "Daily Average";
    }
  };

  const calculatePeriodComparison = () => {
    if (
      !foodData ||
      foodData.length === 0 ||
      !dateRange.start ||
      !dateRange.end
    ) {
      return { caloriesTrend: 0, proteinTrend: 0 };
    }

    // Determine the date range for the current period
    const currentPeriodStart = new Date(dateRange.start);
    const currentPeriodEnd = new Date(dateRange.end);

    const currentPeriodStartStr = format(currentPeriodStart, "yyyy-MM-dd");
    const currentPeriodEndStr = format(currentPeriodEnd, "yyyy-MM-dd");

    const isSingleDayView = timeframe === "day";

    if (isSingleDayView) {
      const currentDay = format(currentPeriodStart, "yyyy-MM-dd");

      const previousDay = new Date(currentPeriodStart);
      previousDay.setDate(previousDay.getDate() - 1);
      const previousDayStr = format(previousDay, "yyyy-MM-dd");

      // Filter data for exact days
      const currentPeriodData = foodData.filter(
        (entry) => entry.date === currentPeriodStartStr
      );
      const previousPeriodData = foodData.filter(
        (entry) => entry.date === previousDayStr
      );

      const currentMetrics = calculatePeriodMetrics(currentPeriodData);
      const previousMetrics = calculatePeriodMetrics(previousPeriodData);

      // Calculate trends
      let caloriesTrend = 0;
      let proteinTrend = 0;

      if (previousMetrics.totalDays > 0 && previousMetrics.avgCalories > 5) {
        if (currentMetrics.avgCalories > 0) {
          caloriesTrend =
            ((currentMetrics.avgCalories - previousMetrics.avgCalories) /
              previousMetrics.avgCalories) *
            100;
        } else {
          caloriesTrend = -100;
        }
        caloriesTrend = Math.round(caloriesTrend);
      }

      if (previousMetrics.totalDays > 0 && previousMetrics.avgProtein > 1) {
        if (currentMetrics.avgProtein > 0) {
          proteinTrend =
            ((currentMetrics.avgProtein - previousMetrics.avgProtein) /
              previousMetrics.avgProtein) *
            100;
        } else {
          proteinTrend = -100; // 100% decrease
        }
        proteinTrend = Math.max(-200, Math.min(200, Math.round(proteinTrend)));
      }

      return { caloriesTrend, proteinTrend };
    }

    // For week/month/etc. views, use your existing logic
    // Calculate days between correctly (inclusive)
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysDiff = Math.round(
      (currentPeriodEnd.getTime() - currentPeriodStart.getTime()) / msPerDay
    );

    // For true single-day view, ensure we get just one previous day
    const isPeriodSingleDay = daysDiff === 0;

    // Calculate previous period with the same length
    const previousPeriodEnd = new Date(currentPeriodStart);
    previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1); // Day before current period

    const previousPeriodStart = new Date(previousPeriodEnd);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - daysDiff); // Same duration as current period

    // Format dates for filtering
    const prevStartStr = format(previousPeriodStart, "yyyy-MM-dd");
    const prevEndStr = format(previousPeriodEnd, "yyyy-MM-dd");
    const currStartStr = format(currentPeriodStart, "yyyy-MM-dd");
    const currEndStr = format(currentPeriodEnd, "yyyy-MM-dd");

    // Enhanced filtering with more detailed logging
    const currentPeriodData = foodData.filter((entry) => {
      const entryDate = entry.date;
      const isInRange = entryDate >= currStartStr && entryDate <= currEndStr;

      return isInRange;
    });

    const previousPeriodData = foodData.filter((entry) => {
      const entryDate = entry.date;
      const isInRange = entryDate >= prevStartStr && entryDate <= prevEndStr;

      return isInRange;
    });

    // Additional logging to help debug
    if (previousPeriodData.length === 0) {
      foodData
        .slice(0, 5)
        .forEach((entry, i) =>
          console.log(`${i}: ${entry.date} - ${entry.calories}cal`)
        );
    }

    // Group and calculate averages for both periods
    const currentMetrics = calculatePeriodMetrics(currentPeriodData);
    const previousMetrics = calculatePeriodMetrics(previousPeriodData);

    // Calculate percentage changes with safeguards
    let caloriesTrend = 0;
    let proteinTrend = 0;

    // Only calculate if we have meaningful data from both periods
    if (previousMetrics.totalDays > 0 && previousMetrics.avgCalories > 5) {
      if (currentMetrics.avgCalories > 0) {
        // Normal case: calculate percentage change
        caloriesTrend =
          ((currentMetrics.avgCalories - previousMetrics.avgCalories) /
            previousMetrics.avgCalories) *
          100;
      } else {
        // If current is zero but previous had data, it's a 100% decrease
        caloriesTrend = -100;
      }
      // Keep the -200 to 200 cap
      caloriesTrend = Math.round(caloriesTrend);
      // Math.max(-200, Math.min(200, Math.round(caloriesTrend)));
    }

    if (previousMetrics.totalDays > 0 && previousMetrics.avgProtein > 1) {
      if (currentMetrics.avgProtein > 0) {
        // Normal case: calculate percentage change
        proteinTrend =
          ((currentMetrics.avgProtein - previousMetrics.avgProtein) /
            previousMetrics.avgProtein) *
          100;
      } else {
        // If current is zero but previous had data, it's a 100% decrease
        proteinTrend = -100;
      }
      proteinTrend = Math.max(-200, Math.min(200, Math.round(proteinTrend)));
    }

    return { caloriesTrend, proteinTrend };
  };

  // Helper to calculate period metrics
  const calculatePeriodMetrics = (periodData) => {
    // Group data by date to avoid double-counting multiple entries on same day
    const dailyTotals = {};

    periodData.forEach((entry) => {
      const date = entry.date;
      if (!dailyTotals[date]) {
        dailyTotals[date] = { calories: 0, protein: 0, days: 0 };
      }

      dailyTotals[date].calories += Number(entry.calories || 0);
      dailyTotals[date].protein += Number(entry.protein || 0);
    });

    // Calculate averages across days
    const days = Object.keys(dailyTotals).length || 1; // Avoid division by zero

    const totalCalories = Object.values(dailyTotals).reduce(
      (sum, day) => sum + day.calories,
      0
    );

    const totalProtein = Object.values(dailyTotals).reduce(
      (sum, day) => sum + day.protein,
      0
    );

    return {
      avgCalories: totalCalories / days,
      avgProtein: totalProtein / days,
      totalDays: days,
    };
  };

  useEffect(() => {
    if (!foodData || !foodData.length) return;

    processNutritionData();
  }, [foodData, timeframe, dateRange]);

  const calculateStreak = () => {
    if (!foodData || foodData.length === 0) return 0;

    // Convert entries to daily entries and get unique dates
    const uniqueDates = [];
    const dateSet = new Set();

    foodData.forEach((entry) => {
      if (!dateSet.has(entry.date)) {
        dateSet.add(entry.date);
        uniqueDates.push(parseISO(entry.date));
      }
    });

    // Sort dates in descending order (newest first)
    uniqueDates.sort((a, b) => b - a);

    if (uniqueDates.length === 0) return 0;

    // Check if the most recent log is from today or yesterday
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const mostRecentDate = uniqueDates[0];

    // If the most recent entry isn't from today or yesterday, streak is broken
    if (
      !isSameDay(mostRecentDate, today) &&
      !isSameDay(mostRecentDate, yesterday)
    ) {
      return 0;
    }

    // Count consecutive days
    let streak = 1; // Start with 1 for the most recent day
    let currentDate = isSameDay(mostRecentDate, today)
      ? yesterday
      : new Date(yesterday);
    currentDate.setDate(currentDate.getDate() - 1); // Check one day earlier

    // Loop through the remaining dates
    for (let i = 1; i < uniqueDates.length; i++) {
      const entryDate = uniqueDates[i];

      // If it matches our "expected next previous day", increase streak
      if (isSameDay(entryDate, currentDate)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      }
      // If this date is earlier than what we're looking for, we have a gap
      else if (entryDate < currentDate) {
        break;
      }
      // If date is more recent than what we're looking for, it's a duplicate day, keep checking
    }

    return streak;
  };
  const processNutritionData = () => {
    // Group data by date

    const groupedByDate = foodData.reduce((acc, entry) => {
      const date = entry.date;
      if (!acc[date]) {
        acc[date] = {
          date,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          meals: {},
        };
      }

      // Sum metrics
      acc[date].calories += Number(entry.calories || 0);
      acc[date].protein += Number(entry.protein || 0);
      acc[date].carbs += Number(entry.carbs || 0);
      acc[date].fat += Number(entry.fat || 0);

      // Track meals
      const mealType = entry.mealType || "Other";
      if (!acc[date].meals[mealType]) acc[date].meals[mealType] = 0;
      acc[date].meals[mealType]++;

      return acc;
    }, {});

    // Convert to array and sort by date
    const sortedDailyData = Object.values(groupedByDate).sort(
      (a, b) => parseISO(a.date) - parseISO(b.date)
    );

    // Fill in missing dates with zeros in the range
    const filledDailyData = fillMissingDates(sortedDailyData, dateRange);

    // Process calories by day for bar chart
    // const calorieData = filledDailyData.map((day) => ({
    //   date: day.date,
    //   displayDate: formatDisplayDate(day.date, timeframe),
    //   calories: Math.round(day.calories),
    //   goal: calorieGoal,
    // }));

    // IMPORTANT: Filter data for the current period only to calculate averages

    let calorieData;

    if (timeframe !== "day") {
      // For non-day views, set standard daily data
      calorieData = filledDailyData.map((day) => ({
        date: day.date,
        displayDate: formatDisplayDate(day.date, timeframe),
        calories: Math.round(day.calories),
        goal: calorieGoal,
      }));
    }

    if (timeframe === "day") {
      // For day view, group by hour instead
      const hourlyData = {};

      // Initialize all hours of the day
      for (let i = 0; i < 24; i++) {
        hourlyData[i] = { hour: i, calories: 0 };
      }

      // Get the selected day
      const selectedDay = format(new Date(dateRange.start), "yyyy-MM-dd");

      // Filter and group entries for this day by hour
      const validEntries = foodData.filter(
        (entry) =>
          entry && typeof entry === "object" && entry.date === selectedDay
      );

      console.log(
        `Found ${validEntries.length} entries for day view: ${selectedDay}`
      );

      validEntries.forEach((entry) => {
        try {
          // Extract hour from entry time or use default if no time provided
          let hour = null;

          // Option 1: Use createdAt timestamp (highest priority)
          if (entry.createdAt) {
            let timestamp = entry.createdAt;

            // Handle Firebase timestamp objects
            if (
              timestamp &&
              typeof timestamp === "object" &&
              timestamp.toDate
            ) {
              timestamp = timestamp.toDate();
            }

            // Handle ISO string timestamps
            if (typeof timestamp === "string") {
              timestamp = new Date(timestamp);
            }

            // Extract hour if we have a valid date
            if (timestamp instanceof Date && !isNaN(timestamp.getTime())) {
              hour = timestamp.getHours();
              console.log(
                `Entry ${entry.id || "unknown"}: Using createdAt hour: ${hour}`
              );
            }
          }

          // Option 2: Use time field if createdAt didn't work
          if (hour === null && entry.time && typeof entry.time === "string") {
            const [hourStr] = entry.time.split(":");
            const parsedHour = parseInt(hourStr, 10);
            if (!isNaN(parsedHour) && parsedHour >= 0 && parsedHour < 24) {
              hour = parsedHour;
              console.log(
                `Entry ${entry.id || "unknown"}: Using time field: ${hour}`
              );
            }
          }

          // Option 3: Fallback to mealType-based hour
          if (
            hour === null &&
            entry.mealType &&
            typeof entry.mealType === "string"
          ) {
            // Fallback based on meal type
            switch (entry.mealType.toLowerCase()) {
              case "breakfast":
                hour = 8;
                break;
              case "lunch":
                hour = 13;
                break;
              case "dinner":
                hour = 19;
                break;
              case "snack":
                hour = 16;
                break;
              default:
                hour = 12;
            }
            console.log(
              `Entry ${
                entry.id || "unknown"
              }: Using mealType hour: ${hour} from ${entry.mealType}`
            );
          }

          // Final fallback if all else failed
          if (hour === null) {
            hour = 12;
            console.log(
              `Entry ${entry.id || "unknown"}: Using default hour (noon)`
            );
          }

          // Ensure hour is valid
          hour = Math.max(0, Math.min(23, hour));

          // Safe way to add calories
          const caloriesValue = Number(entry.calories || 0);
          if (!isNaN(caloriesValue)) {
            hourlyData[hour].calories += caloriesValue;
            console.log(`Added ${caloriesValue} calories to hour ${hour}`);
          }
        } catch (err) {
          console.error("Error processing entry:", JSON.stringify(entry), err);
        }
      });

      // Convert to array and format for chart - ONLY include hours with calories
      calorieData = Object.values(hourlyData)
        .map((hourData) => ({
          hour: hourData.hour,
          date: selectedDay,
          displayDate: format(
            new Date().setHours(hourData.hour, 0, 0, 0),
            "ha"
          ),
          calories: Math.round(hourData.calories),
          goal: calorieGoal / 24,
        }))
        .filter((item) => item.calories > 0); // Only show bars for hours with calories
    }
    const currentPeriodStart = format(new Date(dateRange.start), "yyyy-MM-dd");
    const currentPeriodEnd = format(new Date(dateRange.end), "yyyy-MM-dd");

    // Filter for current period data
    const currentPeriodData =
      timeframe === "day"
        ? sortedDailyData.filter((day) => day.date === currentPeriodStart)
        : sortedDailyData.filter(
            (day) =>
              day.date >= currentPeriodStart && day.date <= currentPeriodEnd
          );
    setHasCurrentPeriodData(currentPeriodData.length > 0);
    const totals = currentPeriodData.reduce(
      (acc, day) => {
        acc.calories += day.calories;
        acc.protein += day.protein;
        acc.carbs += day.carbs;
        acc.fat += day.fat;
        acc.days += 1;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, days: 0 }
    );

    // Now the rest of your code can use totals
    const days = totals.days || 1;
    const avgCalories = Math.round(totals.calories / days);

    const avgProtein = Math.round(totals.protein / days);
    const avgCarbs = Math.round(totals.carbs / days);
    const avgFat = Math.round(totals.fat / days);
    // Calculate macro distribution
    const totalMacros = avgProtein + avgCarbs + avgFat;

    // Calculate meal type distribution
    const mealCounts = {};
    currentPeriodData.forEach((day) => {
      Object.entries(day.meals).forEach(([mealType, count]) => {
        if (!mealCounts[mealType]) mealCounts[mealType] = 0;
        mealCounts[mealType] += count;
      });
    });

    const capitalizeFirstLetter = (string) => {
      return string.charAt(0).toUpperCase() + string.slice(1);
    };

    const mealTypes = Object.entries(mealCounts)
      .map(([name, count]) => ({ name: capitalizeFirstLetter(name), count }))
      .sort((a, b) => b.count - a.count);

    // Calculate trends (compare first half to second half of period)
    const { caloriesTrend, proteinTrend } = calculatePeriodComparison();
    setCaloriesTrend(caloriesTrend);
    setProteinTrend(proteinTrend);

    // Calculate goal progress
    const goalCaloriesProgress = Math.min(
      100,
      Math.round((avgCalories / calorieGoal) * 100)
    );
    const goalProteinProgress = Math.min(
      100,
      Math.round((avgProtein / proteinGoal) * 100)
    );

    setDailyMetrics(sortedDailyData);
    setCaloriesByDay(calorieData);
    setDailyAvgCalories(avgCalories);
    setDailyAvgProtein(avgProtein);
    setMacroAverages({ protein: avgProtein, carbs: avgCarbs, fat: avgFat });
    setMealTypeDistribution(mealTypes);
    setGoalProgress({
      calories: goalCaloriesProgress,
      protein: goalProteinProgress,
    });
  };

  // Helper function to fill in missing dates
  const fillMissingDates = (data, dateRange) => {
    if (!dateRange.start || !dateRange.end || !data.length) return data; // Add this return

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
        result.push({
          date: dateStr,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          meals: {},
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  };

  // Helper to add days to a date
  const addDayToDate = (date, days) => {
    const result = new Date(date);
    result.setDate(date.getDate() + days);
    return result;
  };

  // Helper to format display date based on timeframe
  const formatDisplayDate = (dateStr, timeframe) => {
    const date = parseISO(dateStr);

    switch (timeframe) {
      case "day":
        return format(date, "ha"); // e.g., 10AM
      case "week":
        return format(date, "EEE"); // e.g., Mon
      case "month":
        return format(date, "d"); // e.g., 15
      case "6 months":
      case "year":
        return format(date, "MMM"); // e.g., Jan
      default:
        return format(date, "MMM d");
    }
  };

  // Colors for charts
  const CALORIE_BAR_COLOR = "#8884d8";
  const CALORIE_BAR_BACKGROUND = "#f0edff";
  const PROTEIN_COLOR = "#10b981";
  const CARBS_COLOR = "#f59e0b";
  const FAT_COLOR = "#ef4444";

  const macroColors = [PROTEIN_COLOR, CARBS_COLOR, FAT_COLOR];

  const mealTypeColors = {
    Breakfast: "#f97316",
    Lunch: "#22c55e",
    Dinner: "#3b82f6",
    Snack: "#ec4899",
  };

  const getTrendColor = (value) => {
    if (value > 5) return "text-green-500";
    if (value < -5) return "text-red-500";
    return "text-yellow-500";
  };

  const getTrendIcon = (value) => {
    if (value > 5) return <ArrowUpIcon className="w-4 h-4" />;
    if (value < -5) return <ArrowDownIcon className="w-4 h-4" />;
    return null;
  };

  const renderBarTooltip = (props) => {
    const { active, payload } = props;

    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-zinc-800 p-2 border border-gray-200 dark:border-zinc-700 rounded-md shadow-md">
          <p className="font-medium dark:text-white">
            {payload[0].payload.displayDate}
          </p>
          <p className="text-sm text-blue-500">
            Calories: <span className="font-semibold">{payload[0].value}</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {Math.round((payload[0].value / calorieGoal) * 100)}% of goal
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomBarLabel = (props) => {
    const { x, y, width, value } = props;
    return value > 0 ? (
      <text
        x={x + width / 2}
        y={y - 6}
        fill="#888"
        textAnchor="middle"
        fontSize={10}
      >
        {value}
      </text>
    ) : null;
  };

  const completionPercentage = Math.round(
    (dailyAvgCalories / calorieGoal) * 100
  );
  const proteinPercentage = Math.round((dailyAvgProtein / proteinGoal) * 100);

  // If no data available
  if (foodData.length === 0 || !hasCurrentPeriodData) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-md dark:bg-zinc-800">
          <CardHeader className="pb-2 dark:text-white">
            <CardTitle>No Nutrition Data Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 dark:text-gray-400">
              {foodData.length === 0
                ? "Start logging your meals to see nutrition analytics. Track your calories, protein, carbs and fat intake."
                : `No nutrition data available for the selected time period. Try selecting a different date range.`}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Calorie Card with Progress */}
        <Card className="border-0 shadow-md dark:bg-zinc-800">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 mb-4">
                <CircularProgressbarWithChildren
                  value={completionPercentage}
                  styles={buildStyles({
                    pathColor:
                      completionPercentage > 100 ? "#ef4444" : "#3b82f6",
                    trailColor: "#000000",
                    textSize: "12px",
                  })}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold dark:text-white">
                      {dailyAvgCalories}
                    </span>
                    <span className="capitalize text-xs text-gray-500 dark:text-gray-400 pt-1">
                      calories
                    </span>
                  </div>
                </CircularProgressbarWithChildren>
              </div>
              <div className="text-center">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {getAverageLabel()}
                </h3>
                <div className="flex items-center justify-center mt-1">
                  {caloriesTrend !== 0 ? (
                    <>
                      <span
                        className={`text-xs font-semibold ${getTrendColor(
                          caloriesTrend
                        )} flex items-center`}
                      >
                        {getTrendIcon(caloriesTrend)}
                        {Math.abs(caloriesTrend)}%
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                        vs. previous {timeframe}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      No previous {timeframe} data
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Goal: {calorieGoal} Calories
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Protein Card with Progress */}
        <Card className="border-0 shadow-md dark:bg-zinc-800">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 mb-4">
                <CircularProgressbarWithChildren
                  value={proteinPercentage}
                  styles={buildStyles({
                    pathColor: PROTEIN_COLOR,
                    trailColor: "#000000",
                    textSize: "12px",
                  })}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold dark:text-white">
                      {dailyAvgProtein}g
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                      Protein
                    </span>
                  </div>
                </CircularProgressbarWithChildren>
              </div>
              <div className="text-center">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {getAverageLabel()}
                </h3>
                <div className="flex items-center justify-center mt-1">
                  {proteinTrend !== 0 ? (
                    <>
                      <span
                        className={`text-xs font-semibold ${getTrendColor(
                          proteinTrend
                        )} flex items-center`}
                      >
                        {getTrendIcon(proteinTrend)}
                        {Math.abs(proteinTrend)}%
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                        vs. previous {timeframe}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      No previous {timeframe} data
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Goal: {proteinGoal}g Protein
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calorie Intake Chart */}
      <Card className="border-0 shadow-md dark:bg-zinc-800 ">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center dark:text-white pb-2">
            <CardTitle>Calorie Intake</CardTitle>
            <Badge className="hover:bg-transparent bg-transparent text-sm font-semibold dark:text-white">
              Goal: {calorieGoal} kcal
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={caloriesByDay}
                margin={{
                  top: 20,
                  right: 10,
                  left: 10,
                  bottom: 5,
                }}
                barSize={
                  timeframe === "year" || timeframe === "6 months"
                    ? 8
                    : timeframe === "day"
                    ? 12
                    : 24
                }
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="displayDate"
                  fontSize={11}
                  tickMargin={5}
                  axisLine={false}
                  tickLine={false}
                  interval={timeframe === "day" ? 2 : 0} // Show every 3rd hour in day view
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  fontSize={10}
                  tickFormatter={(value) => (value === 0 ? "" : value)}
                />
                <Tooltip content={renderBarTooltip} />
                <Bar
                  dataKey="calories"
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                  label={false}
                >
                  {caloriesByDay.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        timeframe === "day"
                          ? entry.calories > 0
                            ? "#3b82f6"
                            : "#e5e7eb"
                          : entry.calories > calorieGoal
                          ? "#ef4444"
                          : "#3b82f6"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Macronutrient Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md dark:bg-zinc-800 dark:text-white">
          <CardHeader className="pb-2">
            <CardTitle>Macronutrient Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex  items-center justify-center">
              <div className="w-64 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      className=""
                      data={[
                        { name: "Protein", value: macroAverages.protein },
                        { name: "Carbs", value: macroAverages.carbs },
                        { name: "Fat", value: macroAverages.fat },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      labelLine={false}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {[PROTEIN_COLOR, CARBS_COLOR, FAT_COLOR].map(
                        (color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        )
                      )}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="flex justify-around mt-4">
              <div className="text-center">
                <div
                  className="text-2xl font-bold"
                  style={{ color: PROTEIN_COLOR }}
                >
                  {macroAverages.protein}g
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 ">
                  {" "}
                  Protein{" "}
                </div>
              </div>

              <div className="text-center">
                <div
                  className="text-2xl font-bold"
                  style={{ color: CARBS_COLOR }}
                >
                  {macroAverages.carbs}g
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 ">
                  {" "}
                  Carbs{" "}
                </div>
              </div>
              <div className="text-center">
                <div
                  className="text-2xl font-bold"
                  style={{ color: FAT_COLOR }}
                >
                  {macroAverages.fat}g
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 ">
                  {" "}
                  Fat{" "}
                </div>
              </div>
            </div>
            {/* </div> */}
          </CardContent>
        </Card>

        {/* Meal Type Distribution */}
        <Card className="border-0 shadow-md dark:bg-zinc-800 dark:text-white">
          <CardHeader className="pb-2">
            <CardTitle>Meal Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> */}
            <div className="flex items-center justify-center">
              <div className="w-64 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mealTypeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      innerRadius={60}
                      fill="#8884d8"
                      dataKey="count"
                      paddingAngle={5}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {mealTypeDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            mealTypeColors[entry.name] || mealTypeColors.Other
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex  justify-around mt-4">
              {mealTypeDistribution.map((meal, index) => (
                <div key={index} className="text-center ">
                  <div className="text-center">
                    <div
                      className="text-2xl font-bold"
                      style={{
                        color:
                          mealTypeColors[meal.name] || mealTypeColors.Other,
                      }}
                    >
                      {meal.count}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 ">
                      {" "}
                      {meal.name}{" "}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* </div> */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
