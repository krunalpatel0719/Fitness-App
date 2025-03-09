"use client";
import { useState, useEffect } from "react";
import { format, parseISO, differenceInDays } from "date-fns";
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
import {MetricCard} from './MetricCard'
import { Badge } from "@/components/ui/badge";
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

// Constants
const VOLUME_COLOR = "#3b82f6"; // blue
const FREQUENCY_COLOR = "#8b5cf6"; // purple
const STRENGTH_COLOR = "#ef4444"; // red
const ENDURANCE_COLOR = "#10b981"; // green
const CONSISTENCY_COLOR = "#f59e0b"; // amber

const muscleGroupColors = {
  Chest: "#ef4444", // red
  Back: "#f97316", // orange
  Legs: "#10b981", // green
  Shoulders: "#3b82f6", // blue
  Arms: "#8b5cf6", // purple
  Core: "#ec4899", // pink
  Cardio: "#64748b", // slate
  Other: "#6b7280", // gray
};

// Helper functions
const fillMissingDates = (data, dateRange) => {
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
      result.push({
        date: dateStr,
        totalVolume: 0,
        exercises: 0,
        sets: 0,
        muscleGroups: {},
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

const getTrendInfo = (value) => {
  if (value > 5)
    return {
      color: "text-green-500",
      icon: <ArrowUpIcon className="w-4 h-4" />,
    };
  if (value < -5)
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
      dailyTotals[date] = { volume: 0, exercises: 0, sets: 0, days: 0 };
    }
    dailyTotals[date].volume += Number(entry.totalVolume || 0);
    dailyTotals[date].exercises += entry.exercisesCount || 0;
    dailyTotals[date].sets += entry.totalSets || 0;
    dailyTotals[date].days = dailyTotals[date].volume > 0 ? 1 : 0;
  });

  const days = Object.keys(dailyTotals).length || 1;
  const workoutDays = Object.values(dailyTotals).reduce((sum, day) => sum + day.days, 0);

  const totalVolume = Object.values(dailyTotals).reduce(
    (sum, day) => sum + day.volume,
    0
  );

  const totalExercises = Object.values(dailyTotals).reduce(
    (sum, day) => sum + day.exercises,
    0
  );

  const totalSets = Object.values(dailyTotals).reduce(
    (sum, day) => sum + day.sets,
    0
  );

  return {
    avgVolume: totalVolume / Math.max(workoutDays, 1),
    avgExercises: totalExercises / Math.max(workoutDays, 1),
    avgSets: totalSets / Math.max(workoutDays, 1),
    frequency: (workoutDays / days) * 100,
    totalDays: days,
    workoutDays
  };
};

const categorizeExercise = (exerciseName) => {
  exerciseName = exerciseName.toLowerCase(); 
  
  if (/bench|chest|push[ -]?up|fly|press|dip/.test(exerciseName)) return "Chest";
  if (/back|row|pull[ -]?up|pulldown|deadlift|lat/.test(exerciseName)) return "Back";
  if (/squat|leg|calf|lunge|hamstring|quad|glute/.test(exerciseName)) return "Legs";
  if (/shoulder|delt|military|overhead|press|shrug/.test(exerciseName)) return "Shoulders";
  if (/bicep|tricep|curl|extension|arm/.test(exerciseName)) return "Arms";
  if (/ab|core|crunch|sit[ -]?up|plank/.test(exerciseName)) return "Core";
  if (/run|jog|sprint|cardio|bike|cycling|treadmill|elliptical|rowing/.test(exerciseName)) return "Cardio";
  
  return "Other";
};

const simplifyMuscleGroups = (entry) => {
  const muscleToGroupMapping = {
    // Core muscles
    "abdominals": "Core",
    "obliques": "Core",
    "abs": "Core",
    
    // Leg/Hip muscles
    "quadriceps": "Legs",
    "hamstrings": "Legs",
    "calves": "Legs",
    "glutes": "Legs",
    "abductors": "Legs",
    "adductors": "Legs",
    
    // Chest muscles
    "chest": "Chest",
    "pectorals": "Chest",
    
    // Back muscles
    "lats": "Back",
    "middle back": "Back",
    "lower back": "Back",
    "traps": "Back",
    "trapezius": "Back",
    "erector spinae": "Back",
    "rhomboids": "Back",
    
    // Shoulder muscles
    "shoulders": "Shoulders",
    "deltoids": "Shoulders",
    
    // Arm muscles
    "biceps": "Arms",
    "triceps": "Arms",
    "forearms": "Arms",
    "brachialis": "Arms"
  };

  if (!entry.primaryMuscles?.length && !entry.secondaryMuscles?.length) {
    return categorizeExercise(entry.name);
  }
  
  if (entry.primaryMuscles?.length) {
    const primaryMuscle = entry.primaryMuscles[0].toLowerCase();
    const muscleGroup = muscleToGroupMapping[primaryMuscle];
    
    if (muscleGroup) {
      return muscleGroup;
    }
  }
  
  if (entry.secondaryMuscles?.length) {
    for (const muscle of entry.secondaryMuscles) {
      const muscleGroup = muscleToGroupMapping[muscle.toLowerCase()];
      if (muscleGroup) {
        return muscleGroup;
      }
    }
  }
  
  return categorizeExercise(entry.name);
};




