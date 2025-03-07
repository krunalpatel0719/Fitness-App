// src/components/WorkoutAnalytics.jsx
import { useState, useEffect } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

export function WorkoutAnalytics({ workoutData, timeframe }) {
  const [volumeData, setVolumeData] = useState([]);
  const [exerciseFrequencyData, setExerciseFrequencyData] = useState([]);
  const [bodyPartDistribution, setBodyPartDistribution] = useState([]);
  const [exerciseProgressData, setExerciseProgressData] = useState([]);
  const [setRepRangeData, setSetRepRangeData] = useState([]);
  const [workoutConsistencyData, setWorkoutConsistencyData] = useState([]);
  const [trainingBalanceData, setTrainingBalanceData] = useState([]);

  useEffect(() => {
    if (!workoutData.length) return;
    processWorkoutData();
  }, [workoutData, timeframe]);

  const processWorkoutData = () => {
    // Group data by date
    const groupedByDate = workoutData.reduce((acc, entry) => {
      const date = entry.date;
      if (!acc[date]) {
        acc[date] = {
          exercises: [],
          totalVolume: 0,
          exerciseCount: 0,
          totalSets: 0,
          totalReps: 0
        };
      }
      
      acc[date].exercises.push(entry);
      acc[date].totalVolume += Number(entry.totalVolume) || 0;
      acc[date].exerciseCount += 1;
      acc[date].totalSets += entry.sets?.length || 0;
      acc[date].totalReps += entry.sets?.reduce((sum, set) => sum + (Number(set.reps) || 0), 0) || 0;
      
      return acc;
    }, {});

    // Exercise frequency
    const exerciseFrequency = workoutData.reduce((acc, entry) => {
      const name = entry.name;
      if (!acc[name]) acc[name] = 0;
      acc[name] += 1;
      return acc;
    }, {});

    // Exercise by body part
    const bodyParts = workoutData.reduce((acc, entry) => {
      const bodyPart = entry.bodyPart || "Other";
      if (!acc[bodyPart]) acc[bodyPart] = 0;
      acc[bodyPart] += 1;
      return acc;
    }, {});

    // Rep ranges
    const repRanges = workoutData.flatMap(exercise => 
      exercise.sets?.map(set => ({
        reps: set.reps,
        weight: set.weight
      })) || []
    ).reduce((acc, set) => {
      const reps = Number(set.reps);
      const bracket = 
        reps <= 5 ? "1-5" : 
        reps <= 8 ? "6-8" : 
        reps <= 12 ? "9-12" : 
        "13+";
      
      if (!acc[bracket]) acc[bracket] = 0;
      acc[bracket] += 1;
      return acc;
    }, {});

    // Calculate workout consistency score (days worked out / total days in timeframe)
    const uniqueDates = Object.keys(groupedByDate);
    const consistencyData = uniqueDates.map(date => ({
      date,
      displayDate: formatDateForDisplay(date),
      exercises: groupedByDate[date].exerciseCount,
      volume: groupedByDate[date].totalVolume,
      sets: groupedByDate[date].totalSets
    })).sort((a, b) => a.date.localeCompare(b.date));

    // Exercise progress over time
    const exerciseProgress = [];

    // Process each common exercise
    commonExercises.forEach((exerciseName) => {
    const exerciseEntries = workoutData
        .filter(entry => entry.name === exerciseName && entry.sets && entry.sets.length > 0)
        .sort((a, b) => a.date.localeCompare(b.date));
        
    exerciseEntries.forEach(entry => {
        try {
        // Find max weight for this exercise session
        const maxWeight = entry.sets.reduce(
            (max, set) => Math.max(max, Number(set.weight) || 0),
            0
        );
        
        if (maxWeight > 0) {
            exerciseProgress.push({
            date: entry.date,
            displayDate: formatDateForDisplay(entry.date),
            weight: maxWeight,
            exercise: exerciseName
            });
        }
        } catch (err) {
        console.warn(`Error processing exercise data for ${exerciseName}:`, err);
        }
    });
    });

    setExerciseProgressData(exerciseProgress);

    // Training balance data (Push/Pull/Legs or whatever categories you use)
    const trainingCategories = {
      "Push": ["Chest", "Shoulders", "Triceps"],
      "Pull": ["Back", "Biceps", "Forearms"],
      "Legs": ["Legs", "Quadriceps", "Hamstrings", "Calves"],
      "Core": ["Abs", "Core", "Lower back"]
    };

    const trainingDistribution = workoutData.reduce((acc, entry) => {
      const bodyPart = entry.bodyPart || "Other";
      let category = "Other";

      // Assign category based on body part
      Object.entries(trainingCategories).forEach(([cat, parts]) => {
        if (parts.some(part => bodyPart.toLowerCase().includes(part.toLowerCase()))) {
          category = cat;
        }
      });
      
      if (!acc[category]) acc[category] = 0;
      acc[category] += 1;
      
      return acc;
    }, {});

    // Format data for charts
    const volumeChartData = Object.keys(groupedByDate).map(date => ({
      date,
      displayDate: formatDateForDisplay(date),
      volume: Math.round(groupedByDate[date].totalVolume),
      exercises: groupedByDate[date].exerciseCount,
      sets: groupedByDate[date].totalSets
    })).sort((a, b) => a.date.localeCompare(b.date));

    const exerciseFrequencyChartData = Object.entries(exerciseFrequency)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 exercises

    const bodyPartChartData = Object.entries(bodyParts)
      .map(([part, count]) => ({ name: part, value: count }));

    const repRangeChartData = Object.entries(repRanges)
      .map(([range, count]) => ({ name: range, count }))
      .sort((a, b) => {
        const rangeOrder = ["1-5", "6-8", "9-12", "13+"];
        return rangeOrder.indexOf(a.name) - rangeOrder.indexOf(b.name);
      });

    const trainingBalanceChartData = Object.entries(trainingDistribution)
      .map(([category, count]) => ({ category, count }));

    // Update state with processed data
    setVolumeData(volumeChartData);
    setExerciseFrequencyData(exerciseFrequencyChartData);
    setBodyPartDistribution(bodyPartChartData);
    setExerciseProgressData(exerciseProgress);
    setSetRepRangeData(repRangeChartData);
    setWorkoutConsistencyData(consistencyData);
    setTrainingBalanceData(trainingBalanceChartData);
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

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (!workoutData.length) {
    return (
      <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-white dark:bg-zinc-800 shadow-sm">
        <p className="text-lg text-gray-500 dark:text-gray-400">No workout data available for the selected timeframe.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Workout Volume, Exercise Count and Sets */}
      <Card className="border-0 shadow-md dark:bg-zinc-800">
        <CardHeader>
          <CardTitle>Workout Metrics Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="displayDate" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="volume" name="Volume (lbs)" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line yAxisId="right" type="monotone" dataKey="exercises" name="Exercise Count" stroke="#82ca9d" />
                <Line yAxisId="right" type="monotone" dataKey="sets" name="Set Count" stroke="#ffc658" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Progress Over Time */}
      <Card className="border-0 shadow-md dark:bg-zinc-800">
  <CardHeader>
    <CardTitle>Exercise Progress (Max Weight)</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        {exerciseProgressData.length > 0 ? (
          <LineChart 
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="displayDate" 
              type="category"
              allowDuplicatedCategory={false}
            />
            <YAxis />
            <Tooltip formatter={(value) => [`${value} lbs`, ""]} />
            <Legend />
            {exerciseProgressData
              .map(item => item.exercise)
              .filter((value, index, self) => self.indexOf(value) === index)
              .map((exercise, index) => {
                // Get data for this specific exercise
                const data = exerciseProgressData
                  .filter(item => item.exercise === exercise)
                  .sort((a, b) => a.date.localeCompare(b.date));
                
                return (
                  <Line
                    key={exercise}
                    type="monotone"
                    data={data}
                    dataKey="weight"
                    name={exercise}
                    stroke={COLORS[index % COLORS.length]}
                    dot={{ stroke: COLORS[index % COLORS.length], strokeWidth: 1, r: 4 }}
                    activeDot={{ r: 6, stroke: COLORS[index % COLORS.length] }}
                    isAnimationActive={false}
                    connectNulls
                  />
                );
              })}
          </LineChart>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            Not enough exercise data to show progress
          </div>
        )}
      </ResponsiveContainer>
    </div>
  </CardContent>
</Card>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Most Frequent Exercises */}
        <Card className="border-0 shadow-md dark:bg-zinc-800">
          <CardHeader>
            <CardTitle>Most Frequent Exercises</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={exerciseFrequencyData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Frequency" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Body Part Distribution */}
        <Card className="border-0 shadow-md dark:bg-zinc-800">
          <CardHeader>
            <CardTitle>Body Part Focus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bodyPartDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {bodyPartDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} exercises`, ""]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* More Analysis Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rep Range Distribution */}
        <Card className="border-0 shadow-md dark:bg-zinc-800">
          <CardHeader>
            <CardTitle>Rep Range Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={setRepRangeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} sets`, ""]} />
                  <Legend />
                  <Bar dataKey="count" name="Number of Sets" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Training Balance */}
        <Card className="border-0 shadow-md dark:bg-zinc-800">
          <CardHeader>
            <CardTitle>Training Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={90} data={trainingBalanceData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                  <Radar 
                    name="Exercise Focus" 
                    dataKey="count" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.6} 
                  />
                  <Tooltip formatter={(value) => [`${value} exercises`, ""]} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Volume Progression Over Time */}
      <Card className="border-0 shadow-md dark:bg-zinc-800">
        <CardHeader>
          <CardTitle>Volume Progression</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="displayDate" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} lbs`, ""]} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="volume" 
                  name="Total Volume" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.3} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}