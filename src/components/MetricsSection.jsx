
// src/components/MetricSection.jsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ProgressBar";
import { format, subDays, addDays } from "date-fns";
import { CiCircleInfo } from "react-icons/ci";
import { useState, useEffect } from 'react';
import {LuCircleInfo,LuChevronLeft, LuChevronRight, LuUtensils, LuActivity } from "react-icons/lu"
import {LuInfo } from "react-icons/lu"
export function MetricsSection({ selectedDate, setSelectedDate, userMetrics, caloriesConsumed, foodEntries,
  onInfoClick }) {
    const [totalNutrition, setTotalNutrition] = useState({});

    // useEffect(() => {
    //   // Define all nutrient keys you want to sum
    //   const nutrientKeys = [
    //     "calories",
    //     "protein",
    //     "carbs",
    //     "fat",
    //     "fiber",
    //     "sugar",
    //     "saturated_fat",
    //     "trans_fat",
    //     "polyunsaturated_fat",
    //     "monounsaturated_fat",
    //     "cholesterol",
    //     "sodium",
    //     "potassium",
    //     "vitamin_a",
    //     "vitamin_c",
    //     "vitamin_d",
    //     "calcium",
    //     "iron"
    //   ];
    
    //   // Aggregate totals for each nutrient key from foodEntries
    //   const calculatedNutrition = foodEntries.reduce((totals, entry) => {
    //     nutrientKeys.forEach((key) => {
    //       // Construct the base key with a consistent naming convention.
    //       // For example, if your data stores cholesterol as either "cholesterol" or "baseCholesterol"
    //       const baseKey = "base" + key.charAt(0).toUpperCase() + key.slice(1);
    //       // Ensure the value is a number. If not present, default to 0.
    //       const value = Number(entry[key] || entry[baseKey] || 0);
    //       totals[key] = (totals[key] || 0) + value;
    //     });
    //     return totals;
    //   }, {});
    
    //   setTotalNutrition(calculatedNutrition);
    // }, [foodEntries]);
    
    useEffect(() => {
      // Calculate total nutrition from all food entries
      const calculatedNutrition = foodEntries.reduce((total, entry) => {
        // Use baseValues if available, otherwise use the regular values
        return {
          calories: Math.round((total.calories || 0) + (entry.calories || 0)),
          protein: Math.round((total.protein || 0) + (entry.protein || 0)),
          carbs: Math.round((total.carbs || 0) + (entry.carbs || 0)),
          fat: Math.round((total.fat || 0) + (entry.fat || 0)),
          fiber: Math.round((total.fiber || 0) + (entry.fiber || entry.baseFiber || 0)),
          sugar: Math.round((total.sugar || 0) + (entry.sugar || entry.baseSugar || 0)),
          saturated_fat: Math.round((total.saturated_fat || 0) + (entry.saturated_fat || entry.baseSaturatedFat || 0)),
          trans_fat: Math.round((total.trans_fat || 0) + (entry.trans_fat || entry.baseTransFat || 0)),
          polyunsaturated_fat: Math.round((total.polyunsaturated_fat || 0) + (entry.polyunsaturated_fat || entry.basePolyunsaturatedFat || 0)),
          monounsaturated_fat: Math.round((total.monounsaturated_fat || 0) + (entry.monounsaturated_fat || entry.baseMonounsaturatedFat || 0)),
          cholesterol: Math.round((total.cholesterol || 0) + (entry.cholesterol || entry.baseCholesterol || 0)),
          sodium: Math.round((total.sodium || 0) + (entry.sodium || entry.baseSodium || 0)),
          potassium: Math.round((total.potassium || 0) + (entry.potassium || entry.basePotassium || 0)),
          vitamin_a: Math.round((total.vitamin_a || 0) + (entry.vitamin_a || entry.baseVitaminA || 0)),
          vitamin_c: Math.round((total.vitamin_c || 0) + (entry.vitamin_c || entry.baseVitaminC || 0)),
          vitamin_d: Math.round((total.vitamin_d || 0) + (entry.vitamin_d || entry.baseVitaminD || 0)),
          calcium: Math.round((total.calcium || 0) + (entry.calcium || entry.baseCalcium || 0)),
          iron: Math.round((total.iron || 0) + (entry.iron || entry.baseIron || 0))
        };
      }, {});
  
      setTotalNutrition(calculatedNutrition);
    }, [foodEntries]);
  
    const handleInfoClick = () => {
      // Create a daily total object that matches the structure expected by NutritionLabel
      const dailyTotal = {
        food_name: `${foodEntries.length} ${foodEntries.length === 1 ? 'Item' : 'Items'}`,
        servingAmount: "1",
        servingType: "day",
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
        servings: [{
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
        }]
      };
  
      onInfoClick(dailyTotal);
    };
  
    return (
      <>
        {/* Date Navigation Header */}
        <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight  dark:text-white">Dashboard</h1>
              <div className="flex items-center space-x-2 bg-white dark:bg-zinc-800 rounded-lg shadow p-2 dark:shadow-none">
                <Button className = " dark:bg-white dark:text-black dark:hover:bg-zinc-400 dark:hover:text-gray-100" variant="" size="icon" onClick={() => setSelectedDate(subDays(selectedDate, 1))}>
                  <LuChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex flex-col items-center px-4">
                  <span className="text-lg font-semibold dark:text-white">{format(selectedDate, "EEEE")}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400"> {format(selectedDate, "MMMM d, yyyy")}</span>
                </div>
                <Button className = " dark:bg-white dark:text-black dark:hover:bg-zinc-400 dark:hover:text-gray-100" variant="" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
                  <LuChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

        {/* <Card className="dark:bg-zinc-800">
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
        </Card> */}
  
        {/* Cards: Daily Goal and Daily Progress */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Daily Goal Card */}
          <Card className="border-0 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium ">Daily Goal</CardTitle>
              <LuUtensils className="h-5 w-5 opacity-70" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">
                {userMetrics.dailyCalories}
                <span className="text-lg ml-1 opacity-70">kcal</span>
              </div>
              <p className="text-sm mt-1 opacity-70">Target for {format(selectedDate, "MMM d, yyyy")}</p>
            </CardContent>
          </Card>
  
          {/* Daily Progress Card */}
          <Card className="border-0 bg-white dark:bg-zinc-800 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium dark:text-white">Daily Progress</CardTitle>
              <LuActivity className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
               
                <ProgressBar current={caloriesConsumed} goal={userMetrics.dailyCalories} />
                <div className="flex justify-end items-center "> {/* Added items-center and removed text-sm */}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-blue-600 dark:text-blue-400 flex items-center gap-2 " // Added flex, items-center, and gap-2
                    onClick={handleInfoClick}
                  >
                    <LuInfo className="h-12 w-12" /> {/* Removed mr-1 since we're using gap-2 */}
                    <span className="text-md">Details</span> {/* Moved text-sm to the text only */}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }