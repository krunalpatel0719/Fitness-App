// src/components/analytics/HealthMetrics.jsx
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowUpCircle, ArrowDownCircle, Activity, Trophy } from "lucide-react";

export function HealthMetrics({ foodData, workoutData, timeframe, userMetrics, timeOffset = 0 }) {
  const [dailyCalories, setDailyCalories] = useState(0);
  const [calorieChange, setCalorieChange] = useState(0);
  const [workoutDays, setWorkoutDays] = useState(0);
  const [workoutStreak, setWorkoutStreak] = useState(0);
  const [calorieData, setCalorieData] = useState([]);
  const [workoutData2, setWorkoutData2] = useState([]);
  
  useEffect(() => {
    if (!foodData.length) {
      // Reset metrics when no data
      setDailyCalories(0);
      setCalorieChange(0);
      setCalorieData([]);
      return;
    }
    
    console.log(`Processing ${foodData.length} food entries for health metrics`);
    
    
    // Process food data
    const dailyCalorieTotal = {};
    foodData.forEach(entry => {
      const day = entry.date;
      if (!dailyCalorieTotal[day]) dailyCalorieTotal[day] = 0;
      dailyCalorieTotal[day] += Number(entry.calories) || 0;
    });
    
    // Convert to array for chart and calculations
    const sortedDays = Object.keys(dailyCalorieTotal).sort();
    const chartData = sortedDays.map(day => ({
      date: day,
      value: Math.round(dailyCalorieTotal[day])
    }));
    
    // Calculate recent average - use all data since we're already filtering by timeframe in parent
    const avgCalories = sortedDays.reduce((sum, day) => 
      sum + dailyCalorieTotal[day], 0) / Math.max(1, sortedDays.length);
    
    // No need to calculate change vs previous period as the data is already filtered
    // Just display the average for the selected period
    
    setDailyCalories(Math.round(avgCalories));
    setCalorieChange(0); // Reset change when timeframe changes
    setCalorieData(chartData);
    
  }, [foodData, timeOffset]);
  
  useEffect(() => {
    if (!workoutData.length) {
      // Reset workout metrics when no data
      setWorkoutDays(0);
      setWorkoutStreak(0);
      setWorkoutData2([]);
      return;
    }
    console.log(`Processing ${workoutData.length} workout entries for health metrics`);
  
    // Process workout data
    const workoutsByDay = {};
    let maxStreak = 0;
    
    workoutData.forEach(entry => {
      const day = entry.date;
      if (!workoutsByDay[day]) workoutsByDay[day] = [];
      workoutsByDay[day].push(entry);
    });
    
    // Calculate workout stats
    const totalWorkoutDays = Object.keys(workoutsByDay).length;
    
    // Calculate streak - within the current timeframe only
    const sortedDays = Object.keys(workoutsByDay).sort();
    if (sortedDays.length) {
      let streak = 1;
      for (let i = 1; i < sortedDays.length; i++) {
        const dateDiff = Math.abs(
          new Date(sortedDays[i]).getTime() - new Date(sortedDays[i-1]).getTime()
        ) / (1000 * 3600 * 24);
        
        if (dateDiff <= 1) {
          streak++;
        } else {
          streak = 1;
        }
        maxStreak = Math.max(maxStreak, streak);
      }
    }
    
    // Workout volume data for chart
    const volumeData = sortedDays.map(day => {
      const dailyVolume = workoutsByDay[day].reduce((sum, exercise) => 
        sum + (Number(exercise.totalVolume) || 0), 0);
      return {
        date: day,
        value: Math.round(dailyVolume)
      };
    });
    
    setWorkoutDays(totalWorkoutDays);
    setWorkoutStreak(maxStreak);
    setWorkoutData2(volumeData);
    
  }, [workoutData, timeOffset]);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Calorie Summary Card - Apple Health Style */}
        <Card className="overflow-hidden border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Daily Calories
                </p>
                <h3 className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">
                  {dailyCalories.toLocaleString()}
                </h3>
                
                <div className="flex items-center mt-2">
                  {calorieChange > 0 ? (
                    <ArrowUpCircle className="h-5 w-5 text-red-500 mr-1" />
                  ) : (
                    <ArrowDownCircle className="h-5 w-5 text-green-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    calorieChange > 0 ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {Math.abs(calorieChange)}% {calorieChange > 0 ? 'more' : 'less'} than previous period
                  </span>
                </div>
              </div>
              
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <span>{timeframe === "day" ? "24h" : 
                       timeframe === "week" ? "7d" : 
                       timeframe === "month" ? "30d" : 
                       timeframe === "6months" ? "6m" : "1y"}</span>
              </div>
            </div>
            
            <div className="h-32 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={calorieData}>
                  <XAxis dataKey="date" hide />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      border: 'none'
                    }}
                    formatter={value => [`${value} kcal`, 'Calories']}
                    labelFormatter={label => new Date(label).toLocaleDateString()}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Workout Summary Card - Apple Health Style */}
        <Card className="overflow-hidden border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Workouts
                </p>
                <h3 className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">
                  {workoutDays} days
                </h3>
                
                <div className="flex items-center mt-2">
                  <Trophy className="h-5 w-5 text-amber-500 mr-1" />
                  <span className="text-sm font-medium text-amber-500">
                    {workoutStreak} day streak
                  </span>
                </div>
              </div>
              
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Activity className="h-5 w-5 mr-1" />
                <span>{timeframe === "day" ? "24h" : 
                       timeframe === "week" ? "7d" : 
                       timeframe === "month" ? "30d" : 
                       timeframe === "6months" ? "6m" : "1y"}</span>
              </div>
            </div>
            
            <div className="h-32 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={workoutData2}>
                  <XAxis dataKey="date" hide />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      border: 'none'
                    }}
                    formatter={value => [`${value} lbs`, 'Volume']}
                    labelFormatter={label => new Date(label).toLocaleDateString()}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Goal Progress Section */}
      <Card className="overflow-hidden border-0 shadow-sm">
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">
            Daily Goals
          </h3>
          
          {userMetrics ? (
            <div className="space-y-4">
              <GoalProgressBar 
                label="Calories"
                current={dailyCalories}
                target={userMetrics.dailyCalories || 2000}
                color="#3b82f6"
              />
              
              <GoalProgressBar 
                label="Protein"
                current={foodData.length ? 
                  Math.round(foodData.reduce((sum, item) => sum + (Number(item.protein) || 0), 0) / 
                  [...new Set(foodData.map(item => item.date))].length) : 0}
                target={userMetrics.dailyProtein || 150}
                color="#8b5cf6"
                unit="g"
              />
              
              <GoalProgressBar 
                label="Workouts"
                current={workoutDays}
                target={timeframe === "week" ? 3 : 
                        timeframe === "month" ? 12 :
                        timeframe === "year" ? 156 : 1}
                color="#10b981"
                unit="days"
              />
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              Set your goals in the profile section to track your progress.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component for goal progress bars
function GoalProgressBar({ label, current, target, color, unit = "" }) {
  const percentage = Math.min(100, Math.round((current / target) * 100));
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-gray-600 dark:text-gray-400">
          {current.toLocaleString()}{unit} / {target.toLocaleString()}{unit}
        </span>
      </div>
      
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ 
            width: `${percentage}%`, 
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}