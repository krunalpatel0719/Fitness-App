// src/components/analytics/NutritionSummary.jsx
"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart2,
  Apple,
  TrendingDown,
  Flame,
  Utensils,
  Activity,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Area,
} from "recharts";
import { format, parseISO } from "date-fns";

export function NutritionSummary({ foodData, timeframe, userMetrics, timeOffset = 0 }) {
  const [metrics, setMetrics] = useState({
    avgCalories: 0,
    avgProtein: 0,
    avgCarbs: 0,
    avgFat: 0,
    calorieGoal: 2000,
    proteinGoal: 150,
  });
  
  const [calorieData, setCalorieData] = useState([]);
  const [macroData, setMacroData] = useState([]);
  const [mealTypeData, setMealTypeData] = useState([]);

  useEffect(() => {
    if (!foodData || !foodData.length) {
      // Reset all metrics when no data is available
      setMetrics({
        avgCalories: 0,
        avgProtein: 0,
        avgCarbs: 0,
        avgFat: 0,
        calorieGoal: userMetrics?.calorieGoal || 2000,
        proteinGoal: userMetrics?.proteinGoal || 150,
      });
      setCalorieData([]);
      setMacroData([]);
      setMealTypeData([]);
      return;
    }
    
    // Extract user goals if available
    let calorieGoal = 2000;
    let proteinGoal = 150;
    
    if (userMetrics) {
      calorieGoal = userMetrics.calorieGoal || calorieGoal;
      proteinGoal = userMetrics.proteinGoal || proteinGoal;
    }
    
    processFoodData(calorieGoal, proteinGoal);
    console.log(`Processing ${foodData.length} food entries for ${timeframe} view with offset ${timeOffset}`);
  }, [foodData, timeframe, userMetrics, timeOffset]);

  const processFoodData = (calorieGoal, proteinGoal) => {
    // Group data by date
    const groupedByDate = foodData.reduce((acc, entry) => {
      const date = entry.date;
      if (!acc[date]) {
        acc[date] = {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          meals: [],
          mealTypes: {}
        };
      }
      
      acc[date].calories += Number(entry.calories) || 0;
      acc[date].protein += Number(entry.protein) || 0;
      acc[date].carbs += Number(entry.carbs) || 0;
      acc[date].fat += Number(entry.fat) || 0;
      acc[date].meals.push(entry);
      
      // Count meal types
      const mealType = entry.mealType || "Other";
      if (!acc[date].mealTypes[mealType]) {
        acc[date].mealTypes[mealType] = 0;
      }
      acc[date].mealTypes[mealType] += 1;
      
      return acc;
    }, {});
    
    // Add timeOffset-aware label to the date range display
    const dateRangeLabel = getDateRangeLabel(timeframe, timeOffset);
    
    // Calculate averages
    const numDays = Object.keys(groupedByDate).length;
    const totalCalories = Object.values(groupedByDate).reduce((sum, day) => sum + day.calories, 0);
    const totalProtein = Object.values(groupedByDate).reduce((sum, day) => sum + day.protein, 0);
    const totalCarbs = Object.values(groupedByDate).reduce((sum, day) => sum + day.carbs, 0);
    const totalFat = Object.values(groupedByDate).reduce((sum, day) => sum + day.fat, 0);
    
    const avgCalories = numDays > 0 ? Math.round(totalCalories / numDays) : 0;
    const avgProtein = numDays > 0 ? Math.round(totalProtein / numDays) : 0;
    const avgCarbs = numDays > 0 ? Math.round(totalCarbs / numDays) : 0;
    const avgFat = numDays > 0 ? Math.round(totalFat / numDays) : 0;
    
    setMetrics({
      avgCalories,
      avgProtein,
      avgCarbs,
      avgFat,
      calorieGoal,
      proteinGoal,
    });
    
    // Prepare calorie chart data
    const calorieChartData = Object.keys(groupedByDate)
      .map(date => ({
        date,
        displayDate: formatDateForDisplay(date, timeframe),
        calories: Math.round(groupedByDate[date].calories),
        goal: calorieGoal,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    setCalorieData(calorieChartData);
    
    // Prepare macro distribution chart data
    const macroChartData = Object.keys(groupedByDate)
      .map(date => ({
        date,
        displayDate: formatDateForDisplay(date, timeframe),
        protein: Math.round(groupedByDate[date].protein),
        carbs: Math.round(groupedByDate[date].carbs),
        fat: Math.round(groupedByDate[date].fat),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    setMacroData(macroChartData);
    
    // Meal type distribution
    const mealTypeCounts = foodData.reduce((acc, entry) => {
      const mealType = entry.mealType || "Other";
      if (!acc[mealType]) acc[mealType] = 0;
      acc[mealType] += 1;
      return acc;
    }, {});
    
    const mealTypeChartData = Object.entries(mealTypeCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    
    setMealTypeData(mealTypeChartData);
  };
  
  const formatDateForDisplay = (dateStr, timeframeOption) => {
    if (!dateStr) return "";
    try {
      const date = parseISO(dateStr);
      switch (timeframeOption) {
        case "day":
          return format(date, "ha");
        case "week":
          return format(date, "EEE");
        case "month":
          return format(date, "dd");
        case "6months":
          return format(date, "MMM");
        case "year":
          return format(date, "MMM");
        default:
          return format(date, "MMM d");
      }
    } catch (e) {
      return dateStr;
    }
  };

  const getDateRangeLabel = (timeframeOption, offset) => {
    const now = new Date();
    let periodText;
    
    switch (timeframeOption) {
      case "day":
        periodText = offset === 0 ? "Today" : 
                    offset === -1 ? "Yesterday" : 
                    `${Math.abs(offset)} days ago`;
        break;
      case "week":
        periodText = offset === 0 ? "This week" : 
                    offset === -1 ? "Last week" : 
                    `${Math.abs(offset)} weeks ago`;
        break;
      case "month":
        periodText = offset === 0 ? "This month" : 
                    offset === -1 ? "Last month" : 
                    `${Math.abs(offset)} months ago`;
        break;
      default:
        periodText = "Selected period";
    }
    
    return periodText;
  };
  // Colors
  const COLORS = ["#FF6B8B", "#33B2FF", "#FFD166", "#06D6A0", "#118AB2"];

  if (!foodData || !foodData.length) {
    return (
      <div className="text-center py-10 text-gray-500 dark:text-gray-400">
        <Apple className="mx-auto h-12 w-12 opacity-30 mb-3" />
        <h3 className="text-lg font-semibold mb-2">No nutrition data available</h3>
        <p>Start logging your meals to see your nutrition summary</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm dark:bg-zinc-800">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Flame className="h-8 w-8 text-orange-500 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Calories</p>
            <h3 className="text-2xl font-bold">{metrics.avgCalories}</h3>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm dark:bg-zinc-800">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Activity className="h-8 w-8 text-red-500 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Protein</p>
            <h3 className="text-2xl font-bold">{metrics.avgProtein}g</h3>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm dark:bg-zinc-800">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <BarChart2 className="h-8 w-8 text-blue-500 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Carbs</p>
            <h3 className="text-2xl font-bold">{metrics.avgCarbs}g</h3>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm dark:bg-zinc-800">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <TrendingDown className="h-8 w-8 text-yellow-500 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Fat</p>
            <h3 className="text-2xl font-bold">{metrics.avgFat}g</h3>
          </CardContent>
        </Card>
      </div>
      
      {/* Calorie Chart */}
      <Card className="border-0 shadow-sm dark:bg-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Calorie Intake</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={calorieData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#888" opacity={0.1} />
                <XAxis 
                  dataKey="displayDate" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#888', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#888', fontSize: 12 }}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: 'none',
                  }}
                  formatter={(value) => [`${value.toLocaleString()}`, value === metrics.calorieGoal ? 'Goal' : 'Calories']}
                />
                <Bar 
                  dataKey="calories" 
                  fill="#FF6B8B"
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />
                <Line 
                  type="monotone" 
                  dataKey="goal" 
                  stroke="#06D6A0"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Macronutrient charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Macro Distribution */}
        <Card className="border-0 shadow-sm dark:bg-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Macronutrient Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={macroData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#888" opacity={0.1} />
                  <XAxis 
                    dataKey="displayDate"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#888', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#888', fontSize: 12 }}
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      border: 'none',
                    }}
                    formatter={(value) => [`${value}g`, '']}
                  />
                  <Bar dataKey="protein" stackId="a" fill="#33B2FF" name="Protein" />
                  <Bar dataKey="carbs" stackId="a" fill="#FFD166" name="Carbs" />
                  <Bar dataKey="fat" stackId="a" fill="#FF6B8B" name="Fat" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Meal Type Distribution */}
        <Card className="border-0 shadow-sm dark:bg-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Meal Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mealTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {mealTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      border: 'none',
                    }}
                    formatter={(value) => [value, 'meals']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}