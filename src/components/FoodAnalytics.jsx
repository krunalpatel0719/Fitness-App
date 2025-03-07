// src/components/FoodAnalytics.jsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO, startOfWeek, eachDayOfInterval, addDays, eachWeekOfInterval, startOfMonth, eachMonthOfInterval, subMonths } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, PieChart, Pie, Cell } from "recharts";

export function FoodAnalytics({ foodData, timeframe, userMetrics }) {
  const [calorieData, setCalorieData] = useState([]);
  const [macroData, setMacroData] = useState([]);
  const [caloriesByMealData, setCaloriesByMealData] = useState([]);
  const [nutritionDistribution, setNutritionDistribution] = useState([]);
  const [dailyGoalComparison, setDailyGoalComparison] = useState([]);

  useEffect(() => {
    if (!foodData.length) return;

    processData();
  }, [foodData, timeframe]);

  const processData = () => {
    // Group data by date
    const groupedByDate = foodData.reduce((acc, entry) => {
      const date = entry.date;
      if (!acc[date]) {
        acc[date] = {
          entries: [],
          totalCalories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          breakfast: 0,
          lunch: 0,
          dinner: 0,
          snacks: 0
        };
      }
      
      acc[date].entries.push(entry);
      acc[date].totalCalories += Number(entry.calories) || 0;
      acc[date].protein += Number(entry.protein) || 0;
      acc[date].carbs += Number(entry.carbs) || 0;
      acc[date].fat += Number(entry.fat) || 0;
      
      // Track calories by meal type
      const mealType = entry.mealType?.toLowerCase() || "other";
      if (mealType === "breakfast") acc[date].breakfast += Number(entry.calories) || 0;
      else if (mealType === "lunch") acc[date].lunch += Number(entry.calories) || 0;
      else if (mealType === "dinner") acc[date].dinner += Number(entry.calories) || 0;
      else acc[date].snacks += Number(entry.calories) || 0;
      
      return acc;
    }, {});

    // Format data for charts based on timeframe
    formatChartData(groupedByDate);
  };

  const formatChartData = (groupedData) => {
    // 1. Calories per day/week/month
    const caloriesChart = Object.keys(groupedData).map(date => ({
      date,
      displayDate: formatDateForDisplay(date),
      calories: Math.round(groupedData[date].totalCalories),
      goal: userMetrics?.dailyCalories || 0
    })).sort((a, b) => a.date.localeCompare(b.date));

    // 2. Macronutrient breakdown by date
    const macrosChart = Object.keys(groupedData).map(date => ({
      date,
      displayDate: formatDateForDisplay(date),
      protein: Math.round(groupedData[date].protein),
      carbs: Math.round(groupedData[date].carbs),
      fat: Math.round(groupedData[date].fat)
    })).sort((a, b) => a.date.localeCompare(b.date));

    // 3. Calories by meal type
    const mealTypeCalories = Object.keys(groupedData).map(date => ({
      date,
      displayDate: formatDateForDisplay(date),
      Breakfast: Math.round(groupedData[date].breakfast),
      Lunch: Math.round(groupedData[date].lunch),
      Dinner: Math.round(groupedData[date].dinner),
      Snacks: Math.round(groupedData[date].snacks)
    })).sort((a, b) => a.date.localeCompare(b.date));

    // 4. Overall macro distribution for the period
    const totalProtein = macrosChart.reduce((sum, day) => sum + day.protein, 0);
    const totalCarbs = macrosChart.reduce((sum, day) => sum + day.carbs, 0);
    const totalFat = macrosChart.reduce((sum, day) => sum + day.fat, 0);
    
    const macroDistribution = [
      { name: 'Protein', value: totalProtein, color: '#8884d8' },
      { name: 'Carbs', value: totalCarbs, color: '#82ca9d' },
      { name: 'Fat', value: totalFat, color: '#ffc658' }
    ];

    // 5. Daily goal comparison
    const goalComparisonData = caloriesChart.map(day => ({
      date: day.displayDate,
      Consumed: day.calories,
      Goal: day.goal,
      Difference: day.calories - day.goal
    }));

    setCalorieData(caloriesChart);
    setMacroData(macrosChart);
    setCaloriesByMealData(mealTypeCalories);
    setNutritionDistribution(macroDistribution);
    setDailyGoalComparison(goalComparisonData);
  };

  const formatDateForDisplay = (dateStr) => {
    // Format date based on timeframe
    const date = parseISO(dateStr);
    switch (timeframe) {
      case "day":
        return format(date, "ha");
      case "week":
        return format(date, "EEE");
      case "month":
        return format(date, "dd");
      case "6months":
      case "year":
        return format(date, "MMM d");
      default:
        return format(date, "MMM d");
    }
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

  if (!foodData.length) {
    return (
      <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-white dark:bg-zinc-800 shadow-sm">
        <p className="text-lg text-gray-500 dark:text-gray-400">No food data available for the selected timeframe.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calorie Consumption vs Goal */}
      <Card className="border-0 shadow-md dark:bg-zinc-800">
        <CardHeader>
          <CardTitle>Calorie Consumption vs Goal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={calorieData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="displayDate" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} kcal`, ""]} />
                <Legend />
                <Bar dataKey="calories" name="Calories Consumed" fill="#8884d8" />
                <Bar dataKey="goal" name="Calorie Goal" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Calories by Meal Type */}
      <Card className="border-0 shadow-md dark:bg-zinc-800">
        <CardHeader>
          <CardTitle>Calories by Meal Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={caloriesByMealData} barSize={20} barGap={0}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="displayDate" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} kcal`, ""]} />
                <Legend />
                <Bar dataKey="Breakfast" stackId="a" fill="#8884d8" />
                <Bar dataKey="Lunch" stackId="a" fill="#82ca9d" />
                <Bar dataKey="Dinner" stackId="a" fill="#ffc658" />
                <Bar dataKey="Snacks" stackId="a" fill="#ff8042" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Macronutrient Tracking */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md dark:bg-zinc-800">
          <CardHeader>
            <CardTitle>Macronutrient Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={macroData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="displayDate" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}g`, ""]} />
                  <Legend />
                  <Line type="monotone" dataKey="protein" name="Protein" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="carbs" name="Carbs" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="fat" name="Fat" stroke="#ffc658" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md dark:bg-zinc-800">
          <CardHeader>
            <CardTitle>Nutrition Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={nutritionDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {nutritionDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}g`, ""]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Goal Comparison */}
      <Card className="border-0 shadow-md dark:bg-zinc-800">
        <CardHeader>
          <CardTitle>Daily Goal Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyGoalComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} kcal`, ""]} />
                <Legend />
                <Bar dataKey="Difference" name="Calories +/- Goal" fill={(data) => (data.value >= 0 ? "#ff8042" : "#82ca9d")} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}