// src/components/MetricSection.jsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ProgressBar";
import { format, subDays, addDays } from "date-fns";
import { CiCircleInfo } from "react-icons/ci";
import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Dumbbell,
  BarChart3,
  Target,
} from "lucide-react";
import {
  LuCircleInfo,
  LuChevronLeft,
  LuChevronRight,
  LuDumbbell,
  LuChartColumn,
  LuTarget,
  LuUtensils,
  LuActivity,
  LuBook 
} from "react-icons/lu";
import { LuInfo } from "react-icons/lu";
import { CalendarHeader } from "@/components/CalendarHeader";

export function WorkoutMetricsSection({
  selectedDate,
  setSelectedDate,
  userMetrics,
  totalVolume,
  totalExercise,
  totalSets,
  foodEntries,
  onInfoClick,
}) {
  const [totalNutrition, setTotalNutrition] = useState({});

  useEffect(() => {
    // Calculate total nutrition from all food entries
    const calculatedNutrition = foodEntries.reduce((total, entry) => {
      // Use baseValues if available, otherwise use the regular values
      return {
        calories: Math.round((total.calories || 0) + (entry.calories || 0)),
        protein: Math.round((total.protein || 0) + (entry.protein || 0)),
        carbs: Math.round((total.carbs || 0) + (entry.carbs || 0)),
        fat: Math.round((total.fat || 0) + (entry.fat || 0)),
        fiber: Math.round(
          (total.fiber || 0) + (entry.fiber || entry.baseFiber || 0)
        ),
        sugar: Math.round(
          (total.sugar || 0) + (entry.sugar || entry.baseSugar || 0)
        ),
        saturated_fat: Math.round(
          (total.saturated_fat || 0) +
            (entry.saturated_fat || entry.baseSaturatedFat || 0)
        ),
        trans_fat: Math.round(
          (total.trans_fat || 0) + (entry.trans_fat || entry.baseTransFat || 0)
        ),
        polyunsaturated_fat: Math.round(
          (total.polyunsaturated_fat || 0) +
            (entry.polyunsaturated_fat || entry.basePolyunsaturatedFat || 0)
        ),
        monounsaturated_fat: Math.round(
          (total.monounsaturated_fat || 0) +
            (entry.monounsaturated_fat || entry.baseMonounsaturatedFat || 0)
        ),
        cholesterol: Math.round(
          (total.cholesterol || 0) +
            (entry.cholesterol || entry.baseCholesterol || 0)
        ),
        sodium: Math.round(
          (total.sodium || 0) + (entry.sodium || entry.baseSodium || 0)
        ),
        potassium: Math.round(
          (total.potassium || 0) + (entry.potassium || entry.basePotassium || 0)
        ),
        vitamin_a: Math.round(
          (total.vitamin_a || 0) + (entry.vitamin_a || entry.baseVitaminA || 0)
        ),
        vitamin_c: Math.round(
          (total.vitamin_c || 0) + (entry.vitamin_c || entry.baseVitaminC || 0)
        ),
        vitamin_d: Math.round(
          (total.vitamin_d || 0) + (entry.vitamin_d || entry.baseVitaminD || 0)
        ),
        calcium: Math.round(
          (total.calcium || 0) + (entry.calcium || entry.baseCalcium || 0)
        ),
        iron: Math.round(
          (total.iron || 0) + (entry.iron || entry.baseIron || 0)
        ),
      };
    }, {});

    setTotalNutrition(calculatedNutrition);
  }, [foodEntries]);

  const handleInfoClick = () => {
    // Create a daily total object that matches the structure expected by NutritionLabel
    const dailyTotal = {
      food_name: `${foodEntries.length} ${
        foodEntries.length === 1 ? "Item" : "Items"
      }`,
      servingAmount: "1",
      servingType: "",
      mealType: "daily total",
      // Pass the calculated totals directly
      calories: totalNutrition.calories || 0,
      protein: totalNutrition.protein || 0,
      carbs: totalNutrition.carbs || 0,
      fat: totalNutrition.fat || 0,
      fiber: totalNutrition.fiber || 0,
      sugar: totalNutrition.sugar || 0,
      saturated_fat: totalNutrition.saturated_fat || 0,
      trans_fat: totalNutrition.trans_fat || 0,
      polyunsaturated_fat: totalNutrition.polyunsaturated_fat || 0,
      monounsaturated_fat: totalNutrition.monounsaturated_fat || 0,
      cholesterol: totalNutrition.cholesterol || 0,
      sodium: totalNutrition.sodium || 0,
      potassium: totalNutrition.potassium || 0,
      vitamin_a: totalNutrition.vitamin_a || 0,
      vitamin_c: totalNutrition.vitamin_c || 0,
      vitamin_d: totalNutrition.vitamin_d || 0,
      calcium: totalNutrition.calcium || 0,
      iron: totalNutrition.iron || 0,
      // Add a servings array with a single item for compatibility
      servings: [
        {
          description: "day",
          serving_id: "daily_total",
          calories: totalNutrition.calories || 0,
          protein: totalNutrition.protein || 0,
          carbs: totalNutrition.carbs || 0,
          fat: totalNutrition.fat || 0,
          fiber: totalNutrition.fiber || 0,
          sugar: totalNutrition.sugar || 0,
          saturated_fat: totalNutrition.saturated_fat || 0,
          trans_fat: totalNutrition.trans_fat || 0,
          polyunsaturated_fat: totalNutrition.polyunsaturated_fat || 0,
          monounsaturated_fat: totalNutrition.monounsaturated_fat || 0,
          cholesterol: totalNutrition.cholesterol || 0,
          sodium: totalNutrition.sodium || 0,
          potassium: totalNutrition.potassium || 0,
          vitamin_a: totalNutrition.vitamin_a || 0,
          vitamin_c: totalNutrition.vitamin_c || 0,
          vitamin_d: totalNutrition.vitamin_d || 0,
          calcium: totalNutrition.calcium || 0,
          iron: totalNutrition.iron || 0,
        },
      ],
    };

    onInfoClick(dailyTotal);
  };

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
