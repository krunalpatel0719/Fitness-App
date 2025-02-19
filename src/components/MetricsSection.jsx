
// src/components/MetricSection.jsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ProgressBar";
import { format, subDays, addDays } from "date-fns";

export function MetricsSection({ selectedDate, setSelectedDate, userMetrics, caloriesConsumed }) {
  return (
    <>
      <Card className="dark:bg-zinc-800">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setSelectedDate(subDays(selectedDate, 1))}
              className="h-8 w-20 text-xs sm:text-sm sm:h-auto sm:w-auto dark:hover:bg-zinc-400 dark:hover:border-zinc-400 dark:text-gray-800 hover:text-white"
            >
              Previous Day
            </Button>
            <div className="flex flex-col items-center">
              <span className="text-lg md:text-2xl font-semibold dark:text-white">
                {format(selectedDate, "EEEE")}
              </span>
              <span className="text-sm md:text-md dark:text-gray-300">
                {format(selectedDate, "MMMM d, yyyy")}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              className="h-8 w-20 text-xs sm:text-sm sm:h-auto sm:w-auto dark:hover:bg-zinc-400 dark:hover:border-zinc-400 dark:text-gray-800 hover:text-white"
            >
              Next Day
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="dark:bg-zinc-800">
          <CardHeader>
            <CardTitle className="text-gray-800 dark:text-white text-lg md:text-xl">
              Daily Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400 md:text-4xl">
              {userMetrics.dailyCalories}
              <span className="text-sm ml-2 dark:text-gray-300 md:text-base">
                kcal
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-zinc-800">
          <CardHeader>
            <CardTitle className="text-gray-800 dark:text-white md:text-xl">
              Daily Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressBar current={caloriesConsumed} goal={userMetrics.dailyCalories} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}