const extractHourFromWorkoutEntry = (entry) => {
  if (entry.createdAt) {
    let timestamp = entry.createdAt;

    if (timestamp && typeof timestamp === "object" && timestamp.toDate) {
      timestamp = timestamp.toDate();
    }

    if (typeof timestamp === "string") {
      timestamp = new Date(timestamp);
    }

    if (timestamp instanceof Date && !isNaN(timestamp.getTime())) {
      return timestamp.getHours();
    }
  }

  return new Date().getHours();
};

const processDayViewWorkoutData = (exerciseData, selectedDay) => {
  const hourlyData = {};
  for (let i = 0; i < 24; i++) {
    hourlyData[i] = { hour: i, volume: 0 };
  }

  const validEntries = exerciseData.filter(
    (entry) => entry && typeof entry === "object" && entry.date === selectedDay
  );

  validEntries.forEach((entry) => {
    try {
      const hour = extractHourFromWorkoutEntry(entry);
      const safeHour = Math.max(0, Math.min(23, hour));

      const volumeValue = Number(entry.totalVolume || 0);
      if (!isNaN(volumeValue)) {
        hourlyData[safeHour].volume += volumeValue;
      }
    } catch (err) {
      console.error("Error processing workout entry:", err);
    }
  });

  return Object.values(hourlyData)
    .map((hourData) => ({
      hour: hourData.hour,
      date: selectedDay,
      displayDate: format(new Date().setHours(hourData.hour, 0, 0, 0), "ha"),
      volume: Math.round(hourData.volume),
    }))
    .filter((item) => item.volume > 0); 
};


