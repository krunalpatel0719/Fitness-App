// src/components/analytics/WorkoutSummary.jsx
"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  Dumbbell,
  TrendingUp,
  Calendar,
  Clock,
  BarChart2,
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
} from "recharts";
import { format, parseISO } from "date-fns";

export function WorkoutSummary({ workoutData, timeframe, timeOffset = 0 }) {
  const [metrics, setMetrics] = useState({
    totalWorkouts: 0,
    totalVolume: 0,
    totalSets: 0,
    avgWorkoutDuration: 0,
    mostFrequentExercise: "",
    mostTrainedMuscle: "",
  });
  
  const [volumeData, setVolumeData] = useState([]);
  const [exerciseData, setExerciseData] = useState([]);
  const [bodyPartData, setBodyPartData] = useState([]);

  useEffect(() => {
    if (!workoutData || !workoutData.length) {
      setMetrics({
        totalWorkouts: 0,
        totalVolume: 0,
        totalSets: 0,
        avgWorkoutDuration: 0,
        mostFrequentExercise: "",
        mostTrainedMuscle: "",
        currentPeriod: getTimeframeLabel(timeframe, timeOffset)
      });
      setVolumeData([]);
      setExerciseData([]);
      setBodyPartData([]);
      return;
    }
    processWorkoutData();
  }, [workoutData, timeframe, timeOffset]);

  const getTimeframeLabel = (tf, offset) => {
    if (offset === 0) {
      switch (tf) {
        case "day": return "Today";
        case "week": return "This week";
        case "month": return "This month";
        case "6months": return "Last 6 months";
        case "year": return "This year";
        default: return "Current period";
      }
    } else {
      const absOffset = Math.abs(offset);
      switch (tf) {
        case "day": return `${absOffset} ${absOffset === 1 ? 'day' : 'days'} ago`;
        case "week": return `${absOffset} ${absOffset === 1 ? 'week' : 'weeks'} ago`;
        case "month": return `${absOffset} ${absOffset === 1 ? 'month' : 'months'} ago`;
        case "6months": return `${absOffset * 6} months ago`;
        case "year": return `${absOffset} ${absOffset === 1 ? 'year' : 'years'} ago`;
        default: return `${absOffset} periods ago`;
      }
    }
  };

  const processWorkoutData = () => {
    // Add period label based on timeOffset
    console.log(`Processing ${workoutData.length} workout entries for ${timeframe} view with offset ${timeOffset}`);
  
    const currentPeriod = getTimeframeLabel(timeframe, timeOffset);
    const groupedByDate = workoutData.reduce((acc, entry) => {
      const date = entry.date;
      if (!acc[date]) {
        acc[date] = {
          exercises: [],
          totalVolume: 0,
          exerciseCount: 0,
          totalSets: 0,
        };
      }
      
      acc[date].exercises.push(entry);
      acc[date].totalVolume += Number(entry.totalVolume) || 0;
      acc[date].exerciseCount += 1;
      acc[date].totalSets += entry.sets?.length || 0;
      
      return acc;
    }, {});

   
    // Calculate overall metrics
    const totalWorkouts = Object.keys(groupedByDate).length;
    const totalVolume = workoutData.reduce((sum, entry) => sum + (Number(entry.totalVolume) || 0), 0);
    const totalSets = workoutData.reduce((sum, entry) => sum + (entry.sets?.length || 0), 0);
    
    // Calculate average workout duration (if available in data)
    let avgDuration = 0;
    if (workoutData[0] && workoutData[0].duration) {
      avgDuration = workoutData.reduce((sum, entry) => sum + (Number(entry.duration) || 0), 0) / totalWorkouts;
    }
    
    // Find most frequent exercise
    const exerciseCounts = workoutData.reduce((acc, entry) => {
      const name = entry.name;
      if (!acc[name]) acc[name] = 0;
      acc[name] += 1;
      return acc;
    }, {});
    
    const mostFrequentExercise = Object.entries(exerciseCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name)[0] || "";
    
    // Find most trained muscle group
    const bodyPartCounts = workoutData.reduce((acc, entry) => {
      const bodyPart = entry.bodyPart || "Other";
      if (!acc[bodyPart]) acc[bodyPart] = 0;
      acc[bodyPart] += 1;
      return acc;
    }, {});
    
    const mostTrainedMuscle = Object.entries(bodyPartCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name)[0] || "";
    
      setMetrics({
        totalWorkouts,
        totalVolume,
        totalSets,
        avgWorkoutDuration: avgDuration,
        mostFrequentExercise,
        mostTrainedMuscle,
        currentPeriod // Add this to metrics
      });
    
    // Prepare chart data
    
    // Volume over time
    const volumeChartData = Object.keys(groupedByDate)
      .map(date => ({
        date,
        displayDate: formatDateForDisplay(date, timeframe),
        volume: Math.round(groupedByDate[date].totalVolume),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    setVolumeData(volumeChartData);
    
    // Top exercises
    const exerciseChartData = Object.entries(exerciseCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    setExerciseData(exerciseChartData);
    
    // Body part distribution
    const bodyPartChartData = Object.entries(bodyPartCounts)
      .map(([part, count]) => ({ name: part, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    
    setBodyPartData(bodyPartChartData);
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
  
  // Colors
  const COLORS = ["#FF6B8B", "#33B2FF", "#FFD166", "#06D6A0", "#118AB2"];

  if (!workoutData || !workoutData.length) {
    return (
      <div className="text-center py-10 text-gray-500 dark:text-gray-400">
        <Dumbbell className="mx-auto h-12 w-12 opacity-30 mb-3" />
        <h3 className="text-lg font-semibold mb-2">No workout data available</h3>
        <p>Start logging your workouts to see your progress</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="text-sm text-gray-500 dark:text-gray-400 italic">
        Showing data for: {metrics.currentPeriod || getTimeframeLabel(timeframe, timeOffset)}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm dark:bg-zinc-800">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Dumbbell className="h-8 w-8 text-blue-500 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Workouts</p>
            <h3 className="text-2xl font-bold">{metrics.totalWorkouts}</h3>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm dark:bg-zinc-800">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <TrendingUp className="h-8 w-8 text-green-500 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Volume</p>
            <h3 className="text-2xl font-bold">{metrics.totalVolume.toLocaleString()} lbs</h3>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm dark:bg-zinc-800">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <BarChart2 className="h-8 w-8 text-purple-500 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Sets</p>
            <h3 className="text-2xl font-bold">{metrics.totalSets}</h3>
          </CardContent>
        </Card>
      </div>
      
      {/* Volume Chart */}
      <Card className="border-0 shadow-sm dark:bg-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Total Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={volumeData}>
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
                  formatter={(value) => [`${value.toLocaleString()} lbs`, 'Volume']}
                />
                <Line 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="#33B2FF" 
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
                  activeDot={{ r: 6, stroke: '#33B2FF', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Exercise distribution and muscle groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Exercises */}
        <Card className="border-0 shadow-sm dark:bg-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Top Exercises</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={exerciseData}
                  layout="vertical"
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#888" opacity={0.1} />
                  <XAxis 
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#888', fontSize: 12 }}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#888', fontSize: 12 }}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      border: 'none',
                    }}
                    formatter={(value) => [value, 'Times performed']}
                  />
                  <Bar dataKey="count" fill="#FF6B8B" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Body Part Focus */}
        <Card className="border-0 shadow-sm dark:bg-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Muscle Group Focus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bodyPartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {bodyPartData.map((entry, index) => (
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
                    formatter={(value) => [value, 'exercises']}
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