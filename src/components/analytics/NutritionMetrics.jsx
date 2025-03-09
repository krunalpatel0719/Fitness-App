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
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { MetricCard } from "./MetricCard";
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

const extractHourFromEntry = (entry) => {
  // Option 1: Use createdAt timestamp (highest priority)
  if (entry.createdAt) {
    let timestamp = entry.createdAt;

    // Handle Firebase timestamp objects
    if (timestamp && typeof timestamp === "object" && timestamp.toDate) {
      timestamp = timestamp.toDate();
    }

    // Handle ISO string timestamps
    if (typeof timestamp === "string") {
      timestamp = new Date(timestamp);
    }

    // Extract hour if we have a valid date
    if (timestamp instanceof Date && !isNaN(timestamp.getTime())) {
      return timestamp.getHours();
    }
  }

  // Option 2: Use time field if createdAt didn't work
  if (entry.time && typeof entry.time === "string") {
    const [hourStr] = entry.time.split(":");
    const parsedHour = parseInt(hourStr, 10);
    if (!isNaN(parsedHour) && parsedHour >= 0 && parsedHour < 24) {
      return parsedHour;
    }
  }

  // Option 3: Fallback to mealType-based hour
  if (entry.mealType && typeof entry.mealType === "string") {
    // Fallback based on meal type
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

  // Final fallback
  return 12;
};

const processDayViewData = (foodData, selectedDay, calorieGoal) => {
  // Initialize all hours of the day
  const hourlyData = {};
  for (let i = 0; i < 24; i++) {
    hourlyData[i] = { hour: i, calories: 0 };
  }

  // Filter and group entries for this day by hour
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

  // Convert to array and format for chart - ONLY include hours with calories
  return Object.values(hourlyData)
    .map((hourData) => ({
      hour: hourData.hour,
      date: selectedDay,
      displayDate: format(new Date().setHours(hourData.hour, 0, 0, 0), "ha"),
      calories: Math.round(hourData.calories),
      goal: calorieGoal / 24,
    }))
    .filter((item) => item.calories > 0); // Only show bars for hours with calories
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
      // Get exact period length in days (adding 1 because dates are inclusive)
      const msPerDay = 24 * 60 * 60 * 1000;
      const periodLengthDays = Math.round(
        (currentPeriodEnd.getTime() - currentPeriodStart.getTime()) / msPerDay
      );
      
      // Calculate previous period end (day before current start)
      const previousPeriodEnd = new Date(currentPeriodStart);
      previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);
      
      // Calculate previous period start (ensuring equal period length)
      const previousPeriodStart = new Date(previousPeriodEnd);
      previousPeriodStart.setDate(previousPeriodStart.getDate() - (periodLengthDays - 1));
      
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

  const calculateTrend = (currentValue, previousValue, minThreshold) => {
    if (previousValue <= minThreshold) return 0;

    let trend = 0;
    if (currentValue > 0) {
      trend = ((currentValue - previousValue) / previousValue) * 100;
    } else if (previousValue > 0) {
      trend = -100;
    }

    return Math.round(trend);
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
  
    const sortedDailyData = Object.values(groupedByDate)
      .sort((a, b) => parseISO(a.date) - parseISO(b.date));
  
    const filledDailyData = fillMissingDates(sortedDailyData, dateRange);
    
    return { sortedDailyData, filledDailyData };
  };
  
  const prepareCalorieData = (filledDailyData) => {
    if (timeframe === "day") {
      const selectedDay = format(new Date(dateRange.start), "yyyy-MM-dd");
      return processDayViewData(foodData, selectedDay, calorieGoal);
    }
    
    return filledDailyData.map(day => ({
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
                  interval={timeframe === "day" ? 2 : 0}
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
              <div className="w-72 h-64">
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
              {[
                {
                  name: "Protein",
                  value: macroAverages.protein,
                  color: PROTEIN_COLOR,
                },
                {
                  name: "Carbs",
                  value: macroAverages.carbs,
                  color: CARBS_COLOR,
                },
                { name: "Fat", value: macroAverages.fat, color: FAT_COLOR },
              ].map((macro) => (
                <div key={macro.name} className="text-center">
                  <div
                    className="text-2xl font-bold"
                    style={{ color: macro.color }}
                  >
                    {macro.value}g
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {macro.name}
                  </div>
                </div>
              ))}
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
            <div className="flex items-center justify-center">
              <div className="w-72 h-64">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