export function WorkoutMetrics({
  exerciseData,
  timeframe,
  dateRange,
  userMetrics,
}) {
  const [weeklyVolumeTarget, setWeeklyVolumeTarget] = useState(10000);
  const [weeklyWorkoutTarget, setWeeklyWorkoutTarget] = useState(4);
  
  const [dailyMetrics, setDailyMetrics] = useState([]);
  const [volumeByDay, setVolumeByDay] = useState([]);
  const [dailyAvgVolume, setDailyAvgVolume] = useState(0);
  const [workoutDays, setWorkoutDays] = useState(0);
  const [totalDays, setTotalDays] = useState(0);

  const [muscleGroupDistribution, setMuscleGroupDistribution] = useState([]);
  const [topExercises, setTopExercises] = useState([]);
  const [exerciseCountByType, setExerciseCountByType] = useState([]);
  
  const [volumeTrend, setVolumeTrend] = useState(0);

  const [hasCurrentPeriodData, setHasCurrentPeriodData] = useState(true);
  
  const { color: volumeTrendColor, icon: volumeTrendIcon } = getTrendInfo(volumeTrend);

  const getAverageLabel = () => {
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

  const extractTimePeriods = () => {
    const currentPeriodStart = new Date(dateRange.start);
    const currentPeriodEnd = new Date(dateRange.end);
    const currStartStr = format(currentPeriodStart, "yyyy-MM-dd");
    const currEndStr = format(currentPeriodEnd, "yyyy-MM-dd");

    let prevStartStr, prevEndStr;

    if (timeframe === "day") {
      const previousDay = new Date(currentPeriodStart);
      previousDay.setDate(previousDay.getDate() - 1);
      prevStartStr = prevEndStr = format(previousDay, "yyyy-MM-dd");
    } else {
      const msPerDay = 24 * 60 * 60 * 1000;
      const daysDiff = Math.round(
        (currentPeriodEnd - currentPeriodStart) / msPerDay
      );

      const previousPeriodEnd = new Date(currentPeriodStart);
      previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);

      const previousPeriodStart = new Date(previousPeriodEnd);
      previousPeriodStart.setDate(previousPeriodStart.getDate() - daysDiff);

      prevStartStr = format(previousPeriodStart, "yyyy-MM-dd");
      prevEndStr = format(previousPeriodEnd, "yyyy-MM-dd");
    }

    const currentPeriodData = exerciseData.filter(
      (entry) => entry.date >= currStartStr && entry.date <= currEndStr
    );

    const previousPeriodData = exerciseData.filter(
      (entry) => entry.date >= prevStartStr && entry.date <= prevEndStr
    );

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
    if (!exerciseData?.length || !dateRange.start || !dateRange.end) {
      return { volumeTrend: 0 };
    }

    const { currentPeriodData, previousPeriodData } = extractTimePeriods();

    const currentMetrics = calculatePeriodMetrics(currentPeriodData);
    const previousMetrics = calculatePeriodMetrics(previousPeriodData);

    // Calculate trends
    const volumeTrend = calculateTrend(
      currentMetrics.avgVolume,
      previousMetrics.avgVolume,
      10
    );

    return {
      volumeTrend,
    };
  };

  const prepareDataByDate = () => {
    const groupedByDate = exerciseData.reduce((acc, entry) => {
      const date = entry.date;
      if (!acc[date]) {
        acc[date] = {
          date,
          totalVolume: 0,
          exercises: new Set(),
          exercisesCount: 0,
          totalSets: 0,
          muscleGroups: {},
        };
      }
  
      const muscleGroup = simplifyMuscleGroups(entry);
      
      if (!acc[date].muscleGroups[muscleGroup]) acc[date].muscleGroups[muscleGroup] = 0;
      
      const volume = Number(entry.totalVolume || 0);
      acc[date].totalVolume += volume;
      acc[date].muscleGroups[muscleGroup] += volume;
      
      acc[date].exercises.add(entry.name);
      acc[date].exercisesCount = acc[date].exercises.size;
      
      acc[date].totalSets += entry.sets?.length || 0;
  
      return acc;
    }, {});
  
    const sortedDailyData = Object.values(groupedByDate)
      .sort((a, b) => parseISO(a.date) - parseISO(b.date));
  
    const filledDailyData = fillMissingDates(sortedDailyData, dateRange);
    
    return { sortedDailyData, filledDailyData };
  };
  
  const prepareVolumeData = (filledDailyData) => {
    if (timeframe === "day") {
      const selectedDay = format(new Date(dateRange.start), "yyyy-MM-dd");
      return processDayViewWorkoutData(exerciseData, selectedDay);
    }
    
    return filledDailyData.map(day => ({
      date: day.date,
      displayDate: formatDisplayDate(day.date, timeframe),
      volume: Math.round(day.totalVolume),
    }));
  };

  const processExerciseData = () => {
    if (!exerciseData || !exerciseData.length) return;

    const { sortedDailyData, filledDailyData } = prepareDataByDate();
    const volumeData = prepareVolumeData(filledDailyData);

    const currentPeriodStart = format(new Date(dateRange.start), "yyyy-MM-dd");
    const currentPeriodEnd = format(new Date(dateRange.end), "yyyy-MM-dd");

    const currentPeriodData = sortedDailyData.filter(
      (day) => day.date >= currentPeriodStart && day.date <= currentPeriodEnd
    );

    setHasCurrentPeriodData(currentPeriodData.length > 0);

    const { avgVolume, frequency, workoutDays, totalDays } = calculatePeriodMetrics(currentPeriodData);
    
    const muscleGroups = {};
    currentPeriodData.forEach(day => {
      Object.entries(day.muscleGroups || {}).forEach(([group, volume]) => {
        if (!muscleGroups[group]) muscleGroups[group] = 0;
        muscleGroups[group] += volume;
      });
    });
    
    const muscleGroupData = Object.entries(muscleGroups)
      .map(([name, volume]) => ({ name, volume }))
      .sort((a, b) => b.volume - a.volume);
      
    const exerciseMap = {};
    exerciseData
      .filter(entry => entry.date >= currentPeriodStart && entry.date <= currentPeriodEnd)
      .forEach(exercise => {
        const name = exercise.name;
        if (!exerciseMap[name]) {
          exerciseMap[name] = {
            name,
            totalVolume: 0,
            count: 0,
            muscleGroup: simplifyMuscleGroups(exercise), 
          };
        }
        exerciseMap[name].totalVolume += Number(exercise.totalVolume || 0);
        exerciseMap[name].count++;
      });
    
    const topExercisesData = Object.values(exerciseMap)
      .sort((a, b) => b.totalVolume - a.totalVolume)
      .slice(0, 5);
    
    const { volumeTrend } = calculatePeriodComparison();
    
    setDailyMetrics(sortedDailyData);
    setVolumeByDay(volumeData);
    setDailyAvgVolume(Math.round(avgVolume));
    setWorkoutDays(workoutDays);
    setTotalDays(totalDays);
    setMuscleGroupDistribution(muscleGroupData);
    setTopExercises(topExercisesData);
    setVolumeTrend(volumeTrend);
  };
  
  useEffect(() => {
    if (!exerciseData || !exerciseData.length) return;
    processExerciseData();
  }, [exerciseData, timeframe, dateRange]);

  const renderBarTooltip = (props) => {
    const { active, payload } = props;

    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-zinc-800 p-2 border border-gray-200 dark:border-zinc-700 rounded-md shadow-md">
          <p className="font-medium dark:text-white">
            {payload[0].payload.displayDate}
          </p>
          <p className="text-sm text-blue-500">
            Volume: <span className="font-semibold">{payload[0].value.toLocaleString()}</span>
          </p>
        </div>
      );
    }
    return null;
  };
  

  if (!exerciseData.length || !hasCurrentPeriodData) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-md dark:bg-zinc-800">
          <CardHeader className="pb-2 dark:text-white">
            <CardTitle>No Workout Data Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 dark:text-gray-400">
              {exerciseData.length === 0
                ? "Start logging your workouts to see fitness analytics. Track your exercises, sets, reps and weights."
                : `No workout data available for the selected time period. Try selecting a different date range.`}
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
        {/* Workout Volume Card */}
        <MetricCard
              value={dailyAvgVolume}
              label="volume"
              unit=""
              percentage={100}
              trend={volumeTrend}
              timeframe={timeframe}
              averageLabel={getAverageLabel(timeframe)}
              goalText={`${workoutDays} workout ${workoutDays === 1 ? 'day' : 'days'} in this period`}
              color={VOLUME_COLOR}
            />
        </div>
        
        {/* <Card className="border-0 shadow-md dark:bg-zinc-800">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 mb-4">
                <CircularProgressbarWithChildren
                  value={100}
                  styles={buildStyles({
                    pathColor: VOLUME_COLOR,
                    trailColor: "#000000",
                    textSize: "12px",
                  })}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold dark:text-white">
                      {dailyAvgVolume.toLocaleString()}
                    </span>
                    <span className="capitalize text-xs text-gray-500 dark:text-gray-400 pt-1">
                      volume
                    </span>
                  </div>
                </CircularProgressbarWithChildren>
              </div>
              <div className="text-center">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {getAverageLabel()}
                </h3>
                <div className="flex items-center justify-center mt-1">
                  {volumeTrend !== 0 ? (
                    <>
                      <span
                        className={`text-xs font-semibold ${volumeTrendColor} flex items-center`}
                      >
                        {volumeTrendIcon}
                        {Math.abs(volumeTrend)}%
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
                  {workoutDays} workout {workoutDays === 1 ? 'day' : 'days'} in this period
                </div>
              </div>
            </div>
          </CardContent>
        </Card> */}

      <Card className="border-0 shadow-md dark:bg-zinc-800">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center dark:text-white pb-2">
            <CardTitle>Workout Volume</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={volumeByDay}
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
                  tickFormatter={(value) => (value === 0 ? "" : value.toLocaleString())}
                />
                <Tooltip content={renderBarTooltip} />
                <Bar
                  dataKey="volume"
                  fill={VOLUME_COLOR}
                  radius={[4, 4, 0, 0]}
                  label={false}
                >
                  {volumeByDay.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.volume > 0 ? VOLUME_COLOR : "#e5e7eb"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Muscle Group Distribution & Top Exercises */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md dark:bg-zinc-800 dark:text-white">
          <CardHeader className="pb-2">
            <CardTitle>Muscle Group Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <div className="w-72 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={muscleGroupDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      innerRadius={60}
                      fill="#8884d8"
                      dataKey="volume"
                      paddingAngle={5}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {muscleGroupDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={muscleGroupColors[entry.name] || muscleGroupColors.Other}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex flex-wrap justify-center mt-4 gap-3">
              {muscleGroupDistribution.slice(0, 4).map((group, index) => (
                <div key={index} className="text-center">
                  <div
                    className="h-3 w-3 rounded-full mx-auto mb-1"
                    style={{
                      backgroundColor: muscleGroupColors[group.name] || muscleGroupColors.Other,
                    }}
                  ></div>
                  <div className="text-sm dark:text-gray-200">{group.name}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md dark:bg-zinc-800 dark:text-white">
          <CardHeader className="pb-4">
            <CardTitle>Top Exercises</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topExercises.slice(0, 5).map((exercise, i) => (
                <div key={i} className="flex items-center">
                  <div 
                    className="h-8 w-1 rounded-full mr-3 flex-shrink-0" 
                    style={{ backgroundColor: muscleGroupColors[exercise.muscleGroup] }}
                  ></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium dark:text-white text-sm">
                        {exercise.name}
                      </span>
                      <span className="text-sm dark:text-gray-400">
                        {exercise.totalVolume.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, (exercise.totalVolume / topExercises[0].totalVolume) * 100)}%`,
                          backgroundColor: muscleGroupColors[exercise.muscleGroup]
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
              
              {topExercises.length === 0 && (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                  No exercise data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}