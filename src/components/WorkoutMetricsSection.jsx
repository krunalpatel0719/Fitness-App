// src/components/MetricSection.jsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";


import {

  LuDumbbell,
  LuChartColumn,
  LuTarget,
 
} from "react-icons/lu";
import { CalendarHeader } from "@/components/CalendarHeader";

export function WorkoutMetricsSection({
  selectedDate,
  setSelectedDate,
  totalVolume,
  totalExercise,
  totalSets,
}) {
  

  

  return (
    <>
      {/* Date Navigation Header */}

      <CalendarHeader
        title="Workouts"
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />

      {/* Cards: Daily Goal and Daily Progress */}
      <div className="grid gap-6 md:gap-10 md:grid-cols-3">
        {/* Total Volume */}
        <Card className="border-0 bg-white dark:bg-zinc-800 rounded-xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between ">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white ">
              Total Volume
            </CardTitle>
            <LuChartColumn className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {totalVolume}
              <span className="text-lg ml-1 font-semibold text-gray-500 dark:text-gray-400 ">
                lbs
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Total Exercises Card */}
        <Card className="border-0 bg-white dark:bg-zinc-800 rounded-xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white ">
              Exercises
            </CardTitle>
            <LuDumbbell className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {totalExercise}
              <span className="text-lg font-semibold ml-1 text-gray-500 dark:text-gray-400">
                total
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Total Sets Card */}
        <Card className="border-0 bg-white dark:bg-zinc-800 rounded-xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between ">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white ">
              Total Sets
            </CardTitle>
            <LuTarget className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {totalSets}
              <span className="text-lg ml-1 font-semibold text-gray-500 dark:text-gray-400 ">
                sets
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
