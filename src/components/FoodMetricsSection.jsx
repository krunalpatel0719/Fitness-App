
// src/components/MetricSection.jsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ProgressBar";
import { format, subDays, addDays } from "date-fns";
import { CiCircleInfo } from "react-icons/ci";
import { useState, useEffect } from 'react';
import {LuCircleInfo,LuChevronLeft, LuChevronRight, LuUtensils, LuActivity } from "react-icons/lu"
import {LuInfo } from "react-icons/lu"
import { CalendarHeader } from "@/components/CalendarHeader";

export function FoodMetricsSection({ selectedDate, setSelectedDate, userMetrics, caloriesConsumed, foodEntries,
  onInfoClick }) {
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
        {/* <div className="flex items-center justify-between gap-4">
              <h1 className="text-3xl font-bold tracking-tight  dark:text-white">Food Diary</h1>
              <div className="flex items-center sm:space-x-2 bg-white dark:bg-zinc-800 rounded-lg shadow sm:p-2 dark:shadow-none">
                <Button className = " bg-transparent sm:p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700" variant="" size="icon" onClick={() => setSelectedDate(subDays(selectedDate, 1))}>
                  <LuChevronLeft className="h-4 w-4 sm:min-h-6 sm:min-w-6 " />
                </Button>
                <div className="flex flex-col items-center px-2 sm:px-6">
                  <span className="text-nowrap text-xs sm:text-lg font-semibold dark:text-white">{format(selectedDate, "EEEE, MMMM d, yyyy")}</span>
                  
                </div>
                <Button className = " bg-transparent p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700" variant="" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
                  <LuChevronRight className="h-4 w-4 sm:min-h-6 sm:min-w-6" />
                </Button>
              </div>
            </div> */}
           <CalendarHeader
            title="Food Diary"
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
  
        {/* Cards: Daily Goal and Daily Progress */}
        <div className="grid gap-4 md:gap-8 md:grid-cols-2">
          {/* Daily Goal Card */}
          <Card className="border-0 bg-gradient-to-br from-blue-500 to-blue-600  text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium ">Daily Goal</CardTitle>
              <LuUtensils className="h-5 w-5 opacity-70" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {userMetrics.dailyCalories}
                <span className="text-lg ml-1 opacity-70">kcal</span>
              </div>
             
            </CardContent>
          </Card>
  
          {/* Daily Progress Card */}
          <Card className="border-0 bg-white dark:bg-zinc-800 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium dark:text-white">Calories Consumed</CardTitle>
              <Button 
                    variant="link" 
                    className="p-0 h-auto text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500 flex items-center gap-2 " // Added flex, items-center, and gap-2
                    onClick={handleInfoClick}
                  >
                    <LuInfo className="min-h-5 min-w-5" /> 
                   
                  </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
               
                <ProgressBar current={caloriesConsumed} goal={userMetrics.dailyCalories} />
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }