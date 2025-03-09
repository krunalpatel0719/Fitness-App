"use client";
import { useState, useEffect } from "react";
import { format, parseISO, isToday, isThisWeek, isSameDay } from "date-fns";
import {

  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import "react-circular-progressbar/dist/styles.css";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { DataBarChart } from "./DataBarChart";
import { DistributionPieChart } from "./DistributionPieChart";
import { formatDisplayDate, fillMissingDates, calculateTrend, getAverageLabel } from "@/lib/analyticsUtils";


// Constants

const PROTEIN_COLOR = "#10b981";
const CARBS_COLOR = "#f59e0b";
const FAT_COLOR = "#ef4444";
const DEFAULT_CALORIE_GOAL = 2000;
const DEFAULT_PROTEIN_GOAL = 150;

const mealTypeColors = {
  Breakfast: "#f97316",
  Lunch: "#22c55e",
  Dinner: "#3b82f6",
  Snack: "#ec4899",
};

// Helper functions


const extractHourFromEntry = (entry) => {
  if (entry.createdAt) {
    let timestamp = entry.createdAt;

    if (timestamp && typeof timestamp === "object" && timestamp.toDate) {
      timestamp = timestamp.toDate();
    }

    if (typeof timestamp === "string") {
      timestamp = new Date(timestamp);
    }

    // Extract hour if we have a valid date
    if (timestamp instanceof Date && !isNaN(timestamp.getTime())) {
      return timestamp.getHours();
    }
  }

  if (entry.time && typeof entry.time === "string") {
    const [hourStr] = entry.time.split(":");
    const parsedHour = parseInt(hourStr, 10);
    if (!isNaN(parsedHour) && parsedHour >= 0 && parsedHour < 24) {
      return parsedHour;
    }
  }

  if (entry.mealType && typeof entry.mealType === "string") {
    switch (entry.mealType.toLowerCase()) {
      case "breakfast":
        return 8;
      case "lunch":
        return 13;
      case "dinner":
        return 19;
      case "snack":
        return 16;
      default:
        return 12;
    }
  }

  return 12;
};

const processDayViewData = (foodData, selectedDay, calorieGoal) => {
  const hourlyData = {};
  for (let i = 0; i < 24; i++) {
    hourlyData[i] = { hour: i, calories: 0 };
  }

  const validEntries = foodData.filter(
    (entry) => entry && typeof entry === "object" && entry.date === selectedDay
  );

  validEntries.forEach((entry) => {
    try {
      const hour = extractHourFromEntry(entry);
      const safeHour = Math.max(0, Math.min(23, hour));

      const caloriesValue = Number(entry.calories || 0);
      if (!isNaN(caloriesValue)) {
        hourlyData[safeHour].calories += caloriesValue;
      }
    } catch (err) {
      console.error("Error processing entry:", err);
    }
  });

  return Object.values(hourlyData)
    .map((hourData) => ({
      hour: hourData.hour,
      date: selectedDay,
      displayDate: format(new Date().setHours(hourData.hour, 0, 0, 0), "ha"),
      calories: Math.round(hourData.calories),
      goal: calorieGoal / 24,
    }))
    .filter((item) => item.calories > 0); 
};

const getTrendInfo = (value) => {
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

const calculatePeriodMetrics = (periodData) => {
  const dailyTotals = {};

  periodData.forEach((entry) => {
    const date = entry.date;
    if (!dailyTotals[date]) {
      dailyTotals[date] = { calories: 0, protein: 0, days: 0 };
    }
    dailyTotals[date].calories += Number(entry.calories || 0);
    dailyTotals[date].protein += Number(entry.protein || 0);
  });

  const days = Object.keys(dailyTotals).length || 1;

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

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export function NutritionMetrics({
  foodData,
  timeframe,
  dateRange,
  userMetrics,
}) {
  const [dailyMetrics, setDailyMetrics] = useState([]);
  const [caloriesByDay, setCaloriesByDay] = useState([]);
  const [dailyAvgCalories, setDailyAvgCalories] = useState(0);
  const [dailyAvgProtein, setDailyAvgProtein] = useState(0);

  const [macroAverages, setMacroAverages] = useState({
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [mealTypeDistribution, setMealTypeDistribution] = useState([]);

  const [goalProgress, setGoalProgress] = useState({ calories: 0, protein: 0 });
  const [caloriesTrend, setCaloriesTrend] = useState(0);
  const [proteinTrend, setProteinTrend] = useState(0);

  const [hasCurrentPeriodData, setHasCurrentPeriodData] = useState(true);

  const calorieGoal = userMetrics?.dailyCalories || DEFAULT_CALORIE_GOAL;
  const proteinGoal = userMetrics?.dailyProtein || DEFAULT_PROTEIN_GOAL;

  const { color: caloriesTrendColor, icon: caloriesTrendIcon } =
    getTrendInfo(caloriesTrend);
  const { color: proteinTrendColor, icon: proteinTrendIcon } =
    getTrendInfo(proteinTrend);

  
  const extractTimePeriods = () => {
    const currentPeriodStart = new Date(dateRange.start);
    const currentPeriodEnd = new Date(dateRange.end);
    const currStartStr = format(currentPeriodStart, "yyyy-MM-dd");
    const currEndStr = format(currentPeriodEnd, "yyyy-MM-dd");

    let prevStartStr, prevEndStr;

    if (timeframe === "day") {
      // For day view, compare with previous day
      const previousDay = new Date(currentPeriodStart);
      previousDay.setDate(previousDay.getDate() - 1);
      prevStartStr = prevEndStr = format(previousDay, "yyyy-MM-dd");
    } else {
      const msPerDay = 24 * 60 * 60 * 1000;
      const periodLengthDays = Math.round(
        (currentPeriodEnd.getTime() - currentPeriodStart.getTime()) / msPerDay
      );

      const previousPeriodEnd = new Date(currentPeriodStart);
      previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);

      const previousPeriodStart = new Date(previousPeriodEnd);
      previousPeriodStart.setDate(
        previousPeriodStart.getDate() - (periodLengthDays - 1)
      );

      prevStartStr = format(previousPeriodStart, "yyyy-MM-dd");
      prevEndStr = format(previousPeriodEnd, "yyyy-MM-dd");
    }

    const currentPeriodData = foodData.filter(
      (entry) => entry.date >= currStartStr && entry.date <= currEndStr
    );

    const previousPeriodData = foodData.filter(
      (entry) => entry.date >= prevStartStr && entry.date <= prevEndStr
    );

    if (currentPeriodData.length && previousPeriodData.length) {
      const currentMetrics = calculatePeriodMetrics(currentPeriodData);
      const previousMetrics = calculatePeriodMetrics(previousPeriodData);
    }

    return { currentPeriodData, previousPeriodData };
  };

  
  const calculatePeriodComparison = () => {
    if (!foodData?.length || !dateRange.start || !dateRange.end) {
      return { caloriesTrend: 0, proteinTrend: 0 };
    }

    // Extract time periods
    const { currentPeriodData, previousPeriodData } = extractTimePeriods();

    // Calculate metrics for both periods
    const currentMetrics = calculatePeriodMetrics(currentPeriodData);
    const previousMetrics = calculatePeriodMetrics(previousPeriodData);

    // Calculate trends
    const caloriesTrend = calculateTrend(
      currentMetrics.avgCalories,
      previousMetrics.avgCalories,
      5
    );

    const proteinTrend = calculateTrend(
      currentMetrics.avgProtein,
      previousMetrics.avgProtein,
      1
    );

    return {
      caloriesTrend,
      proteinTrend: Math.max(-200, Math.min(200, proteinTrend)),
    };
  };

  const prepareDataByDate = () => {
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

      acc[date].calories += Number(entry.calories || 0);
      acc[date].protein += Number(entry.protein || 0);
      acc[date].carbs += Number(entry.carbs || 0);
      acc[date].fat += Number(entry.fat || 0);

      const mealType = entry.mealType || "Other";
      if (!acc[date].meals[mealType]) acc[date].meals[mealType] = 0;
      acc[date].meals[mealType]++;

      return acc;
    }, {});

    const sortedDailyData = Object.values(groupedByDate).sort(
      (a, b) => parseISO(a.date) - parseISO(b.date)
    );

    const filledDailyData = fillMissingDates(sortedDailyData, dateRange);

    return { sortedDailyData, filledDailyData };
  };

  const prepareCalorieData = (filledDailyData) => {
    if (timeframe === "day") {
      const selectedDay = format(new Date(dateRange.start), "yyyy-MM-dd");
      return processDayViewData(foodData, selectedDay, calorieGoal);
    }

    return filledDailyData.map((day) => ({
      date: day.date,
      displayDate: formatDisplayDate(day.date, timeframe),
      calories: Math.round(day.calories),
      goal: calorieGoal,
    }));
  };

  const processNutritionData = () => {
    const { sortedDailyData, filledDailyData } = prepareDataByDate();

    let calorieData = prepareCalorieData(filledDailyData);
    const currentPeriodStart = format(new Date(dateRange.start), "yyyy-MM-dd");
    const currentPeriodEnd = format(new Date(dateRange.end), "yyyy-MM-dd");

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

    const days = totals.days || 1;
    const avgCalories = Math.round(totals.calories / days);

    const avgProtein = Math.round(totals.protein / days);
    const avgCarbs = Math.round(totals.carbs / days);
    const avgFat = Math.round(totals.fat / days);
    const totalMacros = avgProtein + avgCarbs + avgFat;
    const mealCounts = {};
    currentPeriodData.forEach((day) => {
      Object.entries(day.meals).forEach(([mealType, count]) => {
        if (!mealCounts[mealType]) mealCounts[mealType] = 0;
        mealCounts[mealType] += count;
      });
    });

    const mealTypes = Object.entries(mealCounts)
      .map(([name, count]) => ({ name: capitalizeFirstLetter(name), count }))
      .sort((a, b) => b.count - a.count);

    const { caloriesTrend, proteinTrend } = calculatePeriodComparison();
    setCaloriesTrend(caloriesTrend);
    setProteinTrend(proteinTrend);

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

  useEffect(() => {
    if (!foodData || !foodData.length) return;

    processNutritionData();
  }, [foodData, timeframe, dateRange]);

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

  const completionPercentage = Math.round(
    (dailyAvgCalories / calorieGoal) * 100
  );
  const proteinPercentage = Math.round((dailyAvgProtein / proteinGoal) * 100);

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
        <MetricCard
          value={dailyAvgCalories}
          label="calories"
          percentage={completionPercentage}
          trend={caloriesTrend}
          timeframe={timeframe}
          averageLabel={getAverageLabel(timeframe)}
          goalText={`Goal: ${calorieGoal} Calories`}
          color={completionPercentage > 100 ? "#ef4444" : "#3b82f6"}
        />

        {/* Protein Card with Progress */}
        <MetricCard
          value={dailyAvgProtein}
          label="Protein"
          unit="g"
          percentage={proteinPercentage}
          trend={proteinTrend}
          timeframe={timeframe}
          averageLabel={getAverageLabel(timeframe)}
          goalText={`Goal: ${proteinGoal}g Protein`}
          color={PROTEIN_COLOR}
        />
      </div>

      <DataBarChart
        title="Calorie Intake"
        data={caloriesByDay}
        dataKey="calories"
        timeframe={timeframe}
        goalText={`Goal: ${calorieGoal} kcal`}
        customTooltip={renderBarTooltip}
        goal={calorieGoal}
      />
      {/* Macronutrient Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DistributionPieChart
        title="Macronutrient Distribution"
        data={[
          { name: "Protein", value: macroAverages.protein },
          { name: "Carbs", value: macroAverages.carbs },
          { name: "Fat", value: macroAverages.fat },
        ]}
        dataKey="value"
        colorMap={{
          "Protein": PROTEIN_COLOR,
          "Carbs": CARBS_COLOR,
          "Fat": FAT_COLOR
        }}
      />
      
      <DistributionPieChart
        title="Meal Type Distribution"
        data={mealTypeDistribution}
        dataKey="count"
        colorMap={mealTypeColors}
      />
      </div>
    </div>
  );
}
